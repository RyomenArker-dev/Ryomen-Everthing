# Web starter

A one-page, responsive, accessible landing page: `index.html` + `styles.css`. No JavaScript,
frameworks or build step, so it can be hosted free on most static hosts later.

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
`prefers-reduced-motion`, fluid type and wrapping navigation (no horizontal scroll), and no trackers or external requests.

## Deliberately not included
- **A connected contact form.** The submit button is disabled until the owner picks and approves a form handler.
- **Analytics or cookies.** These need owner approval and a privacy notice.
- **Testimonials.** Add real ones only, with written permission.
