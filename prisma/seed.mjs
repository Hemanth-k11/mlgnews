// Fills the database with a demo admin user, the sections, and sample stories.
// Run with:  npm run db:seed
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function slugify(s) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

const SECTIONS = [
  { name: "India", blurb: "News from across the country, updated through the day." },
  { name: "World", blurb: "International affairs, conflict, diplomacy and trade." },
  { name: "Opinion", blurb: "Editorials, columns and reader letters." },
  { name: "Business", blurb: "Markets, companies, policy and the economy." },
  { name: "Sport", blurb: "Cricket, football, the Olympics and more." },
  { name: "Sci-Tech", blurb: "Space, health, climate and technology." },
  { name: "Entertainment", blurb: "Film, music, streaming and the arts." },
  { name: "Life & Style", blurb: "Food, travel, wellness and culture." },
];

// title, section, summary, tags, body (Markdown), featured?
const ARTICLES = [
  {
    title: "Parliament clears data protection amendments after marathon debate",
    section: "India",
    summary:
      "The revised Bill narrows government exemptions and gives companies nine months to comply. The Opposition walked out before the division.",
    tags: "data protection, parliament, privacy",
    featured: true,
    heroAlt: "Members during a late-night session in the Lok Sabha",
    heroCaption: "Members during the late-night session. Photo: Bureau",
    body: `Parliament on Monday passed a set of amendments to the data protection law after a debate that ran past midnight, with the government accepting three of the changes proposed by a parliamentary committee earlier this year.

The amendments reduce the scope of exemptions available to government agencies and introduce a fixed nine-month period for companies to bring their systems into compliance once the rules are notified.

## What changes for companies

Businesses that handle personal data will need to publish a point of contact for grievances and complete a data audit within the compliance window. Smaller firms, defined by turnover, get a longer runway.

> The test now is whether the regulator can act independently of the government it also oversees.

Officials said draft rules would be circulated for public comment within six weeks. Industry groups welcomed the timeline but asked for clearer definitions of "significant" data processors.

The Opposition, which walked out before the vote, said the exemptions that remain are still too broad and announced it would move amendments in the upper House.`,
  },
  {
    title: "RBI holds repo rate at 6.25%, keeps stance unchanged",
    section: "Business",
    summary:
      "The committee voted 5-1 to hold, citing sticky food inflation and a stable growth outlook. The next review is in October.",
    tags: "rbi, monetary policy, inflation",
    body: `The Reserve Bank of India's rate-setting committee voted 5-1 to keep the repo rate unchanged at 6.25% on Friday, in line with most forecasts.

The Governor said food inflation remained the main risk to the outlook, even as core inflation stayed within the target band. Growth projections for the year were left unchanged.

## Market reaction

Bond yields were little moved. The rupee held near 84 to the dollar. Economists said a first cut was unlikely before the December review.`,
  },
  {
    title: "ISRO sets December window for next lunar lander test",
    section: "Sci-Tech",
    summary:
      "The uncrewed test will rehearse a soft landing and a sample-return sequence planned for later missions.",
    tags: "isro, space, moon",
    body: `The Indian Space Research Organisation has scheduled an uncrewed lander test for a three-week window in December, officials said.

The flight will rehearse the descent, soft landing and a short surface phase. A sample-return demonstration is planned for a follow-on mission.

Engineers have spent the past year testing the lander's throttleable engine and its hazard-avoidance camera on a suspended rig.`,
  },
  {
    title: "India name unchanged XI for second Test",
    section: "Sport",
    summary: "The team management kept faith with the side that drew the opener in Chennai.",
    tags: "cricket, test match",
    body: `India will field an unchanged team for the second Test, the captain confirmed at the toss-eve press conference.

The pitch is expected to take spin from the third day. The visitors have added a second frontline spinner to their own line-up.`,
  },
  {
    title: "Monsoon withdrawal delayed by a week across the north",
    section: "India",
    summary:
      "The weather office expects above-normal rain in the plains through the first week of September.",
    tags: "monsoon, weather, imd",
    body: `The India Meteorological Department has pushed back its estimate for the start of monsoon withdrawal by about a week.

A low-pressure area over the head of the Bay of Bengal is likely to bring heavy rain to the eastern and central plains over the next few days before conditions ease.

Farmers in the north-west, who had begun harvest preparations, have been advised to wait.`,
  },
  {
    title: "Supreme Court to hear pleas on poll funding disclosures",
    section: "India",
    summary: "A batch of petitions seeking fuller disclosure will be listed next month.",
    tags: "supreme court, elections",
    body: `A group of petitions asking for more detailed disclosure of political funding will be heard by a three-judge bench next month, the registry confirmed.

The petitioners want donations above a threshold to be published with the donor's name and the date of the contribution.`,
  },
  {
    title: "Sensex ends flat as banks offset IT losses",
    section: "Business",
    summary: "Foreign investors were net buyers for a third straight session.",
    tags: "markets, sensex",
    body: `The benchmark index closed almost unchanged, with gains in banking and energy stocks cancelling out a slide in technology shares.

Trading volumes were thin ahead of a long weekend. Analysts expect a narrow range until quarterly results begin next week.`,
  },
  {
    title: "Carmaker to invest Rs 6,000 crore in a new EV line",
    section: "Business",
    summary: "Production is expected to begin in the second half of 2027.",
    tags: "auto, electric vehicles, investment",
    body: `A leading carmaker announced a Rs 6,000 crore investment to set up a dedicated electric-vehicle assembly line at its western plant.

The company said the line would have an initial capacity of 120,000 units a year, with room to double it. About 2,000 jobs are expected.`,
  },
  {
    title: "A workable privacy law needs an independent regulator",
    section: "Opinion",
    summary: "The new amendments are an improvement, but enforcement is where they will be tested.",
    tags: "editorial, privacy",
    body: `The amendments passed this week tidy up several rough edges in the data protection law. That is welcome. But a law is only as good as the body that enforces it.

The board that will oversee compliance is still appointed, funded and staffed through the government it is meant to hold to account. Until that changes, the strongest provisions on paper will carry an asterisk.`,
  },
  {
    title: "Factory output grows 4.1% in July, led by capital goods",
    section: "Business",
    summary: "The reading was slightly ahead of forecasts.",
    tags: "economy, iip",
    body: `Industrial production rose 4.1% year-on-year in July, driven by a double-digit expansion in capital goods and steady growth in electricity generation.

Consumer non-durables were the weak spot, contracting for a second month.`,
  },
  {
    title: "Streaming platforms report a slowdown in new sign-ups",
    section: "Entertainment",
    summary: "Growth is shifting from subscriber numbers to advertising revenue.",
    tags: "streaming, ott",
    body: `The biggest streaming services added fewer subscribers than expected last quarter, and executives are increasingly pointing to ad-supported tiers as the path to growth.

Regional-language originals remain the strongest driver of engagement in the Indian market.`,
  },
  {
    title: "Two states sign pact to share river-flow data in real time",
    section: "India",
    summary: "The agreement is meant to give downstream districts more warning during floods.",
    tags: "water, floods, governance",
    body: `Two neighbouring states have agreed to share gauge readings from key barrages in real time, replacing a system that relied on phone calls between control rooms.

Officials said the feed would also be made public on a website within six months.`,
  },
];

