use encoding_rs::GB18030;
use google_sheets4::{hyper, hyper_rustls, oauth2, Sheets};
use rand::seq::SliceRandom;
use serde::{Deserialize, Serialize};
use std::env;
use std::fs;

#[derive(Deserialize)]
pub struct PhraseParams {
    pub temp: i32,
    pub y: i32,
    pub m: i32,
    pub d: i32,
    pub days: i32,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct GSheetConfig {
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
    pub spreadsheet_id: String,
}

pub async fn get_gphrase(
    _temperature: i32,
    _year: i32,
    _month: i32,
    _day: i32,
    _since: i32,
    config: &GSheetConfig,
) -> String {
    let secret = oauth2::parse_service_account_key(
        &serde_json::to_string(config).expect("Serialization failed"),
    )
    .expect("Parsing failed");

    let client = hyper::Client::builder().build(
        hyper_rustls::HttpsConnectorBuilder::new()
            .with_native_roots()
            .expect("could not build https connector")
            .https_or_http()
            .enable_http1()
            .build(),
    );

    let auth = oauth2::ServiceAccountAuthenticator::with_client(secret, client.clone())
        .build()
        .await
        .expect("could not create an authenticator");

    let hub = Sheets::new(client.clone(), auth);

    // for now, we just retrieve any cell from the B column
    // this strategy may change in the future to include specific dates & events
    let result = hub
        .spreadsheets()
        .values_get(config.spreadsheet_id.as_str(), "B:B")
        .doit()
        .await;

    match result {
        Ok((_, value_range)) => {
            let values = value_range
                .values
                .unwrap_or_else(Vec::new)
                .iter()
                .skip(1)
                .map(|row| row[0].to_string())
                .collect::<Vec<String>>();

            let mut rng = rand::thread_rng();

            values.choose(&mut rng).unwrap().to_string()
        }
        Err(error) => {
            println!("Error: {}", error);
            "some code is broken".to_string()
        }
    }
}

fn get_env_var(name: &str) -> String {
    env::var(name).expect(&format!("{} environment variable not set", name))
}

pub fn load_gsheet_config() -> GSheetConfig {
    if let Ok(_) = env::var("PORT") {
        GSheetConfig {
            key_type: String::from("service_account"),
            project_id: get_env_var("PROJECT_ID"),
            private_key_id: get_env_var("PRIVATE_KEY_ID"),
            private_key: get_env_var("PRIVATE_KEY").replace("\\n", "\n"),
            client_email: get_env_var("CLIENT_EMAIL"),
            client_id: get_env_var("CLIENT_ID"),
            auth_uri: String::from("https://accounts.google.com/o/oauth2/auth"),
            token_uri: String::from("https://oauth2.googleapis.com/token"),
            auth_provider_x509_cert_url: String::from("https://www.googleapis.com/oauth2/v1/certs"),
            client_x509_cert_url: get_env_var("CERT_URL"),
            spreadsheet_id: get_env_var("SPREADSHEET_ID"),
        }
    } else {
        serde_json::from_reader(
            fs::File::open("gsheet_creds.json").expect("Failed to open gsheet_creds.json"),
        )
        .expect("Failed to parse gsheet_creds.json")
    }
}

pub fn format_gphrase(phrase: String) -> Vec<u8> {
    let prefix_phrase = format!("8FJ20GMV{}", phrase.trim_matches('\"').replace("\\n", "\n"));

    let (cow, _, _) = GB18030.encode(&prefix_phrase);

    cow.into_owned()
}
