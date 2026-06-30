# Interview Prep

Daily interview practice app with spaced repetition. Built with Nuxt 4, Nuxt UI, and Nuxt Content.

## Setup

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Commands

- `pnpm dev` — start dev server
- `pnpm build` — production build
- `pnpm preview` — preview production build
- `pnpm typecheck` — TypeScript check

## Questions

Questions live as Markdown files in `content/questions/`. Add one file per question with frontmatter (`title`, `category`, `subcategory`, `difficulty`, optional `hint`) and the ideal answer in the body.

Progress and spaced repetition state are stored in `localStorage` in the browser.

See [spec.md](./spec.md) and [todo.md](./todo.md) for product details.
