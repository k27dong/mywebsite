use serde::{Deserialize, Serialize};
use std::{collections::HashMap, fs};

#[derive(Debug, Serialize, Deserialize)]
pub struct Song {
    id: String,
    title: String,
    artist: String,
    album: String,
    duration: String,
    cover: String,
    audio: String,
    lyrics: String,
}

pub type Playlist = Vec<Song>;

pub fn load_playlist() -> HashMap<u32, Playlist> {
    let mut playlists = HashMap::new();
    let paths = glob::glob("public/audios/*/info.yaml").expect("Failed to read glob pattern");

    for entry in paths {
        match entry {
            Ok(path) => {
                if let Some(playlist_id) = path
                    .parent()
                    .and_then(|p| p.file_name())
                    .and_then(std::ffi::OsStr::to_str)
                    .and_then(|s| s.parse::<u32>().ok())
                {
                    let contents = fs::read_to_string(&path).expect("Failed to read file");
                    let songs: Playlist =
                        serde_yaml::from_str(&contents).expect("Failed to parse YAML");

                    playlists.insert(playlist_id, songs);
                } else {
                    println!("Invalid playlist directory name: {:?}", path);
                }
            }
            Err(e) => println!("Error loading blog posts: {:?}", e),
        }
    }

    playlists
}
