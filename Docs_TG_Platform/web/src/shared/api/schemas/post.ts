import { z } from "zod";

export const postStatusSchema = z.enum(["published", "scheduled", "draft"]);

export const postSchema = z.object({
  id: z.number(),
  status: postStatusSchema,
  created: z.string(),
  text: z.string(),
  rubric: z.string().nullable(),
});

export const postsListSchema = z.array(postSchema);

export const globalNoteSchema = z.object({
  id: z.string(),
  title: z.string(),
  body: z.string(),
  ai: z.boolean(),
  date: z.string(),
});

export type PostDto = z.infer<typeof postSchema>;
export type GlobalNoteDto = z.infer<typeof globalNoteSchema>;
