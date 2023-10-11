import os
import re
import sys

# List of filenames to exclude
exclude_files = [
    "海子诗全集.md",
]

# Complete list of punctuations
punctuations = r"[.!?。！？”…：；]$"
# Pattern for checking tags like [7]
tag_pattern = r"\[\d+\]"


def check_quotes(directory, single_file=None):
    if single_file:
        process_file(directory, single_file)
    else:
        for root, dirs, files in os.walk(directory):
            for file in files:
                if file.endswith(".md") and file not in exclude_files:
                    process_file(root, file)


def process_file(root, file):
    missing_quotes = []
    error_char_quotes = []
    tag_quotes = []
    with open(os.path.join(root, file), "r", encoding="utf-8") as f:
        lines = f.readlines()
        for line in lines:
            line = line.strip()
            if line.startswith(">>"):
                # Check for missing punctuation
                if not re.search(punctuations, line):
                    missing_quotes.append(line)
                # Check for error characters
                if "￼" in line:
                    error_char_quotes.append(line)
                # Check for tags
                if re.search(tag_pattern, line):
                    tag_quotes.append(line)

    # Print the collected quotes and issues for the current file
    if missing_quotes or error_char_quotes or tag_quotes:
        print(f"In {file}:\n")
        if missing_quotes:
            print("Quotes missing punctuation:\n")
            for quote in missing_quotes:
                print(quote + "\n")
        if error_char_quotes:
            print("Quotes with error characters:\n")
            for quote in error_char_quotes:
                print(quote + "\n")
        if tag_quotes:
            print("Quotes with tags:\n")
            for quote in tag_quotes:
                print(quote + "\n")
        print("---------\n")


directory = "docs/salt/"

# Check for command line arguments
if len(sys.argv) > 1:
    filename = sys.argv[1]
    check_quotes(directory, filename)
else:
    check_quotes(directory)
