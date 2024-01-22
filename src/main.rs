use actix_cors::Cors;
use actix_web::{get, http, post, web, App, HttpResponse, HttpServer, Responder};
use blogpost::BlogPost;
use booknote::BookNote;
use project::Project;
use serde_json::json;
use std::collections::HashMap;

use crate::parser::parse_date;

mod blogpost;
mod booknote;
mod parser;
mod project;

struct AppState {
    posts: HashMap<u32, BlogPost>,
    notes: HashMap<String, BookNote>,
    projects: Vec<Project>,
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

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        let cors = Cors::default()
            .allowed_origin("http://0.0.0.0:5173")
            .allowed_origin("https://kefan.me")
            .allowed_methods(vec!["GET", "POST"])
            .allowed_headers(vec![http::header::AUTHORIZATION, http::header::ACCEPT])
            .allowed_header(http::header::CONTENT_TYPE)
            .max_age(3600);

        App::new()
            .wrap(cors)
            .app_data(web::Data::new(AppState {
                posts: blogpost::load_blog_post(),
                notes: booknote::load_book_note(),
                projects: project::load_projects(),
            }))
            .service(health)
            .service(ready)
            .service(get_blog_list)
            .service(get_post)
            .service(get_project_list)
            .service(get_salt_list)
            .service(get_total_note_num)
            .service(get_book_note)
    })
    .bind(("0.0.0.0", 5000))?
    .run()
    .await
}
