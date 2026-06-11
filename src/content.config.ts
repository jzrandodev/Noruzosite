import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

// Scaffolded for the future case-studies section. Add markdown files to
// src/content/case-studies/ and a src/pages/work/[slug].astro page to use it.
const caseStudies = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/case-studies" }),
  schema: z.object({
    title: z.string(),
    client: z.string(),
    summary: z.string(),
    date: z.coerce.date(),
    cover: z.string().optional(),
  }),
});

export const collections = { "case-studies": caseStudies };
