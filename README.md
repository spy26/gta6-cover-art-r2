# Leonida Cover Studio

<!-- SPDX-License-Identifier: MIT -->

Turn a photo into GTA 6-style multi-panel cover art, offline, in your browser.
Pick a layout, pick a colour grade, crop each panel, edit the caption, export
a PNG in the common post sizes.

## What it does

- **5 layouts** — Diagonal Vice (slanted hero + stacked side panels), Hero Split,
  Triptych (three tall frames), Magazine (full-bleed photo, stacked giant title),
  Duo Portrait.
- **5 colour grades** — Sunset Strip, Neon Nights, Postcard Vice, Midnight Vice,
  Golden Hour. Each grade tints the photos, the title band and the decorations.
- **Any photo** — upload your own, or use the two bundled samples. Up to three
  photo slots; every panel takes its own photo, zoom, pan (drag the photo) and flip.
- **Editable caption** — title (auto-fits, never overflows), tagline pill (sized
  to the text, never clipped), subtitle, footer, title size.
- **Poster details** — retro sun with a VI mark, palm and skyline silhouettes,
  halftone dots, film grain, vignette, star footer. All drawn fresh in code;
  no Rockstar artwork, logos or fonts.
- **Export PNG** — 1080×1080, 1080×1350, 1920×1080 and 1080×1920 (story).

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

No build step, no network request: `app/` is plain static files.

## Shots

`shots.json` lists the four screenshots in `screenshots/`, taken headless with
`../shoot.mjs` (not part of the entry). The first is the cover; the second is
the editor with a photo loaded; the third and fourth are the tall and wide covers.

## License

MIT — see `LICENSE`.
