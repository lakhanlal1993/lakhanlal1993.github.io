# Lakhan Lal · GitHub Pages portfolio

An editable static personal site built with HTML, CSS, JavaScript, and JSON. The public pages are generated from small content files. No framework, database, or server is required.

## Preview locally

Open a terminal in this folder and run:

```powershell
python -m http.server 8000
```

Open `http://localhost:8000`. Stop the local server with Ctrl+C.

## Publish using GitHub Pages

1. Use the GitHub account `lakhanlal1993`. Create the user-site repository `lakhanlal1993.github.io` as a public repository.
2. Add these files to its `main` branch.
3. In repository Settings → Pages, select **GitHub Actions** as the build and deployment source.
4. The workflow at `.github/workflows/pages.yml` builds the static page and publishes it after a push to `main`. It also runs every Monday and can be started under Actions → Build and publish portfolio → Run workflow.
5. Check the Actions run and open `https://lakhanlal1993.github.io` after it completes.

Do not replace files in an existing repository until its contents have been checked and backed up.

## Change the site

- **Biography, links, contact, education, skills, hobbies, FOSS copy:** edit `content/profile.json`.
- **Selected cover art:** edit `content/covers.json`. Add another object with image path, journal, caption, alt text, and paper URL; remove an object to remove a cover. Each cover opens its paper in a new tab.
- **Five featured article cards:** edit `content/featured.json`.
- **Full publication list and cached citations:** edit `content/publications.json`.
- **GitHub tools and scripts:** add repository entries in `content/projects.json`. Use each repository's public URL, name, and a short verified description. Add your confirmed GitHub profile URL there too.
- **Profile photo or article images:** replace the matching file under `assets/images/` and keep its path, or change the path in the corresponding JSON file. Keep meaningful alt text.
- **CV:** replace `assets/files/Lakhan-Lal-CV.pdf` with the new file under the same name.
- **NEGF diagram:** replace `assets/diagrams/negf-clean.svg` with another accessible SVG and update its alt text in `index.html` if needed. This diagram uses aligned source, channel, and drain labels with μ subscripts.
- **Colors and layout:** edit the CSS variables at the start of `styles.css`, then the component rules below.
- **Google Analytics:** optional. Add the GA4 Measurement ID as `analyticsMeasurementId` in `site-config.js`. Visitors choose whether to allow tracking, can decline, and can change their choice from Privacy settings in the footer. Leave the value empty to keep analytics off.

Commit the changed file in GitHub. The Actions workflow will publish the update. You can restore the previous file or revert the commit from the repository history.

## Scholar update setup

The visible Scholar metrics and cached publication list refresh weekly via SerpApi's Google Scholar Author API. The website itself never queries Scholar on a visitor's device.

1. Obtain a SerpApi key after checking its current plan and allowance.
2. In the GitHub repository, open Settings → Secrets and variables → Actions → New repository secret. Name it `SERPAPI_KEY` and paste the key there. Do not put it in a source file or commit it.
3. Run the workflow manually once and inspect its output. If the secret is missing, a request fails, or Scholar returns malformed data, the site deploys using the last saved cache and the current public site data is not erased.

The first public build does not require this key; its publication list is based on the supplied CV. Google Scholar may rate-limit requests and scheduled workflows are best effort. Check the Actions run and the visible “Scholar data synced” date after updates. Google Scholar values may differ from other citation databases.

## Current setup notes

- The GitHub profile is set to `lakhanlal1993`. No research-script repositories have been added yet.
- The Google Analytics ID and Scholar API secret are optional and are not included.
- The site publishes the contact details supplied in the CV and public Technion page. Edit `content/profile.json` if you want to change them.
- The two artworks are labelled “Selected journal cover artwork”; they are not described as awards.
- The page says “thermal catalysis” in its topic copy per the brief; revise if you prefer to describe this area differently.
