use serde::{Deserialize, Serialize};
use std::{collections::HashMap, fs};

use crate::parser;

#[derive(Debug, Serialize, Deserialize)]
pub struct BookNoteFrontmatter {
    pub title: String,
    pub author: String,
    pub format: String,
    pub id: u32,
    pub num: u32,
    pub rating: String,
    pub tags: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct BookNote {
    pub frontmatter: BookNoteFrontmatter,
    pub content: BookNoteContent,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Chapter {
    pub name: String,
    pub notes: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct BookNoteContent {
    pub chapters: Vec<Chapter>,
}

impl Chapter {
    pub fn is_empty(&self) -> bool {
        self.name.is_empty() && self.notes.is_empty()
    }
}

pub fn load_booknote() -> HashMap<String, BookNote> {
    let mut posts = HashMap::new();
    let paths = glob::glob("docs/salt/*.md").expect("Failed to read glob pattern");

    for entry in paths {
        match entry {
            Ok(path) => {
                let blog_doc = fs::read_to_string(path).expect("Failed to read file");
                let (frontmatter, content) =
                    parser::parse_frontmatter::<BookNoteFrontmatter>(&blog_doc)
                        .expect("Failed to parse frontmatter");

                let parsed_content = parser::parse_booknote(&frontmatter, &content);

                posts.insert(
                    frontmatter.title.clone(),
                    BookNote {
                        frontmatter,
                        content: parsed_content,
                    },
                );
            }
            Err(e) => println!("Error loading blog posts: {:?}", e),
        }
    }

    posts
}
