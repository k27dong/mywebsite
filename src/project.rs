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
    let file_content =
        fs::read_to_string("docs/project/project.yaml").expect("Failed to read project file");

    let projects: Vec<Project> = serde_yaml::from_str(&file_content).expect("Failed to parse YAML");

    projects
}
