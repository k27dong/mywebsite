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
    if Path::new(ONEPIECE_DIR).exists() {
        fs::remove_dir_all(ONEPIECE_DIR).unwrap();
    }
    fs::create_dir_all(ONEPIECE_DIR).unwrap();

    let source_file = "data/op_sanitized.json";
    let dest_file = format!("{}/characters.json", ONEPIECE_DIR);

    if Path::new(source_file).exists() {
        fs::copy(source_file, &dest_file).expect("Failed to copy One Piece data");
        println!("onepiece done (copied to {})", dest_file);
    } else {
        eprintln!("Warning: {} not found.", source_file);
    }
}
