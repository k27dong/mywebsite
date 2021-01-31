import os

CONTENT_DIR = "docs/salt/"
FILENAME = "new.md"
CONTENT = ""
count = 1

# save all existing id
for filename in os.listdir(CONTENT_DIR):
  if filename.endswith('.md'):
    count += 1

# write out the content
CONTENT = "---\ntitle: \nauthor: \nformat: weread\nid: " + str(count) + "\nnum: \n---\n\n"

# write the new front matter to file, with the new id
f = open(CONTENT_DIR + FILENAME, 'a+')
f.write(CONTENT)
f.close()

# finish
print("done")
