"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import crypto from "crypto";
import { headers } from "next/headers";
import { prisma } from "./db";
import { sendWelcomeEmail, sendAdminSignupNotification, sendPasswordResetEmail } from "./email";
import {
  getSession,
  createSession,
  destroySession,
  verifyPassword,
  hashPassword,
  getReaderSession,
  createReaderSession,
  destroyReaderSession,
} from "./auth";
import { slugify, dayStartUTC, parseISODate, toISODate } from "./format";
import { saveUpload, deleteUpload } from "./upload";

const AVATAR_MAX_BYTES = 800 * 1024; // 800 KB, per user

// ---------- Auth ----------

export async function loginAction(_prevState, formData) {
  const email = String(formData.get("email") || "").toLowerCase().trim();
  const password = String(formData.get("password") || "");
  const next = String(formData.get("next") || "/admin");

  if (!email || !password) {
    return { error: "Enter your email and password." };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  const ok = user && (await verifyPassword(password, user.password));
  if (!ok) {
    // One generic message — don't reveal which field was wrong.
    return { error: "Email or password is incorrect." };
  }

  await createSession(user);
  redirect(next.startsWith("/admin") ? next : "/admin");
}

export async function logoutAction() {
  destroySession();
  redirect("/admin/login");
}

// ---------- Reader accounts (public sign up / sign in) ----------

function safeNext(next, fallback) {
  // Only ever redirect within the site — never to an external URL.
  return next && next.startsWith("/") ? next : fallback;
}

export async function readerSignupAction(_prevState, formData) {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").toLowerCase().trim();
  const password = String(formData.get("password") || "");
  const requestAdmin = formData.get("requestAdmin") === "on";
  const adminRequestNote = String(formData.get("adminRequestNote") || "").trim().slice(0, 500);
  const next = safeNext(String(formData.get("next") || ""), "/account");

  if (!name || !email || !password) {
    return { error: "Fill in your name, email and password." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const existing = await prisma.reader.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with that email already exists. Try signing in instead." };
  }

  const reader = await prisma.reader.create({
    data: {
      name,
      email,
      password: await hashPassword(password),
      adminRequestStatus: requestAdmin ? "pending" : "none",
      adminRequestNote: requestAdmin ? adminRequestNote : "",
    },
  });

  try {
    await sendWelcomeEmail(reader.email, reader.name);
  } catch (e) {
    console.error("Failed to send welcome email:", e);
  }

  try {
    const admins = await prisma.user.findMany({
      where: { role: "admin" },
      select: { email: true },
    });
    await sendAdminSignupNotification(admins.map((a) => a.email), reader);
  } catch (e) {
    console.error("Failed to send admin signup notification:", e);
  }

  await createReaderSession(reader);
  redirect(next);
}

export async function readerLoginAction(_prevState, formData) {
  const email = String(formData.get("email") || "").toLowerCase().trim();
  const password = String(formData.get("password") || "");
  const next = safeNext(String(formData.get("next") || ""), "/account");

  if (!email || !password) {
    return { error: "Enter your email and password." };
  }

  const reader = await prisma.reader.findUnique({ where: { email } });
  const ok = reader && (await verifyPassword(password, reader.password));
  if (!ok) {
    // One generic message — don't reveal which field was wrong.
    return { error: "Email or password is incorrect." };
  }

  await createReaderSession(reader);
  redirect(next);
}

export async function readerLogoutAction() {
  destroyReaderSession();
  redirect("/");
}

// A signed-in staff member approves a reader's request for /admin access —
// this creates their staff (User) account, reusing the password they
// already set as a reader so they can sign in with it right away.
export async function approveAdminRequestAction(formData) {
  await requireSuperAdmin();
  const readerId = String(formData.get("readerId") || "");
  const reader = await prisma.reader.findUnique({ where: { id: readerId } });

  if (reader && reader.adminRequestStatus === "pending") {
    const clash = await prisma.user.findUnique({ where: { email: reader.email } });
    if (!clash) {
      await prisma.user.create({
        data: {
          email: reader.email,
          name: reader.name,
          password: reader.password,
          role: "editor",
        },
      });
    }
    await prisma.reader.update({
      where: { id: readerId },
      data: { adminRequestStatus: "approved" },
    });
  }
  revalidatePath("/admin/requests");
  redirect("/admin/requests?approved=1");
}

export async function rejectAdminRequestAction(formData) {
  await requireSuperAdmin();
  const readerId = String(formData.get("readerId") || "");
  await prisma.reader
    .update({ where: { id: readerId }, data: { adminRequestStatus: "rejected" } })
    .catch(() => {});
  revalidatePath("/admin/requests");
  redirect("/admin/requests?rejected=1");
}

function baseUrl() {
  const host = headers().get("host") || "localhost:3000";
  const proto = host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https";
  return `${proto}://${host}`;
}

export async function requestPasswordResetAction(_prevState, formData) {
  const email = String(formData.get("email") || "").toLowerCase().trim();
  // Same message whether or not the account exists — don't reveal who has one.
  const ok = { ok: "If an account exists for that email, we've sent a reset link." };
  if (!email) return { error: "Enter your email." };

  const reader = await prisma.reader.findUnique({ where: { email } });
  if (reader) {
    const token = crypto.randomBytes(32).toString("hex");
    await prisma.passwordResetToken.create({
      data: { token, readerId: reader.id, expiresAt: new Date(Date.now() + 60 * 60 * 1000) },
    });
    try {
      await sendPasswordResetEmail(reader.email, `${baseUrl()}/reset-password?token=${token}`);
    } catch (e) {
      console.error("Failed to send password reset email:", e);
    }
  }
  return ok;
}

export async function resetPasswordAction(_prevState, formData) {
  const token = String(formData.get("token") || "");
  const password = String(formData.get("password") || "");
  const confirm = String(formData.get("confirm") || "");

  if (!token) return { error: "Missing reset token." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };
  if (password !== confirm) return { error: "Passwords don't match." };

  const record = await prisma.passwordResetToken.findUnique({ where: { token } });
  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return { error: "This reset link is invalid or has expired. Request a new one." };
  }

  const reader = await prisma.reader.update({
    where: { id: record.readerId },
    data: { password: await hashPassword(password) },
  });
  await prisma.passwordResetToken.update({
    where: { id: record.id },
    data: { usedAt: new Date() },
  });

  await createReaderSession(reader);
  redirect("/account?reset=1");
}

async function requireReaderSession(next) {
  const session = await getReaderSession();
  if (!session) redirect(`/login?next=${encodeURIComponent(next)}`);
  return session;
}

// ---------- Likes & comments (readers) ----------

export async function toggleLikeAction(formData) {
  const articleId = String(formData.get("articleId") || "");
  const slug = String(formData.get("slug") || "");
  const session = await requireReaderSession(`/article/${slug}`);

  const existing = await prisma.like.findUnique({
    where: { articleId_readerId: { articleId, readerId: session.id } },
  });
  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
  } else {
    await prisma.like.create({ data: { articleId, readerId: session.id } });
  }
  revalidatePath(`/article/${slug}`);
  redirect(`/article/${slug}`);
}

