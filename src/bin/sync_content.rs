use serde_json::json;
use sitecore::booknote;
use std::fs::{self, create_dir_all, File};
use std::io::Write;
use std::path::Path;

const BLOGPOST_DIR: &str = "web/content/posts";
const BOOKNOTES_DIR: &str = "web/content/booknotes";

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    println!("Starting synchronization...");

    sync_blogposts().await;
    sync_booknotes().await;

    println!("Synchronization complete.");
    Ok(())
}

pub async fn sync_blogposts() {
    if Path::new(BLOGPOST_DIR).exists() {
        fs::remove_dir_all(BLOGPOST_DIR).unwrap();
    }

    create_dir_all(BLOGPOST_DIR).unwrap();

    let paths = glob::glob("docs/blog/*.md").expect("Failed to read glob pattern");
    for entry in paths {
        match entry {
            Ok(path) => {
                fs::copy(
                    &path,
                    Path::new(BLOGPOST_DIR).join(path.file_name().unwrap()),
                )
                .expect("Failed to copy file");
            }
            Err(e) => println!("Error copying blog post: {:?}", e),
        }
    }

    println!("blogpost done")
}

pub async fn sync_booknotes() {
    if Path::new(BOOKNOTES_DIR).exists() {
        fs::remove_dir_all(BOOKNOTES_DIR).unwrap();
    }

    create_dir_all(BOOKNOTES_DIR).unwrap();

    let notes = booknote::load_booknote();
    for (title, note) in notes {
        let file_name = format!("{}/{}.json", BOOKNOTES_DIR, title.replace(" ", "_"));
        let file_data = json!({
            "title": note.frontmatter.title,
            "author": note.frontmatter.author,
            "id": note.frontmatter.id,
            "notenum": note.frontmatter.num,
            "rating": note.frontmatter.rating,
            "tags": note.frontmatter.tags,
            "content": note.content,
        });

        let json_content = serde_json::to_string_pretty(&file_data).unwrap();
        File::create(&file_name)
            .unwrap()
            .write_all(json_content.as_bytes())
            .unwrap();
    }

    println!("booknote done")
}
