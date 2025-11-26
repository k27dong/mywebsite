---
title: Install Clang-Format Without Root Privileges
displaytitle: Install Clang-Format\nWithout Root Privileges
abbrlink: 36417
date: 2022-04-08 01:45:26
---

## Prologue

While writing code, it is important to maintain file readability by following the correct coding practices, such as naming conventions, tab sizes, bracket placement, etc. Yet everyone has their own habit, I perfer my code to be indented by two spaces, but many people, including most of my professors, use four spaces or a tab (`\t`). There's no right answers to this problem - the code would always look the same to the compilers, but it is necessary for us to follow a man-made standard for the sake of consistency.

## Motivation

It is easy to keep track with the standard for short files, but for large projects it is usually tedious to check every line of code and see if each character is placed correctly. To make formatting easier, some developers came up with formatters, which are more often just cli tools or editor extensions, they check code styles and fix them automatically without breaking the original code. Some of the more famous ones include [Prettier](https://prettier.io/), which covers most of the frontend languages, [Rubocop](https://rubocop.org/), which is used specifically for Ruby, or [black](https://black.readthedocs.io/en/stable/), which is designed for Python (it's suprising that they even need a formatter).

For older languages like C, we don't have many options, the most well-supported tool for now is `clang-format`. It's fast, customizable, and can be ran in a terminal. To install it we could simply do `sudo apt install clang-format`:

```
$ clang-format --version
clang-format version 14.0.0
```

But what if we don't have root privileges?

## Solution

It's quite tricky, and there's multiple approach to this problem, but seems like the easiest way is to download `clang` along with `llvm` and use `clang-format` as one of its submodules.

First we go to `llvm`'s [release page](https://github.com/llvm/llvm-project/releases) and download the latest `clang-llvm` zip that suits our enviornment, which for me at the moment is `clang+llvm-14.0.0-x86_64-linux-gnu-ubuntu-18.04.tar.xz`, then we'll download it with

```
wget https://github.com/llvm/llvm-project/releases/download/llvmorg-14.0.0/clang+llvm-14.0.0-x86_64-linux-gnu-ubuntu-18.04.tar.xz

tar -xvf clang+llvm-14.0.0-x86_64-linux-gnu-ubuntu-18.04.tar.xz
```

It's quite large so downloading and unpacking it might take a while, but luckily that's the only step needed. We can use `clang-format` now with:

```
./clang+llvm-14.0.0-x86_64-linux-gnu-ubuntu-18.04/bin/clang-format -h
```

We can also fix the path by using `alias`, like

```
alias cf="./clang+llvm-14.0.0-x86_64-linux-gnu-ubuntu-18.04/bin/clang-format"
```

And that's it.

## More on Clang-Format

In order to format files using `clang-format`, we'll need a `.clang-foramt` configuration file in the project directory. It contains the rules which will be applied to our code. We can generate it by `cf -style=llvm -dump-config > .clang-format` (notice I set cf as an alias to clang-format). As we can see here I used `-style=llvm` as the default styles, it could also be replaced by `google`, `chromium`, `mozilla`, `webkit`, or `microsoft`. We could now customize our style guide by editing the `.clang-format` file, which now might look something like this:

```
---
Language:        Cpp
# BasedOnStyle:  LLVM
AccessModifierOffset: -4 # -2
AlignAfterOpenBracket: Align
AlignConsecutiveAssignments: false
AlignConsecutiveDeclarations: false
AlignEscapedNewlines: Right
AlignOperands:   true
AlignTrailingComments: true
...
```

And we could use it as `cf -style=file -i test_file.c`. Obviously we could also apply some default format over the entire project as `cf -i -style=WebKit *.cpp *.h`

To visualize the formatting rules used, [this website](https://zed0.co.uk/clang-format-configurator/) generates the configuration file, which saves us from going through the [official documentation](https://clang.llvm.org/docs/ClangFormatStyleOptions.html).

Thanks for reading.
