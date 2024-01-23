use glob::glob;
use regex::Regex;
use std::{env, fs};

fn main() -> std::io::Result<()> {
    let exclude_files = vec!["海子诗全集.md".to_string()];
    let punctuations = Regex::new(r"[.!?。！？”…：；]$").unwrap();
    let tag_pattern = Regex::new(r"\[\d+\]").unwrap();

    let directory = "docs/salt/";
    let pattern = format!("{}*.md", directory);

    let args: Vec<String> = env::args().collect();

    if args.len() > 1 {
        let filename = &args[1];
        process_file(directory, filename, &punctuations, &tag_pattern);
    } else {
        for entry in glob(&pattern).expect("Failed to read glob pattern") {
            match entry {
                Ok(path) => {
                    let file_name = path.file_name().unwrap().to_str().unwrap();
                    if !exclude_files.contains(&file_name.to_string()) {
                        process_file(directory, file_name, &punctuations, &tag_pattern);
                    }
                }
                Err(e) => println!("Error processing file: {:?}", e),
            }
        }
    }

    Ok(())
}

fn process_file(root: &str, file: &str, punctuations: &Regex, tag_pattern: &Regex) {
    let mut missing_quotes = vec![];
    let mut error_char_quotes = vec![];
    let mut tag_quotes = vec![];

    let file_path = format!("{}/{}", root, file);
    let content = fs::read_to_string(&file_path).expect("Failed to read file");

    for line in content.lines() {
        let line = line.trim();

        if line.starts_with(">>") {
            // check for missing punctuation
            if !punctuations.is_match(line) {
                missing_quotes.push(line);
            }
            // check for error characters
            if line.contains('￼') {
                error_char_quotes.push(line);
            }
            // check for tags
            if tag_pattern.is_match(line) {
                tag_quotes.push(line);
            }
        }
    }

    // print the collected quotes and issues for the current file
    if !missing_quotes.is_empty() || !error_char_quotes.is_empty() || !tag_quotes.is_empty() {
        println!("In {}:\n", file);

        if !missing_quotes.is_empty() {
            println!("Quotes missing punctuation:\n");
            for quote in missing_quotes {
                println!("{}\n", quote);
            }
        }
        if !error_char_quotes.is_empty() {
            println!("Quotes with error characters:\n");
            for quote in error_char_quotes {
                println!("{}\n", quote);
            }
        }
        if !tag_quotes.is_empty() {
            println!("Quotes with tags:\n");
            for quote in tag_quotes {
                println!("{}\n", quote);
            }
        }

        println!("---------\n");
    }
}
