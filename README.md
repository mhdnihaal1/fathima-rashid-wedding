# Fathima & Rashid — Nikah Invitation

Single-page wedding invitation website in the "gilded emerald" style.
No build step, no dependencies.

## Files
- `index.html` — page structure, all wording, embedded SVG artwork
- `styles.css` — emerald and gold theme, layout, animations
- `script.js` — loader, envelope, petals, countdown, calendar, venue tabs, RSVP, music

## Preview locally
    cd fathima-rashid-wedding && python3 -m http.server 8000
then open http://localhost:8000

Handy URL flags: `index.html?open` skips the envelope; `?still` disables
entrance animations (useful for screenshots).

## Things to fill in
In `index.html`:
- Reception time: search for `time to be announced` and `Time TBA`

In `script.js` (top of file):
- `RSVP_WHATSAPP` — family WhatsApp number, digits only, e.g. `919876543210`
- `CONTACTS` — phone numbers for the Contact Us section (hidden while empty)

## Background music (optional)
Drop a file named `music.mp3` next to `index.html`. The top-right button
becomes active and music starts when a guest opens the envelope.

## Hosting
Upload the folder to any static host (Netlify, Vercel, GitHub Pages,
Cloudflare Pages) or a shared host's `public_html`, and point a domain or
subdomain such as `wedding.yourdomain.com` at it.
