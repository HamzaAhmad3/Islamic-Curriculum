import { defineCollection, reference, z } from "astro:content";

/**
 * Shared "death date" shape.
 * Source doc mixes formats: "d. 918 AH", "1194/1780", bare "741 AH", or missing.
 * We normalize to AH as primary (most consistent across the doc) with optional CE.
 */
const deathDate = z
  .object({
    ah: z.number().int().positive().optional(),
    ce: z.number().int().positive().optional(),
    note: z.string().optional(), // e.g. "uncertain", "attributed"
  })
  .optional();

const level = z
  .enum(["beginner", "beginner-intermediate", "intermediate", "intermediate-advanced", "advanced"])
  .optional();

/**
 * A single recommended edition/print of a text.
 */
const edition = z.object({
  publisher: z.string().optional(),
  editor: z.string().optional(),
  note: z.string().optional(),
  isPreferred: z.boolean().default(false),
});

/**
 * Loosely-typed relationship to another book/commentary in the same collection.
 * `ref` stores the slug (content collection id) of the related entry.
 */
const relatedLink = z.object({
  ref: reference("books"),
  kind: z.enum([
    "prerequisite",
    "leads-to",
    "alternative-pathway",
    "companion-reading",
    "evidence-reference",
    "mandatory-supplement",
    "riwayah-variant",
    "see-also",
  ]),
  note: z.string().optional(),
});

const recording = z.object({
  teacher: z.string().optional(),
  platform: z.string().optional(), // e.g. "YouTube"
  url: z.string().url().optional(),
  lastLesson: z.string().optional(),
  status: z.enum(["ongoing", "completed", "paused"]).optional(),
});

/**
 * BOOKS collection.
 * Covers both primary texts (matn) and commentaries (sharh/hashiyah/nazm) —
 * a Commentary is a Book with `type` set accordingly and a `parent` reference.
 * This mirrors the doc: commentaries carry the exact same kind of metadata
 * as the texts they explain, sometimes several layers deep.
 */
const books = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),                // transliterated / English display title
    titleAr: z.string().optional(),   // Arabic script title
    altTitles: z.array(z.string()).optional(),

    science: reference("sciences"),
    pathway: reference("pathways").optional(),
    pathwayPosition: z.number().optional(), // order within its pathway, if linear

    type: z.enum(["matn", "sharh", "hashiyah", "nazm", "reference-work", "riwayah"]).default("matn"),
    parent: reference("books").optional(), // set when type is a commentary on another book

    author: z.string().optional(),
    authorAr: z.string().optional(),
    deathDate: deathDate,
    century: z.string().optional(), // derived/manual, e.g. "8th century AH"

    level: level,

    editions: z.array(edition).default([]),
    pdfUrl: z.string().url().optional(),
    price: z
      .object({
        amount: z.string().optional(), // string: currency varies / "see sheet"
        source: z.string().optional(), // will point at the Google Sheet later
      })
      .optional(),

    recordings: z.array(recording).default([]),
    related: z.array(relatedLink).default([]),

    tags: z.array(z.string()).default([]),
    notes: z.string().optional(),

    // Personal study state is intentionally NOT stored here — see dashboard collection.
    // Keeps the catalog entry stable regardless of what the curator is doing today.
  }),
});

/**
 * SCIENCES collection — one entry per discipline (Fiqh, Hadith, Nahw, ...).
 * Acts as the "portal" landing page data.
 */
const sciences = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    titleAr: z.string().optional(),
    shortDescription: z.string(),
    icon: z.string().optional(), // icon key used by ScienceCard
    order: z.number().default(999), // homepage ordering
    relatedSciences: z.array(reference("sciences")).default([]),
    status: z.enum(["developed", "developing", "stub"]).default("developing"),
    featured: z.boolean().default(false), // visually highlighted as the curriculum's current focus
  }),
});

/**
 * PATHWAYS collection — an explicit named sequence (possibly one of several
 * parallel/alternative sequences within a science), e.g.
 * "Matn Abi Shuja' -> al-Minhaj -> Nihayat al-Muhtaj"
 */
const pathways = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    science: reference("sciences"),
    description: z.string().optional(),
    isAlternativeTo: reference("pathways").optional(),
    isPrimary: z.boolean().default(false), // the recommended/default progression for its science
    nodes: z.array(reference("books")), // ordered list defining the visual roadmap
    supplementary: z.array(reference("books")).default([]), // recommended alongside, but not sequential nodes
  }),
});

/**
 * SCHOLARS collection — the authors behind the curriculum's texts.
 * Linked to books via `aliases`: any string that may appear verbatim inside
 * a book's `author` field (handles multi-author strings like
 * "Mustafa al-Bugha, Mustafa al-Khinn, and Ali al-Sharbaji" by substring match,
 * rather than requiring a brittle exact-match reference on every book).
 */
const scholars = defineCollection({
  type: "content",
  schema: z.object({
    name: z.string(),
    nameAr: z.string().optional(),
    aliases: z.array(z.string()).default([]),
    born: z
      .object({
        ah: z.number().int().positive().optional(),
        ce: z.number().int().positive().optional(),
      })
      .optional(),
    died: z
      .object({
        ah: z.number().int().positive().optional(),
        ce: z.number().int().positive().optional(),
        note: z.string().optional(), // e.g. "approximate", "still living"
      })
      .optional(),
    contemporary: z.boolean().default(false), // still living — displayed as "Contemporary" instead of a blank/unknown date
    origin: z.string().optional(),
    expertise: z.array(z.string()).default([]),
    significance: z.string().optional(),
    teachers: z.array(z.string()).default([]),
    students: z.array(z.string()).default([]),
    knownWorks: z.array(z.string()).default([]), // free-text titles, including works outside our catalog
  }),
});

/**
 * GUIDES collection — long-form methodology essays, e.g. "How to Study Fiqh".
 * Distinct content type: prose advice, not a catalog record.
 */
const guides = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    relatedScience: reference("sciences").optional(),
    summary: z.string().optional(),
  }),
});

/**
 * DASHBOARD collection — personal, fast-changing study state.
 * Kept entirely separate from `books` so editing "what page I'm on" never
 * risks touching stable catalog data, and so the schema can stay minimal
 * and very fast to edit by hand.
 */
const dashboard = defineCollection({
  type: "data", // YAML, no markdown body needed
  schema: z.object({
    status: z.enum(["studying", "reading", "memorizing", "to-buy", "completed"]),
    book: reference("books").optional(),   // optional: "to-buy" items may not exist as a book yet
    label: z.string().optional(),          // fallback free-text label (e.g. Arabic-only "to buy" items)
    science: reference("sciences").optional(), // for label-only entries, to allow grouping/filtering by science
    teacher: z.string().optional(),
    progress: z.string().optional(),       // e.g. "page 93", "episode 12.5"
    dateNote: z.string().optional(),       // e.g. "17th January 2026"
    note: z.string().optional(),           // extra detail shown under the title, e.g. "would like the Dar Ibn Hazm edition"
    priority: z.number().optional(),       // lower = more important; used to order the to-buy list
    rare: z.boolean().default(false),
    addedAt: z.date().optional(),
  }),
});

/**
 * NOTES collection — short editable announcements/updates/reminders shown on
 * the Dashboard. Each note is its own small file so adding one is just
 * dropping in a new file; no need to touch a growing shared document.
 */
const notes = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string().optional(),
    date: z.date().optional(),
    pinned: z.boolean().default(false), // pinned notes always sort first
  }),
});

export const collections = { books, sciences, pathways, guides, dashboard, scholars, notes };
