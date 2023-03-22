---
title: Detecting C++ Memory Leaks using Valgrind on macOS Catalina
abbrlink: 40077
date: 2020-02-16 16:10:04
---

## Prologue

While I was doing my course on data structures and algorithms, I had a hard time trying to detect memory leaks in C++. Handling pointers are annoying especially when you have thousands lines of code and you’re not sure in which line a piece of memory is allocated but never freed before it goes out of scope.

Valgrind is a tool designed to detect memory leaks, unfortunately, it does not run on macOS Catalina. I thought about running it instead on Waterloo’s linux server, then I realized as a student I do not have the root access. Since it seems like there are no better tools other than this, my final workaround is to run this on Azure, which is a nice service provided by Microsoft.

I have provided all codes & bash commands used in the process, if Valgrind is something you need you can just follow this post step by step.

Let’s get started.

## Step 1: Setting up Azure

Since the platform is Mac so first we use `brew` to install `azure-cli`, then creates a vm on our machine.

```shell
$ brew update && brew install azure-cli
$ az login
$ az group create --name myResources --location eastus
$ az vm create --resource-group myResources \
  --name myVM \
  --image UbuntuLTS \
  --ssh-key-values ~/.ssh/id_rsa.pub \
  --output json \
  --verbose
```

Now the result would look like this :

```json
{
  "fqdns": "",
  "id": "...",
  "location": "eastus",
  "macAddress": "...",
  "powerState": "VM running",
  "privateIpAddress": "...",
  "publicIpAddress": PUBLIC_IP_ADDRESS,
  "resourceGroup": "myResources",
  "zones": ""
}
```

This is the VM created for which `publicIpAddress` displays the IP address which is used to connect to the VM. So we connect like this:

```shell
$ ssh PUBLIC_IP_ADDRESS
kevin@myVM:~$
```

## Step 2: Use Valgrind

Now we have successfully connected to the Azure server running Ubuntu from our terminal, the next thing we need to do is to actually use Valgrind. (Note: since many of the fundamental softwares such as `make` or `gcc` are not installed on the server, instead of install each of them manually I simply used `build-essential`, which includes everything we need)

```shell
$ sudo apt-get -y update
$ sudo apt-get install build-essential
$ sudo apt-get install valgrind
$ mkdir valgrindtest
$ cd valgrindtest
$ vi main.cpp
```

Just to simply test Valgrind’s ability, we write something like this:

```cpp
// main.cpp
# include “stdlib.h”

int main(void) {
  int* x = (int *) malloc(100 * sizeof(int));
}
```

This piece of close clearly demonstrates a leak of 100 \* sizeof(int). If we apply Valgrind to check it, we would need to do this:

```shell
$ g++ main.cpp -o main
$ valgrind --tool=memcheck --leak-check=full --show-reachable=yes --log-file=“result” ./main
```

This command runs the `main` executable we just generated and output the result to a file named `result`. If we open this file, we would see this:

```
==114005== Memcheck, a memory error detector
==114005== Copyright (C) 2002-2017, and GNU GPL'd, by Julian Seward et al.
==114005== Using Valgrind-3.13.0 and LibVEX; rerun with -h for copyright info
==114005== Command: ./main
==114005== Parent PID: 110811
==114005==
==114005==
==114005== HEAP SUMMARY:
==114005==     in use at exit: 400 bytes in 1 blocks
==114005==   total heap usage: 1 allocs, 0 frees, 400 bytes allocated
==114005==
==114005== 400 bytes in 1 blocks are definitely lost in loss record 1 of 1
==114005==    at 0x4C2FB0F: malloc (in /usr/lib/valgrind/vgpreload_memcheck-amd64-linux.so)
==114005==    by 0x10865B: main (in /home/kevin/valgrind_test/main)
==114005==
==114005== LEAK SUMMARY:
==114005==    definitely lost: 400 bytes in 1 blocks
==114005==    indirectly lost: 0 bytes in 0 blocks
==114005==      possibly lost: 0 bytes in 0 blocks
==114005==    still reachable: 0 bytes in 0 blocks
==114005==         suppressed: 0 bytes in 0 blocks
==114005==
==114005== For counts of detected and suppressed errors, rerun with: -v
==114005== ERROR SUMMARY: 1 errors from 1 contexts (suppressed: 0 from 0)
```

We know an int has the size of 4 bytes, so a lost of 400 bytes makes sense. Now, if we correctly handles the pointer by freeing it at the end before the program terminates:

```
==114735== Command: ./main
==114735== Parent PID: 110811
==114735==
==114735==
==114735== HEAP SUMMARY:
==114735==     in use at exit: 0 bytes in 0 blocks
==114735==   total heap usage: 1 allocs, 1 frees, 400 bytes allocated
==114735==
==114735== All heap blocks were freed -- no leaks are possible
==114735==
==114735== For counts of detected and suppressed errors, rerun with: -v
==114735== ERROR SUMMARY: 0 errors from 0 contexts (suppressed: 0 from 0)
```

We can see now Valgrind tells us that no leaks are possible, which is what we wanted.

So, next time before I’m handing in my project, I would just throw all my code on this server and runs Valgrind on all test cases to make sure no memory is leaked.

Thanks for reading, I hope this helps.
