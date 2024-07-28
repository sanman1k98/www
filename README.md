# [`nicesandeep.com`](https://nicesandeep.com)

## ✨ Tech

- [Bun](https://bun.sh): Package manager and runtime
- [Astro](https://astro.build): JavaScript web framework
- [UnoCSS](https://unocss.dev): CSS utility framework
- [Content Collections](https://docs.astro.build/en/guides/content-collections/): Manages Markdown and image content
  - Used to create resume and photo pages
- [Satori](https://github.com/vercel/satori): Converts HTML and CSS to SVG
  - Used to create favicon images

## 💻 Developing

```sh
git clone --recurse-submodules https://github.com/sanman1k98/www.git
```

> [!NOTE]
> This project uses a private git submodule for the "cv" content collection which is used to generate the `/resume` page.

## 🗄 Project Structure

```
/
├── .github/                    # Workflows that deploy the site
│   └── ...
├── scripts/                    # CI/CD related
│   └── ...
├── public/
│   └── ...
├── src/                        # Has a `tsconfig.json` path alias "@/*"
│   ├── components/
│   │   └── ...
│   ├── content/
│   │   ├── cv/                 # -> https://github.com/sanman1k98/cv.git
│   │   ├── info/               # Site links and socials
│   │   ├── photos/             # Contains an `index.yaml` and image files
│   │   └── config.ts           # Defines collections using "src/schemas"
│   ├── layouts/
│   │   ├── BaseLayout.astro    # HTML and slot for `<body>`
│   │   └── MainLayout.astro    # Components and slot for `<main>`
│   ├── pages/
│   │   ├── photos/
│   │   ├── icons/[file].astro  # Static file endpoint to generate favicons
│   │   ├── resume.astro        # Uses "cv" collection entries
│   │   ├── index.astro         # Landing page
│   │   └── ...
│   ├── schemas/                # Zod schemas for Astro Content Collections
│   │   ├── cv.ts               # Exports multiple schemas for different types of CV entries
│   │   ├── info.ts             # Site links and socials
│   │   ├── photos.ts           # Parses, transforms, and validates EXIF metadata for each photo
│   │   └── ...
│   ├── utils/
│   │   └── ...
│   └── content.ts              # Content Collection Entries and types
├── package.json
└── ...
```

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                | Action                                           |
| :--------------------- | :----------------------------------------------- |
| `bun install`          | Installs dependencies                            |
| `bun run dev`          | Starts local dev server at `localhost:4321`      |
| `bun run check`        | Check project for type errors                    |
| `bun run build`        | Build your production site to `./dist/`          |
| `bun run preview`      | Preview your build locally, before deploying     |
| `bun run deploy`       | Build and push to trigger deployment workflow    |
| `bun run astro ...`    | Run CLI commands like `astro add`, `astro check` |
| `bun run astro --help` | Get help using the Astro CLI                     |

## 🚀 Deploying

The site is hosted on GitHub Pages using static files in the [`deploy` branch](https://github.com/sanman1k98/www/tree/deploy). Deployments are triggered when the repository owner (me) pushes to the `deploy` branch.

<details>
  <summary>
    <em>"Why deploy from a branch?"</em>
  </summary>
  <ul>
    <li>All deployments can be accessed simply via <code>git</code>: for example, <code>git log deploy</code></li>
    <li>GitHub Pages Classic used to to work in a similar way: it would deploy your site using files from a branch named <code>gh_pages</code></li>
    <li>Because why not 🤷🏽‍♂</li>️
  </ul>
</details>

## 📜 License

Source code is licensed under [MIT](https://github.com/sanman1k98/www/blob/main/LICENSE).
