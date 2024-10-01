/*!
 * Font Subsetting Script
 *
 * This Rust script is designed to subset an input font (TTF or OTF) using the
 * pyftsubset tool from the fonttools library. It includes only the characters
 * used for the website and converts the subsetted font to the WOFF2 format.
 *
 * Why Call Python from Rust?
 * --------------------------
 * Rust currently lacks a fully mature library for subsetting OpenType and
 * TrueType fonts. Multiple attempts were made but using a well-polished Python
 * library avoids any unnecessary extra work with its powerful subsetting and
 * conversion features, including OpenType table management and compression
 * into web-friendly WOFF2 formats. The Rust script ensures that the subsetting
 * process is tightly integrated into the Rust-based workflow.
 *
 * Python Libraries:
 * --------------------------
 * fonttools - Used for manipulating font files, supporting font subsetting and WOFF2 conversion.
 * brotli - Used for compressing WOFF2 fonts.
 *
 * Installation Instructions:
 * --------------------------
 * To use this script, install the required libraries manually:
 * pip install fonttools brotli
 */

use sitecore::blogpost::load_blogpost;
use sitecore::booknote::load_booknote;
use std::collections::HashSet;
use std::fs;
use std::io::{self, Write};
use std::process::Command;

const FONT_FILES: [&str; 3] = [
    "SourceHanSerifSC-Regular.otf",
    "SourceHanSerifSC-Medium.otf",
    "NotoSerifSC-ExtraBold.ttf",
];

const FILE_SOURCE_LOCATION: &str = "web/assets/";
const FILE_DEST_LOCATION: &str = "public/fonts/";

const UNICODE_FILE: &str = "unicodes.txt";

fn main() -> std::io::Result<()> {
    let blogposts = load_blogpost();
    let booknotes = load_booknote();

    let mut characters = HashSet::new();

    // Collect all characters from blogposts and booknotes
    for post in blogposts.values() {
        for ch in post.frontmatter.title.chars() {
            characters.insert(ch);
        }

        for ch in post.content.chars() {
            characters.insert(ch);
        }
    }

    for note in booknotes.values() {
        for ch in note.frontmatter.title.chars() {
            characters.insert(ch);
        }

        for chapter in &note.content {
            for ch in chapter.name.chars() {
                characters.insert(ch);
            }
            for note in &chapter.notes {
                for ch in note.chars() {
                    characters.insert(ch);
                }
            }
        }
    }

    fs::write(
        UNICODE_FILE,
        characters
            .iter()
            .map(|&ch| format!("U+{:X}", ch as u32))
            .collect::<Vec<String>>()
            .join(","),
    )?;

    // Run pyftsubset for each font file
    for font_file in FONT_FILES.iter() {
        let source_file = format!("{}{}", FILE_SOURCE_LOCATION, font_file);
        let dest_file = format!(
            "{}{}",
            FILE_DEST_LOCATION,
            font_file
                .replace(".otf", "-subset.woff2")
                .replace(".ttf", "-subset.woff2")
        );

        print!("Subsetting {} ...", font_file);
        io::stdout().flush()?;

        let status = Command::new("pyftsubset")
            .arg(&source_file)
            .arg(format!("--unicodes-file={}", UNICODE_FILE))
            .arg("--flavor=woff2")
            .arg(format!("--output-file={}", dest_file))
            .status()
            .expect("Failed to run pyftsubset");

        if status.success() {
            println!("\tdone!");
        } else {
            eprintln!("Failed to subset font: {}", font_file);
        }
    }

    // Clean up the temporary unicode file
    fs::remove_file(UNICODE_FILE)?;

    Ok(())
}
