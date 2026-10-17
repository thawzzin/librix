import { z } from "zod";

const identifierSchema = z
  .union([z.string(), z.number().int()])
  .transform(String)
  .pipe(z.string().trim().min(1));

export const borrowBookRequestSchema = z.object({
  gutendexId: identifierSchema,
  title: z.string().trim().min(1).default("Unknown Title"),
  author: z.string().trim().min(1).default("Unknown Author"),
  coverImage: z.string().url().nullable().optional().default(null),
  formats: z.record(z.string(), z.string()).optional().default({}),
});

export const returnBookRequestSchema = z.object({
  rentalId: z.string().trim().min(1, "Rental ID is required"),
});
