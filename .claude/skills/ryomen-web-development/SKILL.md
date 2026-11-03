---
name: ryomen-web-development
description: Ryomen website workflow — build responsive, accessible static sites and landing pages from web/starter into clients/<slug>/website/site, apply brand tokens, verify in headless Chromium at phone/tablet/desktop widths, and prepare (never perform) deployment. Use for website builds, landing pages, layout fixes and site QA.
---

# Ryomen — Web Development

Follow `sops/website-project.md`.

## Steps
1. Inputs: `templates/website-brief.md` filled in `clients/<slug>/website/website-brief.md`;
   copy from `clients/<slug>/website/copy/`; tokens from `clients/<slug>/brand/` if present.
2. Scaffold: `mkdir -p clients/<slug>/website/site && cp -r web/starter/. clients/<slug>/website/site/`
   (ask first if the target folder already has files).
3. Apply brand: edit the `:root` custom properties in `styles.css`. Replace all placeholder copy.
   Remove sections not needed rather than leaving lorem/TODOs.
4. Build pages with semantic HTML. Keep JS minimal and optional (site works without JS).
5. Forms: keep `action` empty/disabled until the owner chooses a form service. Note it as a TODO.
6. Verify (see below). Fix issues. Run `ryomen-quality-check`.
7. Deployment: write `clients/<slug>/website/deploy-checklist.md` (host options, domain, DNS,
   HTTPS, form handler, analytics consent) and use `ryomen-approval-gate`. **Never deploy.**

## Verify with headless Chromium
```bash
node -e '
const {chromium}=require("playwright");
(async()=>{const b=await chromium.launch();
for (const w of [360,768,1280]){const p=await b.newPage({viewport:{width:w,height:900}});
const errs=[];p.on("console",m=>{if(m.type()==="error")errs.push(m.text())});
await p.goto("file://"+process.argv[1]);
const sw=await p.evaluate(()=>document.documentElement.scrollWidth);
await p.screenshot({path:`/tmp/shot-${w}.png`,fullPage:true});
console.log(w,"scrollWidth",sw,sw>w?"OVERFLOW":"ok","errors",errs.length);}
await b.close();})();' "$PWD/clients/<slug>/website/site/index.html"
```
(Playwright is preinstalled in Claude Code cloud sessions; if `require` fails, say so — don't
install anything without approval.)

## Checklist
Mobile-first · one `h1` · alt text · labelled inputs · visible focus · contrast ≥ 4.5:1 ·
`<title>` + meta description + OG tags · `lang` attribute · no external trackers · images sized
and lazy-loaded · `prefers-reduced-motion` respected.

## Deeper skills
`ui-ux-pro-max`, `ui-styling`, `design-system`, `schema`, `cro`, `seo-audit`.
