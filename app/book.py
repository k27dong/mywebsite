import requests
from frontmatter import Frontmatter

DOUBAN_BOOK_API = "https://api.douban.com/v2/book/"
APIKEY = "054022eaeae0b00e0fc068c0c0a2102a"

# book : dict
def get_all_note(book):
  notelist = []
  body = book['body']
  paragraph = body.split('◆')
  paragraph = list(filter(None, paragraph))
  for p in paragraph:
    p = p.split('>>')
    curr_note = []
    for i in p:
      curr_note.append(i.rstrip("\n"))
    notelist.append(curr_note)
  return notelist

def get_book_info_douban(bookdir):
  book = Frontmatter.read_file(bookdir)
  url = DOUBAN_BOOK_API + "search?q=" + book['attributes']['title'] + "&apikey=" + APIKEY
  raw_info = requests.get(url)

  rating = 'N/A'
  tags = []

  if raw_info.status_code == 200:
    info = raw_info.json()
    info = info['books'][0]
    rating = info['rating']['average']
    raw_tag = info['tags']
    for t in raw_tag:
      if t['title'] != book['attributes']['title'] and t['title'] != book['attributes']['author']:
        tags.append(t['title'])

  final_rating_str = 'rating: ' + str(rating) + "\n"
  final_tags_str = "tags: \n"
  for t in tags:
    final_tags_str += "- " + t + "\n"

  # update ratings and tags if exist
  if 'rating' in book['attributes']:
    curr_file_r = open(bookdir, 'r')
    lines = curr_file_r.readlines()
    for i, item in enumerate(lines):
      if item.startswith('rating:'):
        lines[i] = final_rating_str
        break

    # rewrite lines back
    curr_file_r.close()
    curr_file_w = open(bookdir, 'w')
    for l in lines:
      curr_file_w.write(l)
    curr_file_w.close()
  else:
    curr_file_r = open(bookdir, 'r')
    lines = curr_file_r.readlines()
    for i, item in enumerate(lines):
      if item.startswith('num:'):
        lines.insert(i + 1, final_rating_str)
    curr_file_r.close()
    curr_file_w = open(bookdir, 'w')
    for l in lines:
      curr_file_w.write(l)
    curr_file_w.close()

  if 'tags' in book['attributes']:
    curr_file_r = open(bookdir, 'r')
    lines = curr_file_r.readlines()
    for i, item in enumerate(lines):
      if item.startswith('tags:'):
        to_be_removed = []
        for j in range(i + 1, len(lines)):
          if lines[j].startswith("- "):
            to_be_removed.append(lines[j])
          else:
            break
        for r in to_be_removed:
          lines.remove(r)
        lines[i] = final_tags_str

    curr_file_r.close()
    curr_file_w = open(bookdir, 'w')
    for l in lines:
      curr_file_w.write(l)
    curr_file_w.close()
  else:
    curr_file_r = open(bookdir, 'r')
    lines = curr_file_r.readlines()
    for i, item in enumerate(lines):
      if item.startswith('rating:'):
        lines.insert(i + 1, final_tags_str)
    curr_file_r.close()
    curr_file_w = open(bookdir, 'w')
    for l in lines:
      curr_file_w.write(l)
    curr_file_w.close()

# TODO
def populate_normal_booklist(book):
  return 1