export async function addCommentAction(_prevState, formData) {
  const articleId = String(formData.get("articleId") || "");
  const slug = String(formData.get("slug") || "");
  const session = await requireReaderSession(`/article/${slug}`);

  const body = String(formData.get("body") || "").trim();
  if (!body) return { error: "Write something before posting." };
  if (body.length > 2000) return { error: "Comments are limited to 2000 characters." };

  await prisma.comment.create({ data: { articleId, readerId: session.id, body } });
  revalidatePath(`/article/${slug}`);
  return { ok: true };
}

// ---------- Reader profile ----------

const USERNAME_RE = /^[a-z0-9_]{3,20}$/;

export async function updateReaderProfileAction(_prevState, formData) {
  const session = await requireReaderSession("/account");

  const name = String(formData.get("name") || "").trim();
  const username = String(formData.get("username") || "").trim().toLowerCase();
  const dobRaw = String(formData.get("dateOfBirth") || "");
  const city = String(formData.get("city") || "").trim();
  const address = String(formData.get("address") || "").trim();
  const bio = String(formData.get("bio") || "").trim().slice(0, 1000);
  const profession = String(formData.get("profession") || "").trim();

  if (!name) return { error: "Name is required." };
  if (username && !USERNAME_RE.test(username)) {
    return { error: "Username must be 3-20 characters: lowercase letters, numbers, underscores." };
  }
  if (username) {
    const clash = await prisma.reader.findFirst({
      where: { username, NOT: { id: session.id } },
      select: { id: true },
    });
    if (clash) return { error: "That username is already taken." };
  }

  let dateOfBirth = null;
  if (dobRaw) {
    dateOfBirth = new Date(dobRaw);
    if (Number.isNaN(dateOfBirth.getTime())) return { error: "Enter a valid date of birth." };
  }

  await prisma.reader.update({
    where: { id: session.id },
    data: { name, username: username || null, dateOfBirth, city, address, bio, profession },
  });

  revalidatePath("/account");
  return { ok: "Profile saved." };
}

