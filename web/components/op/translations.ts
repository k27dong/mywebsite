import { match } from "ts-pattern"

export type Language = "en" | "cn"

export enum TranslationKey {
  // UI Labels
  SearchPlaceholder = "SearchPlaceholder",
  TodaysCharacter = "TodaysCharacter",
  SelectedCharacter = "SelectedCharacter",
  Loading = "Loading",
  Error = "Error",
  // Character Field Labels
  Name = "Name",
  Affiliation = "Affiliation",
  DebutChapter = "DebutChapter",
  Arc = "Arc",
  Origin = "Origin",
  Bounty = "Bounty",
  Status = "Status",
  Birthday = "Birthday",
  Height = "Height",
  DevilFruit = "DevilFruit",
  DevilFruitType = "DevilFruitType",
  Haki = "Haki",
  Alive = "Alive",
  // Language UI
  LanguageButton = "LanguageButton",
  FontClass = "FontClass",
  TableTextSize = "TableTextSize",
}

export enum CharacterField {
  Name = "Name",
  Affiliation = "Affiliation",
  DebutArc = "DebutArc",
  Origin = "Origin",
  DevilFruit = "DevilFruit",
  DevilFruitType = "DevilFruitType",
  Bounty = "Bounty",
  Height = "Height",
  Alive = "Alive",
}

export interface Character {
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

const translations: Record<TranslationKey, Record<Language, string>> = {
  [TranslationKey.SearchPlaceholder]: { en: "Search for a character...", cn: "搜索角色..." },
  [TranslationKey.TodaysCharacter]: { en: "Today's Character", cn: "今日角色" },
  [TranslationKey.SelectedCharacter]: { en: "Selected Character", cn: "已选角色" },
  [TranslationKey.Loading]: { en: "Loading...", cn: "加载中..." },
  [TranslationKey.Error]: { en: "Error: ", cn: "错误: " },
  [TranslationKey.Name]: { en: "Name", cn: "名字" },
  [TranslationKey.Affiliation]: { en: "Affiliation", cn: "关系" },
  [TranslationKey.DebutChapter]: { en: "Debut Chapter", cn: "首次登场" },
  [TranslationKey.Arc]: { en: "Arc", cn: "登场篇章" },
  [TranslationKey.Origin]: { en: "Origin", cn: "出身" },
  [TranslationKey.Bounty]: { en: "Bounty ฿", cn: "赏金 ฿" },
  [TranslationKey.Status]: { en: "Status", cn: "状态" },
  [TranslationKey.Birthday]: { en: "Birthday", cn: "生日" },
  [TranslationKey.Height]: { en: "Height", cn: "身高" },
  [TranslationKey.DevilFruit]: { en: "Devil Fruit", cn: "恶魔果实" },
  [TranslationKey.DevilFruitType]: { en: "Type", cn: "类型" },
  [TranslationKey.Haki]: { en: "Haki", cn: "霸气" },
  [TranslationKey.Alive]: { en: "Alive", cn: "存活" },
  [TranslationKey.LanguageButton]: { en: "EN", cn: "漢" },
  [TranslationKey.FontClass]: { en: "font-sans font-normal", cn: "font-sourcehan" },
  [TranslationKey.TableTextSize]: { en: "text-sm sm:text-base", cn: "text-sm sm:text-base" },
}

// Utilities
const stripBrackets = (text: string) => text.replace(/\s*\([^)]*\)/g, "").trim()

const formatBountyEn = (bounty: number): string => {
  if (bounty >= 1_000_000_000) {
    const b = bounty / 1_000_000_000
    return `${b % 1 === 0 ? b : b.toFixed(2).replace(/\.?0+$/, "")}B`
  }
  if (bounty >= 1_000_000) {
    const m = bounty / 1_000_000
    return `${m % 1 === 0 ? m : m.toFixed(2).replace(/\.?0+$/, "")}M`
  }
  return bounty.toLocaleString()
}

