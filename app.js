const $ = (s, root = document) => root.querySelector(s);
const esc = (value = "") => String(value).replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
const safeUrl = value => /^(https?:|mailto:)/i.test(value || "") ? value : "#";
const read = async path => { const response = await fetch(path); if (!response.ok) throw new Error(`Could not load ${path}`); return response.json(); };
const linkAttrs = url => `href="${esc(safeUrl(url))}" target="_blank" rel="noopener noreferrer"`;

function renderProfile(profile) {
  document.title = `${profile.name} — Computational Materials Scientist`;
  $("#hero-intro").textContent = profile.intro;
  $("#portrait").src = profile.portrait;
  $("#cv-link").href = profile.cv;
  $("#contact-email").href = `mailto:${profile.email}`;
  $("#contact-email").textContent = profile.email;
  $("#foss-body").textContent = profile.foss.body;
  $("#foss-focus").textContent = profile.foss.focus;
  $("#gate-text").textContent = profile.gate;
  $("#hobby-text").textContent = profile.hobby;
  $("#year").textContent = new Date().getFullYear();

  const socialMarkup = profile.social.map(item => `<a class="social-icon" ${linkAttrs(item.href)} aria-label="${esc(item.name)}" title="${esc(item.name)}"><span aria-hidden="true">${esc(item.mark)}</span></a>`).join("");
  $("#hero-social").innerHTML = socialMarkup;
  $("#footer-social").innerHTML = socialMarkup;
  $("#contact-details").innerHTML = `<a href="tel:${esc(profile.phoneIsrael.replace(/[^+\d]/g,""))}">${esc(profile.phoneIsrael)}</a><a href="tel:${esc(profile.phoneIndia.replace(/[^+\d]/g,""))}">${esc(profile.phoneIndia)}</a><a href="mailto:${esc(profile.emailAlt)}">${esc(profile.emailAlt)}</a>`;

  $("#research-grid").innerHTML = profile.researchAreas.map(item => `<article class="research-card"><span class="num">${esc(item.number)}</span><h3>${esc(item.title)}</h3><p>${esc(item.text)}</p></article>`).join("");
  $("#education-list").innerHTML = profile.education.map(item => `<li><span class="year">${esc(item.year)}</span><h4>${esc(item.degree)}</h4><p>${esc(item.institution)}</p>${item.thesis ? `<p class="thesis">Thesis: ${esc(item.thesis)}</p>` : ""}</li>`).join("");
  $("#experience-list").innerHTML = profile.experience.map(item => `<article class="experience-item"><span class="dates">${esc(item.dates)}</span><h4>${esc(item.role)}</h4><div class="place">${esc(item.place)}</div><p>${esc(item.detail)}</p></article>`).join("");
  $("#skills-list").innerHTML = profile.skills.map(group => `<div class="skill-group"><h4>${esc(group.group)}</h4><div class="skill-tags">${group.items.map(skill => `<span>${esc(skill)}</span>`).join("")}</div></div>`).join("");
}

function renderCovers(covers) {
  $("#selected-covers").innerHTML = covers.map(item => `<a class="selected-cover" ${linkAttrs(item.url)} aria-label="Open the ${esc(item.journal)} paper, ${esc(item.caption)}"><img src="${esc(item.image)}" alt="${esc(item.alt)}" loading="lazy"><span class="selected-cover-caption"><span>${esc(item.caption)}</span><strong>${esc(item.journal)}</strong><span class="cover-link-hint">View paper ↗</span></span></a>`).join("");
}

function renderProjects(data) {
  const projects = data.projects || [];
  const profileLink = data.githubProfile && /^https:\/\/github\.com\/[A-Za-z0-9-]+\/?$/.test(data.githubProfile) ? `<a class="button button-outline" ${linkAttrs(data.githubProfile)}>GitHub profile ↗</a>` : "";
  if (!projects.length) {
    $("#project-list").innerHTML = `<div class="projects-empty"><span class="project-mark">{ }</span><p>Research scripts and open-source repositories will be added here.</p>${profileLink}</div>`;
    return;
  }
  $("#project-list").innerHTML = projects.map((project,index) => `<a class="project-row" ${linkAttrs(project.url)}><span class="project-mark">${String(index+1).padStart(2,"0")}</span><span><b>${esc(project.name)}</b><small>${esc(project.description || "")}</small></span><span class="project-arrow" aria-hidden="true">↗</span></a>`).join("") + profileLink;
}