export async function updateReaderAvatarAction(formData) {
  const session = await requireReaderSession("/account");
  const result = await saveUpload(formData.get("file"), AVATAR_MAX_BYTES);
  if (result.url) {
    const prev = await prisma.reader.findUnique({
      where: { id: session.id },
      select: { avatarUrl: true },
    });
    await prisma.reader.update({ where: { id: session.id }, data: { avatarUrl: result.url } });
    if (prev?.avatarUrl && prev.avatarUrl !== result.url) await deleteUpload(prev.avatarUrl);
  }
  revalidatePath("/account");
  redirect(`/account${result.error ? `?imgerror=${encodeURIComponent(result.error)}` : ""}`);
}

export async function changeReaderPasswordAction(_prevState, formData) {
  const session = await requireReaderSession("/account");

  const currentPassword = String(formData.get("currentPassword") || "");
  const newPassword = String(formData.get("newPassword") || "");
  const confirm = String(formData.get("confirm") || "");

  if (!currentPassword || !newPassword) return { error: "Fill in both password fields." };
  if (newPassword.length < 8) return { error: "New password must be at least 8 characters." };
  if (newPassword !== confirm) return { error: "New passwords don't match." };

  const reader = await prisma.reader.findUnique({ where: { id: session.id } });
  const ok = reader && (await verifyPassword(currentPassword, reader.password));
  if (!ok) return { error: "Current password is incorrect." };

  await prisma.reader.update({
    where: { id: session.id },
    data: { password: await hashPassword(newPassword) },
  });
  return { ok: "Password changed." };
}

// ---------- Articles ----------

async function requireSession() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  return session;
}

// Only "super_admin" can approve access requests or manage other staff
// accounts. Every other staff role keeps today's access (articles,
// editions, ads, their own profile).
async function requireSuperAdmin() {
  const session = await requireSession();
  if (session.role !== "super_admin") redirect("/admin?error=forbidden");
  return session;
}

// ---------- Staff management (super admin only) ----------

const STAFF_ROLES = ["super_admin", "admin", "editor", "author"];

export async function updateStaffRoleAction(formData) {
  const session = await requireSuperAdmin();
  const userId = String(formData.get("userId") || "");
  const role = String(formData.get("role") || "");
  if (!STAFF_ROLES.includes(role)) redirect("/admin/staff");

  if (userId === session.id && role !== "super_admin") {
    const superAdminCount = await prisma.user.count({ where: { role: "super_admin" } });
    if (superAdminCount <= 1) {
      redirect(`/admin/staff?error=${encodeURIComponent("You can't remove the last super admin.")}`);
    }
  }

  await prisma.user.update({ where: { id: userId }, data: { role } });
  revalidatePath("/admin/staff");
  redirect("/admin/staff?saved=1");
}

