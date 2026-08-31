# Deploying The Chronicle

Local dev uses a SQLite file and saves uploads to disk. Neither works on a hosting
platform, so deploying means switching two things:

| Local | Production |
|---|---|
| SQLite (`dev.db` file) | **Postgres** (Neon, free) |
| Uploads to `public/uploads/` | **Cloudinary** (free) |

Host: **Vercel** (free, made for Next.js). Everything below is free tier.
Budget about half a day the first time.

You need accounts on: **GitHub**, **Neon** (neon.tech), **Cloudinary** (cloudinary.com),
**Vercel** (vercel.com). Sign in to all four with GitHub to keep it simple.

---

## Step 1 — Postgres database (Neon)

1. Neon → **New Project**. Pick a region near you. Name it `chronicle`.
2. After it's created, open **Connection Details**. You need **two** strings:
   - **Pooled connection** (has `-pooler` in the host) → this is `DATABASE_URL`
   - **Direct connection** (no `-pooler`) → this is `DIRECT_URL`
   Copy both somewhere safe. Each looks like
   `postgresql://user:pass@ep-xxx.aws.neon.tech/neondb?sslmode=require`.

3. In `prisma/schema.prisma`, change the `datasource` block to:

   ```prisma
   datasource db {
     provider  = "postgresql"
     url       = env("DATABASE_URL")
     directUrl = env("DIRECT_URL")
   }
   ```

4. The existing migrations were generated for SQLite — start fresh for Postgres:

   ```bash
   # Windows PowerShell
   Remove-Item -Recurse -Force prisma/migrations
   ```

5. Put the Neon strings in your local `.env` (temporarily, to build the schema):

   ```
   DATABASE_URL="<your Neon POOLED url>"
   DIRECT_URL="<your Neon DIRECT url>"
   AUTH_SECRET="<keep your existing value>"
   ```

6. Create the Postgres schema and load the demo content:

   ```bash
   npx prisma migrate dev --name init
   npm run db:seed
   ```

   Check it with `npm run dev` — the site should work exactly as before, now on Postgres.

> From here on, local dev also uses this Neon database. That's fine and normal. If you
> want an isolated local copy, create a **branch** of the project in Neon and use its
> connection strings in `.env`.

---

## Step 2 — Image uploads (Cloudinary)

1. Cloudinary dashboard → note your **Cloud name** (top of the page).
2. **Settings → Upload → Upload presets → Add upload preset**.
   - Signing Mode: **Unsigned**
   - Save, and copy the preset **name** (e.g. `chronicle_unsigned`).
3. Add to your local `.env`:

   ```
   CLOUDINARY_CLOUD_NAME="<your cloud name>"
   CLOUDINARY_UPLOAD_PRESET="<your preset name>"
   ```

4. Restart `npm run dev`, go to an article's **Images** panel, and upload one. The saved
   URL should now start with `https://res.cloudinary.com/…`. (With these two vars unset,
   the app falls back to local disk — that's the dev default.)

---

## Step 3 — Push to GitHub

```bash
cd C:\Users\Hemanth\News-Website-Project\website
git init
git add .
git commit -m "News website ready to deploy"
```

Create an **empty** repo on GitHub (no README), then:

```bash
git remote add origin https://github.com/<you>/<repo>.git
git branch -M main
git push -u origin main
```

`.gitignore` already keeps `.env`, `node_modules`, `dev.db` and `public/uploads/*` out.

---

## Step 4 — Deploy on Vercel

1. Vercel → **Add New → Project** → import your GitHub repo.
2. Framework preset: **Next.js** (auto-detected). Leave build settings default — the
   `vercel-build` script runs `prisma generate && prisma migrate deploy && next build`.
3. **Environment Variables** — add all of these (Production + Preview):

   | Name | Value |
   |---|---|
   | `DATABASE_URL` | Neon **pooled** URL |
   | `DIRECT_URL` | Neon **direct** URL |
   | `AUTH_SECRET` | a fresh 64-char random string (see below) |
   | `CLOUDINARY_CLOUD_NAME` | your Cloudinary cloud name |
   | `CLOUDINARY_UPLOAD_PRESET` | your unsigned preset name |

   Generate a secret:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

4. Click **Deploy**. First build runs the migration against Neon automatically.
5. Open the `*.vercel.app` URL. Public site should load; `/admin` should redirect to login.

---

## Step 5 — After the first deploy

- **Seed production** (only if the DB is empty — e.g. you used a fresh Neon branch):
  ```bash
  # from your machine, pointed at the prod DB for one command
  $env:DATABASE_URL="<Neon direct url>"; npm run db:seed
  ```
- **Make a real admin, drop the demo one:** `npm run db:studio` (with prod `DATABASE_URL`
  in `.env`) → `User` table → add yourself with a bcrypt hash, or log in as
  `admin@example.com` / `admin1234` and change it, then delete the demo row.
- **Custom domain:** Vercel → Project → Settings → Domains → add yours and follow the DNS steps.

## Redeploying

Just `git push`. Vercel rebuilds and runs any new migrations automatically.

---

## Troubleshooting

- **`prisma migrate deploy` fails on Vercel** — you forgot `DIRECT_URL`, or it points at
  the pooled host. Migrations need the **direct** (non-pooler) URL.
- **"too many connections"** — the app's `DATABASE_URL` must be the **pooled** URL.
- **Login doesn't stick in production** — `AUTH_SECRET` isn't set in Vercel, or differs
  from what the first deploy used. Set it once and leave it.
- **Uploaded images 404** — `CLOUDINARY_*` vars missing in Vercel, so it tried to write to
  the (read-only) serverless disk. Add them and redeploy.
- **Prisma engine error on Vercel** — add to `schema.prisma` generator block:
  `binaryTargets = ["native", "rhel-openssl-3.0.x"]`, commit, push.