function renderPublications(data, featured) {
  const link = data.scholarUrl || "https://scholar.google.com/citations?user=RjztNlIAAAAJ&hl=en";
  $("#scholar-link").href = link;
  const metrics = data.citationMetrics;
  $("#scholar-updated").textContent = metrics?.syncedAt ? `Scholar data synced ${metrics.syncedAt}` : data.lastUpdated;
  $("#citation-metrics").innerHTML = metrics ? [["Citations",metrics.citations],["h-index",metrics.hIndex],["i10-index",metrics.i10Index]].filter(([,value]) => value !== null && value !== undefined).map(([label,value]) => `<span><b>${esc(value)}</b> ${esc(label)}</span>`).join("") : "";
  $("#featured-grid").innerHTML = featured.map(item => `<article class="article-card"><a class="article-image" ${linkAttrs(item.url)} aria-label="Open ${esc(item.title)}"><img src="${esc(item.image)}" alt="${esc(item.journal)} article front page" loading="lazy"></a><p class="article-meta">${esc(item.year)} · ${esc(item.journal)}</p><h3>${esc(item.title)}</h3><p class="journal"><a ${linkAttrs(item.url)}>Read article ↗</a></p></article>`).join("");
  const entries = [...data.items].sort((a,b) => (Number(b.year)||0) - (Number(a.year)||0));
  $("#publication-count").textContent = `All publications and manuscripts · ${entries.length}`;
  $("#publication-list").innerHTML = entries.map(item => {
    const destination = item.url || (item.doi ? `https://doi.org/${item.doi}` : "");
    const status = item.status || item.type;
    return `<article class="publication-row"><span class="pub-year">${item.year ? esc(item.year) : "In review"}</span><div><h3>${esc(item.title)}</h3><p>${esc(item.journal)} · ${esc(status)}${Number.isFinite(item.citations) ? ` · ${esc(item.citations)} citations` : ""}</p></div><div class="pub-link">${destination ? `<a ${linkAttrs(destination)}>${item.doi ? `DOI: ${esc(item.doi)}` : "Publisher page"} ↗</a>` : ""}</div></article>`;
  }).join("");
}

function setupAnalytics() {
  const id = window.SITE_CONFIG?.analyticsMeasurementId?.trim();
  if (!/^G-[A-Z0-9]+$/.test(id || "")) return;
  const banner = $("#consent-banner");
  const load = () => {
    if (window.analyticsStarted) return;
    window.analyticsStarted = true;
    const script = document.createElement("script"); script.async = true; script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`; document.head.append(script);
    window.dataLayer = window.dataLayer || []; window.gtag = function(){ window.dataLayer.push(arguments); };
    window.gtag("consent","default",{analytics_storage:"granted"});
    window.gtag("js", new Date()); window.gtag("config", id);
  };
  const choice = localStorage.getItem("analytics-consent");
  if (choice === "yes") load(); else if (!choice) banner.hidden = false;
  $("#analytics-accept").addEventListener("click", () => { localStorage.setItem("analytics-consent","yes"); banner.hidden = true; if (window.analyticsStarted) window.gtag("consent","update",{analytics_storage:"granted"}); else load(); });
  $("#analytics-decline").addEventListener("click", () => { localStorage.setItem("analytics-consent","no"); banner.hidden = true; if (window.analyticsStarted) window.gtag("consent","update",{analytics_storage:"denied"}); });
  $("#analytics-settings").hidden = false;
  $("#analytics-settings").addEventListener("click", () => { if (window.analyticsStarted) window.gtag("consent","update",{analytics_storage:"denied"}); localStorage.removeItem("analytics-consent"); banner.hidden = false; });
  document.addEventListener("click", event => {
    if (!window.analyticsStarted) return;
    const anchor = event.target.closest("a");
    if (!anchor) return;
    if (anchor.id === "cv-link") window.gtag("event","download_cv",{transport_type:"beacon"});
    else if (/^https?:/.test(anchor.href) && new URL(anchor.href).origin !== location.origin) window.gtag("event","click_external",{link_url:anchor.href,transport_type:"beacon"});
  });
}

async function init() {
  try {
    const [profile, covers, publications, featured, projects] = await Promise.all([read("content/profile.json"),read("content/covers.json"),read("content/publications.json"),read("content/featured.json"),read("content/projects.json")]);
    renderProfile(profile); renderCovers(covers); renderPublications(publications,featured); renderProjects(projects);
    setupAnalytics();
  } catch (error) {
    console.error(error);
    const notice = document.createElement("p"); notice.className = "load-error"; notice.textContent = "Some page content could not be loaded. Please refresh or check the site data files.";
    $("main").prepend(notice);
  }
  const toggle = $(".menu-toggle"), nav = $("#main-nav");
  toggle.addEventListener("click", () => { const open = toggle.getAttribute("aria-expanded") === "true"; toggle.setAttribute("aria-expanded",String(!open)); nav.classList.toggle("open",!open); });
  nav.addEventListener("click", event => { if (event.target.closest("a")) { nav.classList.remove("open"); toggle.setAttribute("aria-expanded","false"); } });
}
init();
