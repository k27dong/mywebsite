---
title: Miller-Rabin素性测试和大素数生成
displaytitle: Miller-Rabin素性测试
abbrlink: 52536
date: 2019-02-19 18:55:44
---

## 写在前面

RSA算法基于一个简明的数论事实：将两个大素数相乘十分容易，然而将他们的乘积分解却十分困难。其背后的原因在于素数分布的不可确定性。现在，唯一可靠的寻找素数的方法也只是用超级计算机计算梅森素数：\\(M_n=2^n-1\\)。比如\\(M_3=7\\)，\\(M_5=31\\)都是素数，但是这种方法并不能保证算出来的数一定是素数，只是比纯一个一个试准确了一点，计算起来简单一点而已。比如\\(M\_{11}=2047\\)就不是素数。想要一次彻底解决这个问题，突破口在于黎曼\\(\zeta\\)函数。

<div class="text-2xl">
$$
\zeta(s) = \sum_{n=1}^{\infty} \frac{1}{n^s}
$$
</div>


按黎曼猜想所言，如果我们知道了黎曼\\(\zeta\\)函数的所有非平凡零点的精确位置，那么就有了计算素数计数函数的精确公式。即使无法预测精确位置，只是知道一些大致方向，或许也可以从此推断出素数分布的一些特性。然而自猜想提出已经过了160年，数学家依然在这个问题上束手无策。最近不断有传闻说某个教授又证明了黎曼猜想，但至今也没有一个明确的消息。

关于\\(\zeta\\)函数部分要展开过于漫长，我们先从一个更简单的问题开始讨论：给一个大整数\\(N\\)，如何判断其是否为素数？

在过去，这种问题远非人力可及，但如今的计算机提供了出路，简单到初学者也能写出来：写一个for loop，循环所有从2开始到`floor(sqrt(N))`的整数，如果任何一次循环的商也是整数，则N为合数，否则为质数，是为试除法。然而这种方法对小一点的数还有效，但是对于一个几百位的大数，就算电脑也很吃力。比如:

```
988744896957139511520127222779223595523279520709504309813645616473313737734468205080925749588688951322700157850487148987
=
751012796879096162041722690156315409567882051387805294268467
*
1316548667434112042529905157815899324199482096579536195817561
```

两个质因子都有60多位。一般的计算机对此已经无能为力，然而一般RSA1024的公钥都是上百位，后面还有更强大的RSA2048。可以说，在可视的很长一段时间内，RSA是无解的。

虽然这种方法行不通，数学家的想象力却是很丰富的，Miller-Rabin测试就是一个可以快速判定大数素性的方法。但在正式开始之前，首先要写明几条引理。

## 引理

### 二次探测定理

\\(p\\)为素数，有：

$$
\begin{matrix}
x^2 \equiv 1 \pmod{p} \\\\\\
(x+1)(x-1) \equiv 0 \pmod{p} \\\\\\
x \equiv \pm 1 \pmod{p}
\end{matrix}
$$

### 费马小定理

\\(a\\)为整数，\\(p\\)为素数，有：

$$
\begin{matrix}
a^p \equiv a \pmod{p} \\\\\\
a^{p-1} \equiv 1 \pmod{p}
\end{matrix}
$$


注：费马小定理是判断一个数是否为素数的必要条件，但不是充分条件。有一些“伪素数”也可以达成这个条件。比如：

$$
\begin{matrix}
2^{341-1} \equiv 1 \pmod{341} \\\\\\
341 = 11 \times 31
\end{matrix}
$$


### Fermat素性测试

因为有上述情况的出现，人们引进了“伪素数”这个概念。称满足\\(a^{n-1} \equiv 1 \pmod{n}
\\)的和数\\(n\\)为“一个以\\(a\\)为底的伪素数”。出于同样的原因，可以看出费马小定理在有些时候并不完全适用。但我们却可以通过多次测试来提高准确度。比如上图中，341通过了\\(a=2\\)的测试，但如果再次测试\\(a=3\\)，我们就可以看出它是一个合数。在前十亿个自然数中，只有1272个伪素数可以同时通过\\(a\\)为2和3的测试。这个几率是\\(0.001 \unicode{x2030}\\)，已经非常小了。可以看出，用来测试的\\(a\\)越多，算法就会越准确。通常来说的做法是，随机选择数个\\(a\\)进行若干测试，如果每次都通过了测试，可判定这个数为素数。

