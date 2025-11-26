use serde_json::json;
use sitecore::booknote;
use std::fs;
use std::io::Write;
use std::path::Path;

const BLOGPOST_DIR: &str = "web/content/posts";
const BOOKNOTES_DIR: &str = "web/content/booknotes";
const ONEPIECE_DIR: &str = "web/content/onepiece";

fn main() -> std::io::Result<()> {
    println!("Starting synchronization...");

    sync_blogposts();
    sync_booknotes();
    sync_onepiece();

    println!("Synchronization complete.");
    Ok(())
}

pub fn sync_blogposts() {
    if Path::new(BLOGPOST_DIR).exists() {
        fs::remove_dir_all(BLOGPOST_DIR).unwrap();
    }

    fs::create_dir_all(BLOGPOST_DIR).unwrap();

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

pub fn sync_booknotes() {
    if Path::new(BOOKNOTES_DIR).exists() {
        fs::remove_dir_all(BOOKNOTES_DIR).unwrap();
    }

    fs::create_dir_all(BOOKNOTES_DIR).unwrap();

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
        fs::File::create(&file_name)
            .unwrap()
            .write_all(json_content.as_bytes())
            .unwrap();
    }

    println!("booknote done")
}

pub fn sync_onepiece() {
    // Remove existing directory and recreate
    if Path::new(ONEPIECE_DIR).exists() {
        fs::remove_dir_all(ONEPIECE_DIR).unwrap();
    }
    fs::create_dir_all(ONEPIECE_DIR).unwrap();

    // Read the sanitized character data (array of characters)
    let source_file = "data/op_sanitized.json";

    if Path::new(source_file).exists() {
        let json_content = fs::read_to_string(source_file).expect("Failed to read source file");
        let characters: Vec<serde_json::Value> = serde_json::from_str(&json_content)
            .expect("Failed to parse JSON");

        // Create individual JSON file for each character
        for character in &characters {
            if let Some(name) = character.get("name").and_then(|n| n.as_str()) {
                // Sanitize filename: replace spaces and special characters
                let safe_name = name
                    .replace(" ", "_")
                    .replace(".", "")
                    .replace("'", "")
                    .replace("\"", "")
                    .replace("/", "_")
                    .to_lowercase();

                let file_name = format!("{}/{}.json", ONEPIECE_DIR, safe_name);
                let json_content = serde_json::to_string_pretty(&character).unwrap();
                
                fs::File::create(&file_name)
                    .unwrap()
                    .write_all(json_content.as_bytes())
                    .unwrap();
            }
        }

        println!("onepiece done (created {} character files)", characters.len());
    } else {
        eprintln!("Warning: {} not found. Run 'cargo run --bin sync_onepiece -- --layers all' first.", source_file);
    }
}
