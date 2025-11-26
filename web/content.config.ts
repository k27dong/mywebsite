import { defineCollection, z } from "astro:content"
import { glob } from "astro/loaders"

const posts = defineCollection({
  loader: glob({
    base: "./web/content/posts",
    pattern: "**/*.md",
  }),
  schema: z.object({
    title: z.coerce.string(),
    displaytitle: z.coerce.string().optional(),
    abbrlink: z.coerce.number(),
    date: z.coerce.date(),
    disabled: z.boolean().optional().default(false),
  }),
})

const booknotes = defineCollection({
  loader: glob({
    base: "./web/content/booknotes",
    pattern: "**/*.json",
  }),
  schema: z.object({
    title: z.coerce.string(),
    author: z.string(),
    id: z.number(),
    notenum: z.number(),
    rating: z.coerce.number(),
    tags: z.array(z.string()),
    content: z.array(
      z.object({
        name: z.string(),
        notes: z.array(z.string()),
      }),
    ),
  }),
})

const experiences = defineCollection({
  loader: glob({
    base: "./web/content/experiences",
    pattern: "**/*.yaml",
  }),
  schema: z
    .object({
      company: z.string(),
      role: z.string(),
      date: z.string(),
      location: z.string(),
      description: z.array(z.string()).optional(),
      points: z.array(z.string()).optional(),
      is_internship: z.boolean().optional().default(false),
      link: z.string().url().optional(),
    })
    .transform((data) => {
      const [startStr, endStr] = data.date.split(" - ")

      let year = new Date().getFullYear()
      if (endStr) {
        const yearMatch = endStr.match(/\d{4}/)
        if (yearMatch) year = parseInt(yearMatch[0])
      }

      const parseDate = (str: string, fallbackYear: number) => {
        const parts = str.trim().split(" ")
        const month = parts[0]
        const y = parts.length > 1 ? parseInt(parts[1]) : fallbackYear
        return new Date(`${month} 1, ${y}`)
      }

      return {
        ...data,
        startDate: parseDate(startStr, year),
      }
    }),
})

const skills = defineCollection({
  loader: glob({
    base: "./web/content/skills",
    pattern: "**/*.yaml",
  }),
  schema: z.object({
    name: z.string(),
    id: z.number(),
    items: z.array(z.string()),
  }),
})

const projects = defineCollection({
  loader: glob({
    base: "./web/content/projects",
    pattern: "**/*.yaml",
  }),
  schema: z.object({
    name: z.string(),
    id: z.number(),
    language: z.array(z.string()),
    description: z.string(),
    link: z.string().optional(),
  }),
})

const onepiece = defineCollection({
  loader: glob({
    base: "./web/content/onepiece",
    pattern: "characters.json",
  }),
  schema: z.array(
    z.object({
      name: z.string(),
      japanese_name: z.string(),
      image: z.string(),
      debut_chapter: z.number(),
      debut_arc: z.string(),
      affiliations: z.array(z.string()),
      occupations: z.array(z.string()).optional(),
      residence: z.array(z.string()).optional(),
      origin: z.string(),
      bounty: z.number(),
      status: z.string(),
      age: z.number().optional(),
      birthday: z.string().optional(),
      height: z.number().optional(),
      devil_fruit_name: z.string().optional(),
      devil_fruit_type: z.string().optional(),
      haki: z.array(z.string()),
      cn: z.object({
        name: z.string(),
        affiliations: z.array(z.string()),
        origin: z.string(),
        debut_arc: z.string(),
        devil_fruit_name: z.string().optional(),
        devil_fruit_type: z.string().optional(),
        haki: z.array(z.string()),
      }),
    })
  ),
})

export const collections = { posts, booknotes, experiences, skills, projects, onepiece }


