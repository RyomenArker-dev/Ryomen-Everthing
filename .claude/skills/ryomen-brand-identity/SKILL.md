---
name: ryomen-brand-identity
description: Ryomen brand identity project workflow — brand brief, 2–3 identity directions, accessible colour palettes, open-licence typography, usage rules and brand guidelines saved in clients/<slug>/brand/. Use for logo direction, visual identity, rebrand, style guide, colour or font selection for a client.
---

# Ryomen — Brand Identity

Follow `sops/brand-project.md`. Output folder: `clients/<slug>/brand/`.

## Steps
1. **Brief.** Copy `templates/brand-brief.md` → `clients/<slug>/brand/brand-brief.md` if absent.
   Fill only from the client brief/intake; list gaps as questions for the owner.
2. **Research (optional).** Competitor visual audit — cite URLs, describe, never copy.
3. **Directions.** 2–3 directions in `directions-YYYY-MM-DD.md`, each with:
   - Concept & rationale tied to brief goals
   - Palette: 4–6 colours with HEX, role (primary/accent/neutral/text/bg)
   - Contrast table: text/background pairs with computed ratio (target ≥ 4.5:1 body, ≥ 3:1 large)
   - Typography: heading + body fonts, licence (prefer SIL OFL / Google Fonts), fallback stack
   - Logo direction (written + optional simple SVG sketch), do/don't usage
4. **Owner/client picks a direction** (record in `clients/<slug>/log.md`).
5. **Guidelines.** `brand-guidelines.md`: logo usage, colour tokens, type scale, imagery, voice
   & tone, examples. Optionally export design tokens as CSS custom properties
   (`tokens.css`) for the web developer.
6. Run `ryomen-quality-check`.

## Contrast ratio (compute, don't guess)
```bash
python3 - <<'PY'
def L(h):
    h=h.lstrip('#'); c=[int(h[i:i+2],16)/255 for i in (0,2,4)]
    c=[x/12.92 if x<=0.03928 else ((x+0.055)/1.055)**2.4 for x in c]
    return 0.2126*c[0]+0.7152*c[1]+0.0722*c[2]
def ratio(a,b):
    a,b=sorted((L(a),L(b)),reverse=True); return (a+0.05)/(b+0.05)
print(round(ratio('#1A1A2E','#FFFFFF'),2))
PY
```

## Deeper skills
`brand`, `design-system` (tokens), `ui-ux-pro-max` (palettes, font pairings), `design`,
`banner-design`. Logo/image **generation** in these skills may need a paid API key (e.g. Gemini) —
ask the owner first (CLAUDE.md S6).
