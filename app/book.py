# DOUBAN_BOOK_API = "https://api.douban.com/v2/book/"
# APIKEY = "054022eaeae0b00e0fc068c0c0a2102a"

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

# TODO
def populate_normal_booklist(book):
  return 1

