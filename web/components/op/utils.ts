import { match } from "ts-pattern"

import type { Character, ComparisonResult } from "./types"

// Generic comparison helpers
export const compareStrings = (
  guess: string | undefined,
  answer: string | undefined,
): ComparisonResult => {
  const g = (guess || "").toLowerCase().trim()
  const a = (answer || "").toLowerCase().trim()
  return { status: g === a ? "correct" : "wrong" }
}

export const compareNumber = (
  guess: number | undefined,
  answer: number | undefined,
): ComparisonResult => {
  if (guess == null || answer == null) return { status: "none" }
  if (guess === answer) return { status: "correct" }
  return {
    status: "wrong",
    direction: guess < answer ? "up" : "down",
  }
}

// Character specific comparisons
export const compareAffiliation = (guess: Character, answer: Character): ComparisonResult => {
  const guessAff = guess.affiliations?.[0]?.toLowerCase().trim() || ""
  const answerAff = answer.affiliations?.[0]?.toLowerCase().trim() || ""
  return { status: guessAff === answerAff ? "correct" : "wrong" }
}

export const compareHaki = (guess: Character, answer: Character): ComparisonResult => {
  const guessHaki = new Set((guess.haki || []).map((h) => h.toLowerCase()))
  const answerHaki = new Set((answer.haki || []).map((h) => h.toLowerCase()))

  const bothEmpty = guessHaki.size === 0 && answerHaki.size === 0
  const setsIdentical =
    guessHaki.size === answerHaki.size && [...guessHaki].every((h) => answerHaki.has(h))
  const hasOverlap = [...guessHaki].some((h) => answerHaki.has(h))

  const status = match({ bothEmpty, setsIdentical, hasOverlap })
    .with({ bothEmpty: true }, () => "correct" as const)
    .with({ setsIdentical: true }, () => "correct" as const)
    .with({ hasOverlap: true }, () => "partial" as const)
    .otherwise(() => "wrong" as const)

  return { status }
}

export const compareAlive = (guess: Character, answer: Character): ComparisonResult => {
  return { status: guess.status === answer.status ? "correct" : "wrong" }
}

export const compareDebutArc = (guess: Character, answer: Character): ComparisonResult => {
  const guessArc = (guess.debut_arc || "").toLowerCase().trim()
  const answerArc = (answer.debut_arc || "").toLowerCase().trim()

  // Exact arc match
  if (guessArc === answerArc && guessArc !== "") return { status: "correct" }

  // Fallback to chapter number comparison
  const numericComparison = compareNumber(guess.debut_chapter, answer.debut_chapter)

  // If we can't compare chapters (missing data) but arcs didn't match, it's wrong
  if (numericComparison.status === "none") {
    return { status: "wrong" }
  }

  return numericComparison
}

// Styling helpers
export const getMatchBgClass = (comparison: ComparisonResult): string =>
  match(comparison)
    .with({ status: "correct" }, () => "bg-emerald-400/90 text-emerald-950")
    .with({ status: "partial" }, () => "bg-amber-300/90 text-amber-950")
    // Handle directions for numeric hints
    .with({ direction: "up" }, () => "bg-sky-500/20 text-sky-900")
    .with({ direction: "down" }, () => "bg-rose-500/20 text-rose-900")
    // Standard wrong match
    .with({ status: "wrong" }, () => "bg-slate-300 text-slate-950")
    .with({ status: "none" }, () => "text-gray-700")
    .exhaustive()
