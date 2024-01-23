import os, time, yaml
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from frontmatter import Frontmatter
from app.book import get_all_note, get_book_info_douban
from app.phrase import get_gphrase
from app.db import update_command, update_gsheet_server_list

BUILD_DIR = "../dist"
CONTENT_DIR = "docs/blog/"
SALT_DIR = "docs/salt/"
PROJECT_DIR = "docs/project/project.yaml"
INFO_LIST = {"title", "date"}
BLOG_LIST = {}
BOOK_LIST = {}
TOTAL_NOTE_NUM = 0  # will be updated later

app = Flask(
    __name__,
    static_folder=BUILD_DIR,
    static_url_path="",
    template_folder=BUILD_DIR,
)
# app = Flask(__name__)
CORS(app)


# load all docs
for filename in os.listdir(CONTENT_DIR):
    if filename.endswith(".md"):
        post = Frontmatter.read_file(CONTENT_DIR + filename)
        BLOG_LIST.update(
            {
                post["attributes"]["abbrlink"]: {
                    "title": post["attributes"]["title"],
                    "date": time.mktime(post["attributes"]["date"].timetuple()) * 1000,
                    "body": post["body"],
                }
            }
        )
    else:
        print("Error: initial load on docs")

# load book docs
for bookname in os.listdir(SALT_DIR):
    if bookname.endswith(".md"):
        book = Frontmatter.read_file(SALT_DIR + bookname)
        if ("rating" not in book["attributes"]) or ("tags" not in book["attributes"]):
            get_book_info_douban(SALT_DIR + bookname)
        curr_note_num = book["attributes"]["num"]
        BOOK_LIST.update(
            {
                book["attributes"]["title"]: {
                    "title": book["attributes"]["title"],
                    "author": book["attributes"]["author"],
                    "format": book["attributes"]["format"],
                    "note": get_all_note(book),
                    "notenum": curr_note_num,
                }
            }
        )
        TOTAL_NOTE_NUM += curr_note_num
    else:
        print("Error: initial load on booknotes")


@app.route("/")
def serve():
    return send_from_directory(app.static_folder, "index.html")


@app.errorhandler(404)
def not_found(e):
    return send_from_directory(app.static_folder, "index.html")


@app.route("/api/get_phrase", methods=["GET", "POST"])
def get_phrase():
    temp = request.args.get("temp")
    d = request.args.get("d")
    m = request.args.get("m")
    y = request.args.get("y")
    days = request.args.get("days")

    return get_gphrase(temp, y, m, d, days), 200


@app.route("/api/update_command_usage", methods=["POST"])
def update_command_usage():
    command_name = request.get_json()["command_name"]
    update_command(command_name)
    return "Success", 200


@app.route("/api/update_server_list", methods=["POST"])
def update_server_list():
    server_name = request.get_json()["name"]
    server_id = request.get_json()["id"]
    server_locale = request.get_json()["locale"]
    server_member_count = request.get_json()["member_count"]
    server_joined_time = request.get_json()["joined_time"]
    update_gsheet_server_list(
        server_name, server_id, server_locale, server_member_count, server_joined_time
    )
    return "Success", 200


if __name__ == "__main__":
    #   WSGIServer(('0.0.0.0', 5000), app).serve_forever()
    app.config["JSON_AS_ASCII"] = False
    app.run(host="0.0.0.0")
