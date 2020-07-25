import os
import datetime, time
from flask import Flask, request, jsonify
from flask_cors import CORS
from frontmatter import Frontmatter
from gevent.pywsgi import WSGIServer

app = Flask(__name__)
CORS(app)

CONTENT_DIR = "docs/"
INFO_LIST = {"title", "date"}
BLOG_LIST = {}

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
    print("Error: found wrong doc")

@app.route('/test')
def test():
    return "yes", 200

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
      print("Error: found wrong doc")
  return jsonify(filelist), 200

@app.route('/api/get_post', methods=['GET', 'POST'])
def get_post():
  blog_id = int(request.get_json()['id'])
  return jsonify(BLOG_LIST[blog_id]), 200

if __name__ == "__main__":
  app.run(host='0.0.0.0')


