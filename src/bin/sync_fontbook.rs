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

use colored::*;
use sitecore::blogpost::load_blogpost;
use sitecore::booknote::load_booknote;
use std::collections::BTreeSet;
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
const BASELINE_CHARACTERS: &str = r#" 0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz.,;:!?'"()[]{}<>-–—_*/\|@#$%^&+=~`“”‘’«»·•…％＆（）【】"#;
const CHAR_COUNT_FILE: &str = "public/fonts/.char_count";

struct FontSummary<'a> {
    name: &'a str,
    size_bytes: u64,
    delta_bytes: Option<i64>,
    delta_pct: Option<f64>,
}

fn insert_chars<I: IntoIterator<Item = char>>(target: &mut BTreeSet<char>, chars: I) {
    for ch in chars {
        if !ch.is_control() {
            target.insert(ch);
        }
    }
}

fn main() -> io::Result<()> {
    let blogposts = load_blogpost();
    let booknotes = load_booknote();
    let previous_character_count = fs::read_to_string(CHAR_COUNT_FILE)
        .ok()
        .and_then(|value| value.trim().parse::<usize>().ok())
        .unwrap_or(0);

    println!(
        "{}",
        format!("Previous: {} characters", previous_character_count).dimmed()
    );

    let mut characters = BTreeSet::new();

    // Collect all characters from blogposts and booknotes
    for post in blogposts.values() {
        insert_chars(&mut characters, post.frontmatter.title.chars());
        insert_chars(&mut characters, post.content.chars());
    }

    for note in booknotes.values() {
        insert_chars(&mut characters, note.frontmatter.title.chars());

        for chapter in &note.content {
            insert_chars(&mut characters, chapter.name.chars());
            for note in &chapter.notes {
                insert_chars(&mut characters, note.chars());
            }
        }
    }

    insert_chars(&mut characters, BASELINE_CHARACTERS.chars());

    let character_count = characters.len();

    fs::write(
        UNICODE_FILE,
        characters
            .iter()
            .map(|&ch| format!("U+{:X}", ch as u32))
            .collect::<Vec<String>>()
            .join(","),
    )?;

    // Run pyftsubset for each font file
    fs::create_dir_all(FILE_DEST_LOCATION)?;
    let mut summaries = Vec::new();
    for font_file in FONT_FILES.iter() {
        let source_file = format!("{}{}", FILE_SOURCE_LOCATION, font_file);
        let dest_file = format!(
            "{}{}",
            FILE_DEST_LOCATION,
            font_file
                .replace(".otf", "-subset.woff2")
                .replace(".ttf", "-subset.woff2")
        );

        let previous_size = fs::metadata(&dest_file).ok().map(|meta| meta.len());
        let label_plain = format!("Subsetting {:<30}", font_file);
        print!("{} ...", label_plain);
        io::stdout().flush()?;

        let status = Command::new("python")
            .arg("-m")
            .arg("fontTools.subset")
            .arg(&source_file)
            .arg(format!("--unicodes-file={}", UNICODE_FILE))
            .arg("--flavor=woff2")
            .arg("--no-hinting")
            .arg("--desubroutinize")
            .arg("--drop-tables+=FFTM,DSIG")
            .arg(format!("--output-file={}", dest_file))
            .status()
            .expect("Failed to run pyftsubset");

        if status.success() {
            let new_size = fs::metadata(&dest_file).map(|meta| meta.len()).unwrap_or(0);
            let size_mb = bytes_to_mb(new_size);

            let mut delta_bytes = None;
            let mut delta_pct = None;
            let comparison = match previous_size {
                Some(old) if old > 0 => {
                    let delta = new_size as i64 - old as i64;
                    let pct = (delta as f64 / old as f64) * 100.0;
                    delta_bytes = Some(delta);
                    delta_pct = Some(pct);
                    let symbol = if delta >= 0 { "▲" } else { "▼" };
                    let pct_str = format!("{symbol} {pct:+.2}%");
                    if delta >= 0 {
                        pct_str.red().bold()
                    } else {
                        pct_str.green().bold()
                    }
                }
                _ => "new file".yellow().bold(),
            };

            let size_display = format!("{:.2} MB", size_mb).cyan();

            println!(
                "\r\x1b[K{} ...\t{} | {} | size: {}",
                label_plain.clone().bright_blue(),
                "done!".bold().green(),
                comparison,
                size_display
            );

            summaries.push(FontSummary {
                name: font_file,
                size_bytes: new_size,
                delta_bytes,
                delta_pct,
            });
        } else {
            println!(
                "\r\x1b[K{} ...\t{}",
                label_plain,
                "failed to subset".red().bold()
            );
        }
    }

    print_summary_table(&summaries);

    let char_delta = character_count as i64 - previous_character_count as i64;
    println!(
        "{}",
        format!("Total chars: {} ({:+})", character_count, char_delta)
            .bold()
            .yellow()
    );

    // Clean up the temporary unicode file
    fs::remove_file(UNICODE_FILE)?;
    fs::write(CHAR_COUNT_FILE, character_count.to_string())?;

    Ok(())
}

