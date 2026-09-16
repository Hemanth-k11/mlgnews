import { prisma } from "./db";

// Only stories that are published AND whose publish time has passed.
function publishedFilter() {
  return { status: "published", publishedAt: { lte: new Date() } };
}

const withRefs = { include: { category: true, author: true } };

export async function getSections() {
  return prisma.category.findMany({ orderBy: { order: "asc" } });
}

export async function getFeatured() {
  return prisma.article.findFirst({
    where: { ...publishedFilter(), featured: true },
    orderBy: { publishedAt: "desc" },
    ...withRefs,
  });
}

export async function getLatest(take = 7, skip = 0) {
  return prisma.article.findMany({
    where: publishedFilter(),
    orderBy: { publishedAt: "desc" },
    take,
    skip,
    ...withRefs,
  });
}

export async function getMostRead(take = 5) {
  return prisma.article.findMany({
    where: publishedFilter(),
    orderBy: [{ views: "desc" }, { publishedAt: "desc" }],
    take,
  });
}

// One block per section for the homepage (first three sections that have stories).
export async function getSectionBlocks(perBlock = 4, blocks = 3) {
  const cats = await prisma.category.findMany({ orderBy: { order: "asc" } });
  const out = [];
  for (const category of cats) {
    if (out.length >= blocks) break;
    const items = await prisma.article.findMany({
      where: { ...publishedFilter(), categoryId: category.id },
      orderBy: { publishedAt: "desc" },
      take: perBlock,
      ...withRefs,
    });
    if (items.length) out.push({ category, items });
  }
  return out;
}

export async function getCategoryPage(slug, page = 1, perPage = 8) {
  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) return null;
  const where = { ...publishedFilter(), categoryId: category.id };
  const [items, total] = await Promise.all([
    prisma.article.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      take: perPage,
      skip: (page - 1) * perPage,
      ...withRefs,
    }),
    prisma.article.count({ where }),
  ]);
  return { category, items, total, page, perPage, pages: Math.max(1, Math.ceil(total / perPage)) };
}

export async function getArticleBySlug(slug) {
  return prisma.article.findFirst({
    where: { slug, ...publishedFilter() },
    include: {
      category: true,
      author: true,
      images: { orderBy: { order: "asc" } },
    },
  });
}

export async function getArticleEngagement(articleId, readerId) {
  const [likeCount, liked, comments] = await Promise.all([
    prisma.like.count({ where: { articleId } }),
    readerId
      ? prisma.like
          .findUnique({ where: { articleId_readerId: { articleId, readerId } } })
          .then(Boolean)
      : Promise.resolve(false),
    prisma.comment.findMany({
      where: { articleId },
      orderBy: { createdAt: "desc" },
      include: { reader: { select: { name: true } } },
    }),
  ]);
  return { likeCount, liked, comments };
}

export async function getRelated(article, take = 3) {
  return prisma.article.findMany({
    where: {
      ...publishedFilter(),
      categoryId: article.categoryId,
      NOT: { id: article.id },
    },
    orderBy: { publishedAt: "desc" },
    take,
    include: { category: true },
  });
}

export async function incrementViews(id) {
  try {
    await prisma.article.update({ where: { id }, data: { views: { increment: 1 } } });
  } catch {
    // ignore — view counting is best-effort
  }
}

export async function search(q, page = 1, perPage = 15) {
  const term = String(q || "").trim();
  if (!term) return { items: [], total: 0, page, perPage, pages: 1 };
  // SQLite LIKE is case-insensitive for ASCII, which is fine for v1.
  const where = {
    ...publishedFilter(),
    OR: [
      { title: { contains: term } },
      { summary: { contains: term } },
      { body: { contains: term } },
    ],
  };
  const [items, total] = await Promise.all([
    prisma.article.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      take: perPage,
      skip: (page - 1) * perPage,
      include: { category: true },
    }),
    prisma.article.count({ where }),
  ]);
  return { items, total, page, perPage, pages: Math.max(1, Math.ceil(total / perPage)) };
}

// --- Admin-only reads (no published filter) ---

export async function adminListArticles({ q = "", status = "", categoryId = "" } = {}) {
  const where = {};
  if (q) where.title = { contains: q };
  if (status) where.status = status;
  if (categoryId) where.categoryId = categoryId;
  return prisma.article.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    include: { category: true, author: true },
  });
}

export async function adminGetArticle(id) {
  return prisma.article.findUnique({
    where: { id },
    include: { category: true, images: { orderBy: { order: "asc" } } },
  });
}

// --- Advertisements ---

export async function getAd(placement) {
  return prisma.ad.findFirst({
    where: { placement, active: true, NOT: { imageUrl: "" } },
  });
}

export async function adminListAds() {
  return prisma.ad.findMany({ orderBy: { placement: "asc" } });
}

// --- e-Paper editions ---

export async function getLatestPublishedEdition() {
  return prisma.edition.findFirst({
    
    where: { status: "published" },
    orderBy: { date: "desc" },
  });
}

export async function getPublishedEditionDates() {
  const rows = await prisma.edition.findMany({
    where: { status: "published" },
    orderBy: { date: "desc" },
    select: { date: true },
  });
  return rows.map((r) => r.date);
}

export async function getPublishedEdition(dateObj) {
  return prisma.edition.findFirst({
    where: { status: "published", date: dateObj },
    include: {
      items: {
        orderBy: [{ page: "asc" }, { order: "asc" }],
        include: { article: { include: { category: true, author: true } } },
      },
    },
  });
}

export async function adminListEditions() {
  return prisma.edition.findMany({
    orderBy: { date: "desc" },
    include: { _count: { select: { items: true } } },
  });
}

export async function adminGetEdition(id) {
  return prisma.edition.findUnique({
    where: { id },
    include: {
      items: {
        orderBy: [{ page: "asc" }, { order: "asc" }],
        include: { article: { include: { category: true } } },
      },
    },
  });
}

export async function getArticlesNotInEdition(editionId) {
  const used = (
    await prisma.editionItem.findMany({
      where: { editionId },
      select: { articleId: true },
    })
  ).map((i) => i.articleId);

  return prisma.article.findMany({
    where: { status: "published", id: { notIn: used } },
    orderBy: { publishedAt: "desc" },
    include: { category: true },
  });
}
