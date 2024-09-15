---
title: is_Odd();
displaytitle: is_odd
abbrlink: 60052
date: 2019-05-28 20:35:15
---

As I was doing one of the problems on Leetcode a few days ago, I was about to write a function that decides an integer’s parity (weather it's odd or even). It should be an easy problem, anyone with few minutes of coding experiences would be able to write it out easily. Unexpectedly, it took me much more trails than I thought I needed before I got it correct. When I passed the whole problem, I thought over this interesting part and decided to write it down.

(Note: All code written in Java)

A beginner would write something like this:

```java
public boolean is_odd(int x) {
    if (x % 2 == 1) {
        return true;
    }
    else {
        return false;
    }
}
```

It is simple and pretty easy to understand, but not clean enough. Since the returning value is boolean, and the control statement only takes one line, the function should be simplified as:

```java
public boolean is_odd(int x) {
    return (x % 2 == 1);
}
```

In fact, this is what I originally had. Soon I realized there are also negative numbers, thus the function becomes:

```java
public boolean is_odd(int x) {
    return (x % 2 != 0);
}
```

This function satisfies my need, but as I was reviewing my note on linear circuit, the usage of AND gate inspired me and I realized I can also do the same thing with:

```java
public boolean is_odd(int x) {
    return (x & 1) == 1;
}
```

Since any even number can be written in the form of (2n), when it is transformed into binary, the last digit must be 0 (because 2^0 = 1), on the other hand, if it is an odd number, then this last digit must be 1. When '&' is applied, the only situation where the answer would be 1, is when both operand ends with digit 1, and it would mean the input value is an odd number.

Another method involving bit-wise operator is:

```java
public boolean is_Odd(int x) {
    return i >> 1 << 1 != i;
}
```

Similarly as above, when a number is shifted to the right once and shifted to the left once. It forces the last digit to be zero. If it is still the same number, then the original number does not contains 2^0, which would make it even.

In both cases, the trick is to find if the last digit of the binary number is 1. One used AND gate and one used shifting.

nice.
