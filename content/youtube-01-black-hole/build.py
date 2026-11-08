#!/usr/bin/env python3
"""Inline timeline.json into film.src.html -> black-hole.html (keeps the page zero-asset)."""
import json, pathlib
here = pathlib.Path(__file__).parent
tl = json.loads((here / 'timeline.json').read_text())
src = (here / 'film.src.html').read_text()
(here / 'black-hole.html').write_text(src.replace('__TL__', json.dumps(tl, separators=(',', ':'))))
print('wrote black-hole.html', round(tl['duration'], 1), 's')
# thumbnail page: the film's drawing code with draw() replaced by thumbnail.js
html = (here / 'black-hole.html').read_text()
(here / 'thumbnail.html').write_text(html.replace('</body>', '<script>\n' + (here / 'thumbnail.js').read_text() + '\n</script>\n</body>'))
print('wrote thumbnail.html (render: render.mjs thumbnail.html thumb --stills 0, then scale to 1280x720)')
