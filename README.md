# Islamic Studies Curriculum

A living, browsable map of a traditional Islamic studies curriculum — texts, commentaries, and
the pathways between them — built as a static site with [Astro](https://astro.build) and deployed
free on GitHub Pages.

**Live site:** https://hamzaahmad3.github.io/Islamic-Curriculum/

---

## How this is organized

Everything you'll actually want to edit day-to-day lives in `src/content/` as plain Markdown or
YAML files — no build tooling required to make a change, just edit the file and push.

```
src/content/
├── books/       one .md file per text or commentary
├── sciences/    one .md file per discipline (Fiqh, Hadith, Nahw, ...)
├── pathways/    ordered roadmaps linking books together
├── guides/      long-form "how to study" essays
└── dashboard/   personal study state (studying / reading / memorizing / to-buy)
```

Every file's shape (which fields are required, which are optional, what values are valid) is
defined once in `src/content/config.ts`. If you get a field wrong — a typo'd reference to a book
that doesn't exist, an invalid `level` value — the **build will fail with a clear error** telling
you exactly which file and field is wrong. This is intentional: it means a mistake gets caught
before it ever reaches the live site.

### Adding a new book

Create a new file in `src/content/books/`, e.g. `src/content/books/my-new-book.md`:

```markdown
---
title: "Book Title"
titleAr: "عنوان الكتاب"
science: "fiqh"          # must match a filename in src/content/sciences/
type: "matn"              # matn | sharh | hashiyah | nazm | reference-work | riwayah
level: "beginner"          # optional
author: "Author Name"      # optional
pdfUrl: "https://..."      # optional — renders an "Open PDF" button if present
---

A short description of the book goes here as regular prose.
```

Only `title` and `science` are required — everything else can be added later as you learn more
about the book, including leaving it out entirely for now.

### Adding a commentary on an existing book

Same as above, but add `type: "sharh"` (or `hashiyah`/`nazm`) and `parent: "the-matn-slug"`,
where the slug is the filename (without `.md`) of the book it comments on.

### Updating what you're currently studying

Edit or add a short YAML file in `src/content/dashboard/`:

```yaml
status: "studying"        # studying | reading | memorizing | to-buy | completed
book: "matn-abi-shuja"     # optional — reference to a books/ slug
label: "Some book with no page yet"  # optional — used instead of `book` when there's no catalog entry
teacher: "Self-study"
progress: "page 93"
```

This is intentionally kept separate from the book's own catalog data, so updating today's progress
never risks touching the stable, slower-changing catalog entry for the book itself.

---

## Local development

```bash
npm install
npm run dev
```

Visit `http://localhost:4321/Islamic-Curriculum/` (the base path is included locally too, matching
production).

```bash
npm run build     # type-checks content + builds the static site to dist/
npm run preview   # serves the built dist/ locally, to sanity-check before pushing
```

---

## Deployment

This repo deploys automatically via GitHub Actions (`.github/workflows/deploy.yml`) every time you
push to `main`. No manual build or upload step — push, and the live site updates within a couple of
minutes.

**One-time setup**, if not already done:

1. In the GitHub repo, go to **Settings → Pages**.
2. Under "Build and deployment", set **Source** to **GitHub Actions**.
3. Push to `main` — the "Deploy to GitHub Pages" workflow will run automatically and publish the
   site.

You can watch build progress under the repo's **Actions** tab.

---

## Fonts

Amiri (Arabic), Newsreader, and Inter are self-hosted in `public/fonts/` under the SIL Open Font
License — see `public/fonts/README.md` for sources and how to update them.

---

## A note on `@astrojs/sitemap`

This project pins `@astrojs/sitemap` to the exact version `3.2.1` in `package.json`. Versions
3.7.x of this package have a known build-breaking bug against Astro 4.16
([withastro/astro#15894](https://github.com/withastro/astro/issues/15894)). Don't bump this
dependency without checking that the upstream bug has actually been fixed first.
