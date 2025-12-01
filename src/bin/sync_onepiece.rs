// One Piece Character Data Scraper
// 
// This scraper processes One Piece character data in multiple layers:
//
// Layer 1 (scrape):             Fetches character data from the One Piece Wiki and performs initial sanitization
//                               - Scrapes character list from wiki
//                               - Parses character infoboxes
//                               - Cleans text (removes references, fixes brackets, etc.)
//                               - Parses arrays, bounties, ages, heights
//
// Layer 2 (scrape_haki):        Scrapes Haki user data from wiki category pages
//                               - Scrapes: Armament Haki, Observation Haki, Supreme King Haki users
//                               - Adds haki field to characters (array of: "armament", "observation", "supreme_king")
//                               - Updates op_original.json with Haki data
//                               - Excluded from 'all' (run explicitly after scrape)
//
// Layer 3 (clean_affiliation):  Removes entries with empty affiliations
//                               - Filters out characters with no affiliations
//
// Layer 4 (clean_chapter):      Cleans debut field to contain only Chapter numbers
//                               - Extracts only the first Chapter number from debut field
//                               - Removes entries without a Chapter number in debut
//
// Layer 5 (clean_bounty):       Removes entries with no bounty information
//                               - Filters out characters with empty bounty arrays
//                               - Respects exclude list (unless --strict flag is used)
//
// Layer 6 (clean_height):       Removes entries with no height information
//                               - Filters out characters with empty height arrays
//                               - Respects exclude list (unless --strict flag is used)
//
// Layer 7 (add_arc):            Adds debut arc information based on chapter number
//                               - Maps chapter numbers to their corresponding story arcs
//                               - Adds both English and Chinese arc names (CN to be filled manually)
//                               - Requires Layer 4 (clean_chapter) to have been run first
//
// Layer 8 (map_origin):         Standardizes origin field to major locations
//                               - Maps origins to: Grand Line, East Blue, North Blue, West Blue, South Blue,
//                                 Amazon Lily, Sky Island, Mary Geoise, Jaya, Punk Hazard, Zou, Fish-Man Island
//                               - Adds both English and Chinese location names (CN to be filled manually)
//
// Layer 9 (map_haki):           Maps Haki types to Chinese
//                               - observation → 见闻色, armament → 武装色, supreme_king → 霸王色
//                               - Adds haki_cn field
//                               - Included in 'all' layers
//
// Layer 10 (map_devil_fruit_type): Maps devil fruit types to Chinese
//                               - Paramecia → 超人系, Zoan → 动物系, Logia → 自然系
//                               - Adds devil_fruit_cn.type field
//                               - Included in 'all' layers
//
// Layer 11 (clean_english):     Cleans and standardizes English entries using GPT-5-mini
//                               - Cleans: names, affiliations, occupations, devil_fruit.name
//                               - Standardizes status markers: (former), (defected), etc.
//                               - Removes localization variants from devil fruit names
//                               - Fixes capitalization and formatting issues
//                               - Requires OPENAI_API_KEY environment variable
//                               - NOT included in 'all' (run explicitly, costs money!)
//
// Layer 12 (translate):         Creates/updates translation cache using GPT-5-mini
//                               - Translates: name, Affiliations, devil_fruit.name
//                               - Uses OpenAI GPT-5-mini for accurate One Piece-specific translations
//                               - Updates local dictionary cache (data/op_translation.json)
//                               - Requires OPENAI_API_KEY environment variable
//                               - Does NOT apply translations to character data
//
// Layer 13 (map_translation):   Applies cached translations to character data
//                               - Reads from translation cache (data/op_translation.json)
//                               - Sets: name_cn, affiliations_cn, devil_fruit_cn fields
//                               - Free operation (no API calls)
//                               - Included in 'all' layers
//
// Layer 14 (sanitize):          Transforms data to clean, sanitized JSON format
//                               - Converts to consistent camelCase/snake_case naming
//                               - Numbers stored as numbers (bounty, height, age, debut_chapter)
//                               - Optional fields omitted when empty (not null or [])
//                               - Groups all Chinese translations under 'cn' block
//                               - haki is a required field (empty array if no haki)
//                               - Output file: data/op_sanitized.json
//
// Exclude List:
//   Important characters that are preserved during cleaning (layers 4-5):
//   - Major narrative characters (Yonko crews, Revolutionary Army, World Government, etc.)
//   - Important arc characters and allies
//   - Straw Hat connections and backstory characters
//   Use --strict flag to ignore the exclude list and remove ALL entries that don't meet criteria
//
// Usage:
//   cargo run --bin sync_onepiece -- --layers scrape                    # Run only layer 1 (fetch from wiki)
//   cargo run --bin sync_onepiece -- --layers scrape_haki               # Run only layer 2 (fetch Haki data)
//   cargo run --bin sync_onepiece -- --layers clean_affiliation         # Run only layer 3
//   cargo run --bin sync_onepiece -- --layers clean_chapter             # Run only layer 4
//   cargo run --bin sync_onepiece -- --layers clean_bounty              # Run only layer 5
//   cargo run --bin sync_onepiece -- --layers clean_height              # Run only layer 6
//   cargo run --bin sync_onepiece -- --layers add_arc                   # Run only layer 7
//   cargo run --bin sync_onepiece -- --layers map_origin                # Run only layer 8
//   cargo run --bin sync_onepiece -- --layers map_haki                  # Run only layer 9 (map haki to CN)
//   cargo run --bin sync_onepiece -- --layers map_devil_fruit_type      # Run only layer 10 (map fruit types to CN)
//   cargo run --bin sync_onepiece -- --layers clean_english             # Run only layer 11 (clean English, costs money!)
//   cargo run --bin sync_onepiece -- --layers translate                 # Run only layer 12 (update cache, costs money!)
//   cargo run --bin sync_onepiece -- --layers map_translation           # Run only layer 13 (apply cached translations)
//   cargo run --bin sync_onepiece -- --layers sanitize                  # Run only layer 14 (output clean format)
//   cargo run --bin sync_onepiece -- --layers scrape,scrape_haki        # Run scrape layers together
//   cargo run --bin sync_onepiece -- --layers all                       # Run layers 3-10,13-14 (excludes scrape, scrape_haki, clean_english & translate)
//   cargo run --bin sync_onepiece -- --layers scrape,scrape_haki,all    # Run all layers INCLUDING scrape
//   cargo run --bin sync_onepiece -- --layers all,translate             # Run all layers INCLUDING translate (costs money!)
//   cargo run --bin sync_onepiece -- --layers all,clean_english         # Run all layers INCLUDING clean_english (costs money!)
//   cargo run --bin sync_onepiece -- --layers all --strict              # Run all layers, ignore exclude list

use anyhow::Result;
use async_openai::{Client as OpenAIClient, types::{ChatCompletionRequestMessage, ChatCompletionRequestSystemMessageArgs, ChatCompletionRequestUserMessageArgs, CreateChatCompletionRequestArgs}};
use clap::Parser;
use indicatif::{ProgressBar, ProgressStyle};
use rayon::prelude::*;
use regex::Regex;
use reqwest::blocking::Client;
use scraper::{Html, Selector};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::collections::HashMap as StdHashMap;
use std::fs::{self, File};
use std::io::{Read, Write};
use std::path::Path;
use std::sync::{Arc, Mutex};

// Output file paths (accessible to both backend and frontend)
const ORIGINAL_FILE: &str = "data/op_original.json";
const OUTPUT_FILE: &str = "data/op_characters.json";
const SANITIZED_OUTPUT_FILE: &str = "data/op_sanitized.json";
const TRANSLATION_CACHE_FILE: &str = "data/op_translation.json";

// LLM model for cleaning and translation (GPT-5-mini)
const TRANSLATION_MODEL: &str = "gpt-5-mini";
const MODEL_INPUT_PRICE_PER_1M: f64 = 0.25;
const MODEL_OUTPUT_PRICE_PER_1M: f64 = 2.00;

/// Command-line arguments for the One Piece character scraper
#[derive(Parser, Debug)]
#[command(name = "sync_onepiece")]
#[command(about = "One Piece character data scraper with layered processing", long_about = None)]
struct Args {
    /// Layers to run (comma-separated): scrape, scrape_haki, clean_affiliation, clean_chapter, clean_bounty, clean_height, add_arc, map_origin, map_haki, map_devil_fruit_type, clean_english, translate, map_translation, sanitize, or 'all'
    #[arg(short, long, default_value = "all", value_delimiter = ',')]
    layers: Vec<String>,

    /// Strict mode: ignore exclude list and remove ALL entries that don't meet criteria
    #[arg(short, long, default_value_t = false)]
    strict: bool,

    /// Limit number of characters for LLM layers (clean_english, translate). 0 = no limit
    #[arg(long, default_value_t = 0)]
    llm_limit: usize,
}

#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord)]
enum Layer {
    Scrape = 1,
    ScrapeHaki = 2,
    CleanAffiliation = 3,
    CleanChapter = 4,
    CleanBounty = 5,
    CleanHeight = 6,
    AddArc = 7,
    MapOrigin = 8,
    MapHaki = 9,
    MapDevilFruitType = 10,
    CleanEnglish = 11,
    Translate = 12,
    MapTranslation = 13,
    Sanitize = 14,
}

impl Layer {
    fn from_str(s: &str) -> Option<Self> {
        match s.to_lowercase().as_str() {
            "scrape" => Some(Layer::Scrape),
            "scrape_haki" => Some(Layer::ScrapeHaki),
            "clean_affiliation" => Some(Layer::CleanAffiliation),
            "clean_chapter" => Some(Layer::CleanChapter),
            "clean_bounty" => Some(Layer::CleanBounty),
            "clean_height" => Some(Layer::CleanHeight),
            "add_arc" => Some(Layer::AddArc),
            "map_origin" => Some(Layer::MapOrigin),
            "map_haki" => Some(Layer::MapHaki),
            "map_devil_fruit_type" => Some(Layer::MapDevilFruitType),
            "clean_english" => Some(Layer::CleanEnglish),
            "translate" => Some(Layer::Translate),
            "map_translation" => Some(Layer::MapTranslation),
            "sanitize" => Some(Layer::Sanitize),
            _ => None,
        }
    }

    fn name(&self) -> &str {
        match self {
            Layer::Scrape => "scrape",
            Layer::ScrapeHaki => "scrape_haki",
            Layer::CleanAffiliation => "clean_affiliation",
            Layer::CleanChapter => "clean_chapter",
            Layer::CleanBounty => "clean_bounty",
            Layer::CleanHeight => "clean_height",
            Layer::AddArc => "add_arc",
            Layer::MapOrigin => "map_origin",
            Layer::MapHaki => "map_haki",
            Layer::MapDevilFruitType => "map_devil_fruit_type",
            Layer::CleanEnglish => "clean_english",
            Layer::Translate => "translate",
            Layer::MapTranslation => "map_translation",
            Layer::Sanitize => "sanitize",
        }
    }

