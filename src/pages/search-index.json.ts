import type { APIRoute } from "astro";
import { getCollection, getEntry } from "astro:content";

export const prerender = true;

export const GET: APIRoute = async () => {
  const books = await getCollection("books");

  const index = await Promise.all(
    books.map(async (b) => {
      const science = await getEntry(b.data.science);
      return {
        slug: b.slug,
        title: b.data.title,
        titleAr: b.data.titleAr ?? "",
        author: b.data.author ?? "",
        science: science?.data.title ?? "",
        scienceSlug: science?.slug ?? "",
        type: b.data.type,
        level: b.data.level ?? "",
        tags: b.data.tags.join(" "),
        notes: b.data.notes ?? "",
      };
    })
  );

  return new Response(JSON.stringify(index), {
    headers: { "Content-Type": "application/json" },
  });
};
