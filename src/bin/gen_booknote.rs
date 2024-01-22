use regex::Regex;
use std::{
    cmp::max,
    fs::{self, File},
    io::Write, path::Path,
};

fn main() -> std::io::Result<()> {
    const NEW_BOOKNOTE_PATH: &str = "docs/salt/new.md";

    let paths = glob::glob("docs/salt/*.md").expect("Failed to read glob pattern");
    let new_booknote_path = Path::new(NEW_BOOKNOTE_PATH);
    let mut id = 1;

    if new_booknote_path.exists() {
        fs::remove_file(&new_booknote_path)?;
        println!("Existing new.md removed.");
    }

    // load exisiting ids
    for entry in paths {
        match entry {
            Ok(path) => {
                let booknote = fs::read_to_string(path).expect("Failed to read file");

                let re = Regex::new(r"id: (\d+)").unwrap();
                if let Some(caps) = re.captures(&booknote) {
                    if let Some(id_match) = caps.get(1) {
                        match id_match.as_str().parse::<u32>() {
                            Ok(curr_id) => {
                                id = max(id, curr_id);
                            }
                            Err(e) => {
                                println!(
                                    "Failed to parse abbrlink '{}': {:?}",
                                    id_match.as_str(),
                                    e
                                )
                            }
                        }
                    }
                }
            }
            Err(e) => println!("Error loading blog posts: {:?}", e),
        }
    }

    // generate new id
    id += 1;

    // write to new file
    let mut file = File::create(NEW_BOOKNOTE_PATH)?;

    writeln!(file, "---")?;
    writeln!(file, "title: ")?;
    writeln!(file, "author: ")?;
    writeln!(file, "format: ")?;
    writeln!(file, "id: {}", id)?;
    writeln!(file, "num: ")?;
    writeln!(file, "rating: ")?;
    writeln!(file, "tags: ")?;
    writeln!(file, "---")?;

    println!("New Booknote: {}", id);

    Ok(())
}
