use crate::frontmatter::parse_frontmatter;
use serde::{Deserialize, Serialize};
use std::{collections::HashMap, fmt, fs};

#[derive(Debug, Serialize, Deserialize)]
pub struct BlogPostFrontmatter {
    pub title: String,
    pub date: String,
    pub abbrlink: u32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct BlogPost {
    pub frontmatter: BlogPostFrontmatter,
    pub content: String,
}

impl fmt::Display for BlogPostFrontmatter {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(
            f,
            "Title: {}\nDate: {}\nAbbrlink: {}\n",
            self.title, self.date, self.abbrlink
        )
    }
}

impl fmt::Display for BlogPost {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "{}\n{}", self.frontmatter, self.content)
    }
}

pub fn load_blog_post() -> HashMap<u32, BlogPost> {
    let mut posts = HashMap::new();
    let paths = glob::glob("docs/blog/*.md").expect("Failed to read glob pattern");

    for entry in paths {
        match entry {
            Ok(path) => {
                let blog_doc = fs::read_to_string(path).expect("Failed to read file");
                let (frontmatter, content) = parse_frontmatter::<BlogPostFrontmatter>(&blog_doc)
                    .expect("Failed to parse frontmatter");

                posts.insert(
                    frontmatter.abbrlink,
                    BlogPost {
                        frontmatter,
                        content,
                    },
                );
            }
            Err(e) => println!("Error loading blog posts: {:?}", e),
        }
    }

    posts
}
