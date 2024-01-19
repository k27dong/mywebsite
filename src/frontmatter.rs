use chrono::{NaiveDateTime, TimeZone, Utc};
use serde::Deserialize;
use std::error::Error;

pub fn parse_frontmatter<'a, T: Deserialize<'a>>(
    markdown_input: &'a str,
) -> Result<(T, String), Box<dyn Error>> {
    let parts: Vec<&str> = markdown_input.splitn(3, "---").collect();

    if parts.len() < 3 {
        return Err("No frontmatter found".into());
    }

    let frontmatter_str = parts[1].trim();
    let content = parts[2].trim_start();

    let frontmatter: T = serde_yaml::from_str(frontmatter_str)?;

    Ok((frontmatter, content.to_string()))
}

pub fn parse_date(date_str: &str) -> i64 {
    let naive_datetime =
        NaiveDateTime::parse_from_str(date_str, "%Y-%m-%d %H:%M:%S").expect("Failed to parse date");
    let date = TimeZone::from_utc_datetime(&Utc, &naive_datetime);

    date.timestamp_millis()
}
