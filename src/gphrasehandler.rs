use encoding_rs::GB18030;
use google_sheets4::{hyper, hyper_rustls, oauth2, Sheets};
use rand::seq::SliceRandom;
use serde::{Deserialize, Serialize};

cfg_if::cfg_if! {
    if #[cfg(feature = "shuttle")] {
        use shuttle_runtime::SecretStore;
    }
    else {
        use std::fs;
        use std::collections::HashMap;
    }
}

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

#[cfg(not(feature = "shuttle"))]
pub fn load_gsheet_config() -> GSheetConfig {
    // Read secrets from Secrets.toml (same file used by Shuttle)
    let secrets_content = fs::read_to_string("Secrets.toml")
        .expect("Failed to read Secrets.toml");
    let secrets: HashMap<String, String> = toml::from_str(&secrets_content)
        .expect("Failed to parse Secrets.toml");

    GSheetConfig {
        key_type: get_secret(&secrets, "KEY_TYPE"),
        project_id: get_secret(&secrets, "PROJECT_ID"),
        private_key_id: get_secret(&secrets, "PRIVATE_KEY_ID"),
        private_key: get_secret(&secrets, "PRIVATE_KEY").replace("\\n", "\n"),
        client_email: get_secret(&secrets, "CLIENT_EMAIL"),
        client_id: get_secret(&secrets, "CLIENT_ID"),
        auth_uri: get_secret(&secrets, "AUTH_URI"),
        token_uri: get_secret(&secrets, "TOKEN_URI"),
        auth_provider_x509_cert_url: get_secret(&secrets, "AUTH_PROVIDER_X509_CERT_URL"),
        client_x509_cert_url: get_secret(&secrets, "CLIENT_X509_CERT_URL"),
        spreadsheet_id: get_secret(&secrets, "SPREADSHEET_ID"),
    }
}

#[cfg(not(feature = "shuttle"))]
fn get_secret(secrets: &HashMap<String, String>, key: &str) -> String {
    secrets
        .get(key)
        .cloned()
        .unwrap_or_else(|| panic!("Secret {} not found in Secrets.toml", key))
}

#[cfg(feature = "shuttle")]
pub async fn load_gsheet_config(secret_store: &SecretStore) -> GSheetConfig {
    GSheetConfig {
        key_type: get_secret(secret_store, "KEY_TYPE").await,
        project_id: get_secret(secret_store, "PROJECT_ID").await,
        private_key_id: get_secret(secret_store, "PRIVATE_KEY_ID").await,
        private_key: get_secret(secret_store, "PRIVATE_KEY").await.replace("\\n", "\n"),
        client_email: get_secret(secret_store, "CLIENT_EMAIL").await,
        client_id: get_secret(secret_store, "CLIENT_ID").await,
        auth_uri: get_secret(secret_store, "AUTH_URI").await,
        token_uri: get_secret(secret_store, "TOKEN_URI").await,
        auth_provider_x509_cert_url: get_secret(secret_store, "AUTH_PROVIDER_X509_CERT_URL").await,
        client_x509_cert_url: get_secret(secret_store, "CLIENT_X509_CERT_URL").await,
        spreadsheet_id: get_secret(secret_store, "SPREADSHEET_ID").await,
    }
}

#[cfg(feature = "shuttle")]
async fn get_secret(secret_store: &SecretStore, key: &str) -> String {
    secret_store
        .get(key)
        .expect(&format!("Secret {} was not found", key))
}

pub fn format_gphrase(phrase: String) -> Vec<u8> {
    let prefix_phrase = format!("8FJ20GMV{}", phrase.trim_matches('\"').replace("\\n", "\n"));

    let (cow, _, _) = GB18030.encode(&prefix_phrase);

    cow.into_owned()
}
