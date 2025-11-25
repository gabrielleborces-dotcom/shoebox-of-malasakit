
FINAL PACKAGE — Editable Public Inputs + Secure Admin Save (Option A + B combined)

Files:
- index.html                 -> Public dashboard (original visuals + editable inputs). Changes are local only until admin commits.
- admin.html                 -> Secure admin UI (password protected). Commits data.json via Netlify Function.
- data.json                  -> Canonical shared dataset (initial values)
- netlify/functions/updateData.js -> Netlify Function to commit data.json to GitHub (uses GITHUB_PAT & ADMIN_PASSWORD env vars)
- ORIGINAL_UPLOAD.html.txt   -> Original uploaded file path (for reference): /mnt/data/Shoebox Monitoring 2025 v29.html.txt
- README.txt                 -> This file

How it works:
- Public viewers can edit the inputs on the page (Option A behavior) but those edits do NOT persist globally.
- To save changes globally so everyone sees them, go to admin.html, enter the ADMIN_PASSWORD, edit dataset, and click Commit.
- The Netlify Function will verify your ADMIN_PASSWORD (from Netlify env), use GITHUB_PAT (from Netlify env) to commit data.json to the GitHub repo, and Netlify will auto-deploy.

Deployment steps (summary):
1) Create the GitHub repo `2025-shoebox` under account `gabrielleborces-dotcom`.
2) Add these files to repo root (via GitHub UI or git push).
3) In Netlify, create a site from that GitHub repo.
4) Add environment variables in Netlify (Site settings -> Environment):
   - GITHUB_PAT = <your GitHub PAT with repo scope>
   - ADMIN_PASSWORD = <your chosen admin password>
5) Redeploy. Visit /admin.html to commit updates (Admin uses password, not PAT).

Original uploaded file path (included in package): /mnt/data/Shoebox Monitoring 2025 v29.html.txt
