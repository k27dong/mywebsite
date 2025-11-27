import { useState, useMemo, useEffect } from "react"
import {
  Combobox,
  ComboboxInput,
  ComboboxOptions,
  ComboboxOption,
} from "@headlessui/react"
import pinyin from "tiny-pinyin"
import charactersData from "../../content/onepiece/characters.json"
import { API_BASE_URL } from "../../consts"
import {
  type Language,
  type Character,
  TranslationKey,
  CharacterField,
  useTranslation,
} from "./translations"

const characters: Character[] = charactersData as Character[]

export default function OnePiece() {
  const [language, setLanguage] = useState<Language>("en")
  const t = useTranslation(language)
  const [query, setQuery] = useState("")
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(
    null,
  )
  const [todaysCharacter, setTodaysCharacter] = useState<Character | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filter characters based on search term (supports English, Chinese, Japanese, and Pinyin)
  const filteredCharacters = useMemo(() => {
    if (!query.trim()) return []

    const term = query.toLowerCase()
    return characters
      .filter((char) => {
        const matchesEnglish = char.name.toLowerCase().includes(term)
        const matchesChinese = char.cn?.name?.includes(term)
        const matchesJapanese = char.japanese_name?.includes(term)
        // Pinyin matching for Chinese names
        const chineseName = char.cn?.name || ""
        const pinyinStr = pinyin
          .convertToPinyin(chineseName, "", true)
          .toLowerCase()
        const matchesPinyin = pinyinStr.includes(term)
        return (
          matchesEnglish || matchesChinese || matchesJapanese || matchesPinyin
        )
      })
      .slice(0, 10)
  }, [query])

  // Connect to external language toggle button in Astro Callout
  useEffect(() => {
    const toggleBtn = document.getElementById("language-toggle")

    const handleToggle = () => {
      setLanguage((prev) => (prev === "en" ? "cn" : "en"))
    }

    toggleBtn?.addEventListener("click", handleToggle)
    return () => toggleBtn?.removeEventListener("click", handleToggle)
  }, [])

  // Update button text when language changes
  useEffect(() => {
    const toggleBtn = document.getElementById("language-toggle")
    if (toggleBtn) {
      toggleBtn.textContent = t(TranslationKey.LanguageButton)
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
        setError(
          err instanceof Error ? err.message : "Failed to fetch character",
        )
      } finally {
        setLoading(false)
      }
    }

    fetchTodaysCharacter()
  }, [])

  return (
    <div className="mx-auto max-w-5xl">
      {/* Search Bar */}
      <div className="relative mx-auto mb-8 max-w-2xl">
        <Combobox
          value={selectedCharacter}
          onChange={(char) => {
            setSelectedCharacter(char)
            setQuery("")
          }}
        >
          <ComboboxInput
            onChange={(e) => setQuery(e.target.value)}
            displayValue={() => query}
            placeholder={t(TranslationKey.SearchPlaceholder)}
            className={`w-full rounded-none border border-black bg-white px-4 py-3
              text-base outline-none focus:shadow-[0_0_0_0.5px_black]
              ${t(TranslationKey.FontClass)}`}
            autoComplete="off"
          />

          {filteredCharacters.length > 0 && (
            <ComboboxOptions
              className="absolute left-0 right-0 z-10 mt-1 max-h-96
                overflow-y-auto rounded-sm border border-black bg-white shadow-lg"
            >
              {filteredCharacters.map((char) => (
                <ComboboxOption
                  key={char.name}
                  value={char}
                  className="flex cursor-pointer items-center gap-3 border-b
                    border-gray-200 px-4 py-3 transition-colors last:border-b-0
                    hover:bg-gray-100 data-[focus]:bg-gray-100"
                >
                  {/* Squared Image */}
                  <div
                    className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-sm
                      bg-gray-200"
                  >
                    <img
                      src={char.image}
                      alt={char.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const target = e.currentTarget
                        target.style.display = "none"
                      }}
                    />
                  </div>

                  {/* Name + First Affiliation (single line) */}
                  <div
                    className={`min-w-0 flex-1 truncate text-base ${t(TranslationKey.FontClass)}`}
                  >
                    <span className="font-bold">
                      {t(CharacterField.Name, char)}
                    </span>
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

      {/* Selected Character Display (for testing) */}
      {selectedCharacter && (
        <div
          className="mx-auto max-w-2xl rounded-sm border border-black bg-white
            p-6"
        >
          <h3 className={`mb-4 text-lg font-bold ${t(TranslationKey.FontClass)}`}>
            {t(TranslationKey.SelectedCharacter)}:
          </h3>
          <div className="flex items-start gap-4">
            <div
              className="h-32 w-32 flex-shrink-0 overflow-hidden rounded-sm
                bg-gray-200"
            >
              <img
                src={selectedCharacter.image}
                alt={selectedCharacter.name}
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className={`flex-1 text-sm ${t(TranslationKey.FontClass)}`}>
              <p>
                <strong>{t(TranslationKey.Name)}:</strong>{" "}
                {t(CharacterField.Name, selectedCharacter)}
              </p>
              <p>
                <strong>{t(TranslationKey.Affiliation)}:</strong>{" "}
                {t(CharacterField.Affiliation, selectedCharacter)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

