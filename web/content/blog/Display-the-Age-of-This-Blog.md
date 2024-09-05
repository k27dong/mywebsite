---
title: Display the Age of This Blog
abbrlink: 63683
date: 2019-02-13 15:54:02
---

A little longer than a week ago I realized I need to have a personal website. After some thoughts I decided to make it a blog so that I can keep track of my work and accomplishment.

And here it is.

Thanks to the <a href="hexo.io">hexo</a> framework, it only took me one afternoon to get the site online, but the whole process of personalization took me few days.

As I am writing this sentence the blog has been running for about five days and I decided to add a counter where I'm able to record its age. The code is here, written in Javascript:

```javascript
var now = new Date()

function calculate_time() {
  var running = new Date("02/08/2019 01:12:00") // starting date
  now.setTime(now.getTime() + 250)

  gap = now - running

  whole_days = Math.floor(gap / 1000 / 60 / 60 / 24)

  whole_hours = Math.floor(gap / 1000 / 60 / 60 - whole_days * 24)

  whole_mins = Math.floor(
    gap / 1000 / 60 - whole_days * 24 * 60 - whole_hours * 60
  )

  whole_sec = Math.round(
    gap / 1000 -
      whole_days * 24 * 60 * 60 -
      whole_hours * 60 * 60 -
      whole_mins * 60
  )

  if (String(whole_hours).length == 1) {
    whole_hours = "0" + whole_hours
  }

  if (String(whole_mins).length == 1) {
    whole_mins = "0" + whole_mins
  }

  if (String(whole_sec).length == 1) {
    whole_sec = "0" + whole_sec
  }

  document.getElementById("time_loading").innerHTML =
    "Running  " + whole_days + " days "
  document.getElementById("times").innerHTML =
    whole_hours + ":" + whole_mins + ":" + whole_sec
}

setInterval("calculate_time()", 250)
```

To display it in the footer, this piece of code is put in `theme/next/layout/_partials/footer.swig`, with some additional code:

```html
<div style="display:inline;">
  <span class="post-meta-divider">|</span>

  <span class="post-meta-item-icon">
    <i class="fa fa-coffee"></i>
  </span>

  <span id="time_loading">Loading...</span>
  <span id="times"></span>

  <script>
    <!-- Code Above -->
  </script>
</div>
```

Now the time is displayed in the footer.
