import { defineCollection, z } from "astro:content"

const blog = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    abbrlink: z.coerce.number(),
    date: z.coerce.date(),
    disabled: z.boolean().optional().default(false),
  }),
})

const booknotes = defineCollection({
  type: "data",
  schema: z.object({
    title: z.string(),
    author: z.string(),
    id: z.number(),
    notenum: z.number(),
    rating: z.coerce.number(),
    tags: z.array(z.string()),
    content: z.array(z.object({
      name: z.string(),
      notes: z.array(z.string()),
    })),
  }),
})

export const collections = { blog, booknotes }
