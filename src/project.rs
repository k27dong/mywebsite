use serde::{Deserialize, Serialize};
use serde_yaml;
use std::{fmt, fs};

#[derive(Serialize, Deserialize, Debug)]
pub struct Project {
    pub name: String,
    pub language: Vec<String>,
    pub description: String,
    pub link: String,
}

impl fmt::Display for Project {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(
            f,
            "Name: {}\n# of Language: {}\nDescription: {}\nLink: {}\n",
            self.name,
            self.language.len(),
            self.description,
            self.link
        )
    }
}

pub fn load_projects() -> Vec<Project> {
    let file_content =
        fs::read_to_string("docs/project/project.yaml").expect("Failed to read project file");

    let projects: Vec<Project> = serde_yaml::from_str(&file_content).expect("Failed to parse YAML");

    projects
}