    fn description(&self) -> &str {
        match self {
            Layer::Scrape => "Fetch and parse character data from wiki",
            Layer::ScrapeHaki => "Fetch Haki user data from wiki categories",
            Layer::CleanAffiliation => "Remove entries with empty affiliations",
            Layer::CleanChapter => "Clean debut field to chapter numbers only",
            Layer::CleanBounty => "Remove entries with no bounty (respects exclude list)",
            Layer::CleanHeight => "Remove entries with no height (respects exclude list)",
            Layer::AddArc => "Add story arc information based on debut chapter",
            Layer::MapOrigin => "Map origin to standardized major locations",
            Layer::MapHaki => "Map Haki types to Chinese (见闻色/武装色/霸王色)",
            Layer::MapDevilFruitType => "Map devil fruit types to Chinese (超人系/动物系/自然系)",
            Layer::CleanEnglish => "Clean English entries using GPT-5-mini (costs money!)",
            Layer::Translate => "Create/update translation cache using GPT-5-mini (costs money!)",
            Layer::MapTranslation => "Apply cached translations to character data",
            Layer::Sanitize => "Transform to clean format and output to op_sanitized.json",
        }
    }
}

// Arc mapping: Chapter ranges mapped to story arcs (English and Chinese names)
// Based on https://onepiece.fandom.com/wiki/Chapters_and_Volumes
// Format: (start_chapter, end_chapter, english_name, chinese_name)
// NOTE: Fill in the Chinese names (currently empty strings "")
const ARC_MAPPING: &[(u32, u32, &str, &str)] = &[
    // East Blue Saga
    (1, 7, "Romance Dawn", "冒险的黎明"),
    (8, 21, "Orange Town", "橘子镇"),
    (22, 41, "Syrup Village", "西罗布村篇"),
    (42, 68, "Baratie", "海上餐厅篇"),
    (69, 95, "Arlong Park", "可可亚西村篇"),
    (96, 100, "Loguetown", "罗格镇"),
    
    // Arabasta Saga
    (101, 105, "Reverse Mountain", "颠倒山篇"),
    (106, 114, "Whisky Peak", "威士忌山峰篇"),
    (115, 129, "Little Garden", "小花园篇"),
    (130, 143, "Drum Island", "磁鼓岛篇"),
    (144, 217, "Arabasta", "阿拉巴斯坦篇"),
    
    // Sky Island Saga
    (218, 236, "Jaya", "加雅岛篇"),
    (237, 302, "Skypiea", "空岛篇"),
    
    // Water 7 Saga
    (303, 321, "Long Ring Long Land", "长链岛篇"),
    (322, 374, "Water 7", "七水之都篇"),
    (375, 430, "Enies Lobby", "司法岛篇"),
    (431, 441, "Post-Enies Lobby", "水之都后篇"),
    
    // Thriller Bark Saga
    (442, 489, "Thriller Bark", "恐怖三桅帆船篇"),
    
    // Summit War Saga
    (490, 513, "Sabaody Archipelago", "香波地群岛篇"),
    (514, 522, "Amazon Lily", "女儿岛篇"),
    (523, 541, "Impel Down", "推进城篇"),
    (542, 580, "Marineford", "顶上战争"),
    (581, 597, "Post-War", "顶上战争后篇"),
    
    // Fish-Man Island Saga
    (598, 602, "Return to Sabaody", "新世界前篇"),
    (603, 653, "Fish-Man Island", "鱼人岛篇"),
    
    // Dressrosa Saga
    (654, 699, "Punk Hazard", "庞克哈萨德"),
    (700, 801, "Dressrosa", "德雷斯罗萨"),
    
    // Whole Cake Island Saga
    (802, 824, "Zou", "佐乌篇"),
    (825, 902, "Whole Cake Island", "蛋糕岛篇"),
    (903, 908, "Levely", "世界会议篇"),
    
    // Wano Country Saga
    (909, 958, "Wano Country Act 1", "和之国篇·第一幕"),
    (959, 997, "Wano Country Act 2", "和之国篇·第二幕"),
    (998, 1057, "Wano Country Act 3", "和之国篇·第三幕"),
    
    // Final Saga
    (1058, 1077, "Egghead", "蛋头岛篇"),
    (1078, u32::MAX, "Elbaf", "艾尔巴夫篇"), // Current arc, open-ended
];

// Origin mapping: Keywords to standardized location names
// Format: (keyword, english_name, chinese_name)
// NOTE: Fill in the Chinese names (currently empty strings "")
const ORIGIN_MAPPING: &[(&str, &str, &str)] = &[
    // Blues
    ("East Blue", "East Blue", "东海"),
    ("North Blue", "North Blue", "北海"),
    ("West Blue", "West Blue", "西海"),
    ("South Blue", "South Blue", "南海"),
    
    // Grand Line (general)
    ("Grand Line", "Grand Line", "伟大航路"),
    
    // Specific locations
    ("Amazon Lily", "Amazon Lily", "女儿岛"),
    ("Sky Island", "Sky Island", "空岛"),
    ("Skypiea", "Sky Island", "空岛"),
    ("Mary Geoise", "Mary Geoise", "圣地玛丽乔亚"),
    ("Jaya", "Jaya", "加雅岛"),
    ("Punk Hazard", "Punk Hazard", "庞克哈萨德岛"),
    ("Zou", "Zou", "佐乌"),
    ("Fish-Man Island", "Fish-Man Island", "鱼人岛"),
    ("Fishman Island", "Fish-Man Island", "鱼人岛"),
    ("Fish Man Island", "Fish-Man Island", "鱼人岛"),
];

// Exclude list: Important characters that should be preserved during cleaning
const EXCLUDE_LIST: &[&str] = &[
    // Original exclude list
    "Kouzuki Hiyori",
    "Kouzuki Momonosuke",
    "Rocks D. Xebec",
    "Nerona Imu",
    "Imu",
    "Silvers Rayleigh",
    
    // Top Priority / Major Narrative Impact
    "Monkey D. Dragon",
    "Jaygarcia Saturn",
    "Marcus Mars",
    "Topman Warcury",
    "Ethanbaron V. Nusjuro",
    "Shepherd Ju Peter",
    "Kuzan",
    "Sengoku",
    "Joy Boy",
    "Zunesha",
    "Shirahoshi",
    "Nefertari Cobra",
    "Nefertari Vivi",
    "Nefertari D. Lili",
    "Jaguar D. Saul",
    "Figarland Garling",
    "Morgans",
    "Vegapunk",
    "Shaka",
    "Lilith",
    "Edison",
    "Pythagoras",
    "Atlas",
    "York",
    
    // Major Antagonists & Rivals
    "Enel",
    "Rob Lucci",
    "Kaku",
    "Stussy",
    "Magellan",
    "Hody Jones",
    "S-Bear",
    "S-Hawk",
    "S-Shark",
    "S-Snake",
    
    // Yonko Crews & Key Commanders
    "Benn Beckman",
    "Lucky Roux",
    "Yasopp",
    "Shiryu",
    "Sanjuan Wolf",
    "Catarina Devon",
    "Vasco Shot",
    "Avalo Pizarro",
    "Jozu",
    "Vista",
    "Thatch",
    "Charlotte Cracker",
    "Charlotte Perospero",
    "Charlotte Brûlée",
    "Charlotte Pudding",
    "Charlotte Chiffon",
    "Charlotte Praline",
    
    // Wano & The Samurai
    "Kouzuki Oden",
    "Kouzuki Sukiyaki",
    "Kouzuki Toki",
    "Yamato",
    "Kin'emon",
    "Denjiro",
    "Raizo",
    "Inuarashi",
    "Nekomamushi",
    "Ashura Doji",
    "Kawamatsu",
    "Kikunojo",
    "Kurozumi Orochi",
    "Kurozumi Kanjuro",
    "Kurozumi Higurashi",
    "Kurozumi Semimaru",
    "Shimotsuki Ryuma",
    "Shimotsuki Yasuie",
    "Shimotsuki Ushimaru",
    "Shimotsuki Kouzaburou",
    "Hyougoro",
    "Shinobu",
    "Kurozumi Tama",
    
    // Important Arc Characters & Allies
    "Kyros",
    "Rebecca",
    "Viola",
    "Riku Doldo III",
    "Leo",
    "Sugar",
    "Caesar Clown",
    "Monet",
    "Vergo",
    "Perona",
    "Hogback",
    "Absalom",
    "Oars",
    "Wyper",
    "Gan Fall",
    "Kalgara",
    "Mont Blanc Noland",
    "Otohime",
    "Neptune",
    "Fisher Tiger",
    "Vander Decken IX",
    "Iceburg",
    "Tom",
    "Paulie",
    "Spandam",
    "Kokoro",
    
    // Straw Hat Connections / Backstory
    "Bell-mère",
    "Zeff",
    "Vinsmoke Sora",
    "Vinsmoke Judge",
    "Vinsmoke Reiju",
    "Vinsmoke Ichiji",
    "Vinsmoke Niji",
    "Vinsmoke Yonji",
    "Portgas D. Rouge",
    "Shimotsuki Kuina",
    "Shimotsuki Koushirou",
    "Kaya",
    "Laboon",
    "Makino",
    "Woop Slap",
    "Curly Dadan",
    "Koala",
    "Hack",
    
    // Other Notable Groups/Characters
    "Scopper Gaban",
    "Crocus",
    "Shakuyaku",
    "Gloriosa",
    "Buckingham Stussy",
    "Uta",
    "Wapol",
    "Dalton",
    "Hajrudin",
    "Baby 5",
    "Zeus",
];

#[derive(Debug, Serialize, Deserialize, Default, Clone)]
struct DevilFruit {
    name: Option<String>,
    #[serde(rename = "type")]
    fruit_type: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Default, Clone)]
struct Character {
    name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    name_cn: Option<String>,
    image: Option<String>,
    japanese_name: Option<String>,
    debut: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    debut_arc: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    debut_arc_cn: Option<String>,
    #[serde(rename = "Affiliations")]
    affiliations: Vec<String>,
    #[serde(skip_serializing_if = "Option::is_none", rename = "Affiliations_cn")]
    affiliations_cn: Option<Vec<String>>,
    #[serde(rename = "Occupations")]
    occupations: Vec<String>,
    #[serde(rename = "Origin")]
    origin: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    origin_region: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    origin_region_cn: Option<String>,
    #[serde(rename = "Residence")]
    residence: Vec<String>,
    #[serde(rename = "Bounty")]
    bounty: Vec<String>,
    #[serde(rename = "Status")]
    status: Option<String>,
    #[serde(rename = "Age")]
    age: Vec<String>,
    #[serde(rename = "Birthday")]
    birthday: Option<String>,
    #[serde(rename = "Height")]
    height: Vec<String>,
    devil_fruit: Option<DevilFruit>,
    #[serde(skip_serializing_if = "Option::is_none")]
    devil_fruit_cn: Option<DevilFruitCn>,
    #[serde(skip_serializing_if = "Option::is_none")]
    haki: Option<Vec<String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    haki_cn: Option<Vec<String>>,
}

