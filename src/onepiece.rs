use chrono::{Datelike, Utc};
use rand::rngs::StdRng;
use rand::{Rng, SeedableRng};
use serde::{Deserialize, Serialize};
use std::fs;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CharacterCn {
    pub name: String,
    pub affiliations: Vec<String>,
    pub origin: String,
    pub debut_arc: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub devil_fruit_name: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub devil_fruit_type: Option<String>,
    pub haki: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Character {
    pub name: String,
    pub japanese_name: String,
    pub image: String,
    pub debut_chapter: u32,
    pub debut_arc: String,
    pub affiliations: Vec<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub occupations: Option<Vec<String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub residence: Option<Vec<String>>,
    pub origin: String,
    pub bounty: u64,
    pub status: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub age: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub birthday: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub height: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub devil_fruit_name: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub devil_fruit_type: Option<String>,
    pub haki: Vec<String>,
    pub cn: CharacterCn,
}

pub fn load_characters() -> Vec<Character> {
    let file_content = fs::read_to_string("web/content/onepiece/characters.json")
        .expect("Failed to read character file");

    let characters: Vec<Character> =
        serde_json::from_str(&file_content).expect("Failed to parse JSON");

    characters
}

pub fn get_todays_character(characters: &[Character]) -> Option<Character> {
    if characters.is_empty() {
        return None;
    }

    let now = Utc::now();
    let seed = (now.year() as u64) * 10000 + (now.month() as u64) * 100 + (now.day() as u64);

    let mut rng = StdRng::seed_from_u64(seed);
    let index = rng.gen_range(0..characters.len());

    Some(characters[index].clone())
}