const formatBountyCn = (bounty: number): string => {
  if (bounty < 10_000) return bounty.toLocaleString()

  const yi = Math.floor(bounty / 100_000_000)
  const wan = Math.floor((bounty % 100_000_000) / 10_000)
  const remainder = bounty % 10_000

  return (
    [yi > 0 && `${yi}億`, wan > 0 && `${wan}万`, remainder > 0 && remainder.toLocaleString()]
      .filter(Boolean)
      .join("") || "0"
  )
}

export const formatBounty = (bounty: number | undefined, lang: Language): string => {
  if (bounty == null) return "—"
  if (bounty === 0) return "0"
  return match(lang)
    .with("en", () => formatBountyEn(bounty))
    .with("cn", () => formatBountyCn(bounty))
    .exhaustive()
}

export const formatHeight = (height: number | undefined): string => {
  if (!height) return "—"
  if (height <= 220) return `${height}cm`
  return `${Math.floor(height / 100)}m${(height % 100).toString().padStart(2, "0")}`
}

// Haki display
const HAKI_LABELS: Record<string, string> = {
  armament: "Armament",
  observation: "Observation",
  supreme_king: "Supreme King",
}

export const getHakiDisplay = (char: Character, lang: Language): string[] => {
  const hakiArray = match(lang)
    .with("en", () => char.haki || [])
    .with("cn", () => char.cn?.haki || char.haki || [])
    .exhaustive()

  if (hakiArray.length === 0) return ["✕"]

  return match(lang)
    .with("en", () => hakiArray.map((h) => HAKI_LABELS[h.toLowerCase()] || h))
    .with("cn", () => hakiArray)
    .exhaustive()
}

// Character field getters
const characterFieldGetters: Record<CharacterField, (char: Character, lang: Language) => string> = {
  [CharacterField.Name]: (char, lang) =>
    match(lang)
      .with("en", () => char.name)
      .with("cn", () => char.cn?.name || char.name)
      .exhaustive(),

  [CharacterField.Affiliation]: (char, lang) =>
    match(lang)
      .with("en", () => stripBrackets(char.affiliations?.[0] || ""))
      .with("cn", () => stripBrackets(char.cn?.affiliations?.[0] || char.affiliations?.[0] || ""))
      .exhaustive(),

  [CharacterField.DebutArc]: (char, lang) =>
    match(lang)
      .with("en", () => char.debut_arc || "")
      .with("cn", () => char.cn?.debut_arc || char.debut_arc || "")
      .exhaustive(),

  [CharacterField.Origin]: (char, lang) =>
    match(lang)
      .with("en", () => char.origin || "")
      .with("cn", () => char.cn?.origin || char.origin || "")
      .exhaustive(),

  [CharacterField.DevilFruit]: (char, lang) =>
    match(lang)
      .with("en", () => char.devil_fruit_name || "—")
      .with("cn", () => char.cn?.devil_fruit_name || char.devil_fruit_name || "—")
      .exhaustive(),

  [CharacterField.DevilFruitType]: (char, lang) =>
    match(lang)
      .with("en", () => char.devil_fruit_type || "—")
      .with("cn", () => char.cn?.devil_fruit_type || char.devil_fruit_type || "—")
      .exhaustive(),

  [CharacterField.Bounty]: (char, lang) => formatBounty(char.bounty, lang),

  [CharacterField.Height]: (char) => formatHeight(char.height),

  [CharacterField.Alive]: (char, lang) =>
    match(lang)
      .with("en", () => (char.status === "Alive" ? "Yes" : "No"))
      .with("cn", () => (char.status === "Alive" ? "是" : "否"))
      .exhaustive(),
}

// Translation hook
export const useTranslation = (language: Language) => {
  function t(key: TranslationKey): string
  function t(field: CharacterField, char: Character): string
  function t(keyOrField: TranslationKey | CharacterField, char?: Character): string {
    if (char !== undefined) {
      return characterFieldGetters[keyOrField as CharacterField](char, language)
    }
    return translations[keyOrField as TranslationKey][language]
  }
  return t
}
