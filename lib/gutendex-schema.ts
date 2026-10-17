import { z } from "zod";

export const personSchema = z.object({
  name: z.string(),
  birth_year: z.number().nullable().default(null),
  death_year: z.number().nullable().default(null),
});

export const bookSchema = z
  .object({
    id: z.number().int(),
    title: z.string(),
    authors: z.array(personSchema).default([]),
    translators: z.array(personSchema).default([]),
    subjects: z.array(z.string()).default([]),
    bookshelves: z.array(z.string()).default([]),
    languages: z.array(z.string()).default([]),
    copyright: z.boolean().nullable().default(null),
    media_type: z.string().default("Text"),
    formats: z.record(z.string(), z.string()).default({}),
    download_count: z.number().default(0),
    summaries: z.array(z.string()).optional(),
  })
  .passthrough();

export const responseSchema = z.object({
  count: z.number().int().nonnegative(),
  next: z.string().nullable(),
  previous: z.string().nullable(),
  results: z.array(bookSchema),
});
