use encoding_rs::GB18030;
use google_sheets4::{hyper, hyper_rustls, oauth2, Sheets};
use rand::seq::SliceRandom;
use serde::{Deserialize, Serialize};
use std::env;

#[derive(Deserialize)]
pub struct PhraseParams {
    pub temp: i32,
    pub y: i32,
    pub m: i32,
    pub d: i32,
    pub days: i32,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
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

pub fn load_gsheet_config() -> GSheetConfig {
    GSheetConfig {
        key_type: env::var("KEY_TYPE").expect("KEY_TYPE not set"),
        project_id: env::var("PROJECT_ID").expect("PROJECT_ID not set"),
        private_key_id: env::var("PRIVATE_KEY_ID").expect("PRIVATE_KEY_ID not set"),
        private_key: env::var("PRIVATE_KEY").expect("PRIVATE_KEY not set").replace("\\n", "\n"),
        client_email: env::var("CLIENT_EMAIL").expect("CLIENT_EMAIL not set"),
        client_id: env::var("CLIENT_ID").expect("CLIENT_ID not set"),
        auth_uri: env::var("AUTH_URI").expect("AUTH_URI not set"),
        token_uri: env::var("TOKEN_URI").expect("TOKEN_URI not set"),
        auth_provider_x509_cert_url: env::var("AUTH_PROVIDER_X509_CERT_URL").expect("AUTH_PROVIDER_X509_CERT_URL not set"),
        client_x509_cert_url: env::var("CLIENT_X509_CERT_URL").expect("CLIENT_X509_CERT_URL not set"),
        spreadsheet_id: env::var("SPREADSHEET_ID").expect("SPREADSHEET_ID not set"),
    }
}

pub fn format_gphrase(phrase: String) -> Vec<u8> {
    let prefix_phrase = format!("8FJ20GMV{}", phrase.trim_matches('\"').replace("\\n", "\n"));

    let (cow, _, _) = GB18030.encode(&prefix_phrase);

    cow.into_owned()
}
