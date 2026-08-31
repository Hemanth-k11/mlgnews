"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "./db";
import { getSession, createSession, destroySession, verifyPassword } from "./auth";
import { slugify, dayStartUTC, parseISODate, toISODate } from "./format";
import { saveUpload, deleteUpload } from "./upload";

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

// ---------- Articles ----------

async function requireSession() {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  return session;
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

  const title = String(formData.get("title") || "The Chronicle").trim() || "The Chronicle";
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
