import { Combobox, ComboboxInput, ComboboxOption, ComboboxOptions } from "@headlessui/react"
import { useEffect, useMemo, useState } from "react"
import pinyin from "tiny-pinyin"
import { match } from "ts-pattern"

import { API_BASE_URL } from "@/consts"
import charactersData from "@/content/onepiece/characters.json"

import { getHakiDisplay, useTranslation } from "./translations"
import {
  type Character,
  CharacterField,
  type ComparisonResult,
  type Language,
  TranslationKey,
} from "./types"
import {
  compareAffiliation,
  compareAlive,
  compareDebutArc,
  compareHaki,
  compareNumber,
  compareStrings,
  getMatchBgClass,
} from "./utils"

const characters: Character[] = charactersData as Character[]

const DirectionArrow = ({ comparison }: { comparison: ComparisonResult }) =>
  match(comparison)
    .with({ direction: "up" }, () => "↑")
    .with({ direction: "down" }, () => "↓")
    .otherwise(() => null)

const LegendItem = ({
  colorClass,
  label,
  symbol,
}: {
  colorClass: string
  label: string
  symbol?: string
}) => (
  <div className="flex items-center gap-2">
    <div
      className={`flex h-6 w-6 items-center justify-center rounded-sm border border-black/10 text-sm font-bold ${colorClass}`}
    >
      {symbol}
    </div>
    <span className="text-sm font-medium text-gray-700">{label}</span>
  </div>
)

const Legend = ({ t }: { t: (key: TranslationKey) => string }) => (
  <div className="mb-8 flex flex-wrap justify-center gap-x-6 gap-y-3 px-4">
    <LegendItem colorClass="bg-emerald-400/90" label={t(TranslationKey.LegendCorrect)} />
    <LegendItem colorClass="bg-amber-300/90" label={t(TranslationKey.LegendPartial)} />
    <LegendItem colorClass="bg-slate-300" label={t(TranslationKey.LegendWrong)} />
    <LegendItem
      colorClass="bg-sky-500/20 text-sky-900"
      label={t(TranslationKey.LegendHigher)}
      symbol="↑"
    />
    <LegendItem
      colorClass="bg-rose-500/20 text-rose-900"
      label={t(TranslationKey.LegendLower)}
      symbol="↓"
    />
  </div>
)

const Countdown = ({ t }: { t: (key: TranslationKey) => string }) => {
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date()
      const tomorrow = new Date(now)
      tomorrow.setUTCHours(24, 0, 0, 0)
      const diff = tomorrow.getTime() - now.getTime()

      if (diff > 0) {
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
        const minutes = Math.floor((diff / (1000 * 60)) % 60)
        const seconds = Math.floor((diff / 1000) % 60)
        setTimeLeft({ hours, minutes, seconds })
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="flex flex-col items-center gap-1 rounded-sm bg-gray-100 p-4">
      <div className="text-sm font-medium text-gray-600">{t(TranslationKey.NextCharacterIn)}</div>
      <div className="font-mono text-xl font-bold tracking-wider text-gray-900 sm:text-2xl">
        {String(timeLeft.hours).padStart(2, "0")}:{String(timeLeft.minutes).padStart(2, "0")}:
        {String(timeLeft.seconds).padStart(2, "0")}
      </div>
    </div>
  )
}

