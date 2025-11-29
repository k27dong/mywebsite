import { useState, useMemo, useEffect, useRef } from "react"
import pinyin from "tiny-pinyin"
import charactersData from "../../content/onepiece/characters.json"

type Language = "en" | "cn"

interface Character {
  name: string
  japanese_name?: string
  image: string
  debut_chapter?: number
  debut_arc?: string
  affiliations?: string[]
  occupations?: string[]
  origin?: string
  bounty?: number
  status?: string
  age?: number
  birthday?: string
  height?: number
  devil_fruit_name?: string
  devil_fruit_type?: string
  haki?: string[]
  cn?: {
    name?: string
    affiliations?: string[]
    origin?: string
    debut_arc?: string
    devil_fruit_name?: string
    devil_fruit_type?: string
    haki?: string[]
  }
}

const characters: Character[] = charactersData as Character[]

export default function OnePiece() {
  const [language, setLanguage] = useState<Language>("en")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(
    null,
  )
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Helper to strip bracketed text like "(former)" or "(temporarily)"
  const stripBrackets = (text: string) =>
    text.replace(/\s*\([^)]*\)/g, "").trim()

  // Helper to get localized text
  const getText = (char: Character, field: "name" | "affiliations") => {
    if (language === "cn") {
      if (field === "name") return char.cn?.name || char.name
      if (field === "affiliations") {
        const affiliation =
          char.cn?.affiliations?.[0] || char.affiliations?.[0] || ""
        return stripBrackets(affiliation)
      }
    }
    if (field === "name") return char.name
    if (field === "affiliations")
      return stripBrackets(char.affiliations?.[0] || "")
    return ""
  }

  // Filter characters based on search term (supports English, Chinese, Japanese, and Pinyin)
  const filteredCharacters = useMemo(() => {
    if (!searchTerm.trim()) return []

    const term = searchTerm.toLowerCase()
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
  }, [searchTerm])

  const handleSelectCharacter = (character: Character) => {
    setSelectedCharacter(character)
    setSearchTerm("") // Clear input after selection
    setShowDropdown(false)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

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
      toggleBtn.textContent = language === "en" ? "EN" : "汉"
    }
  }, [language])

  // Font class based on language
  const fontClass = language === "cn" ? "font-sourcehan" : "font-jbmono"

  return (
    <div className="mx-auto max-w-5xl">
      {/* Search Bar */}
      <div className="relative mx-auto mb-8 max-w-2xl">
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setShowDropdown(true)
          }}
          onFocus={() => setShowDropdown(true)}
          placeholder={
            language === "en" ? "Search for a character..." : "搜索角色..."
          }
          className={`w-full rounded-none border border-black bg-white px-4 py-3
            text-base outline-none focus:shadow-[0_0_0_0.5px_black]
            ${fontClass}`}
          autoComplete="off"
        />

        {/* Dropdown */}
        {showDropdown && filteredCharacters.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute left-0 right-0 z-10 mt-1 max-h-96
              overflow-y-auto rounded-sm border border-black bg-white shadow-lg"
          >
            {filteredCharacters.map((char, index) => (
              <div
                key={`${char.name}-${index}`}
                onClick={() => handleSelectCharacter(char)}
                className="flex cursor-pointer items-center gap-3 border-b
                  border-gray-200 px-4 py-3 transition-colors last:border-b-0
                  hover:bg-gray-100"
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
                  className={`min-w-0 flex-1 truncate text-base ${fontClass}`}
                >
                  <span className="font-bold">{getText(char, "name")}</span>
                  {getText(char, "affiliations") && (
                    <span className="text-gray-500">
                      {" · "}
                      {getText(char, "affiliations")}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected Character Display (for testing) */}
      {selectedCharacter && (
        <div
          className="mx-auto max-w-2xl rounded-sm border border-black bg-white
            p-6"
        >
          <h3 className={`mb-4 text-lg font-bold ${fontClass}`}>
            {language === "en" ? "Selected Character" : "已选角色"}:
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
            <div className={`flex-1 text-sm ${fontClass}`}>
              <p>
                <strong>{language === "en" ? "Name" : "名字"}:</strong>{" "}
                {getText(selectedCharacter, "name")}
              </p>
              <p>
                <strong>{language === "en" ? "Affiliation" : "所属"}:</strong>{" "}
                {getText(selectedCharacter, "affiliations")}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
