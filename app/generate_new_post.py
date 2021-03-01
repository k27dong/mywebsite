import os
import random
from datetime import datetime
from frontmatter import Frontmatter

post_id = []
CONTENT_DIR = "docs/blog/"
FILENAME = "new.md"
CONTENT = ""

# save all existing id
for filename in os.listdir(CONTENT_DIR):
  if filename.endswith('.md'):
    post = Frontmatter.read_file(CONTENT_DIR + filename)
    post_id.append(post['attributes']['abbrlink'])

# generate a new id
new_id = random.randint(10000,99999)
while new_id in post_id:
  new_id = random.randint(10000,99999)

# write out the content
CONTENT = "---\ntitle: \nabbrlink: " + str(new_id) + "\ndate: " + datetime.now().strftime("%Y-%m-%d %H:%M:%S") + "\n---\n\n"

# write the new front matter to file, with the new id
f = open(CONTENT_DIR + FILENAME, 'a+')
f.write(CONTENT)
f.close()

# finish
print("done")
