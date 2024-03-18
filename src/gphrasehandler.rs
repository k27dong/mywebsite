use std::env;

use google_sheets4::{hyper, hyper_rustls, oauth2, Sheets};
use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
pub struct PhraseParams {
    pub temp: i32,
    pub y: i32,
    pub m: i32,
    pub d: i32,
    pub days: i32,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Config {
    #[serde(rename = "type")]
    pub key_type: String,
    pub project_id: String,
    pub private_key_id: String,
    pub private_key: String,
    pub client_email: String,
    pub client_id: String,
    pub auth_uri: String,
    pub token_uri: String,
    pub auth_provider_x509_cert_url: String,
    pub client_x509_cert_url: String,
}

impl Config {
    pub fn new() -> Config {
        Config {
            key_type: String::from("service_account"),
            project_id: get_env_var("PROJECT_ID"),
            private_key_id: get_env_var("PRIVATE_KEY_ID"),
            private_key: get_env_var("PRIVATE_KEY"),
            client_email: get_env_var("CLIENT_EMAIL"),
            client_id: get_env_var("CLIENT_ID"),
            auth_uri: String::from("https://accounts.google.com/o/oauth2/auth"),
            token_uri: String::from("https://oauth2.googleapis.com/token"),
            auth_provider_x509_cert_url: String::from("https://www.googleapis.com/oauth2/v1/certs"),
            client_x509_cert_url: get_env_var("CERT_URL"),
        }
    }
}

pub async fn get_gphrase(temperature: i32, year: i32, month: i32, day: i32, since: i32) -> String {
    let secret = if let Ok(_) = env::var("PORT") {
        let config = Config::new();
        let json_string = serde_json::to_string(&config).expect("Serialization failed");
        oauth2::parse_service_account_key(&json_string).expect("Parsing failed")
    } else {
        oauth2::read_service_account_key("gsheet_creds.json")
            .await
            .expect("Reading failed")
    };

    let client = hyper::Client::builder().build::<_, hyper::Body>(
        hyper_rustls::HttpsConnectorBuilder::new()
            .with_native_roots()
            .https_only()
            .enable_http1()
            .enable_http2()
            .build(),
    );

    let auth = oauth2::ServiceAccountAuthenticator::with_client(secret, client.clone())
        .build()
        .await
        .expect("could not create an authenticator");

    let hub = Sheets::new(client.clone(), auth);

    // TODO retrieve data from the spreadsheet strategically
    let sheet = hub
        .spreadsheets()
        .values_get(get_env_var("SPREADSHEET_ID").as_str(), "B3")
        .doit()
        .await;

    match sheet {
        Ok(res) => {
            println!("Response: {:?}", res);
        }
        Err(e) => {
            println!("Error: {}", e);
        }
    }

    "phrase".to_string()
}

fn get_env_var(name: &str) -> String {
    env::var(name).unwrap_or_else(|_| panic!("{} is not found", name))
}
