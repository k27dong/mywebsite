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

export const collections = { blog }
