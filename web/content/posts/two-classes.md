---
title: Two Classes
abbrlink: 66942
date: 2024-06-28 11:52:53
---

> Big Macs, fat folks, ecstasy capsules
>
> Presidential scandals, everybody move

### Class 1
```js
class StateMachine {
  constructor(states, initial) {
    this.states = states
    this.table = new Map() // look up table: <val, State>

    for (let s of states) {
      this.table.set(s.val, s)
    }

    this.initial = initial
  }

  traverse(path) {
    let curr = new Set([this.initial.val])

    for (let step of path) {
      let next_set = new Set()

      for (let start of curr) {
        let start_state = this.table.get(start)
        next_set = next_set.union(start_state.get_next(step)) // node >= 22.0.0
      }

      curr = next_set
    }

    for (let end_state of curr) {
      let state = this.table.get(end_state)
      console.log(`[State ${state.val}] ${state.is_end ? "end" : ""}`)
    }
  }

  print_machine() {
    for (let s of this.states) {
      s.print_path()
    }
  }
}

class State {
  constructor(val) {
    this.val = val
    this.dest = new Map() // <path, Set<state>>
    this.is_end = true
  }

  add_transition(path, state) {
    if (!this.dest.has(path)) {
      this.dest.set(path, new Set())
    }

    this.dest.get(path).add(state)

    if (state !== this.val) {
      this.is_end = false
    }
  }

  get_next(path) {
    if (!this.dest.has(path)) {
      throw "Error: no such path"
    }

    return this.dest.get(path)
  }

  print_path() {
    for (let [k, v] of this.dest.entries()) {
      for (let dest of v) {
        console.log(`[State ${this.val}] ${k} -> ${dest}`)
      }
    }
  }
}

/************ Testing ************/
/*** Setup ***/
let s1 = new State(1)
let s2 = new State(2)
let s3 = new State(3)
let s4 = new State(4)
let s5 = new State(5)

s1.add_transition("a", 1)
s1.add_transition("b", 1)
s1.add_transition("a", 2)
s1.add_transition("b", 4)

s2.add_transition("a", 3)
s2.add_transition("b", 2)

s3.add_transition("a", 3)
s3.add_transition("b", 3)

s4.add_transition("a", 4)
s4.add_transition("b", 5)

s5.add_transition("a", 5)
s5.add_transition("b", 5)

/*** Calls ***/
let sm = new StateMachine([s1, s2, s3, s4, s5], s1)

sm.print_machine()

console.log("========================")

console.log("traverse1: ")
sm.traverse("babaa")

console.log("traverse2: ")
sm.traverse("aaabaaaa")
```

### Class 2
```js
class Shop {
  constructor() {
    this.revenue = 0
    this.cost = 0
    this.stock = new Map() // <name, Stock>
  }

  add_item(name, count, price, expiry) {
    this.cost += count * price

    if (this.stock.has(name)) {
      this.stock.get(name).add(count, expiry)
    } else {
      this.stock.set(name, new Stock(count, expiry))
    }
  }

  sell_item(name, count, price, expiry) {
    if (!this.stock.has(name)) {
      throw "Error: no such item"
    }

    let res = this.stock.get(name).remove(count, expiry)

    if (res) {
      this.revenue += count * price
    } else {
      console.log("Unable to remove")
    }
  }

  print_shop() {
    for (let [k, v] of this.stock.entries()) {
      console.log(`\t${k}:`)
      v.print_stock()
    }
  }
}

class Stock {
  constructor(count, expiry) {
    this.total_count = 0
    this.expiry = new Map()

    this.add(count, expiry)
  }

  add(count, expiry) {
    this.expiry.set(expiry, (this.expiry.get(expiry) || 0) + count)
    this.total_count += count
  }

  remove(count, expiry) {
    // we remove the first count item that's less than expiry date restriction
    if (this.total_count < count) return false

    let stock = [...this.expiry].sort((a, b) => a[0] - b[0])
    let to_be_removed = []

    for (let i = 0; i < stock.length && count > 0; i++) {
      let soon_expired = stock[i]

      if (soon_expired[0] < expiry) {
        continue
      }

      let sell_count = Math.min(count, soon_expired[1])
      count -= sell_count
      to_be_removed.push([
        soon_expired[0],
        sell_count === soon_expired[1] ? Infinity : sell_count,
      ])
    }

    if (count > 0) {
      return false // no way to sell
    }

    // if can sell, update total_count & expiry map
    for (let [date, removed_count] of to_be_removed) {
      if (removed_count === Infinity) {
        this.total_count -= this.expiry.get(date)
        this.expiry.delete(date)
      } else {
        this.total_count -= removed_count
        this.expiry.set(date, this.expiry.get(date) - removed_count)
      }
    }

    return true
  }

  print_stock() {
    console.log(`total: ${this.total_count}`)
    for (let [date, count] of [...this.expiry].sort((a, b) => a[0] - b[0])) {
      console.log(`Expiring in ${date} day:\t ${count}`)
    }
  }
}

/************ Testing ************/
let shop = new Shop()

shop.add_item("apple", 8, 1, 2)
shop.add_item("apple", 3, 1, 7)
shop.add_item("apple", 5, 1, 10)
shop.add_item("banana", 4, 1, 20)
shop.print_shop()

console.log("=====================")

shop.sell_item("apple", 5, 2, 4)
shop.sell_item("apple", 10, 2, 1)
shop.print_shop()
```