async function main() {
  console.log("Seeding database...");

  // 1. Admin user
  const passwordHash = await bcrypt.hash("admin1234", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      name: "Newsroom Admin",
      password: passwordHash,
      role: "admin",
    },
  });

  // 2. Sections
  const categories = {};
  for (let i = 0; i < SECTIONS.length; i++) {
    const s = SECTIONS[i];
    const cat = await prisma.category.upsert({
      where: { slug: slugify(s.name) },
      update: { blurb: s.blurb, order: i },
      create: { name: s.name, slug: slugify(s.name), blurb: s.blurb, order: i },
    });
    categories[s.name] = cat;
  }

  // 3. Articles (published, spaced a few hours apart)
  let offsetHours = 2;
  for (const a of ARTICLES) {
    const slug = slugify(a.title);
    const publishedAt = new Date(Date.now() - offsetHours * 60 * 60 * 1000);
    offsetHours += 3;

    await prisma.article.upsert({
      where: { slug },
      update: {},
      create: {
        title: a.title,
        slug,
        summary: a.summary,
        body: a.body,
        heroAlt: a.heroAlt ?? null,
        heroCaption: a.heroCaption ?? null,
        status: "published",
        featured: Boolean(a.featured),
        tags: a.tags ?? "",
        views: Math.floor(Math.random() * 4000),
        publishedAt,
        categoryId: categories[a.section].id,
        authorId: admin.id,
      },
    });

    // Demo images (external placeholders, keyed by slug so they stay stable).
    // Also backfills any articles seeded before images existed.
    const art = await prisma.article.update({
      where: { slug },
      data: {
        heroImage: `https://picsum.photos/seed/${slug}/1200/675`,
        heroAlt: a.heroAlt ?? "Placeholder image for this story",
        heroCaption: a.heroCaption ?? "Placeholder image.",
      },
    });

    const imageCount = await prisma.articleImage.count({
      where: { articleId: art.id },
    });
    if (imageCount === 0) {
      await prisma.articleImage.createMany({
        data: [1, 2, 3].map((n) => ({
          articleId: art.id,
          url: `https://picsum.photos/seed/${slug}-${n}/1200/800`,
          alt: "Placeholder image",
          caption:
            n === 1 ? "File photo." : n === 2 ? "Representative image." : "Archive picture.",
          order: n - 1,
        })),
      });
    }
  }

  // 4. A published e-Paper edition for today
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const edition = await prisma.edition.upsert({
    where: { date: today },
    update: { status: "published" },
    create: {
      date: today,
      title: "Miryalaguda Chronicle",
      strapline: "Digital Edition",
      status: "published",
    },
  });

  const published = await prisma.article.findMany({
    where: { status: "published" },
    orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
    take: 8,
  });

  for (let i = 0; i < published.length; i++) {
    await prisma.editionItem.upsert({
      where: {
        editionId_articleId: { editionId: edition.id, articleId: published[i].id },
      },
      update: {},
      create: {
        editionId: edition.id,
        articleId: published[i].id,
        page: i < 4 ? 1 : 2,
        order: i,
        prominence:
          i === 0 || i === 4 ? "lead" : i % 4 === 3 ? "brief" : "standard",
      },
    });
  }

  // 5. Ad slots (one banner per placement, managed at /admin/ads)
  const AD_SLOTS = [
    { placement: "home-rail", name: "House ad — homepage", w: 600, h: 500 },
    { placement: "article-rail", name: "House ad — article", w: 600, h: 1200 },
    { placement: "section-rail", name: "House ad — section", w: 600, h: 500 },
  ];
  for (const s of AD_SLOTS) {
    await prisma.ad.upsert({
      where: { placement: s.placement },
      update: {},
      create: {
        placement: s.placement,
        name: s.name,
        imageUrl: `https://picsum.photos/seed/${s.placement}-ad/${s.w}/${s.h}`,
        linkUrl: "",
        alt: "Advertisement",
        active: true,
      },
    });
  }

  console.log("Done.");
  console.log("Admin login:  admin@example.com  /  admin1234");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