export async function deleteStaffAction(formData) {
  const session = await requireSuperAdmin();
  const userId = String(formData.get("userId") || "");

  if (userId === session.id) {
    redirect(`/admin/staff?error=${encodeURIComponent("You can't delete your own account while signed in.")}`);
  }

  const articleCount = await prisma.article.count({ where: { authorId: userId } });
  if (articleCount > 0) {
    redirect(
      `/admin/staff?error=${encodeURIComponent(
        `This account has authored ${articleCount} article(s). Reassign or delete those first.`
      )}`
    );
  }

  await prisma.user.delete({ where: { id: userId } }).catch(() => {});
  revalidatePath("/admin/staff");
  redirect("/admin/staff?deleted=1");
}

// ---------- Staff profile ----------

export async function updateStaffProfileAction(_prevState, formData) {
  const session = await requireSession();

  const name = String(formData.get("name") || "").trim();
  const username = String(formData.get("username") || "").trim().toLowerCase();
  const dobRaw = String(formData.get("dateOfBirth") || "");
  const city = String(formData.get("city") || "").trim();
  const address = String(formData.get("address") || "").trim();
  const bio = String(formData.get("bio") || "").trim().slice(0, 1000);
  const profession = String(formData.get("profession") || "").trim();

  if (!name) return { error: "Name is required." };
  if (username && !USERNAME_RE.test(username)) {
    return { error: "Username must be 3-20 characters: lowercase letters, numbers, underscores." };
  }
  if (username) {
    const clash = await prisma.user.findFirst({
      where: { username, NOT: { id: session.id } },
      select: { id: true },
    });
    if (clash) return { error: "That username is already taken." };
  }

  let dateOfBirth = null;
  if (dobRaw) {
    dateOfBirth = new Date(dobRaw);
    if (Number.isNaN(dateOfBirth.getTime())) return { error: "Enter a valid date of birth." };
  }

  await prisma.user.update({
    where: { id: session.id },
    data: { name, username: username || null, dateOfBirth, city, address, bio, profession },
  });

  revalidatePath("/admin/profile");
  return { ok: "Profile saved." };
}

export async function updateStaffAvatarAction(formData) {
  const session = await requireSession();
  const result = await saveUpload(formData.get("file"), AVATAR_MAX_BYTES);
  if (result.url) {
    const prev = await prisma.user.findUnique({
      where: { id: session.id },
      select: { avatarUrl: true },
    });
    await prisma.user.update({ where: { id: session.id }, data: { avatarUrl: result.url } });
    if (prev?.avatarUrl && prev.avatarUrl !== result.url) await deleteUpload(prev.avatarUrl);
  }
  revalidatePath("/admin/profile");
  redirect(`/admin/profile${result.error ? `?imgerror=${encodeURIComponent(result.error)}` : ""}`);
}

export async function changeStaffPasswordAction(_prevState, formData) {
  const session = await requireSession();

  const currentPassword = String(formData.get("currentPassword") || "");
  const newPassword = String(formData.get("newPassword") || "");
  const confirm = String(formData.get("confirm") || "");

  if (!currentPassword || !newPassword) return { error: "Fill in both password fields." };
  if (newPassword.length < 8) return { error: "New password must be at least 8 characters." };
  if (newPassword !== confirm) return { error: "New passwords don't match." };

  const user = await prisma.user.findUnique({ where: { id: session.id } });
  const ok = user && (await verifyPassword(currentPassword, user.password));
  if (!ok) return { error: "Current password is incorrect." };

  await prisma.user.update({
    where: { id: session.id },
    data: { password: await hashPassword(newPassword) },
  });
  return { ok: "Password changed." };
}

export async function newDraftAction() {
  const session = await requireSession();
  const firstCategory = await prisma.category.findFirst({ orderBy: { order: "asc" } });
  const draft = await prisma.article.create({
    data: {
      title: "Untitled article",
      slug: "untitled-" + Date.now().toString(36),
      status: "draft",
      categoryId: firstCategory.id,
      authorId: session.id,
    },
  });
  redirect(`/admin/articles/${draft.id}/edit`);
}

