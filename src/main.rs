use actix_cors::Cors;
use actix_web::{get, post, web, http, App, HttpResponse, HttpServer, Responder};
use blogpost::BlogPost;
use project::Project;
use serde_json::json;
use std::collections::HashMap;

use crate::frontmatter::parse_date;

mod blogpost;
mod booknote;
mod frontmatter;
mod project;

struct AppState {
    posts: HashMap<u32, BlogPost>,
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
    let blog_list = &data.posts;

    let mut filelist: Vec<_> = blog_list
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
async fn get_post(data: web::Data<AppState>, path: web::Path<(u32,)>) -> impl Responder {
    let blog_posts = &data.posts;
    let id = path.into_inner().0;

    match blog_posts.get(&id) {
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

#[get("/api/get_project_list")]
async fn get_project_list(data: web::Data<AppState>) -> impl Responder {
    let projects = &data.projects;

    HttpResponse::Ok().json(projects)
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        let cors = Cors::default()
            .allowed_origin("http://127.0.0.1:5173")
            .allowed_methods(vec!["GET", "POST"])
            .allowed_headers(vec![http::header::AUTHORIZATION, http::header::ACCEPT])
            .allowed_header(http::header::CONTENT_TYPE)
            .max_age(3600);

        App::new()
            .wrap(cors)
            .app_data(web::Data::new(AppState {
                posts: blogpost::load_blog_post(),
                projects: project::load_projects(),
            }))
            .service(health)
            .service(ready)
            .service(get_blog_list)
            .service(get_post)
            .service(get_project_list)
    })
    .bind(("127.0.0.1", 5000))?
    .run()
    .await
}
