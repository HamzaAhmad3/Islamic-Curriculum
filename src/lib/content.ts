import { getCollection, getEntry, type CollectionEntry } from "astro:content";

export async function getSciencesSorted() {
  const sciences = await getCollection("sciences");
  return sciences.sort((a, b) => a.data.order - b.data.order);
}

export async function getBooksForScience(scienceId: string) {
  const books = await getCollection("books");
  return books.filter((b) => b.data.science.slug === scienceId);
}

export async function getCommentariesFor(bookId: string) {
  const books = await getCollection("books");
  return books.filter((b) => b.data.parent?.slug === bookId);
}

/**
 * All commentaries reachable from a book, at any depth — a hashiyah written
 * on a sharh (rather than directly on the matn) still needs to surface
 * somewhere, so this walks the full parent chain rather than stopping one
 * level down.
 */
export async function getAllDescendantCommentaries(
  bookId: string
): Promise<CollectionEntry<"books">[]> {
  const direct = await getCommentariesFor(bookId);
  const nested = await Promise.all(direct.map((c) => getAllDescendantCommentaries(c.slug)));
  return [...direct, ...nested.flat()];
}

export async function getBookCountByScience() {
  const books = await getCollection("books");
  const counts = new Map<string, number>();
  for (const book of books) {
    const id = book.data.science.slug;
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  return counts;
}

export async function resolvePathwayNodes(pathway: CollectionEntry<"pathways">) {
  const resolved = await Promise.all(
    pathway.data.nodes.map((ref) => getEntry(ref))
  );
  return resolved.filter((b): b is CollectionEntry<"books"> => Boolean(b));
}

export async function resolvePathwaySupplementary(pathway: CollectionEntry<"pathways">) {
  const resolved = await Promise.all(
    (pathway.data.supplementary ?? []).map((ref) => getEntry(ref))
  );
  return resolved.filter((b): b is CollectionEntry<"books"> => Boolean(b));
}

/**
 * Books belonging to a science that aren't reachable from any of its pathways —
 * neither as a pathway node, a commentary on a pathway node, nor a listed
 * supplementary work. Surfaced separately so nothing already catalogued is
 * silently missing from a science page just because it isn't part of a
 * named sequence yet (e.g. tabaqat works, mandatory references, riwayat).
 */
export async function getUncoveredBooksForScience(scienceId: string) {
  const [books, pathways] = await Promise.all([
    getBooksForScience(scienceId),
    getPathwaysForScience(scienceId),
  ]);

  const covered = new Set<string>();
  for (const pathway of pathways) {
    for (const ref of pathway.data.nodes) covered.add(ref.slug);
    for (const ref of pathway.data.supplementary ?? []) covered.add(ref.slug);
  }
  // A commentary is "covered" if it's reachable via the full parent chain
  // from any covered node — walk up from each book to see if it eventually
  // lands on something already covered, however many levels deep.
  for (const book of books) {
    let current = book;
    const seen = new Set<string>();
    while (current.data.parent && !seen.has(current.slug)) {
      seen.add(current.slug);
      if (covered.has(current.data.parent.slug)) {
        for (const s of seen) covered.add(s);
        break;
      }
      const next = books.find((b) => b.slug === current.data.parent!.slug);
      if (!next) break;
      current = next;
    }
  }

  return books.filter((b) => !covered.has(b.slug));
}

export async function getPathwaysForScience(scienceId: string) {
  const pathways = await getCollection("pathways");
  return pathways.filter((p) => p.data.science.slug === scienceId);
}

export async function getGuidesForScience(scienceId: string) {
  const guides = await getCollection("guides");
  return guides.filter((g) => g.data.relatedScience?.slug === scienceId);
}

export async function getSortedScholars() {
  const scholars = await getCollection("scholars");
  return scholars.sort((a, b) => {
    const da = a.data.died?.ah ?? a.data.died?.ce ?? 99999;
    const db = b.data.died?.ah ?? b.data.died?.ce ?? 99999;
    return da - db;
  });
}

export async function getBooksByScholar(scholar: CollectionEntry<"scholars">) {
  const books = await getCollection("books");
  const aliases = scholar.data.aliases;
  if (aliases.length === 0) return [];
  return books.filter((b) => {
    if (!b.data.author) return false;
    return aliases.some((alias) => b.data.author!.includes(alias));
  });
}

export const levelLabel: Record<string, string> = {
  beginner: "Beginner",
  "beginner-intermediate": "Beginner–Intermediate",
  intermediate: "Intermediate",
  "intermediate-advanced": "Intermediate–Advanced",
  advanced: "Advanced",
};
