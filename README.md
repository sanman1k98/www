## 🚀 Project Structure

```
/
├── public/
│   └── favicon.svg
├── src/
│   ├── content/
│   │   ├── cv/ -> https://github.com/sanman1k98/cv.git
│   │   ├── info/
│   │   └── config.ts
│   ├── components/
│   │   └── ...
│   ├── layouts/
│   │   └── Layout.astro
│   └── pages/
│       ├── about.astro
│       ├── index.astro
│       └── work.astro
└── package.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

Any static assets, like images, can be placed in the `public/` directory.

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
