# Mohamed & Doha — Wedding Invitation Website

A cinematic, mobile-first wedding invitation site. Pure HTML/CSS/JS, no build step, ready for GitHub Pages.

## File structure

```
index.html
style.css
script.js
assets/
  images/   photo1.jpg … photo5.jpg  (gallery — currently placeholders)
  music/    wedding.mp3              (background music — not included)
  icons/    (reserved for any extra icon assets)
```

## Add your own content

**Photos** — drop 5 images into `assets/images/` named exactly:
`photo1.jpg`, `photo2.jpg`, `photo3.jpg`, `photo4.jpg`, `photo5.jpg`.
Until then, each slot shows an elegant "M & D" placeholder — the layout works either way.

**Music** — add your song as `assets/music/wedding.mp3`. It starts automatically the
moment a guest taps "Open Invitation" (browsers block audio before a user gesture, so
this is the earliest it can start). The floating gold button in the bottom-right corner
lets guests pause/resume; if no file is present the button simply stays inactive and the
rest of the site works normally.

**Wedding details** — date, time, and venue are set in `index.html` (search for the
`details`, `hero`, and `location` sections) and the countdown target is set near the top
of `script.js` (`WEDDING_DATE`).

**Google Maps link** — already wired to the provided link on the "Open in Google Maps"
button in the Location section.

## Deploy to GitHub Pages

1. Create a new GitHub repository and push these files to the root (or to `/docs`).
2. In the repo, go to **Settings → Pages**, set the source branch, and save.
3. Your invitation will be live at `https://<username>.github.io/<repo>/`.

That's it — no build tools, no dependencies, no backend.
