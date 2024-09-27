# Personal Website

https://www.kefan.me/

[![](https://badgen.net/uptime-robot/status/m787427706-0eab16df7d2eef051f934714)](https://stats.uptimerobot.com/n66xyTGv63)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/2b8bdddeeaca49e7ba41fcca6619ed57)](https://app.codacy.com/gh/k27dong/mywebsite?utm_source=github.com&utm_medium=referral&utm_content=k27dong/mywebsite&utm_campaign=Badge_Grade_Settings)
[![](https://badgen.net/uptime-robot/response/m787426865-a3bc76f98a7232571f84627c)](https://stats.uptimerobot.com/n66xyTGv63)
[![](https://badgen.net/github/license/k27dong/mywebsite)](https://github.com/k27dong/mywebsite/blob/master/LICENSE)
[![](https://badgen.net/badge/icon/rss?icon=rss&label)](http://kefan.me/rss.xml)

### Technology Stack
```diff
React
Actix
Heroku
- Flask
- Docker
- Nginx
- Google Cloud Platform
- Kubernetes
- uWSGI
- Gunicorn
```

Update 20201009: Migrated from GCP to Heroku due to operating costs.

Update 20240125: Migrated from Flask to Actix Web.

### Local Development

```bash
pnpm install && pnpm build
cargo build --release

./target/release/mywebsite
```