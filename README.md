# Personal Website

https://www.kefan.me/

<a href="https://vercel.com/" target="_blank" style="text-decoration: none;">
  <img src="https://deploy-badge.vercel.app/vercel/mywebsite-seven-chi?logo=" alt="Vercel Deploy" />
</a>
<a href="https://stats.uptimerobot.com/n66xyTGv63" target="_blank" style="text-decoration: none;">
  <img src="https://img.shields.io/uptimerobot/status/m787427706-0eab16df7d2eef051f934714?up_message=live&down_message=down&style=flat&label=website" alt="Uptime Robot Status" />
</a>
<a href="https://app.codacy.com/gh/k27dong/mywebsite/dashboard" target="_blank" style="text-decoration: none;">
  <img src="https://img.shields.io/codacy/grade/2b8bdddeeaca49e7ba41fcca6619ed57?style=flat&logo=codacy" alt="Codacy Grade" />
</a>
<a href="https://github.com/k27dong/mywebsite/blob/main/LICENSE" target="_blank" style="text-decoration: none;">
  <img src="https://img.shields.io/github/license/k27dong/mywebsite?style=flat" alt="GitHub License" />
</a>
<a href="https://kefan.me/rss.xml" target="_blank" style="text-decoration: none;">
  <img src="https://img.shields.io/badge/rss-blue?style=flat&logo=rss&logoColor=white&labelColor=grey" alt="RSS Feed" />
</a>

## Tech Stack

<table>
  <tr>
    <th align="center">Area</th>
    <th align="center">Technology</th>
  </tr>
  <tr>
    <td align="center"><strong>Frontend</strong></td>
    <td align="center">
      <a href="https://astro.build/" target="_blank">
        <img src="https://img.shields.io/badge/astro-17191e?style=flat&logo=astro&logoColor=ffffff" width="80">
      </a>
    </td>
  </tr>
  <tr>
    <td align="center"><strong>Backend</strong></td>
    <td align="center">
      <a href="https://actix.rs/" target="_blank">
        <img src="https://img.shields.io/badge/actix-65319a?style=flat&logo=actix" width="80">
      </a>
    </td>
  </tr>
  <tr>
    <td align="center"><strong>Deployment</strong></td>
    <td align="center">
      <a href="https://vercel.com/" target="_blank">
        <img src="https://img.shields.io/badge/vercel-white?style=flat&logo=vercel&logoColor=black" width="80">
      </a>
      <br>
      <a href="https://www.shuttle.rs/" target="_blank">
        <img src="https://img.shields.io/badge/shuttle.rs-f1daa4?style=flat&logo=Rocket&logoColor=ea642d" width="80">
      </a>
    </td>
  </tr>
</table>

## Features

- **Static Site Generation (SSG) and Server-Side Rendering (SSR):** The website uses a combination of SSG and SSR for optimized performance. All the expensive HTML rendering is moved to build time, reducing load times by serving static files and the least JavaScript possible.

- **Rust-powered Backend:** The backend is entirely written in Rust, offering a highly structured, fast, and reliable architecture with guaranteed memory safety and the capability to handle complex tasks with minimal overhead.

- **Better Font Loading:** Font size has been minimized using `pyftsubset`. The original font, primarily in [Source Han Serif](https://source.typekit.com/source-han-serif/), was reduced from some 50MB to 4MB, resulting the page to load significantly faster.

- **CI/CD with GitHub Actions:** Continuous Integration and Deployment are streamlined using [GitHub Actions](https://github.com/features/actions), enabling a easy edit-build-test-debug-deploy loop for a smooth development process.

- **Separated Deployment:** The frontend and backend are deployed independently and communicate through precise routing, fully supporting dynamic API interactions for scalability and flexibility.

- **Package Management:** The project uses `pnpm` and `cargo` to manage dependencies effectively, reducing disk space usage and maintaining a clean, organized structure. This setup also improves cross-platform compatibility, ensuring smooth operation across different environments.

- **Responsive Design:** The website offers a fully responsive design that adapts seamlessly to different screen sizes using [Tailwind CSS](https://tailwindcss.com/), making the user experience consistent across devices.

- **Real-time Monitoring:** [Uptime Robot](https://uptimerobot.com/) provides real-time status monitoring to ensure the website remains operational and accessible.

## Local Development

The project can be started in two ways: frontend-only for quick UI development or full stack with the API for complete functionality.

1. Running the Frontend Only
   ```bash
   pnpm install
   pnpm run dev
   ```
2. Running the Full Application (Frontend + API)
   ```bash
   pnpm install
   pnpm build
   cargo build --release
   ./target/release/mywebsite
   ```

## Scripts

I've included a few scripts to help with development and maintenance:

- `check_booknote`: Verifies the formatting of booknotes.
- `fix_booknote`: Automatically corrects any formatting issues in booknotes.
- `gen_blogpost`: Generates a new blog post entry, saved as `new.md`.
- `gen_booknote`: Generates a new booknote entry, saved as `new.md`.
- `sync_content`: Synchronizes the `docs/` folder with the `content/` folder used by the frontend.
- `sync_fontbook`: Extract the unique characters used across the site, reads the original font files from the `assets/` folder, generates optimized font subsets, then update the `public/` folder with the new, smaller font files.

To run any of these scripts, use the following command:

```bash
cargo run --bin <script_name>
```

## License

This project is licensed under the [GPL-3.0](https://github.com/k27dong/mywebsite/blob/master/LICENSE) license.