export default function OnePiece() {
  const [language, setLanguage] = useState<Language>("en")
  const t = useTranslation(language)
  const [query, setQuery] = useState("")
  const [guessHistory, setGuessHistory] = useState<Character[]>([])
  const [todaysCharacter, setTodaysCharacter] = useState<Character | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Initialize state from local storage on mount
  useEffect(() => {
    try {
      // Load language preference
      const savedLang = localStorage.getItem("op_language") as Language | null
      if (savedLang && (savedLang === "en" || savedLang === "cn")) {
        setLanguage(savedLang)
      }

      const saved = localStorage.getItem("op_game_state")
      if (saved) {
        const { date, history } = JSON.parse(saved)
        const today = new Date().toISOString().split("T")[0]
        if (date === today) {
          // Restore history if it's the same day
          const restoredHistory = history
            .map((name: string) => characters.find((c) => c.name === name))
            .filter((c: Character | undefined): c is Character => c !== undefined)
          setGuessHistory(restoredHistory)
        } else {
          // Clear storage if it's a new day
          localStorage.removeItem("op_game_state")
        }
      }
    } catch (e) {
      console.error("Failed to load game state:", e)
    }
  }, [])

  // Save state when history changes
  useEffect(() => {
    if (guessHistory.length > 0) {
      const state = {
        date: new Date().toISOString().split("T")[0],
        history: guessHistory.map((c) => c.name),
      }
      localStorage.setItem("op_game_state", JSON.stringify(state))
    }
  }, [guessHistory])

  // Save language preference
  useEffect(() => {
    localStorage.setItem("op_language", language)
  }, [language])

  const hasWon =
    guessHistory.length > 0 &&
    todaysCharacter &&
    guessHistory[0].name === todaysCharacter.name

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
      <Legend t={t} />

      {hasWon && todaysCharacter ? (
        <div className="mx-auto mb-8 max-w-2xl animate-pop">
          <div className="flex flex-col items-center gap-6 rounded-sm border border-emerald-200 bg-emerald-50 p-8 shadow-sm">
            <div className="text-center">
              <h2 className={`mb-2 text-2xl font-bold text-emerald-800 ${t(TranslationKey.FontClass)}`}>
                {t(TranslationKey.SuccessTitle)}
              </h2>
              <div className={`text-lg text-emerald-700 ${t(TranslationKey.FontClass)}`}>
                <span className="font-bold">{t(CharacterField.Name, todaysCharacter)}</span>
              </div>
            </div>

            <div className="h-32 w-32 overflow-hidden rounded-sm border-2 border-emerald-200 shadow-md sm:h-40 sm:w-40">
              <img
                src={todaysCharacter.image}
                alt={todaysCharacter.name}
                className="h-full w-full object-cover"
                loading="lazy"
                referrerPolicy="no-referrer"
                onError={handleImageError}
              />
            </div>

            <Countdown t={t} />
          </div>
        </div>
      ) : (
        /* Search Bar */
        <div className="relative mx-auto mb-8 max-w-2xl">
          <Combobox
            value={null}
            onChange={(char: Character | null) => {
              if (char) {
                if (guessHistory.some((guess) => guess.name === char.name)) {
                  return
                }
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
                {filteredCharacters.map((char) => {
                  const isGuessed = guessHistory.some((guess) => guess.name === char.name)
                  return (
                    <ComboboxOption
                      key={char.name}
                      value={char}
                      disabled={isGuessed}
                      className={`flex cursor-pointer items-center gap-3 border-b border-gray-200 px-4
                    py-3 transition-colors last:border-b-0
                    ${
                      isGuessed
                        ? "cursor-not-allowed bg-gray-50 opacity-60"
                        : "hover:bg-gray-100 data-[focus]:bg-gray-100"
                    }`}
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
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{t(CharacterField.Name, char)}</span>
                          {isGuessed && (
                            <span className="rounded bg-gray-200 px-1.5 py-0.5 text-xs text-gray-600">
                              {t(TranslationKey.SelectedCharacter)}
                            </span>
                          )}
                        </div>
                        {t(CharacterField.Affiliation, char) && (
                          <span className="text-gray-500">
                            {t(CharacterField.Affiliation, char)}
                          </span>
                        )}
                      </div>
                    </ComboboxOption>
                  )
                })}
              </ComboboxOptions>
            )}
          </Combobox>
        </div>
      )}

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
                        ? getMatchBgClass(compareDebutArc(char, todaysCharacter))
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
                        ? getMatchBgClass(compareNumber(char.bounty, todaysCharacter.bounty))
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
                        ? getMatchBgClass(compareNumber(char.height, todaysCharacter.height))
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
