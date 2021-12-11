import gspread
import quantumrandom
import os
from oauth2client.service_account import ServiceAccountCredentials

def construct_phrase(entry):
  string = "8FJ20GMV" + entry['content']
  return string.encode('gb2312')

def get_gphrase(t, y, m, d, days):
  scope = [
    'https://spreadsheets.google.com/feeds',
    'https://www.googleapis.com/auth/drive'
  ]

  secret = {
    "type": "service_account",
    "project_id": os.environ['PROJECT_ID'],
    "private_key_id": os.environ['PRIVATE_KEY_ID'],
    "private_key": os.environ['PRIVATE_KEY'].replace('\\n', '\n'),
    "client_email": os.environ['CLIENT_EMAIL'],
    "client_id": os.environ['CLIENT_ID'],
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": os.environ['CERT_URL']
  }

  # creds = ServiceAccountCredentials.from_json_keyfile_name('app/secret.json', scope)
  creds = ServiceAccountCredentials.from_json_keyfile_dict(secret, scope)

  client = gspread.authorize(creds)

  sheet = client.open("phrases").sheet1

  list_of_hashes = sheet.get_all_records()

  # for entry in list_of_hashes:
  #   if (entry['used'] == 0):
  #     list_of_hashes.remove(entry)

  index = int(quantumrandom.randint(0, len(list_of_hashes)))

  if (int(days) % 101 == 0):
    index = 0

  return construct_phrase(list_of_hashes[index])


