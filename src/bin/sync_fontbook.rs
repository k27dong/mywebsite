use sitecore::blogpost::load_blogpost;
use sitecore::booknote::load_booknote;
use std::{
    collections::HashSet,
    fs::{self, File},
    io::Write,
    path::Path,
};

fn main() {
    let font_files = vec![
        "web/assets/SourceHanSerifSC-Regular.otf",
        "web/assets/SourceHanSerifSC-Regular.otf",
        "web/assets/NotoSerifSC-ExtraBold.ttf",
    ];

    let blogposts = load_blogpost();
    let booknotes = load_booknote();
    let mut unique_chars = HashSet::new();

    for post in blogposts.values() {
        for ch in post.frontmatter.title.chars() {
            unique_chars.insert(ch);
        }

        for ch in post.content.chars() {
            unique_chars.insert(ch);
        }
    }

    for note in booknotes.values() {
        for ch in note.frontmatter.title.chars() {
            unique_chars.insert(ch);
        }

        for chapter in &note.content {
            for ch in chapter.name.chars() {
                unique_chars.insert(ch);
            }
            for note in &chapter.notes {
                for ch in note.chars() {
                    unique_chars.insert(ch);
                }
            }
        }
    }

    let mut char_vec: Vec<_> = unique_chars.into_iter().collect();
    char_vec.sort_unstable();
    let char_string: String = char_vec.iter().collect();

    let glyphhanger_dir = ".glyphhanger";
    if !Path::new(glyphhanger_dir).exists() {
        fs::create_dir(glyphhanger_dir).expect("Unable to create .glyphhanger directory");
    }

    let test_file_path = format!("{}/test.txt", glyphhanger_dir);

    let mut file = File::create(&test_file_path).expect("Unable to create test.txt");
    file.write_all(char_string.as_bytes())
        .expect("Unable to write data");

    print_optimized_command(&font_files, &test_file_path, glyphhanger_dir);
}

fn print_optimized_command(font_files: &[&str], test_file_path: &str, glyphhanger_dir: &str) {
    let mut command = format!(
        "glyphhanger {} > {}/glyphhanger_output",
        test_file_path, glyphhanger_dir
    );

    for font in font_files {
        let output_file = format!("{}/glyphhanger_output", glyphhanger_dir);
        command.push_str(&format!(
            " && pyftsubset {} --unicodes-file={} --flavor=woff2",
            font, output_file
        ));
    }

    println!("Run the following command:");
    println!("{}", command);
}
