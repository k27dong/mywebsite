import { Combobox, ComboboxInput, ComboboxOption, ComboboxOptions } from "@headlessui/react"
import { useEffect, useMemo, useState } from "react"
import pinyin from "tiny-pinyin"
import { match } from "ts-pattern"

import { API_BASE_URL } from "@/consts"
import charactersData from "@/content/onepiece/characters.json"

import {
  type Character,
  CharacterField,
  type Language,
  TranslationKey,
  getHakiDisplay,
  useTranslation,
} from "./translations"

const characters: Character[] = charactersData as Character[]

// Match result types for cell coloring
type MatchResult = "correct" | "partial" | "wrong"

// Numeric comparison result - a closed set of outcomes
type NumericComparison =
  | { result: "correct" }
  | { result: "wrong"; direction: "up" }
  | { result: "wrong"; direction: "down" }
  | { result: "wrong" }
  | { result: "none" }

// Comparison helpers
const compareStrings = (guess: string | undefined, answer: string | undefined): MatchResult => {
  const g = (guess || "").toLowerCase().trim()
  const a = (answer || "").toLowerCase().trim()
  if (g === a) return "correct"
  return "wrong"
}

const compareAffiliation = (guess: Character, answer: Character): MatchResult => {
  const guessAff = guess.affiliations?.[0]?.toLowerCase().trim() || ""
  const answerAff = answer.affiliations?.[0]?.toLowerCase().trim() || ""
  return guessAff === answerAff ? "correct" : "wrong"
}

const compareHaki = (guess: Character, answer: Character): MatchResult => {
  const guessHaki = new Set((guess.haki || []).map((h) => h.toLowerCase()))
  const answerHaki = new Set((answer.haki || []).map((h) => h.toLowerCase()))

  const bothEmpty = guessHaki.size === 0 && answerHaki.size === 0
  const setsIdentical =
    guessHaki.size === answerHaki.size && [...guessHaki].every((h) => answerHaki.has(h))
  const hasOverlap = [...guessHaki].some((h) => answerHaki.has(h))

  return match({ bothEmpty, setsIdentical, hasOverlap })
    .with({ bothEmpty: true }, () => "correct" as const)
    .with({ setsIdentical: true }, () => "correct" as const)
    .with({ hasOverlap: true }, () => "partial" as const)
    .otherwise(() => "wrong" as const)
}

const compareAlive = (guess: Character, answer: Character): MatchResult => {
  return guess.status === answer.status ? "correct" : "wrong"
}

const compareNumber = (
  guess: number | undefined,
  answer: number | undefined,
): NumericComparison => {
  // Don't compare if either value is null/undefined
  if (guess == null || answer == null) return { result: "none" }
  if (guess === answer) return { result: "correct" }
  if (guess < answer) return { result: "wrong", direction: "up" }
  return { result: "wrong", direction: "down" }
}

const compareDebutArc = (guess: Character, answer: Character): NumericComparison => {
  const guessArc = (guess.debut_arc || "").toLowerCase().trim()
  const answerArc = (answer.debut_arc || "").toLowerCase().trim()

  // Exact arc match
  if (guessArc === answerArc && guessArc !== "") return { result: "correct" }

  // If arcs differ, compare by chapter number
  const guessChapter = guess.debut_chapter
  const answerChapter = answer.debut_chapter

  // Can't compare if either chapter is missing
  if (guessChapter == null || answerChapter == null) return { result: "wrong" }

  if (guessChapter === answerChapter) return { result: "correct" }
  if (guessChapter < answerChapter) return { result: "wrong", direction: "up" }
  return { result: "wrong", direction: "down" }
}

const DirectionArrow = ({ comparison }: { comparison: NumericComparison }) =>
  match(comparison)
    .with({ direction: "up" }, () => "↑")
    .with({ direction: "down" }, () => "↓")
    .with({ result: "correct" }, () => null)
    .with({ result: "wrong" }, () => null)
    .with({ result: "none" }, () => null)
    .exhaustive()

