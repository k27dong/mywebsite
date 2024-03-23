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
        let lines = content.split("\n").collect::<Vec<_>>();
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

        chapters
    }
}

impl BookNoteContentParser for Weread2Parser {
    fn parse(&self, content: &str) -> BookNoteContent {
        let lines = content.split("\n").collect::<Vec<_>>();
        let mut chapters: Vec<Chapter> = Vec::new();
        let mut empty_line_counter = 2;

        let mut current_chapter = Chapter {
            name: String::new(),
            notes: Vec::new(),
        };

        for line in lines {
            let trimmed_line = line.trim();

            if trimmed_line.is_empty() {
                empty_line_counter += 1;
                continue;
            }

            if !trimmed_line.starts_with('◆') {
                // if there are two empty lines in a row, we know the current line is the new chapter name
                // else, we know the current line is the continuation of the previous note
                if empty_line_counter >= 2 {
                    if !current_chapter.is_empty() {
                        chapters.push(current_chapter);
                        current_chapter = Chapter {
                            name: String::new(),
                            notes: Vec::new(),
                        };
                    }
                    current_chapter.name = trimmed_line.to_string();
                } else {
                    if let Some(last_note) = current_chapter.notes.last_mut() {
                        last_note.push_str("\n");
                        last_note.push_str(trimmed_line);
                    } else {
                        current_chapter.notes.push(trimmed_line.to_string());
                    }
                }
            } else {
                // new note starts with '◆'
                current_chapter
                    .notes
                    .push(trimmed_line.trim_start_matches("◆").trim().to_string());
            }

            empty_line_counter = 0;
        }

        if !current_chapter.is_empty() {
            chapters.push(current_chapter);
        }

        chapters
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

#[cfg(test)]
mod tests {
    use crate::blogpost::BlogPostFrontmatter;

    use super::*;

    #[test]
    fn test_parse_date_success() {
        let date = "2021-01-01 00:00:00";
        let expected = 1609459200000;
        let actual = parse_date(date);

        assert_eq!(expected, actual);
    }

    #[test]
    #[should_panic(expected = "Failed to parse date")]
    fn test_parse_date_panic() {
        let date = "invalid date format";
        parse_date(date);
    }

    #[test]
    fn test_parse_blogpost_frontmatter_success() {
        let blog_raw_input =
            "\n---\ntitle: BlogTitle\nabbrlink: 12345\ndate: 2021-01-01 00:00:00\n---\nContent";
        let (frontmatter, content) =
            parse_frontmatter::<BlogPostFrontmatter>(blog_raw_input).unwrap();

        assert_eq!(frontmatter.title, "BlogTitle");
        assert_eq!(frontmatter.date, "2021-01-01 00:00:00");
        assert_eq!(frontmatter.abbrlink, 12345);
        assert_eq!(content, "Content");
    }

    #[test]
    fn test_parse_booknote_frontmatter_success() {
        let booknote_raw_input = "\n---\ntitle: BookTitle\nauthor: Author\nformat: weread2\nid: 54\nnum: 10\nrating: 9.2\ntags:\n- Tag1\n- Tag2\n- Tag3\n---\nContent";
        let (frontmatter, content) =
            parse_frontmatter::<BookNoteFrontmatter>(booknote_raw_input).unwrap();

        assert_eq!(frontmatter.title, "BookTitle");
        assert_eq!(frontmatter.author, "Author");
        assert_eq!(frontmatter.format, "weread2");
        assert_eq!(frontmatter.id, 54);
        assert_eq!(frontmatter.num, 10);
        assert_eq!(frontmatter.rating, "9.2");
        assert_eq!(frontmatter.tags, vec!["Tag1", "Tag2", "Tag3"]);
        assert_eq!(content, "Content");
    }

    #[test]
    #[should_panic(expected = "No frontmatter found")]
    fn test_parse_frontmatter_panic_no_frontmatter() {
        let raw_input = "No frontmatter present";
        parse_frontmatter::<BlogPostFrontmatter>(raw_input).unwrap();
    }

    #[test]
    #[should_panic]
    fn test_parse_frontmatter_panic_invalid_type() {
        let raw_input = "---\ntitle: \"BlogTitle123\"\nabbrlink: \"12345\"\ndate: \"2021-01-01 00:00:00\"\n---\nContent";
        parse_frontmatter::<BlogPostFrontmatter>(raw_input).unwrap();
    }
}
