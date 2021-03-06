import os
import datetime, time
from flask import Flask, request, jsonify
from flask_cors import CORS
from frontmatter import Frontmatter
from gevent.pywsgi import WSGIServer
from book import get_all_note, get_book_info_douban

app = Flask(__name__)
CORS(app)

CONTENT_DIR = "docs/blog/"
SALT_DIR = "docs/salt/"
INFO_LIST = {"title", "date"}
BLOG_LIST = {}
BOOK_LIST = {}

TOTAL_NOTE_NUM = 0  # will be updated later

# load all docs
for filename in os.listdir(CONTENT_DIR):
  if filename.endswith('.md'):
    post = Frontmatter.read_file(CONTENT_DIR + filename)
    BLOG_LIST.update({
      post['attributes']['abbrlink'] : {
        "title": post['attributes']['title'],
        "date": time.mktime(post['attributes']['date'].timetuple()) * 1000,
        "body": post['body']
      }
    })
  else:
    print("Error: initial load on docs")

# load book docs
for bookname in os.listdir(SALT_DIR):
  if bookname.endswith('.md'):
    book = Frontmatter.read_file(SALT_DIR + bookname)
    if ('rating' not in book['attributes']) or ('tags' not in book['attributes']):
      get_book_info_douban(SALT_DIR + bookname)
    curr_note_num = book['attributes']['num']
    BOOK_LIST.update({
      book['attributes']['title'] : {
        "title": book['attributes']['title'],
        "author": book['attributes']['author'],
        "format": book['attributes']['format'],
        "note": get_all_note(book),
        "notenum": curr_note_num
      }
    })
    TOTAL_NOTE_NUM += curr_note_num
  else:
    print("Error: initial load on booknotes")

@app.route('/health')
def health():
  return '', 200

@app.route('/ready')
def ready():
  return '', 200

@app.route('/api/get_blog_list', methods=['GET', 'POST'])
def get_blog_list():
  filelist = []
  for filename in os.listdir(CONTENT_DIR):
    if filename.endswith('.md'):
      post = Frontmatter.read_file(CONTENT_DIR + filename)
      filelist.append({
        "abbrlink": post['attributes']['abbrlink'],
        "title": post['attributes']['title'],
        "date": time.mktime(post['attributes']['date'].timetuple()) * 1000
      })
      filelist.sort(key = lambda r: r["date"], reverse=True)
    else:
      print("Error: get_blog_list")
  return jsonify(filelist), 200

@app.route('/api/get_post', methods=['GET', 'POST'])
def get_post():
  blog_id = int(request.get_json()['id'])
  return jsonify(BLOG_LIST[blog_id]), 200

@app.route('/api/get_salt_list', methods=['GET', 'POST'])
def get_salt_list():
  booklist = []
  for bookname in os.listdir(SALT_DIR):
    if bookname.endswith('.md'):
      book = Frontmatter.read_file(SALT_DIR + bookname)
      booklist.append({
        "title": book['attributes']['title'],
        "author": book['attributes']['author'],
        "notenum": book['attributes']['num'],
        "rating": book['attributes']['rating'],
        "tag": book['attributes']['tags'],
        "id": book['attributes']['id']
      })
      booklist.sort(key = lambda r : r["id"], reverse=True)
    else:
      print("Error: get_salt_list")
  return jsonify(booklist), 200

@app.route('/api/get_book_note', methods=['GET', 'POST'])
def get_book_note():
  book_name = request.get_json()['key']
  return jsonify(BOOK_LIST[book_name]), 200

@app.route('/api/get_total_note_num', methods=['GET', 'POST'])
def get_total_note_num():
  return jsonify(TOTAL_NOTE_NUM), 200

if __name__ == "__main__":
  WSGIServer(('0.0.0.0', 5000), app).serve_forever()