export async function saveArticleAction(_prevState, formData) {
  const session = await requireSession();

  const id = formData.get("id") ? String(formData.get("id")) : null;
  const title = String(formData.get("title") || "").trim();
  const summary = String(formData.get("summary") || "").trim();
  const body = String(formData.get("body") || "");
  const categoryId = String(formData.get("categoryId") || "");
  const status = String(formData.get("status") || "draft");
  const tags = String(formData.get("tags") || "").trim();
  const featured = formData.get("featured") === "on";
  let slug = String(formData.get("slug") || "").trim() || slugify(title);

  if (!title) return { error: "Headline is required." };
  if (!categoryId) return { error: "Choose a category." };

  // Keep slugs unique.
  const clash = await prisma.article.findFirst({
    where: { slug, NOT: id ? { id } : undefined },
    select: { id: true },
  });
  if (clash) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;

  // Set publishedAt the first time a story goes live; keep it afterwards.
  // The main image is managed in the Images panel, so read its state here for
  // the "alt text required to publish" check.
  let publishedAt = null;
  if (status === "published") {
    const existing = id
      ? await prisma.article.findUnique({
          where: { id },
          select: { publishedAt: true, heroImage: true, heroAlt: true },
        })
      : null;
    if (existing?.heroImage && !existing.heroAlt) {
      return {
        error: "Add alt text for the main image before publishing (see the Images panel below).",
      };
    }
    publishedAt = existing?.publishedAt ?? new Date();
  }

  const data = {
    title,
    slug,
    summary,
    body,
    categoryId,
    status,
    tags,
    featured,
    publishedAt,
  };

  const article = id
    ? await prisma.article.update({ where: { id }, data })
    : await prisma.article.create({ data: { ...data, authorId: session.id } });

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath(`/article/${article.slug}`);
  revalidatePath(`/section/${(await prisma.category.findUnique({ where: { id: categoryId } }))?.slug ?? ""}`);

  redirect("/admin?saved=1");
}

export async function deleteArticleAction(formData) {
  await requireSession();
  const id = String(formData.get("id") || "");
  if (id) {
    await prisma.article.delete({ where: { id } });
    revalidatePath("/");
    revalidatePath("/admin");
  }
  redirect("/admin?deleted=1");
}

// ---------- Article images ----------

async function revalidateArticle(articleId) {
  const a = await prisma.article.findUnique({
    where: { id: articleId },
    select: { slug: true },
  });
  revalidatePath("/");
  revalidatePath("/admin");
  if (a) revalidatePath(`/article/${a.slug}`);
}

function backToEdit(id, error) {
  redirect(
    `/admin/articles/${id}/edit${error ? `?imgerror=${encodeURIComponent(error)}` : ""}`
  );
}

// Upload a file and use it as the main (hero) image.
export async function setHeroImageAction(formData) {
  await requireSession();
  const id = String(formData.get("id") || "");
  const result = await saveUpload(formData.get("file"));
  if (result.url) {
    const prev = await prisma.article.findUnique({
      where: { id },
      select: { heroImage: true },
    });
    await prisma.article.update({ where: { id }, data: { heroImage: result.url } });
    if (prev?.heroImage && prev.heroImage !== result.url) {
      await deleteUpload(prev.heroImage);
    }
    await revalidateArticle(id);
  }
  backToEdit(id, result.error);
}

// Use a pasted URL as the main image instead of uploading.
export async function setHeroUrlAction(formData) {
  await requireSession();
  const id = String(formData.get("id") || "");
  const url = String(formData.get("url") || "").trim();
  if (url) {
    await prisma.article.update({ where: { id }, data: { heroImage: url } });
    await revalidateArticle(id);
  }
  backToEdit(id);
}

export async function saveHeroMetaAction(formData) {
  await requireSession();
  const id = String(formData.get("id") || "");
  await prisma.article.update({
    where: { id },
    data: {
      heroAlt: String(formData.get("heroAlt") || "").trim() || null,
      heroCaption: String(formData.get("heroCaption") || "").trim() || null,
    },
  });
  await revalidateArticle(id);
  backToEdit(id);
}

export async function clearHeroImageAction(formData) {
  await requireSession();
  const id = String(formData.get("id") || "");
  const prev = await prisma.article.findUnique({
    where: { id },
    select: { heroImage: true },
  });
  await prisma.article.update({
    where: { id },
    data: { heroImage: null, heroCaption: null },
  });
  if (prev?.heroImage) await deleteUpload(prev.heroImage);
  await revalidateArticle(id);
  backToEdit(id);
}

