import os
import datetime, time
import markdown
from frontmatter import Frontmatter

CONTENT_DIR = "docs/blog/"

XML_HEADER = '<?xml version="1.0" encoding="UTF-8"?>'
RSS_HEADER = '<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/"  xmlns:dc="http://purl.org/dc/elements/1.1/">'
RSS_TITLE = "Kefan's Blog"
RSS_LINK = "https://kefan.me/"
RSS_DESC = "我的精神家园"
RSS_LANG = "zh-CN"

INVALID_ABBRLINK = [
    52536,  # miller
    43663,  # list 19
    38818,  # list 20
    51126,  # list 21
    41986,  # setting up blog 1
    40077,  # valgrind
    25747,  # fetching
    60052,  # is_odd
    63683,  # display age
]

posts = ""


def convert_datetime(dt):
    return dt.strftime("%a, %d %b %Y %H:%M:%S %z")


RSS_LASTBUILDDATE = convert_datetime(datetime.datetime.now())


def cdata_block(content):
    return "<![CDATA[" + content + "]]>"


def write_block(name, content, attr=""):
    return "<" + name + " " + attr + ">" + content + "</" + name + ">\n"


def write_item(post):
    item = "<item>\n"
    item += write_block("title", str(post["attributes"]["title"]))
    item += write_block(
        "link", "http://kefan.me/post/" + str(post["attributes"]["abbrlink"])
    )
    item += write_block("pubDate", convert_datetime(post["attributes"]["date"]))
    item += write_block("guid", str(post["attributes"]["abbrlink"]))
    item += write_block("description", cdata_block(str(post["attributes"]["abbrlink"])))
    item += write_block("content:encoded", cdata_block(markdown.markdown(post["body"])))
    item += "</item>\n"

    return item


def channel_header():
    header = ""
    header += write_block("title", RSS_TITLE)
    header += write_block("link", RSS_LINK)
    header += write_block("description", RSS_DESC)
    header += write_block("language", RSS_DESC)
    header += write_block("lastBuildDate", RSS_LASTBUILDDATE)

    return header


for filename in os.listdir(CONTENT_DIR):
    if filename.endswith(".md"):
        post = Frontmatter.read_file(CONTENT_DIR + filename)
        if post["attributes"]["abbrlink"] not in INVALID_ABBRLINK:
            posts += write_item(post)

## Write Headers
print(XML_HEADER + "\n" + RSS_HEADER)
print("<channel>")
print(channel_header())
print(posts)
print("</channel>")
print("</rss>")
