import gspread
import os
from oauth2client.service_account import ServiceAccountCredentials

def update_command(cmd):
  scope = [
    'https://spreadsheets.google.com/feeds',
    'https://www.googleapis.com/auth/drive'
  ]

  secret = {
    "type": "service_account",
    "project_id": os.environ['WY_PROJECT_ID'],
    "private_key_id": os.environ['WY_PRIVATE_KEY_ID'],
    "private_key": os.environ['WY_PRIVATE_KEY'].replace('\\n', '\n'),
    "client_email": os.environ['WY_CLIENT_EMAIL'],
    "client_id": os.environ['WY_CLIENT_ID'],
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": os.environ['WY_CERT_URL']
  }

  creds = ServiceAccountCredentials.from_json_keyfile_dict(secret, scope)
  client = gspread.authorize(creds)
  sheet = client.open("wybot").worksheet("Command")

  cmd_cell = sheet.find(cmd)

  if cmd_cell is not None:
    # increament the frequency cell
    sheet.update_cell(cmd_cell.row, cmd_cell.col + 1, int(sheet.cell(cmd_cell.row, cmd_cell.col + 1).value) + 1)
  else:
    # add new row with (cmd, 0)
    sheet.append_row([cmd, 0])

  return "done"


