# [`nicesandeep.com`](https://nicesandeep.com)

## ✨ Tech

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

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                 | Action                                           |
| :---------------------- | :----------------------------------------------- |
| `pnpm install`          | Installs dependencies                            |
| `pnpm run dev`          | Starts local dev server at `localhost:4321`      |
| `pnpm run check`        | Check project for type errors                    |
| `pnpm run build`        | Build your production site to `./dist/`          |
| `pnpm run preview`      | Preview your build locally, before deploying     |
| `pnpm run deploy`       | Build and push to trigger deployment workflow    |
| `pnpm run astro ...`    | Run CLI commands like `astro add`, `astro check` |
| `pnpm run astro --help` | Get help using the Astro CLI                     |

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
