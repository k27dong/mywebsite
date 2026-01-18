use serde::{Deserialize, Serialize};
use serde_yaml;
use std::fs;

#[derive(Serialize, Deserialize, Debug)]
pub struct Project {
    pub name: String,
    pub language: Vec<String>,
    pub description: String,
    pub link: String,
}

pub fn load_projects() -> Vec<Project> {
    let file_content = match fs::read_to_string("docs/project/project.yaml") {
        Ok(content) => content,
        Err(e) => {
            eprintln!("Warning: Could not read project file: {}", e);
            return Vec::new();
        }
    };

    match serde_yaml::from_str(&file_content) {
        Ok(projects) => projects,
        Err(e) => {
            eprintln!("Warning: Failed to parse project YAML: {}", e);
            Vec::new()
        }
    }
}