// Add one more image to the gallery.
export async function addArticleImageAction(formData) {
  await requireSession();
  const articleId = String(formData.get("articleId") || "");
  const result = await saveUpload(formData.get("file"));
  if (result.url) {
    const order = await prisma.articleImage.count({ where: { articleId } });
    await prisma.articleImage.create({
      data: {
        articleId,
        url: result.url,
        alt: String(formData.get("alt") || "").trim(),
        caption: String(formData.get("caption") || "").trim(),
        order,
      },
    });
    await revalidateArticle(articleId);
  }
  backToEdit(articleId, result.error);
}

export async function removeArticleImageAction(formData) {
  await requireSession();
  const id = String(formData.get("id") || "");
  const articleId = String(formData.get("articleId") || "");
  const img = await prisma.articleImage.findUnique({ where: { id } });
  await prisma.articleImage.delete({ where: { id } });
  if (img?.url) await deleteUpload(img.url);
  await revalidateArticle(articleId);
  backToEdit(articleId);
}

// ---------- Advertisements ----------

export async function setAdImageAction(formData) {
  await requireSession();
  const id = String(formData.get("id") || "");
  const result = await saveUpload(formData.get("file"));
  if (result.url) {
    const prev = await prisma.ad.findUnique({
      where: { id },
      select: { imageUrl: true },
    });
    await prisma.ad.update({ where: { id }, data: { imageUrl: result.url } });
    if (prev?.imageUrl && prev.imageUrl !== result.url) {
      await deleteUpload(prev.imageUrl);
    }
    revalidatePath("/");
    revalidatePath("/admin/ads");
  }
  redirect(
    `/admin/ads${
      result.error ? `?imgerror=${encodeURIComponent(result.error)}` : "?saved=1"
    }`
  );
}

export async function setAdImageUrlAction(formData) {
  await requireSession();
  const id = String(formData.get("id") || "");
  const url = String(formData.get("url") || "").trim();
  if (url) {
    await prisma.ad.update({ where: { id }, data: { imageUrl: url } });
    revalidatePath("/");
    revalidatePath("/admin/ads");
  }
  redirect("/admin/ads?saved=1");
}

export async function saveAdAction(formData) {
  await requireSession();
  const id = String(formData.get("id") || "");
  await prisma.ad.update({
    where: { id },
    data: {
      name: String(formData.get("name") || "").trim() || "Ad slot",
      linkUrl: String(formData.get("linkUrl") || "").trim(),
      alt: String(formData.get("alt") || "").trim() || "Advertisement",
      active: formData.get("active") === "on",
    },
  });
  revalidatePath("/");
  revalidatePath("/admin/ads");
  redirect("/admin/ads?saved=1");
}

export async function clearAdImageAction(formData) {
  await requireSession();
  const id = String(formData.get("id") || "");
  const prev = await prisma.ad.findUnique({
    where: { id },
    select: { imageUrl: true },
  });
  await prisma.ad.update({ where: { id }, data: { imageUrl: "" } });
  if (prev?.imageUrl) await deleteUpload(prev.imageUrl);
  revalidatePath("/");
  revalidatePath("/admin/ads");
  redirect("/admin/ads?saved=1");
}

// ---------- e-Paper editions ----------

async function touchEdition(id) {
  await prisma.edition
    .update({ where: { id }, data: { updatedAt: new Date() } })
    .catch(() => {});
  revalidatePath("/epaper");
}

export async function newEditionAction() {
  await requireSession();
  const today = dayStartUTC();
  let edition = await prisma.edition.findFirst({ where: { date: today } });
  if (!edition) edition = await prisma.edition.create({ data: { date: today } });
  redirect(`/admin/editions/${edition.id}/edit`);
}

