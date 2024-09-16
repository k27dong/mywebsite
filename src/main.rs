use actix_cors::Cors;
use actix_files as fs;
use actix_web::{
    get, http, post, web, web::ServiceConfig, App, HttpResponse, HttpServer, Responder,
};
use serde_json::json;
use shuttle_actix_web::ShuttleActixWeb;
use std::collections::HashMap;

use sitecore::blogpost::BlogPost;
use sitecore::booknote::BookNote;
use sitecore::gphrasehandler::{GSheetConfig, PhraseParams};
use sitecore::parser::parse_date;
use sitecore::playlist::Playlist;
use sitecore::project::Project;

struct AppState {
    posts: HashMap<u32, BlogPost>,
    notes: HashMap<String, BookNote>,
    projects: Vec<Project>,
    playlists: HashMap<u32, Playlist>,
    // gsheet_config: GSheetConfig,
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

// #[get("/api/get_phrase")]
// async fn get_phrase(query: web::Query<PhraseParams>, data: web::Data<AppState>) -> impl Responder {
//     let phrase = sitecore::gphrasehandler::get_gphrase(
//         query.temp,
//         query.y,
//         query.m,
//         query.d,
//         query.days,
//         &data.gsheet_config,
//     )
//     .await;

//     let phrase = sitecore::gphrasehandler::format_gphrase(phrase);

//     HttpResponse::Ok().content_type("text/plain").body(phrase)
// }

#[cfg(not(feature = "shuttle"))]
#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let port = std::env::var("PORT").unwrap_or(String::from("5000"));

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
                posts: sitecore::blogpost::load_blogpost(),
                notes: sitecore::booknote::load_booknote(),
                projects: sitecore::project::load_projects(),
                playlists: sitecore::playlist::load_playlist(),
                // gsheet_config: sitecore::gphrasehandler::load_gsheet_config(),
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
            // .service(get_phrase)
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

#[cfg(feature = "shuttle")]
#[shuttle_runtime::main]
async fn actix_web() -> ShuttleActixWeb<impl FnOnce(&mut ServiceConfig) + Send + Clone + 'static> {
    println!("Starting actix-web server with shuttle runtime");
    let config = move |cfg: &mut ServiceConfig| {
        cfg.app_data(web::Data::new(AppState {
            posts: sitecore::blogpost::load_blogpost(),
            notes: sitecore::booknote::load_booknote(),
            projects: sitecore::project::load_projects(),
            playlists: sitecore::playlist::load_playlist(),
            // gsheet_config: sitecore::gphrasehandler::load_gsheet_config(),
        }));
        cfg.service(health);
        cfg.service(ready);
        cfg.service(get_blog_list);
        cfg.service(get_post);
        cfg.service(get_project_list);
        cfg.service(get_salt_list);
        cfg.service(get_total_note_num);
        cfg.service(get_book_note);
        cfg.service(get_playlist);
        // cfg.service(get_phrase);
        cfg.service(
            fs::Files::new("/", "./dist")
                .index_file("index.html")
                .default_handler(
                    web::get().to(|| async { fs::NamedFile::open("./dist/index.html") }),
                ),
        );
    };
    Ok(config.into())
}
