use chrono::{NaiveDateTime, TimeZone, Utc};
use serde::Deserialize;
use std::error::Error;

use crate::booknote::{BookNoteContent, BookNoteFrontmatter, Chapter};

// Parsers for different book note formats
// (need to implement the BookNoteContentParser trait)
pub struct WereadParser;
pub struct Weread2Parser;

pub trait BookNoteContentParser {
    fn parse(&self, content: &str) -> BookNoteContent;
}

impl BookNoteContentParser for WereadParser {
    fn parse(&self, content: &str) -> BookNoteContent {
        let lines = content.split("\r\n").collect::<Vec<_>>();
        let mut chapters: Vec<Chapter> = Vec::new();

        let mut current_chapter = Chapter {
            name: String::new(),
            notes: Vec::new(),
        };

        for line in lines {
            let trimmed_line = line.trim();

            if trimmed_line.is_empty() {
                continue;
            }

            if trimmed_line.starts_with('◆') {
                if !current_chapter.is_empty() {
                    chapters.push(current_chapter);
                    current_chapter = Chapter {
                        name: String::new(),
                        notes: Vec::new(),
                    };
                }
                current_chapter.name = trimmed_line.trim_start_matches('◆').trim().to_string();
            } else if trimmed_line.starts_with(">>") {
                current_chapter
                    .notes
                    .push(trimmed_line.trim_start_matches(">>").trim().to_string());
            } else {
                if let Some(last_note) = current_chapter.notes.last_mut() {
                    last_note.push_str("\n");
                    last_note.push_str(trimmed_line);
                } else {
                    current_chapter.notes.push(trimmed_line.to_string());
                }
            }
        }

        if !current_chapter.is_empty() {
            chapters.push(current_chapter);
        }

        BookNoteContent { chapters }
    }
}

impl BookNoteContentParser for Weread2Parser {
    fn parse(&self, content: &str) -> BookNoteContent {
        // TODO: Implement

        BookNoteContent { chapters: vec![] }
    }
}

pub fn parse_frontmatter<'a, T: Deserialize<'a>>(
    markdown_input: &'a str,
) -> Result<(T, String), Box<dyn Error>> {
    let parts: Vec<&str> = markdown_input.splitn(3, "---").collect();

    if parts.len() < 3 {
        return Err("No frontmatter found".into());
    }

    let frontmatter_str = parts[1].trim();
    let content = parts[2].trim_start();

    let frontmatter: T = serde_yaml::from_str(frontmatter_str)?;

    Ok((frontmatter, content.to_string()))
}

pub fn parse_date(date_str: &str) -> i64 {
    let naive_datetime =
        NaiveDateTime::parse_from_str(date_str, "%Y-%m-%d %H:%M:%S").expect("Failed to parse date");
    let date = TimeZone::from_utc_datetime(&Utc, &naive_datetime);

    date.timestamp_millis()
}

pub fn parse_booknote(frontmatter: &BookNoteFrontmatter, content_str: &str) -> BookNoteContent {
    let parser: Box<dyn BookNoteContentParser> = match frontmatter.format.as_str() {
        "weread" => Box::new(WereadParser),
        "weread2" => Box::new(Weread2Parser),
        _ => panic!("Unsupported format: {}", frontmatter.format),
    };

    parser.parse(content_str)
}
