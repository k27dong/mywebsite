import { defineCollection, z } from "astro:content"

const posts = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    displaytitle: z.string().optional(),
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

const experiences = defineCollection({
  type: "data",
  schema: z.object({
    company: z.string(),
    id: z.number(),
    role: z.string(),
    date: z.string(),
    location: z.string(),
    description: z.array(z.string()).optional(),
    points: z.array(z.string()).optional(),
    is_internship: z.boolean().optional().default(false),
  }),
})

const skills = defineCollection({
  type: "data",
  schema: z.object({
    name: z.string(),
    id: z.number(),
    items: z.array(z.string()),
  }),
})

const projects = defineCollection({
  type: "data",
  schema: z.object({
    name: z.string(),
    id: z.number(),
    language: z.array(z.string()),
    description: z.string(),
    link: z.string().optional(),
  }),
})

export const collections = { posts, booknotes, experiences, skills, projects }
