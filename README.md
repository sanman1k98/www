# ⚠️ Work in progress ⚠️

## 💻 Developing

```sh
git clone --recurse-submodules https://github.com/sanman1k98/www.git
```

<!-- TODO: suggest using a dummy "cv" collection to build the project for those without access to the private submodule -->
> [!NOTE]
> This project uses a private git submodule for the "cv" content collection which is used to generate the `/resume` page.

## 🗄 Project Structure

```
/
├── .github/            # workflows that deploy the site
│   └── ...
├── scripts/            # CI/CD related
│   └── ...
├── public/
│   ├── fonts/
│   └── ...
├── src/
│   ├── content/
│   │   ├── cv/ -> https://github.com/sanman1k98/cv.git
│   │   ├── info/
│   │   ├── photos/
│   │   └── config.ts     # Defines collections using "src/schemas"
│   ├── components/
│   │   └── ...
│   ├── layouts/
│   │   └── ...
│   ├── pages/
│   │   ├── resume/       # Uses "cv" collection entries
│   │   └── ...
│   ├── schemas/          # Zod schemas
│   │   ├── cv.ts
│   │   ├── env.ts        # Used in "src/utils"
│   │   ├── info.ts
│   │   └── ...
│   ├── utils/
│   │   └── ...
│   └── content.ts        # Collection entries and helpers
├── package.json
└── ...
```

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                | Action                                           |
| :--------------------- | :----------------------------------------------- |
| `bun install`          | Installs dependencies                            |
| `bun run dev`          | Starts local dev server at `localhost:3000`      |
| `bun run build`        | Build your production site to `./dist/`          |
| `bun run preview`      | Preview your build locally, before deploying     |
| `bun run astro ...`    | Run CLI commands like `astro add`, `astro check` |
| `bun run astro --help` | Get help using the Astro CLI                     |

## 🚀 Deploying

The site is hosted on GitHub Pages using static files in the [`deploy` branch](https://github.com/sanman1k98/www/tree/deploy). Deployments are triggered when the repository owner (me) pushes to the `deploy` branch. See the [`.github/workflows`](https://github.com/sanman1k98/www/tree/main/.github/workflows) and [`scripts`](https://github.com/sanman1k98/www/tree/main/scripts) directories for more information.
