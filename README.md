# ScrollForge

A cinematic scroll-based experience built with **GSAP ScrollTrigger** and **Lenis** — no frameworks, pure Vanilla JS.

## Features

- Cinematic hero with per-character text animation and loader reveal
- Infinite bidirectional marquee with hover speed control
- Pinned section with sequential panel reveals and progress bar
- Horizontal scroll driven by vertical scroll
- Word-by-word text illumination on scroll
- SVG path draw animation synced to scroll
- Staggered card entrance animations with GSAP hover
- Custom cursor with contextual states (expand, text, link)

## Tech Stack

- **GSAP 3** + ScrollTrigger + ScrollToPlugin
- **Lenis** — smooth scroll
- **Vite 5** — build tool
- Vanilla JS / HTML / CSS — no framework

## Run Locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Live Demo

[arvinebrahimi.dev](https://arvinebrahimi.dev)

## Project Structure

```
src/
├── main.js              # entry point
├── style.css            # design system & section styles
├── sections/            # one module per scroll section
└── utils/               # lenis, cursor
```

## License

MIT
