use actix_cors::Cors;
use actix_files as fs;
use actix_web::{get, http, post, web, App, HttpResponse, HttpServer, Responder};
use blogpost::BlogPost;
use booknote::BookNote;
use gphrasehandler::PhraseParams;
use playlist::Playlist;
use project::Project;
use serde_json::json;
use std::{collections::HashMap, io::Write, fs::create_dir_all, fs::File};

use crate::parser::parse_date;

mod blogpost;
mod booknote;
mod gphrasehandler;
mod parser;
mod playlist;
mod project;

struct AppState {
    posts: HashMap<u32, BlogPost>,
    notes: HashMap<String, BookNote>,
    projects: Vec<Project>,
    playlists: HashMap<u32, Playlist>,
    gsheet_config: gphrasehandler::Config,
}

#[get("/health")]
async fn health() -> impl Responder {
    HttpResponse::Ok().body("OK")
}

#[post("/ready")]
async fn ready() -> impl Responder {
    HttpResponse::Ok().body("OK")
}

#[get("/api/get_blog_list")]
async fn get_blog_list(data: web::Data<AppState>) -> impl Responder {
    let blogposts = &data.posts;

    let mut filelist: Vec<_> = blogposts
        .values()
        .map(|post| {
            let frontmatter = &post.frontmatter;

            json!({
                "abbrlink": frontmatter.abbrlink,
                "title": frontmatter.title,
                "date": parse_date(&frontmatter.date),
            })
        })
        .collect();

    filelist.sort_by_key(|post| -post["date"].as_i64().unwrap());

    HttpResponse::Ok().json(filelist)
}

#[get("/api/get_post/{id}")]
async fn get_post(data: web::Data<AppState>, path: web::Path<u32>) -> impl Responder {
    let blogposts = &data.posts;
    let id = path.into_inner();

    match blogposts.get(&id) {
        Some(post) => {
            let frontmatter = &post.frontmatter;

            let response = json!({
                "title": frontmatter.title,
                "date": parse_date(&frontmatter.date),
                "body": post.content
            });

            HttpResponse::Ok().json(response)
        }
        None => HttpResponse::NotFound().json("Post not found"),
    }
}

#[get("/api/get_salt_list")]
async fn get_salt_list(data: web::Data<AppState>) -> impl Responder {
    let booknotes = &data.notes;

    let mut filelist: Vec<_> = booknotes
        .values()
        .map(|note| {
            let frontmatter = &note.frontmatter;

            json!({
                "title": frontmatter.title,
                "author": frontmatter.author,
                "notenum": frontmatter.num,
                "rating": frontmatter.rating,
                "tag": frontmatter.tags,
                "id": frontmatter.id,
            })
        })
        .collect();

    filelist.sort_by_key(|note| -note["id"].as_i64().unwrap());

    HttpResponse::Ok().json(filelist)
}

#[get("/api/get_book_note/{title}")]
async fn get_book_note(data: web::Data<AppState>, path: web::Path<String>) -> impl Responder {
    let booknotes = &data.notes;
    let title = path.into_inner();

    match booknotes.get(&title) {
        Some(post) => {
            let frontmatter = &post.frontmatter;

            let response = json!({
                "title": frontmatter.title,
                "author": frontmatter.author,
                "format": frontmatter.format,
                "notes": post.content,
                "notenum": frontmatter.num,
            });

            HttpResponse::Ok().json(response)
        }
        None => HttpResponse::NotFound().json("Post not found"),
    }
}

#[get("/api/get_total_note_num")]
async fn get_total_note_num(data: web::Data<AppState>) -> impl Responder {
    let booknotes = &data.notes;

    let total_note_num: u32 = booknotes.values().map(|note| note.frontmatter.num).sum();

    HttpResponse::Ok().json(total_note_num)
}

#[get("/api/get_project_list")]
async fn get_project_list(data: web::Data<AppState>) -> impl Responder {
    let projects = &data.projects;

    HttpResponse::Ok().json(projects)
}

#[get("/api/get_playlist/{id}")]
async fn get_playlist(data: web::Data<AppState>, path: web::Path<u32>) -> impl Responder {
    let playlists = &data.playlists;
    let id = path.into_inner();

    if let Some(playlist) = playlists.get(&id) {
        HttpResponse::Ok().json(playlist)
    } else {
        HttpResponse::NotFound().body("Playlist not found")
    }
}

#[get("/api/get_phrase")]
async fn get_phrase(query: web::Query<PhraseParams>, data: web::Data<AppState>) -> impl Responder {
    let phrase = gphrasehandler::get_gphrase(
        query.temp,
        query.y,
        query.m,
        query.d,
        query.days,
        &data.gsheet_config,
    )
    .await;

    let phrase = gphrasehandler::format_gphrase(phrase);

    HttpResponse::Ok().content_type("text/plain").body(phrase)
}

async fn process_and_save_notes(notes: &HashMap<String, booknote::BookNote>) {
    let content_path = "./web/content/booknotes";
    create_dir_all(content_path).unwrap();

    for (title, note) in notes {
        let file_name = format!("{}/{}.json", content_path, title.replace(" ", "_"));
        let mut file = File::create(&file_name).unwrap();

        let note_data = json!({
            "title": note.frontmatter.title,
            "author": note.frontmatter.author,
            "id": note.frontmatter.id,
            "notenum": note.frontmatter.num,
            "rating": note.frontmatter.rating,
            "tags": note.frontmatter.tags,
            "content": note.content,
        });

        let json_content = serde_json::to_string_pretty(&note_data).unwrap();
        file.write_all(json_content.as_bytes()).unwrap();
    }
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let port = std::env::var("PORT").unwrap_or(String::from("5000"));

    process_and_save_notes(&booknote::load_booknote()).await;
    println!("Processed and saved all notes");

    HttpServer::new(|| {
        let cors = Cors::default()
            .allowed_origin("http://localhost:5173")
            .allowed_origin("http://127.0.0.1:5173")
            .allowed_origin("https://kefan.me")
            .allowed_origin("https://www.kefan.me")
            .allowed_methods(vec!["GET"])
            .allowed_headers(vec![http::header::AUTHORIZATION, http::header::ACCEPT])
            .allowed_header(http::header::CONTENT_TYPE)
            .max_age(3600);

        App::new()
            .wrap(cors)
            .app_data(web::Data::new(AppState {
                posts: blogpost::load_blogpost(),
                notes: booknote::load_booknote(),
                projects: project::load_projects(),
                playlists: playlist::load_playlist(),
                gsheet_config: gphrasehandler::load_gsheet_config(),
            }))
            .service(health)
            .service(ready)
            .service(get_blog_list)
            .service(get_post)
            .service(get_project_list)
            .service(get_salt_list)
            .service(get_total_note_num)
            .service(get_book_note)
            .service(get_playlist)
            .service(get_phrase)
            .service(
                fs::Files::new("/", "./dist")
                    .index_file("index.html")
                    .default_handler(
                        web::get().to(|| async { fs::NamedFile::open("./dist/index.html") }),
                    ),
            )
    })
    .bind(("0.0.0.0", port.parse::<u16>().unwrap()))?
    .run()
    .await
}
