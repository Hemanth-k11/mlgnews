# Miryalaguda Chronicle — dynamic news website

A working news site built from the approved mockups:

- **Public site** (server-rendered for SEO): homepage, section pages, article pages, search.
- **e-Paper** at `/epaper`: a dated digital edition laid out as broadsheet pages you can
  flip through and Print / Save as PDF (a real print stylesheet is included).
- **Admin panel** at `/admin`: cookie-session login, article list with filters, a create/edit
  editor with Markdown, draft/publish status, categories, tags; an **Images** panel to
  **upload** the main image (or paste a URL) and attach a **gallery** of extra pictures;
  an **Editions** area to compile the e-Paper; and an **Ads** area to upload/manage the
  banner shown in each rail.

**Stack:** Next.js 14 (App Router) · Prisma ORM · SQLite (one local file) · `jose` +
`bcryptjs` for auth · `react-markdown` for article bodies. Plain CSS, no framework — the
design tokens come straight from the mockups.

---

## Run it locally

You need **Node.js 18.18+** (or 20+). Then, in a normal terminal (PowerShell is fine):

```bash
cd C:\Users\Hemanth\News-Website-Project\website

npm install          # installs packages, also runs "prisma generate"
npm run setup        # creates the SQLite database and fills it with demo content
npm run dev          # starts the site at http://localhost:3000
```

Open:

- Public site — http://localhost:3000
- Admin — http://localhost:3000/admin  (you'll be sent to the login page)

**Admin login:** `karlapati.hemanth@gmail.com` with the password you set as
`SEED_ADMIN_PASSWORD` in `.env` before running the seed (used only on an empty database).

> `npm run setup` runs `prisma migrate dev` the first time — run it in an interactive
> terminal so it can create the migration. After that, `npm run dev` is all you need.

Other scripts:

| Command | What it does |
|---|---|
| `npm run db:seed` | Re-load the demo articles |
| `npm run db:studio` | Open Prisma Studio to browse/edit the database in a browser |
| `npm run build` / `npm start` | Production build and server |

---

## How it fits together

```
src/
├── app/
│   ├── (site)/               public pages share the masthead + footer layout
│   │   ├── page.js            homepage (lead story, section blocks, right rail)
│   │   ├── article/[slug]/    single article
│   │   ├── section/[slug]/    one section's stream, paginated
│   │   └── search/            keyword search
│   ├── epaper/               digital edition — its own minimal shell + print CSS
│   │   ├── page.js            redirects to the latest published edition
│   │   └── [date]/            broadsheet reader for one date, paged
│   └── admin/
│       ├── login/             sign-in screen (no auth required)
│       └── (dashboard)/       everything here requires a valid session
│           ├── page.js        article list + filters
│           ├── articles/[id]/edit/    the article editor
│           └── editions/             e-Paper editions: list + compiler
├── components/                SiteHeader, StoryCard, ArticleForm, RailBits, …
├── lib/
│   ├── db.js                  shared Prisma client
│   ├── auth.js                password hashing + signed session cookie
│   ├── queries.js             all database reads
│   └── actions.js             server actions: login, logout, save/delete article
└── middleware.js              (in src/) blocks /admin for signed-out visitors
prisma/
├── schema.prisma             User, Category, Article
└── seed.mjs                  demo data
```

**Auth model:** on login, the server checks the bcrypt password hash, then sets an
httpOnly cookie holding a signed JWT (`jose`). `middleware.js` verifies it on every
`/admin` request; the dashboard layout checks it again. Authorisation is enforced on
the server in every action — never just by hiding a button.

**Content model:** an `Article` has a title, slug, summary, Markdown body, hero image
URL + alt text + caption, a `status` (`draft` / `published`), a `featured` flag (the one
story in the homepage hero), comma-separated `tags`, and a `views` counter that powers
"Most Read". Public queries only ever return `published` stories whose publish time has
passed.

**e-Paper model:** an `Edition` is keyed by date (one per day) with a nameplate title,
strapline, `status`, and optional `pdfUrl` for a real print replica. `EditionItem` links
a published article to an edition with a `page`, `order`, and `prominence`
(`lead` / `standard` / `brief`) that drive the broadsheet layout. In the admin, "Auto-fill"
pulls that day's published stories in automatically; you can also add/remove/re-order by
hand. `/epaper` shows the latest published edition; `/epaper/YYYY-MM-DD` shows a specific
one. The print stylesheet hides the toolbar and reflows to four columns so Ctrl+P / Save
as PDF produces a clean paper.

---

## Images

- Upload happens through a server action that writes the file to `public/uploads/`
  (served at `/uploads/<name>`). Allowed: JPG, PNG, WebP, GIF, AVIF, up to 6 MB.
- The **main image** is `Article.heroImage` (+ `heroAlt`, `heroCaption`). Gallery pictures
  are rows in `ArticleImage` and render in an "In pictures" strip on the article page.
- The demo articles use stable placeholder images from `picsum.photos` (needs internet
  to display). Re-running `npm run db:seed` backfills images onto any older articles.
- **Local-filesystem uploads don't survive on serverless hosts (Vercel).** Before
  deploying there, swap `src/lib/upload.js` for a Cloudinary or S3 uploader — the rest
  of the code only ever stores/reads a URL string, so nothing else changes.

## Advertisements

Three placements — `home-rail`, `article-rail`, `section-rail` — each an `Ad` row.
Manage them at **`/admin/ads`**: upload a banner (or paste a URL), set a click-through
link and alt text, and toggle `active`. `<AdSlot placement="…">` renders the live banner
(linked, `rel="sponsored"`) when one is set and active, otherwise the grey placeholder box.

## Known v1 limits (deliberate — see the project plan)

- **No comments, no newsletter backend** — both are visual placeholders.
- **Search** is a simple `LIKE` query. Fine to a few thousand articles; swap in a search
  service later if needed.
- Pages are fully server-rendered on each request (`force-dynamic`). Add caching / ISR
  once traffic grows.
- `useFormState` logs a deprecation notice on React 18 — harmless; it becomes
  `useActionState` when you move to Next 15 / React 19.

## Before deploying anywhere public

1. Set a real `AUTH_SECRET` (a long random string) in the host's environment.
2. Move from SQLite to Postgres: change the `datasource` provider in `schema.prisma`
   and set `DATABASE_URL`. Managed Postgres options: Neon, Supabase, Railway.
3. Change the demo admin password (or create a new admin and delete the demo one via
   `npm run db:studio`).
