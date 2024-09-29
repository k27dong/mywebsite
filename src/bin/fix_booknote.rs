use colored::Colorize;
use difference::{Changeset, Difference};
use glob::glob;
use inquire::{InquireError, Select};
use regex::Regex;
use std::fmt::Write;
use std::fs;

fn is_title(line: &str) -> bool {
    !line.starts_with("◆")
}

fn fix_missing_punctuation(line: &str) -> String {
    let re = Regex::new(r"[.!?。！？”…：；]$").unwrap();
    if !re.is_match(line) {
        format!("{}。", line)
    } else {
        line.to_string()
    }
}

fn fix_error_character(line: &str) -> String {
    line.replace('￼', "")
}

fn fix_unnecessary_tag(line: &str) -> String {
    let re = Regex::new(r"\[\d+\]").unwrap();
    re.replace_all(line, "").to_string()
}

fn main() -> std::io::Result<()> {
    let paths = glob("docs/salt/*.md").expect("Failed to read glob pattern");

    for entry in paths {
        match entry {
            Ok(path) => {
                let blog_doc = fs::read_to_string(&path).expect("Failed to read file");
                let parts: Vec<&str> = blog_doc.splitn(3, "---").collect();

                println!("Processing {:?}", path);

                if parts.len() != 3 {
                    println!("No frontmatter found for {:?}", path);
                    continue;
                }

                let frontmatter = parts[1].trim();
                if !frontmatter.contains("format: weread2") {
                    continue;
                }

                let content = parts[2];
                let lines = content.lines();

                let mut fixed_content = Vec::new();

                for line in lines {
                    let trimmed = line.trim();
                    if trimmed.is_empty() {
                        fixed_content.push(line.to_string());
                        continue;
                    }

                    let mut fixed_line = trimmed.to_string().clone();

                    // check for MissingPunctuations, ErrorCharacter, UnnecessaryTags
                    fixed_line = fix_error_character(&fixed_line);
                    fixed_line = fix_unnecessary_tag(&fixed_line);

                    if !is_title(&trimmed) {
                        fixed_line = fix_missing_punctuation(&fixed_line);
                    }

                    if fixed_line != trimmed {
                        let Changeset { diffs, .. } =
                            Changeset::new(trimmed, fixed_line.as_str(), "");

                        let mut result = String::new();

                        for c in &diffs {
                            match *c {
                                Difference::Same(ref text) => {
                                    write!(result, "{}", text).unwrap();
                                }
                                Difference::Add(ref text) => {
                                    write!(result, "{}", text.on_green()).unwrap();
                                }
                                Difference::Rem(ref text) => {
                                    write!(result, "{}", text.on_red()).unwrap();
                                }
                            }
                        }

                        println!("=====================================");
                        println!("Processed differences:");
                        println!("{}", result);

                        let ans: Result<&str, InquireError> =
                            Select::new("Do you want to proceed?", vec!["Yes", "No"]).prompt();

                        match ans {
                            Ok(choice) => {
                                if choice == "Yes" {
                                    fixed_content.push(fixed_line);
                                } else {
                                    fixed_content.push(line.to_string());
                                }
                            }
                            Err(_) => {
                                panic!("Error when asking for user input");
                            }
                        }
                    } else {
                        fixed_content.push(fixed_line);
                    }
                }

                // fix is done, now write back to file
                let fixed_part = fixed_content.join("\n") + "\n";
                let reconstructed_doc = format!("{}---{}---{}", parts[0], parts[1], fixed_part);

                match fs::write(path, reconstructed_doc) {
                    Ok(_) => println!("File updated successfully."),
                    Err(e) => println!("Failed to update the file: {}", e),
                }
            }
            Err(e) => println!("Error when fixing booknote: {:?}", e),
        }
    }

    Ok(())
}
