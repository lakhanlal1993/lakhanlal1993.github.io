# Lakhan Lal · GitHub Pages portfolio

An editable static personal site built with HTML, CSS, JavaScript, and JSON. The public pages are generated from small content files. No framework, database, or server is required.

## Preview locally

Open a terminal in this folder and run:

```powershell
python -m http.server 8000
```

Open `http://localhost:8000`. Stop the local server with Ctrl+C.

## Publish using GitHub Pages

1. Use the GitHub account `lakhanlal1993`. The user-site repository is `lakhanlal1993.github.io`.
2. In repository Settings → Pages, select **GitHub Actions** as the build and deployment source.
3. The workflow at `.github/workflows/pages.yml` publishes after a push to `main`. It runs on the 1st and 16th of each month (about every 15 days) and can be started under Actions → Build and publish portfolio → Run workflow.
4. Check the Actions run and open `https://lakhanlal1993.github.io` after it completes.

## Change the site

- **Biography, contact, education, skills, hobbies, social links and FOSS copy:** edit `content/profile.json`.
- **Selected cover art and its paper link:** edit `content/covers.json`.
- **Five featured article cards:** edit `content/featured.json`.
- **Full publication list and cached citations:** edit `content/publications.json`.
- **Research code links:** edit `content/projects.json`.
- **Photo gallery:** upload photos to `assets/images/gallery/`, then add an object to `content/gallery.json` with `image` (site-relative path), `caption`, and `alt`. Remove an object to remove that photo.
- **Profile photo or article images:** replace the matching file under `assets/images/` and keep its path, or update the path in its JSON file.
- **CV:** replace `assets/files/Lakhan-Lal-CV.pdf` with the new file under the same name.
- **NEGF diagram:** replace `assets/diagrams/negf-clean.svg` and update its alt text in `index.html` if needed.
- **Colors, type and layout:** edit `styles.css`.
- **Google Analytics tracking:** add the GA4 Measurement ID as `analyticsMeasurementId` in `site-config.js`. Visitors can allow or decline tracking and later change their choice in the footer.
- **Public visitor totals:** update `content/analytics-summary.json` with aggregate `totalVisitors`, `updatedAt`, and `countries` values. Google Analytics does not automatically publish these totals on a static site; use the private Analytics report to check current figures before updating. Do not publish individual visitor data.

## Google Scholar refresh

The workflow refreshes publications and citation metrics on the 1st and 16th of each month (approximately every 15 days) via SerpApi's Google Scholar Author API. The site does not query Scholar in a visitor's browser. The top-five list is ranked by citations after a successful refresh.

Store the SerpApi key in repository Settings → Secrets and variables → Actions as the secret `SERPAPI_KEY`. Never add the key to a source file. Run the workflow manually once to verify; if a refresh fails, the existing publication cache remains available.

Google Scholar may rate-limit requests and scheduled workflows are best effort. Check the Actions run and the visible “Scholar data synced” date after a refresh. Citation counts can differ across databases.
