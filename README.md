# Leveling System (No Newsletter / Ad-free)

A minimal, ad-free single-page leveling system inspired by a Notion template. Runs fully in the browser and stores data in localStorage.

Features:
- XP counter and level computation (100 XP per level)
- Progress bar
- Tasks which award XP when completed
- Add manual XP and quick-add chips
- Export/import JSON and reset data
- Mobile-friendly and accessible (basic ARIA/progressbar)

How to use:
1. Save the files (index.html, styles.css, app.js) in a folder.
2. Open `index.html` in your browser. (For best results use a local server for Chrome file restrictions: `python -m http.server`.)
3. Add tasks, mark them done to get XP, and watch the level go up.

Want it on GitHub Pages?
- Create a repo, push these files to the default branch, and enable Pages (or just push to `gh-pages`).

Customization ideas:
- Change leveling formula in `app.js` computeLevel()
- Add per-task cooldowns or recurring tasks
- Replace localStorage with a backend (Firebase, Supabase) for multi-device sync

No newsletter/ad UI included — entirely focused on the leveling experience.