export async function saveEditionAction(_prevState, formData) {
  await requireSession();
  const id = String(formData.get("id") || "");
  const parsed = parseISODate(String(formData.get("date") || ""));
  if (!parsed) return { error: "Enter a valid date." };

  const title = String(formData.get("title") || "Miryalaguda Chronicle").trim() || "Miryalaguda Chronicle";
  const strapline = String(formData.get("strapline") || "").trim() || "Digital Edition";
  const status = String(formData.get("status") || "draft");
  const pdfUrl = String(formData.get("pdfUrl") || "").trim() || null;

  const clash = await prisma.edition.findFirst({
    where: { date: parsed, NOT: { id } },
    select: { id: true },
  });
  if (clash) return { error: "Another edition already uses that date." };

  await prisma.edition.update({
    where: { id },
    data: { date: parsed, title, strapline, status, pdfUrl },
  });

  revalidatePath("/epaper");
  revalidatePath(`/epaper/${toISODate(parsed)}`);
  revalidatePath("/admin/editions");
  return { ok: "Edition details saved." };
}

export async function deleteEditionAction(formData) {
  await requireSession();
  const id = String(formData.get("id") || "");
  if (id) {
    await prisma.editionItem.deleteMany({ where: { editionId: id } });
    await prisma.edition.delete({ where: { id } });
    revalidatePath("/epaper");
    revalidatePath("/admin/editions");
  }
  redirect("/admin/editions?deleted=1");
}

export async function addEditionItemAction(formData) {
  await requireSession();
  const editionId = String(formData.get("editionId") || "");
  const articleId = String(formData.get("articleId") || "");
  const page = Math.max(1, parseInt(formData.get("page") || "1", 10) || 1);
  const prominence = String(formData.get("prominence") || "standard");

  if (editionId && articleId) {
    const order = await prisma.editionItem.count({ where: { editionId, page } });
    await prisma.editionItem.upsert({
      where: { editionId_articleId: { editionId, articleId } },
      update: { page, prominence },
      create: { editionId, articleId, page, order, prominence },
    });
    await touchEdition(editionId);
  }
  redirect(`/admin/editions/${editionId}/edit`);
}

export async function updateEditionItemAction(formData) {
  await requireSession();
  const id = String(formData.get("id") || "");
  const editionId = String(formData.get("editionId") || "");
  const page = Math.max(1, parseInt(formData.get("page") || "1", 10) || 1);
  const order = parseInt(formData.get("order") || "0", 10) || 0;
  const prominence = String(formData.get("prominence") || "standard");

  await prisma.editionItem.update({
    where: { id },
    data: { page, order, prominence },
  });
  await touchEdition(editionId);
  redirect(`/admin/editions/${editionId}/edit`);
}

export async function removeEditionItemAction(formData) {
  await requireSession();
  const id = String(formData.get("id") || "");
  const editionId = String(formData.get("editionId") || "");
  await prisma.editionItem.delete({ where: { id } });
  await touchEdition(editionId);
  redirect(`/admin/editions/${editionId}/edit`);
}

export async function autofillEditionAction(formData) {
  await requireSession();
  const editionId = String(formData.get("editionId") || "");
  const edition = await prisma.edition.findUnique({ where: { id: editionId } });
  if (!edition) redirect("/admin/editions");

  const start = dayStartUTC(edition.date);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);

  let articles = await prisma.article.findMany({
    where: { status: "published", publishedAt: { gte: start, lt: end } },
    orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
  });
  if (articles.length === 0) {
    articles = await prisma.article.findMany({
      where: { status: "published" },
      orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
      take: 10,
    });
  }

  const used = new Set(
    (
      await prisma.editionItem.findMany({
        where: { editionId },
        select: { articleId: true },
      })
    ).map((e) => e.articleId)
  );

  let idx = used.size;
  for (const a of articles) {
    if (used.has(a.id)) continue;
    await prisma.editionItem.create({
      data: {
        editionId,
        articleId: a.id,
        page: Math.floor(idx / 4) + 1,
        order: idx,
        prominence: idx % 4 === 0 ? "lead" : idx % 4 === 3 ? "brief" : "standard",
      },
    });
    idx++;
  }
  await touchEdition(editionId);
  redirect(`/admin/editions/${editionId}/edit`);
}
