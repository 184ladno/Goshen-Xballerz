# Goshen XBallerz

Website for Goshen XBallerz football coaching. Plain HTML, CSS and JavaScript – no build step.
Open `index.html` in a browser to view it.

## Files

| File | What it is |
| --- | --- |
| `index.html` | Home page (hero, Meet Gareth, "Built around every player" scroll section, reviews) |
| `about.html` | About page (story rows + video) |
| `coaches.html` | Coaches page (team cards that open a profile pop-up) |
| `contact.html` | Contact page (enquiry form + phone/email details) |
| `camps.html`, `coaching.html`, `membership.html` | Not built yet (empty) |
| `styles.css` | All styling for every page. Table of contents at the top |
| `script.js` | All interactive features. **Settings at the top** (contact email, FAQ questions) |
| `images/` | All images, in WebP format |

## Common edits

- **Change site colours:** `styles.css` → section 1 "Colours & settings" (`--gold`, `--cream`, …).
- **Change FAQ questions:** `script.js` → `POPULAR_QUESTIONS` at the top.
- **Change the contact email:** `script.js` → `CONTACT_EMAIL`, and the email link in `contact.html`.
- **Change the menu, header or footer:** they are copied into every page, so edit all four `.html` files.
- **Add a coach:** in `coaches.html`, copy a whole `<li class="team-card">…</li>` block.
- **Add a story chapter:** in `about.html`, copy a whole `<article class="story-row">…</article>` block.
- **Change the mobile layout:** each section in `styles.css` ends with `@media (max-width: 700px)` rules for phones.

## Adding images

Keep images small so the site loads fast and the repo stays light:

- Save photos as **WebP** (or JPEG) no wider than about 1600px.
- Small icons/logos only need to be 2× the size they're shown at.
- Use simple names without spaces, e.g. `images/coach-sam.webp`.

Free tool: <https://squoosh.app> – drop in an image, choose WebP, resize, download.

## Fixing problems

1. Open the page in Chrome/Edge/Firefox and press **F12** → **Console**. Red errors show the file and line.
2. Right-click an element → **Inspect** to see which CSS rules apply to it and where they are in `styles.css`.
3. Each feature in `script.js` only runs on pages that have its HTML, so an error usually means a class
   name or `id` was renamed in the HTML but not in the JS/CSS (or the other way round).