#[derive(Debug, Serialize, Deserialize, Default, Clone)]
struct DevilFruitCn {
    #[serde(skip_serializing_if = "Option::is_none")]
    name: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none", rename = "type")]
    fruit_type: Option<String>,
}

// ============================================================================
// Sanitized output format (Layer 13)
// ============================================================================

#[derive(Debug, Serialize, Deserialize, Clone)]
struct CharacterCn {
    name: String,
    affiliations: Vec<String>,
    origin: String,
    debut_arc: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    devil_fruit_name: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    devil_fruit_type: Option<String>,
    haki: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
struct OutputCharacter {
    name: String,
    japanese_name: String,
    image: String,
    debut_chapter: u32,
    debut_arc: String,
    affiliations: Vec<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    occupations: Option<Vec<String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    residence: Option<Vec<String>>,
    origin: String,
    bounty: u64,
    status: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    age: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    birthday: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    height: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    devil_fruit_name: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    devil_fruit_type: Option<String>,
    haki: Vec<String>,
    cn: CharacterCn,
}

// Translation cache structure
#[derive(Debug, Serialize, Deserialize, Default)]
struct TranslationCache {
    #[serde(default)]
    terms: HashMap<String, String>,
}

// Load secrets from Secrets.toml
fn load_secrets() -> StdHashMap<String, String> {
    if let Ok(content) = fs::read_to_string("Secrets.toml") {
        toml::from_str(&content).unwrap_or_default()
    } else {
        StdHashMap::new()
    }
}

// Get a secret value - tries Secrets.toml first, then environment variable
fn get_secret(secrets: &StdHashMap<String, String>, key: &str) -> Option<String> {
    secrets.get(key).cloned().or_else(|| std::env::var(key).ok())
}

fn main() -> Result<()> {
    // Load secrets from Secrets.toml (primary) and .env (fallback)
    let _ = dotenvy::dotenv();
    let secrets = load_secrets();

    let args = Args::parse();

    // Parse and sort layers
    let mut layers = Vec::new();
    for layer_str in &args.layers {
        if layer_str.to_lowercase() == "all" {
            // Note: Scrape, ScrapeHaki, CleanEnglish, and Translate are excluded from 'all'
            // - Scrape: Data doesn't change often, run explicitly
            // - ScrapeHaki: Additional scraping, run explicitly after scrape
            // - CleanEnglish: Costs money, run explicitly
            // - Translate: Costs money, run explicitly
            // Merge with existing layers (e.g., scrape,all should include scrape)
            for layer in [
                Layer::CleanAffiliation,
                Layer::CleanChapter,
                Layer::CleanBounty,
                Layer::CleanHeight,
                Layer::AddArc,
                Layer::MapOrigin,
                Layer::MapHaki,
                Layer::MapDevilFruitType,
                Layer::MapTranslation,
                Layer::Sanitize,
            ] {
                if !layers.contains(&layer) {
                    layers.push(layer);
                }
            }
        } else if let Some(layer) = Layer::from_str(layer_str) {
            if !layers.contains(&layer) {
                layers.push(layer);
            }
        } else {
            eprintln!("Unknown layer: {}", layer_str);
            eprintln!("Available layers: scrape, scrape_haki, clean_affiliation, clean_chapter, clean_bounty, clean_height, add_arc, map_origin, map_haki, map_devil_fruit_type, clean_english, translate, map_translation, sanitize, all");
            std::process::exit(1);
        }
    }

    // Sort layers to ensure correct execution order
    layers.sort();

    println!("🚀 One Piece Character Sync");
    println!("━━━━━━━━━━━━━━━━━━━━━━━━━━");
    if args.strict {
        println!("⚠️  STRICT MODE: Exclude list disabled");
    } else {
        println!("📋 Exclude list enabled ({} characters protected)", EXCLUDE_LIST.len());
    }
    println!("\nLayers to execute:");
    for layer in &layers {
        println!("  • {} - {}", layer.name(), layer.description());
    }
    println!();

    // Execute layers in order
    for layer in &layers {
        match layer {
            Layer::Scrape => layer_1_scrape()?,
            Layer::ScrapeHaki => layer_2_scrape_haki()?,
            Layer::CleanAffiliation => layer_3_clean_affiliation()?,
            Layer::CleanChapter => layer_4_clean_chapter()?,
            Layer::CleanBounty => layer_5_clean_bounty(args.strict)?,
            Layer::CleanHeight => layer_6_clean_height(args.strict)?,
            Layer::AddArc => layer_7_add_arc(&layers)?,
            Layer::MapOrigin => layer_8_map_origin()?,
            Layer::MapHaki => layer_9_map_haki()?,
            Layer::MapDevilFruitType => layer_10_map_devil_fruit_type()?,
            Layer::CleanEnglish => {
                // Clean English layer needs async runtime
                tokio::runtime::Runtime::new()?.block_on(layer_11_clean_english(args.llm_limit, &secrets))?;
            }
            Layer::Translate => {
                // Translation layer needs async runtime
                tokio::runtime::Runtime::new()?.block_on(layer_12_translate(args.llm_limit, &secrets))?;
            }
            Layer::MapTranslation => layer_13_map_translation()?,
            Layer::Sanitize => layer_14_sanitize()?,
        }
    }

    println!("━━━━━━━━━━━━━━━━━━━━━━━━━━");
    println!("✅ All layers completed successfully!");
    Ok(())
}

fn layer_1_scrape() -> Result<()> {
    println!("━━━━━━━━━━━━━━━━━━━━━━━━━━");
    println!("📥 Layer 1: Scraping");
    println!("━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    // 1. Fetch List of Characters
    println!("Fetching character list...");
    let list_url = "https://onepiece.fandom.com/wiki/List_of_Canon_Characters";
    // Add headers to mimic a real browser to avoid 403 Forbidden
    let mut headers = reqwest::header::HeaderMap::new();
    headers.insert("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8".parse().unwrap());
    headers.insert("Accept-Language", "en-US,en;q=0.9".parse().unwrap());

    let client_builder = Client::builder()
        .user_agent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
        .default_headers(headers);
    let client = client_builder.build()?;

    let resp = client.get(list_url).send()?;
    let resp = resp.text()?;
    let document = Html::parse_document(&resp);

    // Try to find tables. The original script looked for tables after the first h2.
    // We'll look for all tables and check if they contain character links.
    let table_selector = Selector::parse("table").unwrap();
    let row_selector = Selector::parse("tr").unwrap();

    let mut character_links = Vec::new();
    let mut table_count = 0;

    for table in document.select(&table_selector) {
        let rows: Vec<_> = table.select(&row_selector).collect();
        // Lower threshold to catch smaller tables (e.g. letters with few characters)
        if rows.len() < 2 {
            continue;
        }
        table_count += 1;

        for row in rows {
            let cells: Vec<_> = row.select(&Selector::parse("td").unwrap()).collect();
            if cells.len() > 1 {
                if let Some(link) = cells[1].select(&Selector::parse("a").unwrap()).next() {
                    if let Some(href) = link.value().attr("href") {
                        if href.starts_with("/wiki/")
                            && !href.contains("Category:")
                            && !href.contains("File:")
                        {
                            character_links.push(format!("https://onepiece.fandom.com{}", href));
                        }
                    }
                }
            }
        }
    }

    println!("Processed {} tables.", table_count);

    // Remove duplicates
    character_links.sort();
    character_links.dedup();

    println!(
        "Found {} characters. Scraping details...",
        character_links.len()
    );

    // 2. Scrape Characters in Parallel with Progress Bar
    let characters: Arc<Mutex<Vec<Character>>> = Arc::new(Mutex::new(Vec::new()));
    let client = Arc::new(client);

    // Create progress bar
    let pb = ProgressBar::new(character_links.len() as u64);
    pb.set_style(
        ProgressStyle::default_bar()
            .template("{spinner:.green} [{elapsed_precise}] [{bar:40.cyan/blue}] {pos}/{len} ({eta})")
            .unwrap()
            .progress_chars("#>-"),
    );

    // Regex for cleaning
    let ref_regex = Regex::new(r"\[\s*\d+\s*\]").unwrap();
    let height_regex = Regex::new(r"(\d+)\s*cm").unwrap();
    let bounty_regex = Regex::new(r"(\d[\d,]*)\s*(?:\[(?:bounty\s*)?\d+\])?").unwrap();
    let birthday_regex = Regex::new(r"((?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d+(?:st|nd|rd|th)?)").unwrap();
    let fruit_type_regex = Regex::new(r"(Paramecia|Zoan|Logia)").unwrap();

    let pb = Arc::new(pb);
    character_links.par_iter().for_each(|url| {
        match scrape_character(&client, url, &ref_regex, &height_regex, &bounty_regex, &birthday_regex, &fruit_type_regex) {
            Ok(char_data) => {
                let mut chars = characters.lock().unwrap();
                chars.push(char_data);
                pb.inc(1);
            }
            Err(e) => {
                pb.inc(1);
                eprintln!("Failed to scrape {}: {}", url, e);
            },
        }
    });

    pb.finish_with_message("✓ Scraping complete!");

    let mut final_chars = characters.lock().unwrap().clone();
    // Sort by name for consistency
    final_chars.sort_by(|a, b| a.name.cmp(&b.name));

    // 3. Save to JSON (original file - raw scraped data)
    // Ensure directory exists
    if let Some(parent) = Path::new(ORIGINAL_FILE).parent() {
        fs::create_dir_all(parent)?;
    }
    
    let json = serde_json::to_string_pretty(&final_chars)?;
    let mut file = File::create(ORIGINAL_FILE)?;
    file.write_all(json.as_bytes())?;

    println!(
        "\n✓ Layer 1 complete: Saved {} characters to {}",
        final_chars.len(),
        ORIGINAL_FILE
    );

    Ok(())
}

fn layer_2_scrape_haki() -> Result<()> {
    println!("━━━━━━━━━━━━━━━━━━━━━━━━━━");
    println!("📥 Layer 2: Scraping Haki Data");
    println!("━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    // Load existing character data from original file
    if !Path::new(ORIGINAL_FILE).exists() {
        eprintln!("❌ Error: {} not found!", ORIGINAL_FILE);
        eprintln!("   Run 'scrape' layer first to fetch character data.");
        std::process::exit(1);
    }

    let mut file = File::open(ORIGINAL_FILE)?;
    let mut contents = String::new();
    file.read_to_string(&mut contents)?;
    let mut characters: Vec<Character> = serde_json::from_str(&contents)?;
    println!("Loaded {} characters from {}\n", characters.len(), ORIGINAL_FILE);

    // Build HTTP client
    let mut headers = reqwest::header::HeaderMap::new();
    headers.insert("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8".parse().unwrap());
    headers.insert("Accept-Language", "en-US,en;q=0.9".parse().unwrap());

    let client = Client::builder()
        .user_agent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
        .default_headers(headers)
        .build()?;

    // Scrape each Haki type
    let haki_urls = [
        ("https://onepiece.fandom.com/wiki/Category:Armament_Haki_Users", "armament"),
        ("https://onepiece.fandom.com/wiki/Category:Observation_Haki_Users", "observation"),
        ("https://onepiece.fandom.com/wiki/Category:Supreme_King_Haki_Users", "supreme_king"),
    ];

    let mut haki_map: HashMap<String, Vec<String>> = HashMap::new();

    for (url, haki_type) in haki_urls {
        println!("Scraping {} Haki users...", haki_type);
        let resp = client.get(url).send()?.text()?;
        let document = Html::parse_document(&resp);

        // Find all character links in the category
        let link_selector = Selector::parse(".category-page__member-link").unwrap();
        
        let mut count = 0;
        for link in document.select(&link_selector) {
            if let Some(name) = link.value().attr("title") {
                let name = name.to_string();
                haki_map.entry(name.clone()).or_insert_with(Vec::new).push(haki_type.to_string());
                count += 1;
            }
        }
        println!("  Found {} {} Haki users", count, haki_type);
    }

    println!("\nTotal unique Haki users: {}", haki_map.len());

    // Match and update characters
    let mut matched_count = 0;
    for character in &mut characters {
        if let Some(haki_types) = haki_map.get(&character.name) {
            character.haki = Some(haki_types.clone());
            matched_count += 1;
        }
    }

    println!("Matched {} characters with Haki data\n", matched_count);

    // Sort by name for consistency
    characters.sort_by(|a, b| a.name.cmp(&b.name));

    // Save updated data back to original file
    let json = serde_json::to_string_pretty(&characters)?;
    let mut file = File::create(ORIGINAL_FILE)?;
    file.write_all(json.as_bytes())?;

    println!("━━━━━━━━━━━━━━━━━━━━━━━━━━");
    println!(
        "⚔️  Layer 2: Scrape Haki: done! {} characters have Haki",
        matched_count
    );

    Ok(())
}

fn layer_3_clean_affiliation() -> Result<()> {
    // Load from original file if it exists (first layer after scrape), otherwise use output file
    let source_file = if Path::new(ORIGINAL_FILE).exists() {
        ORIGINAL_FILE
    } else {
        OUTPUT_FILE
    };
    let mut file = File::open(source_file)?;
    let mut contents = String::new();
    file.read_to_string(&mut contents)?;
    let mut characters: Vec<Character> = serde_json::from_str(&contents)?;
    let initial_count = characters.len();

    // Remove entries with empty affiliations
    characters.retain(|c| !c.affiliations.is_empty());
    let removed = initial_count - characters.len();

    // Sort by name for consistency
    characters.sort_by(|a, b| a.name.cmp(&b.name));

    // Save cleaned data
    let json = serde_json::to_string_pretty(&characters)?;
    let mut file = File::create(OUTPUT_FILE)?;
    file.write_all(json.as_bytes())?;

    println!("━━━━━━━━━━━━━━━━━━━━━━━━━━");
    println!(
        "🧹 Layer 3: Clean Affiliation: done! {} → {} ({} removed)",
        initial_count,
        characters.len(),
        removed
    );

    Ok(())
}

fn layer_4_clean_chapter() -> Result<()> {
    // Load existing data
    let mut file = File::open(OUTPUT_FILE)?;
    let mut contents = String::new();
    file.read_to_string(&mut contents)?;
    let characters: Vec<Character> = serde_json::from_str(&contents)?;
    let initial_count = characters.len();

    // Clean debut field and remove entries without Chapter
    // Also handles already-cleaned data (just a number)
    let chapter_regex = Regex::new(r"Chapter\s+(\d+)").unwrap();
    let number_regex = Regex::new(r"^\d+$").unwrap();
    
    let characters: Vec<Character> = characters
        .into_iter()
        .filter_map(|mut c| {
            if let Some(debut) = &c.debut {
                // If already just a number (previously cleaned), keep it
                if number_regex.is_match(debut) {
                    Some(c)
                // Otherwise, try to extract chapter number
                } else if let Some(caps) = chapter_regex.captures(debut) {
                    c.debut = Some(caps[1].to_string());
                    Some(c)
                } else {
                    None
                }
            } else {
                None
            }
        })
        .collect();
    
    let removed = initial_count - characters.len();

    // Sort by name for consistency
    let mut characters = characters;
    characters.sort_by(|a, b| a.name.cmp(&b.name));

    // Save cleaned data
    let json = serde_json::to_string_pretty(&characters)?;
    let mut file = File::create(OUTPUT_FILE)?;
    file.write_all(json.as_bytes())?;

    println!("━━━━━━━━━━━━━━━━━━━━━━━━━━");
    println!(
        "📖 Layer 4: Clean Chapter: done! {} → {} ({} removed)",
        initial_count,
        characters.len(),
        removed
    );

    Ok(())
}

fn layer_5_clean_bounty(strict: bool) -> Result<()> {
    // Load existing data
    let mut file = File::open(OUTPUT_FILE)?;
    let mut contents = String::new();
    file.read_to_string(&mut contents)?;
    let characters: Vec<Character> = serde_json::from_str(&contents)?;
    let initial_count = characters.len();

    // Remove entries with no bounty (unless in exclude list)
    let mut excluded_count = 0;
    
    let characters: Vec<Character> = characters
        .into_iter()
        .filter(|c| {
            if !c.bounty.is_empty() {
                return true;
            }
            if strict {
                return false;
            }
            if EXCLUDE_LIST.contains(&c.name.as_str()) {
                excluded_count += 1;
                true
            } else {
                false
            }
        })
        .collect();
    
    let removed = initial_count - characters.len();

    // Sort by name for consistency
    let mut characters = characters;
    characters.sort_by(|a, b| a.name.cmp(&b.name));

    // Save cleaned data
    let json = serde_json::to_string_pretty(&characters)?;
    let mut file = File::create(OUTPUT_FILE)?;
    file.write_all(json.as_bytes())?;

    println!("━━━━━━━━━━━━━━━━━━━━━━━━━━");
    let protected = if !strict && excluded_count > 0 {
        format!(" ({} protected)", excluded_count)
    } else {
        String::new()
    };
    println!(
        "💰 Layer 5: Clean Bounty: done! {} → {} ({} removed){}",
        initial_count,
        characters.len(),
        removed,
        protected
    );

    Ok(())
}

fn layer_6_clean_height(strict: bool) -> Result<()> {
    // Load existing data
    let mut file = File::open(OUTPUT_FILE)?;
    let mut contents = String::new();
    file.read_to_string(&mut contents)?;
    let characters: Vec<Character> = serde_json::from_str(&contents)?;
    let initial_count = characters.len();

    // Remove entries with no height (unless in exclude list)
    let mut excluded_count = 0;
    
    let characters: Vec<Character> = characters
        .into_iter()
        .filter(|c| {
            if !c.height.is_empty() {
                return true;
            }
            if strict {
                return false;
            }
            if EXCLUDE_LIST.contains(&c.name.as_str()) {
                excluded_count += 1;
                true
            } else {
                false
            }
        })
        .collect();
    
    let removed = initial_count - characters.len();

    // Sort by name for consistency
    let mut characters = characters;
    characters.sort_by(|a, b| a.name.cmp(&b.name));

    // Save cleaned data
    let json = serde_json::to_string_pretty(&characters)?;
    let mut file = File::create(OUTPUT_FILE)?;
    file.write_all(json.as_bytes())?;

    println!("━━━━━━━━━━━━━━━━━━━━━━━━━━");
    let protected = if !strict && excluded_count > 0 {
        format!(" ({} protected)", excluded_count)
    } else {
        String::new()
    };
    println!(
        "📏 Layer 6: Clean Height: done! {} → {} ({} removed){}",
        initial_count,
        characters.len(),
        removed,
        protected
    );

    Ok(())
}

fn layer_7_add_arc(executed_layers: &[Layer]) -> Result<()> {
    // Check if clean_chapter has been run
    if !executed_layers.contains(&Layer::CleanChapter) {
        eprintln!("❌ Error: Layer 7 (add_arc) requires Layer 4 (clean_chapter) to be run first!");
        eprintln!("   The debut field must contain only chapter numbers.");
        eprintln!("\n   Run with: --layers clean_chapter,add_arc");
        std::process::exit(1);
    }

    // Load existing data
    let mut file = File::open(OUTPUT_FILE)?;
    let mut contents = String::new();
    file.read_to_string(&mut contents)?;
    let mut characters: Vec<Character> = serde_json::from_str(&contents)?;

    // Add arc information to each character
    let mut mapped_count = 0;
    let mut failed_count = 0;

    for character in &mut characters {
        if let Some(debut_str) = &character.debut {
            if let Ok(chapter) = debut_str.parse::<u32>() {
                if let Some((arc_name_en, arc_name_cn)) = get_arc_names(chapter) {
                    character.debut_arc = Some(arc_name_en.to_string());
                    character.debut_arc_cn = if arc_name_cn.is_empty() {
                        Some(String::new())
                    } else {
                        Some(arc_name_cn.to_string())
                    };
                    mapped_count += 1;
                } else {
                    failed_count += 1;
                }
            } else {
                failed_count += 1;
            }
        }
    }

    // Sort by name for consistency
    characters.sort_by(|a, b| a.name.cmp(&b.name));

    // Save updated data
    let json = serde_json::to_string_pretty(&characters)?;
    let mut file = File::create(OUTPUT_FILE)?;
    file.write_all(json.as_bytes())?;

    println!("━━━━━━━━━━━━━━━━━━━━━━━━━━");
    let unmapped = if failed_count > 0 {
        format!(" ({} unmapped)", failed_count)
    } else {
        String::new()
    };
    println!(
        "📚 Layer 7: Add Arc: done! {} characters mapped{}",
        mapped_count,
        unmapped
    );

    Ok(())
}

fn layer_8_map_origin() -> Result<()> {
    // Load existing data
    let mut file = File::open(OUTPUT_FILE)?;
    let mut contents = String::new();
    file.read_to_string(&mut contents)?;
    let mut characters: Vec<Character> = serde_json::from_str(&contents)?;

    // Map origin to standardized regions
    let mut mapped_count = 0;
    let mut no_origin_count = 0;

    for character in &mut characters {
        if let Some(origin) = &character.origin {
            if let Some((region_en, region_cn)) = map_origin_to_region(origin) {
                character.origin_region = Some(region_en.to_string());
                character.origin_region_cn = if region_cn.is_empty() {
                    Some(String::new())
                } else {
                    Some(region_cn.to_string())
                };
                mapped_count += 1;
            }
        } else {
            character.origin_region = Some("Unknown".to_string());
            character.origin_region_cn = Some("未知".to_string());
            no_origin_count += 1;
        }
    }

    // Sort by name for consistency
    characters.sort_by(|a, b| a.name.cmp(&b.name));

    // Save updated data
    let json = serde_json::to_string_pretty(&characters)?;
    let mut file = File::create(OUTPUT_FILE)?;
    file.write_all(json.as_bytes())?;

    println!("━━━━━━━━━━━━━━━━━━━━━━━━━━");
    let no_origin = if no_origin_count > 0 {
        format!(" ({} unknown)", no_origin_count)
    } else {
        String::new()
    };
    println!(
        "🗺️ Layer 8: Map Origin: done! {} characters mapped{}",
        mapped_count,
        no_origin
    );

    Ok(())
}

fn layer_9_map_haki() -> Result<()> {
    // Load existing data
    let mut file = File::open(OUTPUT_FILE)?;
    let mut contents = String::new();
    file.read_to_string(&mut contents)?;
    let mut characters: Vec<Character> = serde_json::from_str(&contents)?;

    // Map Haki types to Chinese
    let mut mapped_count = 0;

    for character in &mut characters {
        if let Some(haki_types) = &character.haki {
            let haki_cn: Vec<String> = haki_types
                .iter()
                .map(|haki_type| match haki_type.as_str() {
                    "observation" => "见闻色".to_string(),
                    "armament" => "武装色".to_string(),
                    "supreme_king" => "霸王色".to_string(),
                    _ => haki_type.clone(), // Unknown type, keep as-is
                })
                .collect();

            if !haki_cn.is_empty() {
                character.haki_cn = Some(haki_cn);
                mapped_count += 1;
            }
        }
    }

    // Sort by name for consistency
    characters.sort_by(|a, b| a.name.cmp(&b.name));

    // Save updated data
    let json = serde_json::to_string_pretty(&characters)?;
    let mut file = File::create(OUTPUT_FILE)?;
    file.write_all(json.as_bytes())?;

    println!("━━━━━━━━━━━━━━━━━━━━━━━━━━");
    println!(
        "⚔️ Layer 9: Map Haki: done! {} Haki types mapped",
        mapped_count
    );

    Ok(())
}

fn layer_10_map_devil_fruit_type() -> Result<()> {
    // Load existing data
    let mut file = File::open(OUTPUT_FILE)?;
    let mut contents = String::new();
    file.read_to_string(&mut contents)?;
    let mut characters: Vec<Character> = serde_json::from_str(&contents)?;

    // Map devil fruit types to Chinese
    let mut mapped_count = 0;

    for character in &mut characters {
        if let Some(df) = &character.devil_fruit {
            if let Some(fruit_type) = &df.fruit_type {
                let fruit_type_cn = match fruit_type.as_str() {
                    "Paramecia" => "超人系",
                    "Zoan" => "动物系",
                    "Logia" => "自然系",
                    _ => continue, // Unknown type, skip
                };

                // Create or update devil_fruit_cn
                if let Some(df_cn) = &mut character.devil_fruit_cn {
                    df_cn.fruit_type = Some(fruit_type_cn.to_string());
                } else {
                    character.devil_fruit_cn = Some(DevilFruitCn {
                        name: None,
                        fruit_type: Some(fruit_type_cn.to_string()),
                    });
                }
                mapped_count += 1;
            }
        }
    }

    // Sort by name for consistency
    characters.sort_by(|a, b| a.name.cmp(&b.name));

    // Save updated data
    let json = serde_json::to_string_pretty(&characters)?;
    let mut file = File::create(OUTPUT_FILE)?;
    file.write_all(json.as_bytes())?;

    println!("━━━━━━━━━━━━━━━━━━━━━━━━━━");
    println!(
        "🍎 Layer 10: Map Devil Fruit Type: done! {} fruit types mapped",
        mapped_count
    );

    Ok(())
}

// ============================================================================
// Layer 11: Clean English - Standardize English entries using GPT-4o-mini
// ============================================================================

/// Structure for sending character data to GPT for cleaning
#[derive(Debug, Serialize, Deserialize)]
struct CleanableCharacter {
    name: String,
    affiliations: Vec<String>,
    occupations: Vec<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    status: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    devil_fruit_name: Option<String>,
}

async fn layer_11_clean_english(limit: usize, secrets: &StdHashMap<String, String>) -> Result<()> {
    println!("━━━━━━━━━━━━━━━━━━━━━━━━━━");
    println!("🧹 Layer 11: Clean English (Using GPT-5-mini)");
    println!("━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    // Check for API key (from Secrets.toml or environment)
    let api_key = get_secret(secrets, "OPENAI_API_KEY").ok_or_else(|| {
        anyhow::anyhow!(
            "OPENAI_API_KEY not found!\n  \
             Add it to Secrets.toml: OPENAI_API_KEY = \"your-key-here\"\n  \
             Or set env var: $env:OPENAI_API_KEY=\"your-key-here\" (PowerShell)"
        )
    })?;

    // Load existing data
    println!("Loading {}...", OUTPUT_FILE);
    let mut file = File::open(OUTPUT_FILE)?;
    let mut contents = String::new();
    file.read_to_string(&mut contents)?;
    let mut characters: Vec<Character> = serde_json::from_str(&contents)?;
    let initial_count = characters.len();

    // Apply limit if specified
    let process_count = if limit > 0 && characters.len() > limit {
        println!("⚠️  TESTING MODE: Processing {} characters (out of {})\n", limit, initial_count);
        limit
    } else {
        println!("Loaded {} characters\n", initial_count);
        characters.len()
    };

    // Create OpenAI client
    let client = OpenAIClient::with_config(
        async_openai::config::OpenAIConfig::new().with_api_key(api_key)
    );

    // Estimate cost
    let estimated_input_tokens = process_count * 200; // ~200 tokens per character
    let estimated_output_tokens = process_count * 200;
    let estimated_cost = (estimated_input_tokens as f64 * MODEL_INPUT_PRICE_PER_1M / 1_000_000.0) 
                       + (estimated_output_tokens as f64 * MODEL_OUTPUT_PRICE_PER_1M / 1_000_000.0);
    println!("💰 Estimated cost: ${:.4} USD", estimated_cost);
    println!("   ({}: ${:.2}/1M input, ${:.2}/1M output)\n", 
             TRANSLATION_MODEL, MODEL_INPUT_PRICE_PER_1M, MODEL_OUTPUT_PRICE_PER_1M);

    // Process in batches (5 characters at a time for reliable processing)
    let batch_size = 5;
    let chars_to_process: Vec<_> = characters.iter().take(process_count).cloned().collect();
    let total_batches = (chars_to_process.len() + batch_size - 1) / batch_size;

    // Create progress bar
    let pb = ProgressBar::new(chars_to_process.len() as u64);
    pb.set_style(
        ProgressStyle::default_bar()
            .template("{spinner:.green} [{elapsed_precise}] [{bar:40.cyan/blue}] {pos}/{len} ({eta}) {msg}")
            .unwrap()
            .progress_chars("#>-"),
    );

    let mut cleaned_count = 0;
    let mut name_to_cleaned: HashMap<String, CleanableCharacter> = HashMap::new();

    for (batch_idx, batch) in chars_to_process.chunks(batch_size).enumerate() {
        pb.set_message(format!("Batch {}/{}", batch_idx + 1, total_batches));

        match clean_english_batch(&client, batch).await {
            Ok(cleaned_chars) => {
                for cleaned in cleaned_chars {
                    name_to_cleaned.insert(cleaned.name.clone(), cleaned);
                    cleaned_count += 1;
                }
                pb.inc(batch.len() as u64);
            }
            Err(e) => {
                eprintln!("\n⚠️  Batch {} failed: {}", batch_idx + 1, e);
                eprintln!("   Continuing with remaining batches...");
                pb.inc(batch.len() as u64);
            }
        }

        // Rate limiting delay
        if batch_idx < total_batches - 1 {
            tokio::time::sleep(tokio::time::Duration::from_millis(300)).await;
        }
    }

    pb.finish_with_message("✓ Cleaning complete!");
    println!();

    // Apply cleaned data back to characters
    let mut updated_count = 0;
    for character in &mut characters {
        // Look up by original name (the key we stored)
        if let Some(cleaned) = name_to_cleaned.get(&character.name) {
            // Update name
            character.name = cleaned.name.clone();
            
            // Update affiliations
            character.affiliations = cleaned.affiliations.clone();
            
            // Update occupations
            character.occupations = cleaned.occupations.clone();
            
            // Update status
            if cleaned.status.is_some() {
                character.status = cleaned.status.clone();
            }
            
            // Update devil fruit name
            if let Some(ref cleaned_df_name) = cleaned.devil_fruit_name {
                if let Some(ref mut df) = character.devil_fruit {
                    df.name = Some(cleaned_df_name.clone());
                }
            }
            
            updated_count += 1;
        }
    }

    // Sort by name for consistency
    characters.sort_by(|a, b| a.name.cmp(&b.name));

    // Save updated data
    let json = serde_json::to_string_pretty(&characters)?;
    let mut file = File::create(OUTPUT_FILE)?;
    file.write_all(json.as_bytes())?;

    println!("━━━━━━━━━━━━━━━━━━━━━━━━━━");
    println!(
        "✓ Layer 11 complete: {} characters cleaned ({} updated)",
        cleaned_count,
        updated_count
    );

    Ok(())
}

/// Clean a batch of characters using GPT-4o-mini
async fn clean_english_batch(
    client: &OpenAIClient<async_openai::config::OpenAIConfig>,
    characters: &[Character],
) -> Result<Vec<CleanableCharacter>> {
    // Extract fields that need cleaning
    let cleanable: Vec<CleanableCharacter> = characters.iter().map(|c| {
        CleanableCharacter {
            name: c.name.clone(),
            affiliations: c.affiliations.clone(),
            occupations: c.occupations.clone(),
            status: c.status.clone(),
            devil_fruit_name: c.devil_fruit.as_ref().and_then(|df| df.name.clone()),
        }
    }).collect();

    let input_json = serde_json::to_string_pretty(&cleanable)?;

    let system_prompt = r#"You are a One Piece encyclopedia editor. Your task is to clean and standardize character data.

## Cleaning Rules:

### Names:
- Use proper title case for character names
- Format: "Monkey D. Luffy", "Roronoa Zoro", "Nico Robin"
- Keep the "D." initial with periods for D. clan members
- Use romanized Japanese names (not translated names)

### Affiliations:
- Use official One Piece organization names with proper capitalization
- Canonical names: "Straw Hat Pirates", "Marines", "World Government", "Revolutionary Army", "Cross Guild"
- Standardize status markers to one of: "(former)", "(defected)", "(resigned)", "(disbanded)", "(temporarily)"
- Place status markers at the END of the affiliation name
- Example: "Straw Hat Pirates (Captain)" not "(Captain) Straw Hat Pirates"

### Occupations:
- Use proper title case: "Pirate", "Captain", "Swordsman", "Navigator", "Cook", "Doctor", "Archaeologist"
- Combine compound occupations sensibly: "Pirate Captain", "Marine Admiral"

### Status:
- Standardize to EXACTLY one of: "Alive", "Deceased", "Unknown"
- If uncertain, use "Unknown"

### Devil Fruit Names:
- Use the canonical English name format: "[Name]-[Name] Fruit"
- Examples: "Gum-Gum Fruit", "Flame-Flame Fruit", "Dark-Dark Fruit", "Op-Op Fruit"
- Remove localization variants like "(Viz)", "(4Kids)", "(Funimation)"
- Keep only ONE canonical name, preferring the most commonly used English translation
- For Zoan fruits: "Human-Human Fruit" or "Bird-Bird Fruit" format

## Output Format:
Return ONLY a valid JSON array with the cleaned data.
Preserve the EXACT same order and number of entries as input.
Do NOT add explanations or markdown code blocks."#;

    let system_message = ChatCompletionRequestSystemMessageArgs::default()
        .content(system_prompt)
        .build()?;

    let user_message = ChatCompletionRequestUserMessageArgs::default()
        .content(format!(
            "Clean these {} One Piece character entries:\n\n{}",
            characters.len(), 
            input_json
        ))
        .build()?;

    let request = CreateChatCompletionRequestArgs::default()
        .model(TRANSLATION_MODEL)
        .messages(vec![
            ChatCompletionRequestMessage::System(system_message),
            ChatCompletionRequestMessage::User(user_message),
        ])
        // Note: gpt-5-mini only supports default temperature (1.0)
        .build()?;

    let response = client.chat().create(request).await?;

    let response_text = response
        .choices
        .first()
        .and_then(|choice| choice.message.content.as_ref())
        .ok_or_else(|| anyhow::anyhow!("No response from OpenAI"))?;

    // Extract JSON from response (handle potential markdown code blocks)
    let json_text = if response_text.contains("```") {
        response_text
            .split("```")
            .nth(1)
            .and_then(|s| s.strip_prefix("json").or(Some(s)))
            .unwrap_or(response_text)
            .trim()
    } else {
        response_text.trim()
    };

    // Parse the cleaned characters
    let cleaned: Vec<CleanableCharacter> = serde_json::from_str(json_text).map_err(|e| {
        anyhow::anyhow!(
            "Failed to parse cleaned character response: {}\nResponse was: {}",
            e,
            &response_text[..response_text.len().min(500)]
        )
    })?;

    if cleaned.len() != characters.len() {
        return Err(anyhow::anyhow!(
            "Response count mismatch: expected {}, got {}",
            characters.len(),
            cleaned.len()
        ));
    }

    Ok(cleaned)
}

async fn layer_12_translate(limit: usize, secrets: &StdHashMap<String, String>) -> Result<()> {
    println!("━━━━━━━━━━━━━━━━━━━━━━━━━━");
    println!("🌏 Layer 12: Translate (Update Cache)");
    println!("━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    // Check for API key (from Secrets.toml or environment)
    let api_key = get_secret(secrets, "OPENAI_API_KEY").ok_or_else(|| {
        anyhow::anyhow!(
            "OPENAI_API_KEY not found!\n  \
             Add it to Secrets.toml: OPENAI_API_KEY = \"your-key-here\"\n  \
             Or set env var: $env:OPENAI_API_KEY=\"your-key-here\" (PowerShell)"
        )
    })?;

    // Load existing data
    println!("Loading {}...", OUTPUT_FILE);
    let file = File::open(OUTPUT_FILE)?;
    let mut contents = String::new();
    let mut file = file;
    file.read_to_string(&mut contents)?;
    let characters: Vec<Character> = serde_json::from_str(&contents)?;
    let initial_count = characters.len();
    
    // Apply limit if specified
    let characters = if limit > 0 && characters.len() > limit {
        println!("⚠️  TESTING MODE: Limiting to {} characters (out of {})\n", limit, initial_count);
        characters.into_iter().take(limit).collect()
    } else {
        println!("Loaded {} characters\n", initial_count);
        characters
    };

    // Load translation cache
    let mut cache = load_translation_cache()?;
    let initial_cache_size = cache.terms.len();
    println!("Loaded translation cache with {} entries\n", initial_cache_size);

    // Create OpenAI client
    let client = OpenAIClient::with_config(
        async_openai::config::OpenAIConfig::new().with_api_key(api_key)
    );

    // Collect all terms to translate (only One Piece-specific terms)
    let mut terms_to_translate = std::collections::HashSet::new();
    for character in &characters {
        // Character names
        terms_to_translate.insert(simplify_term(&character.name));
        
        // Affiliations (One Piece-specific organizations)
        for aff in &character.affiliations {
            terms_to_translate.insert(simplify_term(aff));
        }
        
        // Devil Fruits (One Piece-specific)
        if let Some(df) = &character.devil_fruit {
            if let Some(name) = &df.name {
                terms_to_translate.insert(simplify_term(name));
            }
        }
        
        // Skip Occupations - they're generic terms (Pirate, Captain, etc.)
    }

    // Filter out already cached terms and empty strings
    let uncached_terms: Vec<String> = terms_to_translate
        .iter()
        .filter(|term| !term.is_empty() && !cache.terms.contains_key(*term))
        .cloned()
        .collect();

    println!("Total unique terms: {}", terms_to_translate.len());
    println!("Already cached: {}", terms_to_translate.len() - uncached_terms.len());
    println!("Need to translate: {}", uncached_terms.len());
    
    // Estimate cost
    if !uncached_terms.is_empty() {
        let estimated_input_tokens = uncached_terms.iter().map(|t| t.len()).sum::<usize>() * 2; // Rough estimate
        let estimated_output_tokens = estimated_input_tokens; // Similar length for translations
        let estimated_cost = (estimated_input_tokens as f64 * MODEL_INPUT_PRICE_PER_1M / 1_000_000.0) 
                           + (estimated_output_tokens as f64 * MODEL_OUTPUT_PRICE_PER_1M / 1_000_000.0);
        println!("💰 Estimated cost: ${:.4} USD", estimated_cost);
        println!("   ({}: ${:.2}/1M input, ${:.2}/1M output)\n", 
                 TRANSLATION_MODEL, MODEL_INPUT_PRICE_PER_1M, MODEL_OUTPUT_PRICE_PER_1M);
    } else {
        println!();
    }

    if uncached_terms.is_empty() {
        println!("✓ All terms already cached!");
    } else {
        // Create progress bar
        let pb = ProgressBar::new(uncached_terms.len() as u64);
        pb.set_style(
            ProgressStyle::default_bar()
                .template("{spinner:.green} [{elapsed_precise}] [{bar:40.cyan/blue}] {pos}/{len} ({eta}) {msg}")
                .unwrap()
                .progress_chars("#>-"),
        );

        // Batch translate in groups of 15 to save API calls (reduced from 20 for safety)
        let batch_size = 15;
        let total_batches = (uncached_terms.len() + batch_size - 1) / batch_size;
        
        for (batch_idx, batch) in uncached_terms.chunks(batch_size).enumerate() {
            pb.set_message(format!("Batch {}/{} ({} terms)", batch_idx + 1, total_batches, batch.len()));
            
            match translate_batch(&client, batch).await {
                Ok(translations) => {
                    for (term, translation) in translations {
                        cache.terms.insert(term, translation);
                    }
                    pb.inc(batch.len() as u64);
                }
                Err(e) => {
                    eprintln!("\n⚠️  Translation batch {} failed: {}", batch_idx + 1, e);
                    eprintln!("   Continuing with remaining batches...");
                    pb.inc(batch.len() as u64);
                }
            }

            // Small delay to avoid rate limiting
            if batch_idx < total_batches - 1 {
                tokio::time::sleep(tokio::time::Duration::from_millis(200)).await;
            }
        }

        pb.finish_with_message("✓ Translation complete!");
        println!();
    }

    // Save updated cache
    save_translation_cache(&cache)?;

    let new_translations = cache.terms.len() - initial_cache_size;
    println!("━━━━━━━━━━━━━━━━━━━━━━━━━━");
    println!(
        "✓ Layer 12 complete: {} new terms added to cache",
        new_translations
    );
    println!("   Total cache size: {} terms", cache.terms.len());
    println!("   Cache file: {}\n", TRANSLATION_CACHE_FILE);

    Ok(())
}

// Load translation cache from file
fn load_translation_cache() -> Result<TranslationCache> {
    if Path::new(TRANSLATION_CACHE_FILE).exists() {
        let mut file = File::open(TRANSLATION_CACHE_FILE)?;
        let mut contents = String::new();
        file.read_to_string(&mut contents)?;
        Ok(serde_json::from_str(&contents)?)
    } else {
        Ok(TranslationCache::default())
    }
}

// Save translation cache to file
fn save_translation_cache(cache: &TranslationCache) -> Result<()> {
    if let Some(parent) = Path::new(TRANSLATION_CACHE_FILE).parent() {
        fs::create_dir_all(parent)?;
    }
    let json = serde_json::to_string_pretty(cache)?;
    let mut file = File::create(TRANSLATION_CACHE_FILE)?;
    file.write_all(json.as_bytes())?;
    Ok(())
}

// Simplify term by removing parenthetical notes like (former), (defected), etc.
fn simplify_term(term: &str) -> String {
    // Remove content in parentheses at the end
    let simplified = term
        .split('(')
        .next()
        .unwrap_or(term)
        .trim()
        .to_string();
    
    simplified
}

// Translate a batch of terms using OpenAI GPT-4o-mini
async fn translate_batch(
    client: &OpenAIClient<async_openai::config::OpenAIConfig>,
    terms: &[String],
) -> Result<Vec<(String, String)>> {
    // Create simplified input (just the terms, one per line)
    let terms_list = terms.join("\n");
    
    let system_message = ChatCompletionRequestSystemMessageArgs::default()
        .content(
            "You are a One Piece (海贼王/ワンピース) manga translation specialist. \
             Translate ONLY using official One Piece terminology. \
             \n\nRules:\n\
             - Character names: Use official transliteration (蒙奇·D·路飞 for Monkey D. Luffy)\n\
             - Organizations: Use official names (草帽海贼团 for Straw Hat Pirates, 四皇 for Four Emperors)\n\
             - Devil Fruits: Use official names (橡胶果实 for Gum-Gum Fruit, 透明果实 for Clear-Clear Fruit)\n\
             - Locations: Use official names (空岛 for Sky Island)\n\
             - CRITICAL: Return EXACTLY the same number of translations as input terms\n\
             - Each line in input = exactly ONE translation in output\n\
             \nReturn ONLY a JSON array of Chinese translations, nothing else."
        )
        .build()?;

    let num_terms = terms.len();
    let user_message = ChatCompletionRequestUserMessageArgs::default()
        .content(format!(
            "Translate these {} One Piece terms to simplified Chinese (return EXACTLY {} translations):\n\n{}\n\n\
             Return format: [\"中文翻译1\", \"中文翻译2\", ...]\n\
             IMPORTANT: Return exactly {} translations in the same order.",
            num_terms, num_terms, terms_list, num_terms
        ))
        .build()?;

    let request = CreateChatCompletionRequestArgs::default()
        .model(TRANSLATION_MODEL)
        .messages(vec![
            ChatCompletionRequestMessage::System(system_message),
            ChatCompletionRequestMessage::User(user_message),
        ])
        .build()?;

    let response = client.chat().create(request).await?;
    
    let translation_text = response
        .choices
        .first()
        .and_then(|choice| choice.message.content.as_ref())
        .ok_or_else(|| anyhow::anyhow!("No response from OpenAI"))?;

    // Try to extract JSON array from response (in case of markdown code blocks)
    let json_text = if translation_text.contains("```") {
        // Extract from code block
        translation_text
            .split("```")
            .nth(1)
            .and_then(|s| s.strip_prefix("json").or(Some(s)))
            .unwrap_or(translation_text)
            .trim()
    } else {
        translation_text.trim()
    };

    // Parse the JSON response
    let translations: Vec<String> = serde_json::from_str(json_text).map_err(|e| {
        anyhow::anyhow!("Failed to parse translation response: {}\nResponse was: {}", e, translation_text)
    })?;

    if translations.len() != terms.len() {
        // Try to handle mismatches gracefully
        if translations.len() < terms.len() {
            // LLM returned fewer translations (likely skipped empty/problematic terms)
            eprintln!("\n⚠️  Warning: Got {} translations for {} terms", translations.len(), terms.len());
            eprintln!("   Some terms may not be translated correctly.");
            
            // Pair up what we can, skip the rest
            let paired: Vec<(String, String)> = terms.iter()
                .take(translations.len())
                .cloned()
                .zip(translations.clone())
                .collect();
            return Ok(paired);
        } else {
            // LLM returned MORE translations (likely split one term)
            eprintln!("\n⚠️  Warning: Got {} translations for {} terms", translations.len(), terms.len());
            eprintln!("   Attempting to merge extra translations...");
            
            // Try to pair intelligently - merge the extra one back
            let mut paired = Vec::new();
            let mut trans_idx = 0;
            
            for (_term_idx, term) in terms.iter().enumerate() {
                if trans_idx < translations.len() {
                    // Check if this term might have been split (contains multiple parts)
                    if term.contains(" Fish-Fish Fruit") && trans_idx + 1 < translations.len() {
                        // Merge two translations
                        let merged = format!("{} {}", translations[trans_idx], translations[trans_idx + 1]);
                        paired.push((term.clone(), merged));
                        trans_idx += 2;
                    } else {
                        paired.push((term.clone(), translations[trans_idx].clone()));
                        trans_idx += 1;
                    }
                }
            }
            
            return Ok(paired);
        }
    }

    Ok(terms.iter().cloned().zip(translations).collect())
}

// Helper function to get arc names (English and Chinese) from chapter number
fn get_arc_names(chapter: u32) -> Option<(&'static str, &'static str)> {
    for &(start, end, arc_name_en, arc_name_cn) in ARC_MAPPING {
        if chapter >= start && chapter <= end {
            return Some((arc_name_en, arc_name_cn));
        }
    }
    None
}

// Helper function to map origin string to standardized region
fn map_origin_to_region(origin: &str) -> Option<(&'static str, &'static str)> {
    // Check each mapping keyword
    for &(keyword, region_en, region_cn) in ORIGIN_MAPPING {
        if origin.contains(keyword) {
            return Some((region_en, region_cn));
        }
    }
    None
}

fn scrape_character(
    client: &Client,
    url: &str,
    ref_regex: &Regex,
    height_regex: &Regex,
    bounty_regex: &Regex,
    birthday_regex: &Regex,
    fruit_type_regex: &Regex,
) -> Result<Character> {
    let resp = client.get(url).send()?.text()?;
    let document = Html::parse_document(&resp);

    // Try multiple selectors for the infobox
    let selectors = [
        "aside.portable-infobox",
        "div.portable-infobox",
        "table.infobox", // Sometimes older wikis use tables
        ".portable-infobox",
    ];

    let mut aside = None;
    for sel in selectors {
        let selector = Selector::parse(sel).unwrap();
        if let Some(element) = document.select(&selector).next() {
            aside = Some(element);
            break;
        }
    }

    let aside = match aside {
        Some(a) => a,
        None => {
            return Err(anyhow::anyhow!("No infobox found"));
        }
    };

    // Name (Title)
    let title_selector = Selector::parse("h2[data-source='title'], h2.pi-title").unwrap();
    let name = aside
        .select(&title_selector)
        .next()
        .map(|el| {
            let text = el.text().collect::<String>();
            let cleaned = clean_text(&text, ref_regex);
            // Remove wiki template artifacts like "[ v · e ]"
            cleaned
                .split('[')
                .next()
                .unwrap_or(&cleaned)
                .trim()
                .to_string()
        })
        .unwrap_or_else(|| "Unknown".to_string());

    // Image
    let img_selector = Selector::parse("img.pi-image-thumbnail").unwrap();
    let image = aside
        .select(&img_selector)
        .next()
        .and_then(|img| img.value().attr("src").map(|s| s.to_string()));

    let mut char_data = Character {
        name,
        image,
        ..Default::default()
    };

    // Sections
    let section_selector =
        Selector::parse("section.pi-item.pi-group, div.pi-item.pi-group").unwrap();
    let item_selector = Selector::parse("div.pi-item.pi-data").unwrap();
    let label_selector = Selector::parse("h3.pi-data-label").unwrap();
    let value_selector = Selector::parse("div.pi-data-value").unwrap();
    let header_selector = Selector::parse("h2.pi-header").unwrap();

    // Iterate over sections
    for section in aside.select(&section_selector) {
        let header = section
            .select(&header_selector)
            .next()
            .map(|h| h.text().collect::<String>().to_lowercase())
            .unwrap_or_default();

        if header.contains("fruit") {
            // Parse Devil Fruit
            let mut df = DevilFruit::default();
            for item in section.select(&item_selector) {
                let label = item
                    .select(&label_selector)
                    .next()
                    .map(|l| {
                        l.text()
                            .collect::<String>()
                            .trim()
                            .replace(":", "")
                            .to_string()
                    })
                    .unwrap_or_default();
                let val = item
                    .select(&value_selector)
                    .next()
                    .map(|v| {
                        let raw = v.text().collect::<Vec<_>>().join(" ");
                        clean_text(&raw, ref_regex)
                    })
                    .unwrap_or_default();

                match label.as_str() {
                    "Japanese Name" | "English Name" => {
                        if label == "English Name" {
                            df.name = Some(val);
                        } else if df.name.is_none() {
                            df.name = Some(val);
                        }
                    }
                    "Meaning" => { /* Optional */ }
                    "Type" => {
                        // Extract just Paramecia, Zoan, or Logia from the type
                        if let Some(caps) = fruit_type_regex.captures(&val) {
                            df.fruit_type = Some(caps[1].to_string());
                        } else {
                            df.fruit_type = Some(val);
                        }
                    }
                    _ => {}
                }
            }
            if df.name.is_some() || df.fruit_type.is_some() {
                char_data.devil_fruit = Some(df);
            }
        } else {
            // Parse General Statistics
            for item in section.select(&item_selector) {
                let label = item
                    .select(&label_selector)
                    .next()
                    .map(|l| {
                        l.text()
                            .collect::<String>()
                            .trim()
                            .replace(":", "")
                            .to_string()
                    })
                    .unwrap_or_default();

                let value_el = item.select(&value_selector).next();
                if value_el.is_none() {
                    continue;
                }
                let value_el = value_el.unwrap();

                let raw_value = value_el.text().collect::<Vec<_>>().join(" ");
                let cleaned_value = clean_text(&raw_value, ref_regex);

                match label.as_str() {
                    "Japanese Name" => char_data.japanese_name = Some(cleaned_value),
                    "Debut" | "First Appearance" => {
                        // Clean debut: remove multiple spaces and trim
                        char_data.debut = Some(cleaned_value.split_whitespace().collect::<Vec<_>>().join(" "));
                    }
                    "Affiliations" => char_data.affiliations = parse_array(&cleaned_value),
                    "Occupations" => char_data.occupations = parse_array(&cleaned_value),
                    "Origin" => char_data.origin = Some(cleaned_value),
                    "Residence" => char_data.residence = parse_array(&cleaned_value),
                    "Status" => char_data.status = Some(cleaned_value),
                    "Age" => char_data.age = parse_ages(&cleaned_value),
                    "Birthday" => {
                        // Extract just the date part (e.g., "May 5th" from "May 5th (Children's Day)")
                        if let Some(caps) = birthday_regex.captures(&cleaned_value) {
                            char_data.birthday = Some(caps[1].to_string());
                        } else {
                            char_data.birthday = Some(cleaned_value);
                        }
                    }
                    "Height" => {
                        // Parse all heights (character grows over time)
                        char_data.height = parse_heights(&cleaned_value, height_regex);
                    }
                    "Total Bounty" | "Bounty" => {
                        char_data.bounty = parse_bounties(&cleaned_value, bounty_regex);
                    }
                    _ => {
                        // Handle empty label which often contains bounty data
                        if label.is_empty() {
                            if cleaned_value.contains("000")
                                || cleaned_value.contains("Belly")
                                || cleaned_value.contains("Berries")
                            {
                                let bounties = parse_bounties(&cleaned_value, bounty_regex);
                                if !bounties.is_empty() {
                                    char_data.bounty = bounties;
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    Ok(char_data)
}
fn clean_text(text: &str, regex: &Regex) -> String {
    let no_refs = regex.replace_all(text, "");
    let mut cleaned = no_refs.trim().to_string();
    
    // Clean up spaces inside brackets (but keep space before opening bracket)
    cleaned = cleaned.replace("( ", "(").replace(" )", ")");
    
    // Clean up Unicode brackets with spaces
    cleaned = cleaned.replace("（ ", "（").replace(" ）", "）");
    
    // Normalize multiple spaces to single space
    cleaned = cleaned.split_whitespace().collect::<Vec<_>>().join(" ");
    
    cleaned
}

fn parse_array(text: &str) -> Vec<String> {
    // Split by comma or semicolon, but respect parentheses
    let mut result = Vec::new();
    let mut current = String::new();
    let mut paren_depth = 0;
    
    for ch in text.chars() {
        match ch {
            '(' | '（' => {
                paren_depth += 1;
                current.push(ch);
            }
            ')' | '）' => {
                paren_depth -= 1;
                current.push(ch);
            }
            ',' | ';' if paren_depth == 0 => {
                let trimmed = current.trim();
                if !trimmed.is_empty() {
                    result.push(trimmed.to_string());
                }
                current.clear();
            }
            _ => current.push(ch),
        }
    }
    
    // Don't forget the last item
    let trimmed = current.trim();
    if !trimmed.is_empty() {
        result.push(trimmed.to_string());
    }
    
    result
}

fn parse_heights(text: &str, height_regex: &Regex) -> Vec<String> {
    // Extract all heights in cm
    height_regex
        .captures_iter(text)
        .map(|cap| format!("{} cm", &cap[1]))
        .collect()
}

fn parse_bounties(text: &str, bounty_regex: &Regex) -> Vec<String> {
    // Extract all bounty amounts (they're concatenated with reference marks)
    bounty_regex
        .captures_iter(text)
        .filter_map(|cap| {
            let amount = cap.get(1)?.as_str();
            // Filter out very small numbers that are likely not bounties
            if amount.len() >= 6 || amount.contains(",") {
                // Remove commas from the bounty
                Some(amount.replace(",", ""))
            } else {
                None
            }
        })
        .collect()
}

fn parse_ages(text: &str) -> Vec<String> {
    // Age can be like "41 (debut) 43 (after timeskip)" which should be split
    // Split by numbers followed by parentheses
    let age_regex = Regex::new(r"(\d+\s*\([^)]+\))").unwrap();
    let ages: Vec<String> = age_regex
        .captures_iter(text)
        .map(|cap| cap[1].trim().to_string())
        .collect();
    
    if !ages.is_empty() {
        ages
    } else {
        // Fallback to the standard array parsing
        parse_array(text)
    }
}

// ============================================================================
// Layer 13: Map Translation - Apply cached translations to character data
// ============================================================================

fn layer_13_map_translation() -> Result<()> {
    // Load existing data
    let mut file = File::open(OUTPUT_FILE)?;
    let mut contents = String::new();
    file.read_to_string(&mut contents)?;
    let mut characters: Vec<Character> = serde_json::from_str(&contents)?;

    // Load translation cache
    let cache = load_translation_cache()?;

    // Apply translations to characters
    let mut translated_count = 0;

    for character in &mut characters {
        let mut has_translation = false;

        // Translate name (using simplified version as cache key)
        let simplified_name = simplify_term(&character.name);
        if let Some(translated) = cache.terms.get(&simplified_name) {
            character.name_cn = Some(translated.clone());
            has_translation = true;
        }

        // Translate affiliations
        let mut affiliations_cn = Vec::new();
        for aff in &character.affiliations {
            let simplified_aff = simplify_term(aff);
            if let Some(translated) = cache.terms.get(&simplified_aff) {
                affiliations_cn.push(translated.clone());
            }
        }
        if !affiliations_cn.is_empty() {
            character.affiliations_cn = Some(affiliations_cn);
            has_translation = true;
        }

        // Skip occupations - they're generic, not One Piece-specific

        // Translate devil fruit name (preserve existing fruit_type if present)
        if let Some(df) = &character.devil_fruit {
            if let Some(name) = &df.name {
                let simplified_df = simplify_term(name);
                if let Some(translated) = cache.terms.get(&simplified_df) {
                    // Preserve existing fruit_type if it exists
                    let existing_type = character.devil_fruit_cn.as_ref().and_then(|df| df.fruit_type.clone());
                    character.devil_fruit_cn = Some(DevilFruitCn {
                        name: Some(translated.clone()),
                        fruit_type: existing_type,
                    });
                    has_translation = true;
                }
            }
        }

        if has_translation {
            translated_count += 1;
        }
    }

    // Sort by name for consistency
    characters.sort_by(|a, b| a.name.cmp(&b.name));

    // Save updated data
    let json = serde_json::to_string_pretty(&characters)?;
    let mut file = File::create(OUTPUT_FILE)?;
    file.write_all(json.as_bytes())?;

    println!("━━━━━━━━━━━━━━━━━━━━━━━━━━");
    println!(
        "🈯 Layer 13: Map Translation: done! {} characters mapped ({} cached terms)",
        translated_count,
        cache.terms.len()
    );

    Ok(())
}

// ============================================================================
// Layer 14: Sanitize - Transform to clean output format
// ============================================================================

fn layer_14_sanitize() -> Result<()> {
    // Load existing data
    let mut file = File::open(OUTPUT_FILE)?;
    let mut contents = String::new();
    file.read_to_string(&mut contents)?;
    let characters: Vec<Character> = serde_json::from_str(&contents)?;

    // Transform each character
    let sanitized: Vec<OutputCharacter> = characters
        .iter()
        .filter_map(|c| sanitize_character(c))
        .collect();

    let skipped = characters.len() - sanitized.len();

    // Sort by name for consistency
    let mut sanitized = sanitized;
    sanitized.sort_by(|a, b| a.name.cmp(&b.name));

    // Save sanitized data
    let json = serde_json::to_string_pretty(&sanitized)?;
    let mut file = File::create(SANITIZED_OUTPUT_FILE)?;
    file.write_all(json.as_bytes())?;

    println!("━━━━━━━━━━━━━━━━━━━━━━━━━━");
    let skipped_msg = if skipped > 0 {
        format!(" ({} skipped)", skipped)
    } else {
        String::new()
    };
    println!(
        "✨ Layer 14: Sanitize: done! {} characters → {}{}",
        sanitized.len(),
        SANITIZED_OUTPUT_FILE,
        skipped_msg
    );

    Ok(())
}

/// Transform a Character to OutputCharacter format
fn sanitize_character(c: &Character) -> Option<OutputCharacter> {
    // Parse debut chapter (required)
    let debut_chapter = c.debut.as_ref()?.parse::<u32>().ok()?;

    // Get debut arc (required)
    let debut_arc = c.debut_arc.clone()?;
    let debut_arc_cn = c.debut_arc_cn.clone().unwrap_or_default();

    // Get origin (use origin_region which is standardized, default to "Unknown")
    let origin = c.origin_region.clone().unwrap_or_else(|| "Unknown".to_string());
    let origin_cn = c.origin_region_cn.clone().unwrap_or_else(|| "未知".to_string());

    // Parse bounty - take the highest value
    let bounty = c.bounty
        .iter()
        .filter_map(|b| b.replace(',', "").parse::<u64>().ok())
        .max()
        .unwrap_or(0);

    // Parse age - extract numbers and take the highest
    let age = extract_max_number(&c.age);

    // Parse height - extract cm values and take the highest
    let height = extract_max_height(&c.height);

    // Get status (default to "Unknown")
    let status = c.status.clone().unwrap_or_else(|| "Unknown".to_string());

    // Get devil fruit info
    let (devil_fruit_name, devil_fruit_type) = if let Some(df) = &c.devil_fruit {
        (df.name.clone(), df.fruit_type.clone())
    } else {
        (None, None)
    };

    // Get devil fruit CN info
    let devil_fruit_name_cn = c.devil_fruit_cn.as_ref().and_then(|df| df.name.clone());
    let devil_fruit_type_cn = c.devil_fruit_cn.as_ref().and_then(|df| df.fruit_type.clone());

    // Build occupations (omit if empty)
    let occupations = if c.occupations.is_empty() {
        None
    } else {
        Some(c.occupations.clone())
    };

    // Build residence (omit if empty)
    let residence = if c.residence.is_empty() {
        None
    } else {
        Some(c.residence.clone())
    };

    // Get Haki (required field, default to empty array)
    let haki = c.haki.clone().unwrap_or_default();
    let haki_cn = c.haki_cn.clone().unwrap_or_default();

    // Build CN block
    let cn = CharacterCn {
        name: c.name_cn.clone().unwrap_or_else(|| c.name.clone()),
        affiliations: c.affiliations_cn.clone().unwrap_or_default(),
        origin: origin_cn,
        debut_arc: debut_arc_cn,
        devil_fruit_name: devil_fruit_name_cn,
        devil_fruit_type: devil_fruit_type_cn,
        haki: haki_cn,
    };

    Some(OutputCharacter {
        name: c.name.clone(),
        japanese_name: c.japanese_name.clone().unwrap_or_default(),
        image: c.image.clone().unwrap_or_default(),
        debut_chapter,
        debut_arc,
        affiliations: c.affiliations.clone(),
        occupations,
        residence,
        origin,
        bounty,
        status,
        age,
        birthday: c.birthday.clone(),
        height,
        devil_fruit_name,
        devil_fruit_type,
        haki,
        cn,
    })
}

/// Extract the maximum number from a list of age strings like ["21 (debut)", "23 (after timeskip)"]
fn extract_max_number(values: &[String]) -> Option<u32> {
    let num_regex = Regex::new(r"(\d+)").unwrap();
    
    values
        .iter()
        .filter_map(|s| {
            num_regex.captures(s).and_then(|caps| {
                caps.get(1)?.as_str().parse::<u32>().ok()
            })
        })
        .max()
}

/// Extract the maximum height in cm from strings like ["195 cm", "200 cm"]
fn extract_max_height(values: &[String]) -> Option<u32> {
    let height_regex = Regex::new(r"(\d+)\s*cm").unwrap();
    
    values
        .iter()
        .filter_map(|s| {
            height_regex.captures(s).and_then(|caps| {
                caps.get(1)?.as_str().parse::<u32>().ok()
            })
        })
        .max()
}
