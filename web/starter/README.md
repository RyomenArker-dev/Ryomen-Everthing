# Web starter

A one-page, responsive, accessible landing page: `index.html` + `styles.css`. No frameworks
or build step, so it can be hosted free on most static hosts later.

## Animations (Motion, formerly Framer Motion)
`animations.js` adds gentle fade-up entrances using Motion's plain-JS build, which is stored in
`vendor/` (v14.13.0, MIT, licence in `vendor/motion-LICENSE.md`). The file is local, so the page
still makes no external requests.
- The page works without JavaScript: content is only hidden once the script has loaded.
- Visitors with "reduce motion" switched on see no animation.
- To turn animations off, delete the two `<script>` tags at the end of `index.html`.
- API docs: https://motion.dev/docs (`animate`, `inView`, `scroll`, `stagger`).
- For a React project, use the npm package instead: `npm i motion`, then
  `import { motion } from "motion/react"`.

## Use for a client
```bash
mkdir -p clients/<slug>/website/site
cp -r web/starter/. clients/<slug>/website/site/
```
Then:
1. Change the colour/font tokens in `:root` in `styles.css`. Check the contrast ratios.
2. Replace every `TODO` with approved copy, and delete any section you don't need.
3. Add more pages by copying `index.html`. Each page needs its own `<title>` and meta description.
4. Verify at 360/768/1280px (see the `ryomen-web-development` skill).

## Built in
Skip link, landmarks, one `h1`, labelled form fields, visible focus, 44px touch targets,
`prefers-reduced-motion` (CSS and animations), fluid type and wrapping navigation (no horizontal scroll), and no trackers or external requests.

## Deliberately not included
- **A connected contact form.** The submit button is disabled until the owner picks and approves a form handler.
- **Analytics or cookies.** These need owner approval and a privacy notice.
- **Testimonials.** Add real ones only, with written permission.
