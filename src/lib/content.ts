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

export async function getPathwaysForScience(scienceId: string) {
  const pathways = await getCollection("pathways");
  return pathways.filter((p) => p.data.science.slug === scienceId);
}

export const levelLabel: Record<string, string> = {
  beginner: "Beginner",
  "beginner-intermediate": "Beginner–Intermediate",
  intermediate: "Intermediate",
  "intermediate-advanced": "Intermediate–Advanced",
  advanced: "Advanced",
};
