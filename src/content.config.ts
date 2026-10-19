import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

// Case studies: one markdown file per language in
// src/content/case-studies/{en,es}/<key>.md
const caseStudies = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/case-studies" }),
  schema: z.object({
    lang: z.enum(["en", "es"]),
    key: z.string(), // shared across languages; not "slug", which the loader treats as the entry id
    order: z.number(),
    concept: z.boolean().default(true),
    kind: z.enum(["website", "system"]),
    title: z.string(),
    clinic: z.string(),
    place: z.string(),
    summary: z.string(),
    highlights: z.array(z.string()),
    deliverables: z.array(z.string()),
    measure: z.array(z.string()),
  }),
});

export const collections = { "case-studies": caseStudies };
