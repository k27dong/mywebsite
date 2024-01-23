use chrono::Utc;
use chrono_tz::America::Toronto;
use rand::Rng;
use regex::Regex;
use std::{
    collections::HashSet,
    fs::{self, File},
    io::Write,
};

fn main() -> std::io::Result<()> {
    const NEW_BLOGPOST_PATH: &str = "docs/salt/new.md";

    let paths = glob::glob("docs/blog/*.md").expect("Failed to read glob pattern");
    let mut rng = rand::thread_rng();
    let mut id_set: HashSet<u32> = HashSet::new();
    let mut id: u32;

    // load exisiting abbrlinks (ids)
    for entry in paths {
        match entry {
            Ok(path) => {
                let blogpost = fs::read_to_string(path).expect("Failed to read file");

                let re = Regex::new(r"abbrlink: (\d+)").unwrap();
                if let Some(caps) = re.captures(&blogpost) {
                    if let Some(abbrlink_match) = caps.get(1) {
                        match abbrlink_match.as_str().parse::<u32>() {
                            Ok(abbrlink) => {
                                id_set.insert(abbrlink);
                            }
                            Err(e) => {
                                println!(
                                    "Failed to parse abbrlink '{}': {:?}",
                                    abbrlink_match.as_str(),
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

    // generate new abbrlink
    loop {
        id = rng.gen_range(10000..100000);
        if !id_set.contains(&id) {
            break;
        }
    }

    // write to new file
    let mut file = File::create(NEW_BLOGPOST_PATH)?;

    writeln!(file, "---")?;
    writeln!(file, "title: ")?;
    writeln!(file, "abbrlink: {}", id)?;
    writeln!(
        file,
        "date: {}",
        Utc::now()
            .with_timezone(&Toronto)
            .format("%Y-%m-%d %H:%M:%S")
    )?;
    writeln!(file, "---")?;

    println!("New Blogpost: {}", id);

    Ok(())
}
