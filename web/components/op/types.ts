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

export type ComparisonStatus = "correct" | "partial" | "wrong" | "none"

export interface ComparisonResult {
  status: ComparisonStatus
  direction?: "up" | "down"
}