fn bytes_to_mb(bytes: u64) -> f64 {
    bytes as f64 / (1024.0 * 1024.0)
}

fn print_summary_table(summaries: &[FontSummary<'_>]) {
    if summaries.is_empty() {
        return;
    }

    println!();
    println!("{}", "Font subset summary".bold().underline());

    let rows: Vec<TableRow> = summaries.iter().map(TableRow::from).collect();

    let name_width = rows
        .iter()
        .map(|row| row.name.len())
        .max()
        .unwrap_or(4)
        .max("Font".len());
    let size_width = rows
        .iter()
        .map(|row| row.size_plain.len())
        .max()
        .unwrap_or(0)
        .max("Size".len());
    let delta_width = rows
        .iter()
        .map(|row| row.delta_plain.len())
        .max()
        .unwrap_or(0)
        .max("Delta".len());

    let name_col = name_width + 2;
    let size_col = size_width + 2;
    let delta_col = delta_width + 2;

    let header = format!(
        "┌{}┬{}┬{}┐",
        "─".repeat(name_col),
        "─".repeat(size_col),
        "─".repeat(delta_col)
    );
    println!("{}", header.bright_black());
    println!(
        "│ {:<name_width$} │ {:>size_width$} │ {:>delta_width$} │",
        "Font",
        "Size",
        "Delta",
        name_width = name_width,
        size_width = size_width,
        delta_width = delta_width
    );
    let divider = format!(
        "├{}┼{}┼{}┤",
        "─".repeat(name_col),
        "─".repeat(size_col),
        "─".repeat(delta_col)
    );
    println!("{}", divider.bright_black());

    for row in rows {
        let size_cell = pad_colored(&row.size_plain, &row.size_colored, size_width, false);
        let delta_cell = pad_colored(&row.delta_plain, &row.delta_colored, delta_width, false);

        println!(
            "│ {:<name_width$} │ {} │ {} │",
            row.name,
            size_cell,
            delta_cell,
            name_width = name_width
        );
    }

    let footer = format!(
        "└{}┴{}┴{}┘",
        "─".repeat(name_col),
        "─".repeat(size_col),
        "─".repeat(delta_col)
    );
    println!("{}", footer.bright_black());
}

struct TableRow {
    name: String,
    size_plain: String,
    size_colored: String,
    delta_plain: String,
    delta_colored: String,
}

impl<'a> From<&FontSummary<'a>> for TableRow {
    fn from(summary: &FontSummary<'a>) -> Self {
        let size_value = bytes_to_mb(summary.size_bytes);
        let size_plain = format!("{:.2} MB", size_value);
        let size_colored = size_plain.clone().cyan().to_string();

        let (delta_plain, delta_colored) = match (summary.delta_pct, summary.delta_bytes) {
            (Some(pct), Some(delta_bytes)) => {
                let arrow = if pct >= 0.0 { "▲" } else { "▼" };
                let delta_mb = bytes_to_mb_signed(delta_bytes);
                let plain = format!("{arrow} {pct:+.2}% / {delta_mb:+.2} MB");
                let colored = if pct >= 0.0 {
                    plain.clone().red().bold().to_string()
                } else {
                    plain.clone().green().bold().to_string()
                };
                (plain, colored)
            }
            _ => {
                let plain = "new".to_string();
                (plain.clone(), plain.yellow().bold().to_string())
            }
        };

        TableRow {
            name: summary.name.to_string(),
            size_plain,
            size_colored,
            delta_plain,
            delta_colored,
        }
    }
}

fn pad_colored(value_plain: &str, value_colored: &str, width: usize, align_left: bool) -> String {
    if width == 0 {
        return value_colored.to_string();
    }
    let padded = if align_left {
        format!("{:<width$}", value_plain, width = width)
    } else {
        format!("{:>width$}", value_plain, width = width)
    };
    padded.replacen(value_plain, value_colored, 1)
}

fn bytes_to_mb_signed(bytes: i64) -> f64 {
    bytes as f64 / (1024.0 * 1024.0)
}