// Get background color class based on match result
const getMatchBgClass = (result: MatchResult): string =>
  match(result)
    .with("correct", () => "bg-emerald-400/90 text-emerald-950")
    .with("partial", () => "bg-amber-300/90 text-amber-950")
    .with("wrong", () => "bg-slate-300 text-slate-950")
    .exhaustive()

// Get background color class for numeric comparisons with direction
const getNumericMatchBgClass = (comparison: NumericComparison): string =>
  match(comparison)
    .with({ result: "correct" }, () => "bg-emerald-400/90 text-emerald-950")
    .with({ direction: "up" }, () => "bg-sky-500/20 text-sky-900")
    .with({ direction: "down" }, () => "bg-rose-500/20 text-rose-900")
    .with({ result: "wrong" }, () => "bg-slate-300 text-slate-950")
    .with({ result: "none" }, () => "text-gray-700")
    .exhaustive()

export default function OnePiece() {
  const [language, setLanguage] = useState<Language>("en")
  const t = useTranslation(language)
  const [query, setQuery] = useState("")
  const [guessHistory, setGuessHistory] = useState<Character[]>([])
  const [todaysCharacter, setTodaysCharacter] = useState<Character | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filter characters based on search term (supports English, Chinese, Japanese, and Pinyin)
  const filteredCharacters = useMemo(() => {
    if (!query.trim()) {
      return []
    }

    const term = query.toLowerCase()
    return characters
      .filter((char) => {
        const matchesEnglish = char.name.toLowerCase().includes(term)
        const matchesChinese = char.cn?.name?.includes(term)
        const matchesJapanese = char.japanese_name?.includes(term)
        const chineseName = char.cn?.name || ""
        const pinyinStr = pinyin.convertToPinyin(chineseName, "", true).toLowerCase()
        const matchesPinyin = pinyinStr.includes(term)
        return matchesEnglish || matchesChinese || matchesJapanese || matchesPinyin
      })
      .slice(0, 10)
  }, [query])

  // Handle image loading errors
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.style.display = "none"
  }

  // Connect to external language toggle button in Astro Callout and update text
  useEffect(() => {
    const toggleBtn = document.getElementById("language-toggle")
    if (!toggleBtn) {
      return
    }

    const handleToggle = () => {
      setLanguage((prev) => (prev === "en" ? "cn" : "en"))
    }

    toggleBtn.textContent = t(TranslationKey.LanguageButton)
    toggleBtn.addEventListener("click", handleToggle)

    return () => {
      toggleBtn.removeEventListener("click", handleToggle)
    }
  }, [language, t])

  // Fetch today's character from backend
  useEffect(() => {
    const fetchTodaysCharacter = async () => {
      try {
        setLoading(true)
        const response = await fetch(`${API_BASE_URL}/api/op/today`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        setTodaysCharacter(data)
        setError(null)
      } catch (err) {
        console.error("Failed to fetch today's character:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch character")
      } finally {
        setLoading(false)
      }
    }

    fetchTodaysCharacter()
  }, [])

  return (
    <div className="mx-auto max-w-screen-xl">
      {/* Search Bar */}
      <div className="relative mx-auto mb-8 max-w-2xl">
        <Combobox
          value={null}
          onChange={(char: Character | null) => {
            if (char) {
              setGuessHistory((prev) => [char, ...prev])
            }
            setQuery("")
          }}
        >
          <ComboboxInput
            onChange={(e) => setQuery(e.target.value)}
            displayValue={() => query}
            placeholder={t(TranslationKey.SearchPlaceholder)}
            className={`w-full rounded-none border border-black bg-white px-4 py-3 text-sm
              outline-none focus:shadow-[0_0_0_0.5px_black] sm:text-base md:text-lg
              ${t(TranslationKey.FontClass)}`}
            autoComplete="off"
          />

          {filteredCharacters.length > 0 && (
            <ComboboxOptions
              className="absolute left-0 right-0 z-10 mt-1 max-h-96 overflow-y-auto rounded-sm
                border border-black bg-white shadow-lg"
            >
              {filteredCharacters.map((char) => (
                <ComboboxOption
                  key={char.name}
                  value={char}
                  className="flex cursor-pointer items-center gap-3 border-b border-gray-200 px-4
                    py-3 transition-colors last:border-b-0 hover:bg-gray-100
                    data-[focus]:bg-gray-100"
                >
                  {/* Squared Image */}
                  <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-sm bg-gray-200">
                    <img
                      src={char.image}
                      alt={char.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      onError={handleImageError}
                    />
                  </div>

                  {/* Name + First Affiliation (single line) */}
                  <div
                    className={`min-w-0 flex-1 truncate text-sm sm:text-base md:text-lg
                    ${t(TranslationKey.FontClass)}`}
                  >
                    <span className="font-bold">{t(CharacterField.Name, char)}</span>
                    {t(CharacterField.Affiliation, char) && (
                      <span className="text-gray-500">
                        {" · "}
                        {t(CharacterField.Affiliation, char)}
                      </span>
                    )}
                  </div>
                </ComboboxOption>
              ))}
            </ComboboxOptions>
          )}
        </Combobox>
      </div>

      {/* Guess History Table */}
      {guessHistory.length > 0 && (
        <div className="mx-auto mt-8 border border-black bg-white">
          <table
            className={`w-full table-fixed border-collapse leading-snug
            ${t(TranslationKey.FontClass)} ${t(TranslationKey.TableTextSize)}`}
          >
            <thead>
              <tr className="border-b border-black bg-gray-50">
                <th className="w-[2%] border-r border-black px-1 py-2 text-center font-bold">#</th>
                <th className="w-[5%] border-r border-black px-1 py-2 text-center font-bold" />
                <th className="w-[12%] border-r border-black px-1 py-2 text-left font-bold">
                  {t(TranslationKey.Name)}
                </th>
                <th className="w-[12%] border-r border-black px-1 py-2 text-left font-bold">
                  {t(TranslationKey.Affiliation)}
                </th>
                <th className="w-[8%] border-r border-black px-1 py-2 text-left font-bold">
                  {t(TranslationKey.Origin)}
                </th>
                <th className="w-[13%] border-r border-black px-1 py-2 text-left font-bold">
                  {t(TranslationKey.Arc)}
                </th>
                <th className="w-[10%] border-r border-black px-1 py-2 text-center font-bold">
                  {t(TranslationKey.DevilFruit)}
                </th>
                <th className="w-[8%] border-r border-black px-1 py-2 text-center font-bold">
                  {t(TranslationKey.DevilFruitType)}
                </th>
                <th className="w-[8%] border-r border-black px-1 py-2 text-center font-bold">
                  {t(TranslationKey.Haki)}
                </th>
                <th className="w-[11%] border-r border-black px-1 py-2 text-right font-bold">
                  {t(TranslationKey.Bounty)}
                </th>
                <th className="w-[7%] border-r border-black px-2 py-2 text-center font-bold">
                  {t(TranslationKey.Height)}
                </th>
                <th className="w-[4%] px-1 py-2 text-center font-bold">
                  {t(TranslationKey.Alive)}
                </th>
              </tr>
            </thead>
            <tbody>
              {guessHistory.map((char, index) => (
                <tr
                  key={`${char.name}-${guessHistory.length - index}`}
                  className="border-b border-gray-600 transition-colors last:border-b-0"
                >
                  <td className="border-r border-black px-1 py-2 text-center text-gray-500">
                    {guessHistory.length - index}
                  </td>
                  <td className="border-r border-black px-1 py-1">
                    <div
                      className="mx-auto h-8 w-8 overflow-hidden rounded-sm bg-gray-200 sm:h-10
                        sm:w-10"
                    >
                      <img
                        src={char.image}
                        alt={char.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        onError={handleImageError}
                      />
                    </div>
                  </td>
                  <td className="break-words border-r border-black px-1 py-2 font-medium">
                    {t(CharacterField.Name, char)}
                  </td>
                  <td
                    className={`break-words border-r border-black px-1 py-2 ${
                      todaysCharacter
                        ? getMatchBgClass(compareAffiliation(char, todaysCharacter))
                        : "text-gray-700"
                    }`}
                  >
                    {t(CharacterField.Affiliation, char) || "—"}
                  </td>
                  <td
                    className={`break-words border-r border-black px-1 py-2 ${
                      todaysCharacter
                        ? getMatchBgClass(compareStrings(char.origin, todaysCharacter.origin))
                        : "text-gray-700"
                    }`}
                  >
                    {t(CharacterField.Origin, char) || "—"}
                  </td>
                  <td
                    className={`break-words border-r border-black px-1 py-2 ${
                      todaysCharacter
                        ? getNumericMatchBgClass(compareDebutArc(char, todaysCharacter))
                        : "text-gray-700"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="flex-1">{t(CharacterField.DebutArc, char) || "—"}</span>
                      <span className="inline-flex w-4 flex-shrink-0 justify-center">
                        {todaysCharacter && (
                          <DirectionArrow comparison={compareDebutArc(char, todaysCharacter)} />
                        )}
                      </span>
                    </div>
                  </td>
                  <td
                    className={`break-words border-r border-black px-1 py-2 text-center ${
                      todaysCharacter
                        ? getMatchBgClass(
                            compareStrings(char.devil_fruit_name, todaysCharacter.devil_fruit_name),
                          )
                        : "text-gray-700"
                    }`}
                  >
                    {t(CharacterField.DevilFruit, char)}
                  </td>
                  <td
                    className={`break-words border-r border-black px-1 py-2 text-center ${
                      todaysCharacter
                        ? getMatchBgClass(
                            compareStrings(char.devil_fruit_type, todaysCharacter.devil_fruit_type),
                          )
                        : "text-gray-700"
                    }`}
                  >
                    {t(CharacterField.DevilFruitType, char)}
                  </td>
                  <td
                    className={`border-r border-black px-1 py-2 ${
                      todaysCharacter
                        ? getMatchBgClass(compareHaki(char, todaysCharacter))
                        : "text-gray-700"
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center">
                      {getHakiDisplay(char, language).map((label, i) => (
                        <div key={i} className="leading-tight">
                          {label}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td
                    className={`break-words border-r border-black px-1 py-2 text-right ${
                      todaysCharacter
                        ? getNumericMatchBgClass(compareNumber(char.bounty, todaysCharacter.bounty))
                        : "text-gray-700"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="flex-1 text-right">{t(CharacterField.Bounty, char)}</span>
                      <span className="inline-flex w-4 flex-shrink-0 justify-center">
                        {todaysCharacter && (
                          <DirectionArrow
                            comparison={compareNumber(char.bounty, todaysCharacter.bounty)}
                          />
                        )}
                      </span>
                    </div>
                  </td>
                  <td
                    className={`break-words border-r border-black px-2 py-2 text-center ${
                      todaysCharacter
                        ? getNumericMatchBgClass(compareNumber(char.height, todaysCharacter.height))
                        : "text-gray-700"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="flex-1 text-center">{t(CharacterField.Height, char)}</span>
                      <span className="inline-flex w-4 flex-shrink-0 justify-center">
                        {todaysCharacter && (
                          <DirectionArrow
                            comparison={compareNumber(char.height, todaysCharacter.height)}
                          />
                        )}
                      </span>
                    </div>
                  </td>
                  <td
                    className={`break-words px-1 py-2 text-center ${
                      todaysCharacter
                        ? getMatchBgClass(compareAlive(char, todaysCharacter))
                        : "text-gray-700"
                    }`}
                  >
                    {t(CharacterField.Alive, char)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
