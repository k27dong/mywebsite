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
  Age = "Age",
  Birthday = "Birthday",
  Height = "Height",
  DevilFruit = "DevilFruit",
  Haki = "Haki",

  // Language UI
  LanguageButton = "LanguageButton",
  FontClass = "FontClass",
}

export enum CharacterField {
  Name = "Name",
  Affiliation = "Affiliation",
  DebutArc = "DebutArc",
  Origin = "Origin",
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
  [TranslationKey.SearchPlaceholder]: {
    en: "Search for a character...",
    cn: "搜索角色...",
  },
  [TranslationKey.TodaysCharacter]: {
    en: "Today's Character",
    cn: "今日角色",
  },
  [TranslationKey.SelectedCharacter]: {
    en: "Selected Character",
    cn: "已选角色",
  },
  [TranslationKey.Loading]: {
    en: "Loading...",
    cn: "加载中...",
  },
  [TranslationKey.Error]: {
    en: "Error: ",
    cn: "错误: ",
  },
  [TranslationKey.Name]: {
    en: "Name",
    cn: "名字",
  },
  [TranslationKey.Affiliation]: {
    en: "Affiliation",
    cn: "所属",
  },
  [TranslationKey.DebutChapter]: {
    en: "Debut Chapter",
    cn: "首次登场",
  },
  [TranslationKey.Arc]: {
    en: "Arc",
    cn: "篇章",
  },
  [TranslationKey.Origin]: {
    en: "Origin",
    cn: "出身",
  },
  [TranslationKey.Bounty]: {
    en: "Bounty",
    cn: "赏金",
  },
  [TranslationKey.Status]: {
    en: "Status",
    cn: "状态",
  },
  [TranslationKey.Age]: {
    en: "Age",
    cn: "年龄",
  },
  [TranslationKey.Birthday]: {
    en: "Birthday",
    cn: "生日",
  },
  [TranslationKey.Height]: {
    en: "Height",
    cn: "身高",
  },
  [TranslationKey.DevilFruit]: {
    en: "Devil Fruit",
    cn: "恶魔果实",
  },
  [TranslationKey.Haki]: {
    en: "Haki",
    cn: "霸气",
  },
  [TranslationKey.LanguageButton]: {
    en: "EN",
    cn: "汉",
  },
  [TranslationKey.FontClass]: {
    en: "font-jbmono",
    cn: "font-sourcehan",
  },
}

const stripBrackets = (text: string) => text.replace(/\s*\([^)]*\)/g, "").trim()

const characterFieldGetters: Record<
  CharacterField,
  (char: Character, language: Language) => string
> = {
  [CharacterField.Name]: (char, language) =>
    match(language)
      .with("en", () => char.name)
      .with("cn", () => char.cn?.name || char.name)
      .exhaustive(),

  [CharacterField.Affiliation]: (char, language) =>
    match(language)
      .with("en", () => stripBrackets(char.affiliations?.[0] || ""))
      .with("cn", () => {
        const affiliation =
          char.cn?.affiliations?.[0] || char.affiliations?.[0] || ""
        return stripBrackets(affiliation)
      })
      .exhaustive(),

  [CharacterField.DebutArc]: (char, language) =>
    match(language)
      .with("en", () => char.debut_arc || "")
      .with("cn", () => char.cn?.debut_arc || char.debut_arc || "")
      .exhaustive(),

  [CharacterField.Origin]: (char, language) =>
    match(language)
      .with("en", () => char.origin || "")
      .with("cn", () => char.cn?.origin || char.origin || "")
      .exhaustive(),
}

// Base translation functions (not exported, use hook instead)
function translateUI(key: TranslationKey, language: Language): string {
  return match(language)
    .with("en", () => translations[key].en)
    .with("cn", () => translations[key].cn)
    .exhaustive()
}

function translateCharField(
  field: CharacterField,
  language: Language,
  char: Character,
): string {
  return characterFieldGetters[field](char, language)
}

// Create bound translation function
export function useTranslation(language: Language) {
  function t(key: TranslationKey): string
  function t(field: CharacterField, char: Character): string
  function t(keyOrField: TranslationKey | CharacterField, char?: Character): string {
    if (char !== undefined) {
      return translateCharField(keyOrField as CharacterField, language, char)
    }
    return translateUI(keyOrField as TranslationKey, language)
  }
  
  return t
}