然而漏网之鱼还是存在的。在某些情况下，即使选择了所有小于\\(n\\)并与其互素的底数\\(a\\)，这个数依旧可以通过所有的测试。[Robert Carmichael](https://en.wikipedia.org/wiki/Robert_Daniel_Carmichael)
是第一个发现这种数的人，于是这种极端的伪素数也就被称为Carmichael数。违反直觉的是，这种数字并不是特别稀有，在上述的1200多个数里，有600多个都是Carmichael数。最小的一个仅为561。这种缺陷的存在，说明这种判断的严谨性尚有不足，需要一个更加完善的算法。

## Miller-Rabin素性测试

苏联数学家Artjuhov在1966年首次提出了这个想法，然而不知道因为什么原因，并没有掀起什么波浪（wiki上也只有短短一句话说明）。直到十年后的1976年，Gary Miller才在他的PHD 论文<a class="no-underline" href="#bib2" id="bib2ref"><sup>[1]</sup></a>中独立地重新发现了这个理论。这个算法的正确性基于广义黎曼猜想，而这个猜想至今并未被证明（虽然极可能是正确的）。后来经过拉宾（Rabin）的改造<a class="no-underline" href="#bib3" id="bib3ref"><sup>[2]</sup></a>，变成了一个依赖于二次探测定理的非确定性算法。

### 阐述

判断\\(N\\)是否是为素数：

- 确定\\(N\\)是一个大于2的奇数
- 将\\(N-1\\)化为\\(2^s d\\)的形式（\\(N-1\\)为偶数，\\(d\\)为奇数）
- 随机选取整数\\(a\in(0,N)\\)
- 对所有整数\\(r \in [0, s-1]\\)进行运算：
  - 判断 \\(a^d \neq 1 \pmod{N}\\)
  - 判断 \\(a^{2^r d} \neq -1 \pmod{N}\\)
- 若上述两个条件均符合，则称\\(N\\)通过Miller-Rabin测试。

- 如果\\(N\\)不通过测试，则\\(N\\)一定为合数
- 如果\\(N\\)通过测试，则\\(N\\)有\\(\frac{3}{4}\\)的几率为素数（误差率\\(\le\frac{1}{4}\\)）

在这个过程中只取了一次随机数\\(a\\)。类似于Fermat测试，通过重复取\\(k\\)次不同的随机值，准确率可以上升到\\(1-(\frac{1}{4})^k\\)。然而这也只是一个很保守的估计，实际效果要好得多。

### C中的实现

```c
// Function declarations
int mod_exp(int base, int exp, int mod);
bool miller_rabin_test(int n, int k);
bool is_composite_witness(int base, int d, int n, int s);

/**
 * Efficient modular exponentiation: (base^exp) % mod
 * Uses exponentiation by squaring to avoid overflow
 *
 * @return (base^exp) % mod.
 */
int mod_exp(int base, int exp, int mod) {
    int result = 1;
    base = base % mod;

    while (exp > 0) {
        if (exp % 2 == 1) {
            result = (result * base) % mod;
        }

        exp >>= 1;
        base = (base * base) % mod;
    }

    return result;
}

/**
 * Performs the test on N for a total of k times
 * In each round, a random base between 1 and n-1 is chosen and tested
 * to see if it proves n is composite.
 *
 * @return true if n is likely prime, false if it is definitely composite.
 */
bool miller_rabin_test(int n, int k) {
    if (n <= 2 || n % 2 == 0) {
        return false;
    }

    // Decompose (n-1) into (2^s) * d
    int s = 1, d;
    int m = (n - 1) / 2;

    while (m % 2 == 0) {
        s++;
        m >>= 1;
    }
    d = m;

    for (int i = 0; i < k; i++) {
        int base = 1 + (rand() % (n - 1));
        if (is_composite_witness(base, d, n, s)) {
            return false;
        }
    }

    return true;
}

/**
 * Checks if base is a witness that proves n is composite.
 *
 * If 'base' raises evidence that 'n' fails to behave like a prime
 * number during modular exponentiation, 'base' is a witness that 'n'
 * is composite.
 *
 * @return true if 'base' is a witness that 'n' is composite, false otherwise.
 */
bool is_composite_witness(int base, int d, int n, int s) {
    if (mod_exp(base, d, n) == 1) {
        return false;
    }

    for (int j = 0; j < s; j++) {
        if (mod_exp(base, (1 << j) * d, n) == n - 1) {
            return false;
        }
    }

    return true;
}

```

这里有一个问题。在这个算法中要进行大量的指数运算，而C++自带的变量明显无法容纳这么大的数字，所以虽然程序逻辑是对的，但是如果真正跑起来，能检测的\\(N\\)并不会很大。可话虽如此，在真正的应用中，让电脑做乘法明显比一个数一个数试下来快的多。如果想进一步拓展这个程序的scope，可以用一些自定义的变量，在这里不再做进一步说明。

### 大素数的生成

有了上面这个方法，检测素数变得方便了很多。现在我们可以进一步说明如何生成一个大素数了。浅而易见的一个方法就是随机搜索。即随机产生一个大数，然后判断这个数的素性。但是这样明显很没有效率，有了这种工具之后，如何利用也是关键。一个效率较高的生成\\(n\\)位素数的过程如下（假设\\(n\gt5\\)）：

- 产生一个 n 位数的数\\(p\\)
- 确保最高位不为\\(0\\)
- 确保最低位只能为\\(1\\)，\\(3\\)，\\(7\\)，\\(9\\)
- 对\\(p\\)测试能否被 10000 以下的素数整除（共 1228 个）
- 对\\(p\\)进行数次 Miller-Rabin 测试 （5 次测试的误差率已小于千分之一）
- 如果都通过，则可以认为\\(p\\)是素数

### 随机数的问题

几乎上面所有的计算都涉及到了随机数，然而对于电脑来说，由于他的状态空间是恒定的，纯软件角度上的随机是不可能的。所有的软件归根结底都只是电路上的1和0，它没有“随便”的概念，只有非黑即白的“是”和“否”。因此随机产生的数，都不是真正意义上的随机数，而是通过某些算法算出来的“伪随机数”（比如无理数）。而真正意义上的随机，与其说是数学问题，不如说更像是哲学问题。对于电脑本身来说，最“随机”的随机数是通过处理器上的一块特殊的硬件产生的，这片芯片会用电路中硅元素所产生的热力学噪声来产生随机数。如果有更苛刻一些的要求，或许只有量子力学才能给出答案了。但对于制造计算机的工程师来说，只要生成的伪随机数可以解决实际问题，就没有必要陷入有关自由意志之类的无穷讨论中去。

可RSA公司就是在这个伪随机数上面栽了跟头。这里提到的RSA公司，并不是RSA算法本身，而是一个基于此算法而成立的加密公司。2007年，微软的两名工程师发现，RSA公司所用的加密算法[Dual EC DRBG](https://en.wikipedia.org/wiki/Dual_EC_DRBG)里面包含了一个来源未知的常数Q<a href="#bib4" id="bib4ref" class="no-underline"><sup>[3]</sup></a>，没有人知道这个数字是如何生成的，公司制定的标准中也没有提及选择这个数的原因。而在这篇文章中，他们提到如果这个常数是经过特殊设计的话，只要知道了随机数列生成的前32个字节，便可以预知未来所有相同条件下产生的随机数。可因为并不知道设计者对此是否知情，也不知道常数Q的具体运作方式，他们无法肯定这是不是设计者故意留下来的漏洞，只是说是逻辑上存在的一个可能的缺陷，即使这个算法已经被NIST（美国国家标准技术管理委员会）立为了国家标准。

<img class="mx-auto" src="/images/52536/dual_e.png" alt="dual_e" title="Dual Elliptic Curve" width=25% height=25%/>

后来到了2013年的9月，斯诺登躲在香港酒店里泄露了大量的国家备忘录。人们才发现NSA（美国国家安全局）早就通过贿赂收买了RSA公司，并且故意把`Dual_EC_DRBG`这个运行速度缓慢，自带缺陷的算法写入了标准。再后来，RSA公司推出的安全软件BSafe也沿用了这个算法（虽然他们本身不一定知道算法本身有缺陷）。然而这个问题和斯诺登爆出的其他猛料相比实在不算太大的新闻，棱镜计划的丑闻程度比这个严重多了。关于`Dual_EC_DRBG`更具体的细节，在Aris Adamantiadis的[这篇博文](https://blog.0xbadc0de.be/archives/155)里有更详细的介绍。

## 总结

RSA所基于的大素数生成有两个很关键的条件：素数测试和随机数。前者保证整个算法的正确行和效率，后者保证数字是不可预测，难以攻破的。然而随着AKS素性测试的出现，Miller-Rabin测试已经渐渐淡出主流。AKS这个名字来自它的三个发现者名字的首字母：Agrawal–Kayal–Saxena，和RSA (Rivest–Shamir–Adleman)如出一辙，进一步了解请移步他们的论文<a class="no-underline" href="#bib4" id="bib4ref"><sup>[4]</sup></a>。

## 参考文献

<a id="bib2" href="#bib2ref"><sup>[1]</sup></a>: Miller, Gary L. (1976), "Riemann's Hypothesis and Tests for Primality", Journal of Computer and System Sciences, 13 (3): 300–317, doi:10.1145/800116.803773

<a id="bib3" href="#bib3ref"><sup>[2]</sup></a>: Rabin, Michael O. (1980), "Probabilistic algorithm for testing primality", Journal of Number Theory, 12 (1): 128–138, doi:10.1016/0022-314X(80)90084-0

<a id="bib4" href="#bib4ref"><sup>[3]</sup></a> Dan Shumow, Niels Ferguson. (2007), "On the Possibility of a Back Door in the NIST SP800-90 Dual Ec Prng". http://rump2007.cr.yp.to/15-shumow.pdf

<a id="bib5" href="#bib5ref"><sup>[4]</sup></a> Agrawal, Manindra; Kayal, Neeraj; Saxena, Nitin (2004). "PRIMES is in P". Annals of Mathematics. 160 (2): 781–793. doi:10.4007/annals.2004.160.781. JSTOR 3597229
