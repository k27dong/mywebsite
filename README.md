# Personal Website

This is my personal website, please hire me.

[![](https://badgen.net/uptime-robot/status/m780862024-50db2c44c703e5c68d6b1ebb)](https://stats.uptimerobot.com/n66xyTGv63)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/2b8bdddeeaca49e7ba41fcca6619ed57)](https://app.codacy.com/gh/k27dong/mywebsite?utm_source=github.com&utm_medium=referral&utm_content=k27dong/mywebsite&utm_campaign=Badge_Grade_Settings)
[![](https://badgen.net/uptime-robot/response/m787426865-a3bc76f98a7232571f84627c)](https://stats.uptimerobot.com/n66xyTGv63)
[![](https://badgen.net/github/license/k27dong/mywebsite)](https://github.com/k27dong/mywebsite/blob/master/LICENSE)
[![](https://badgen.net/badge/icon/rss?icon=rss&label)](http://kefan.me/rss.xml)

### Technology Stack
```diff
React
+ Actix Web
+ Heroku
Docker
- Flask
- Nginx
- uWSGI
- Google Cloud Platform
- Kubernetes
- Gunicorn
```

Update 20201009: Website had been migrated from GCP to heroku due to operating costs.

Update 20240125: Migration from Flask to Actix Web.

### Local Development

```bash
# Build Frontend
$ npm i && npm run build

# Build Backend
$ cargo build --release

# Run
$ ./target/release/mywebsite
```

Alternatively:

```bash
$ docker-compose up
```
