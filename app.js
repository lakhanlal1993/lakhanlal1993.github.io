const $ = (s, root = document) => root.querySelector(s);
const esc = (v = '') => String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeUrl = v => /^(https?:|mailto:)/i.test(v || '') ? v : '#';
const read = async p => { const r = await fetch(p); if (!r.ok) throw new Error('Could not load ' + p); return r.json(); };
const linkAttrs = u => 'href="' + esc(safeUrl(u)) + '" target="_blank" rel="noopener noreferrer"';

function ensureSections() {
  const nav = $('#main-nav');
  if (nav && !nav.querySelector('[href="#gallery"]')) nav.insertAdjacentHTML('beforeend','<a href="#gallery">Gallery</a>');
  const pub = $('.publication-section .section-wrap');
  if (pub && !$('#top-papers-list')) {
    const list = document.createElement('div'); list.className='top-papers';
    list.innerHTML='<div class="top-papers-heading"><h3>Top 5 papers</h3><span>Ranked by Google Scholar citations</span></div><ol id="top-papers-list"></ol>';
    pub.insertBefore(list,$('#featured-grid'));
  }
  const gallery = document.createElement('section'); gallery.className='gallery-section section-pad'; gallery.id='gallery'; gallery.innerHTML='<div class="section-wrap"><div class="section-heading"><div><p class="eyebrow">Field notes &amp; moments</p><h2>Photo <em>gallery.</em></h2></div><p class="section-lead">Research, travel and everyday moments.</p></div><div class="gallery-grid" id="gallery-grid"></div></div>';
  if (!$('#gallery')) $('.projects-section')?.before(gallery);
  if (!$('#audience')) {
    const audience=document.createElement('section'); audience.className='audience-section'; audience.id='audience'; audience.innerHTML='<div class="section-wrap audience-inner"><div><p class="eyebrow">Site readership</p><h2>Visitor <em>overview.</em></h2><p class="audience-note">Aggregate figures only. Recent visitor locations are not published.</p></div><div class="audience-data" id="audience-data"></div><a class="analytics-report-link" href="https://analytics.google.com/analytics/web/" target="_blank" rel="noopener noreferrer">Open Google Analytics reports ↗</a></div>';
    $('footer.site-footer')?.before(audience);
  }
}

function renderProfile(p) {
  document.title=p.name+' — Computational Materials Scientist';
  $('#hero-intro').textContent=p.intro; $('#portrait').src=p.portrait; $('#cv-link').href=p.cv;
  $('#contact-email').href='mailto:'+p.email; $('#contact-email').textContent=p.email;
  $('#foss-body').textContent=p.foss.body; $('#foss-focus').textContent=p.foss.focus;
  $('#gate-text').textContent=p.gate; $('#hobby-text').textContent=p.hobby; $('#year').textContent=new Date().getFullYear();
  const socials=p.social.map(x=>'<a class="social-icon" '+linkAttrs(x.href)+' aria-label="'+esc(x.name)+'" title="'+esc(x.name)+'"><span aria-hidden="true">'+esc(x.mark)+'</span></a>').join('');
  $('#hero-social').innerHTML=socials; $('#footer-social').innerHTML=socials;
  $('#contact-details').innerHTML='<a href="tel:'+esc(p.phoneIsrael.replace(/[^+\d]/g,''))+'">'+esc(p.phoneIsrael)+'</a><a href="tel:'+esc(p.phoneIndia.replace(/[^+\d]/g,''))+'">'+esc(p.phoneIndia)+'</a><a href="mailto:'+esc(p.emailAlt)+'">'+esc(p.emailAlt)+'</a>';
  $('#research-grid').innerHTML=p.researchAreas.map(x=>'<article class="research-card"><span class="num">'+esc(x.number)+'</span><h3>'+esc(x.title)+'</h3><p>'+esc(x.text)+'</p></article>').join('');
  $('#education-list').innerHTML=p.education.map(x=>'<li><span class="year">'+esc(x.year)+'</span><h4>'+esc(x.degree)+'</h4><p>'+esc(x.institution)+'</p>'+(x.result?'<p class="education-result">'+esc(x.result)+'</p>':'')+(x.thesis?'<p class="thesis">Thesis: '+esc(x.thesis)+'</p>':'')+'</li>').join('');
  $('#experience-list').innerHTML=p.experience.map(x=>'<article class="experience-item"><span class="dates">'+esc(x.dates)+'</span><h4>'+esc(x.role)+'</h4><div class="place">'+esc(x.place)+'</div><p>'+esc(x.detail)+'</p></article>').join('');
  $('#skills-list').innerHTML=p.skills.map(g=>'<div class="skill-group"><h4>'+esc(g.group)+'</h4><div class="skill-tags">'+g.items.map(x=>'<span>'+esc(x)+'</span>').join('')+'</div></div>').join('');
}
function renderCovers(data) {
  $('#selected-covers').innerHTML=data.map(x=>'<a class="selected-cover" '+linkAttrs(x.url)+' aria-label="Open '+esc(x.journal)+' paper"><img src="'+esc(x.image)+'" alt="'+esc(x.alt)+'" loading="lazy"><span class="selected-cover-caption"><span>'+esc(x.caption)+'</span><strong>'+esc(x.journal)+'</strong><span class="cover-link-hint">View paper ↗</span></span></a>').join('');
}
function renderProjects(data) {
  const projects=data.projects||[], root=$('#project-list');
  if(!projects.length){root.innerHTML='<div class="projects-empty"><span class="project-mark">{ }</span><p>Research scripts and open-source repositories will be added here.</p><a class="button button-outline" '+linkAttrs(data.githubProfile||'https://github.com/lakhanlal1993')+'>GitHub profile ↗</a></div>';return;}
  root.innerHTML=projects.map((x,i)=>'<a class="project-row" '+linkAttrs(x.url)+'><span class="project-mark">'+String(i+1).padStart(2,'0')+'</span><span><b>'+esc(x.name)+'</b><small>'+esc(x.description||'')+'</small></span><span class="project-arrow">↗</span></a>').join('');
}
function renderPublications(data,featured) {
  const scholar=data.scholarUrl||'https://scholar.google.com/citations?user=RjztNlIAAAAJ&hl=en'; $('#scholar-link').href=scholar;
  $('#scholar-updated').textContent=data.citationMetrics?.syncedAt?'Scholar data synced '+data.citationMetrics.syncedAt:(data.lastUpdated||'');
  const metrics=data.citationMetrics, entries=metrics?[['Total citations',metrics.citations],['h-index',metrics.hIndex],['i10-index',metrics.i10Index]].filter(x=>x[1]!==null&&x[1]!==undefined):[];
  const box=$('#citation-metrics');
  box.innerHTML=entries.length?entries.map(x=>'<span class="metric-card"><b>'+esc(Number(x[1]).toLocaleString())+'</b><small>'+esc(x[0])+'</small></span>').join(''):'<span class="metric-pending">Citation metrics appear after the first successful Scholar refresh.</span>';
  if(box.parentElement.tagName!=='A'){const a=document.createElement('a');a.className='scholar-dashboard';a.href=scholar;a.target='_blank';a.rel='noopener noreferrer';a.setAttribute('aria-label','Open Google Scholar citation metrics');box.before(a);a.append(box);}
  const sorted=data.items.filter(x=>x.type!=='Submitted manuscript'&&Number.isFinite(x.citations)).sort((a,b)=>b.citations-a.citations).slice(0,5);
  $('#top-papers-list').innerHTML=sorted.length?sorted.map(x=>'<li><a '+linkAttrs(x.url||(x.doi?'https://doi.org/'+x.doi:scholar))+'><span><strong>'+esc(x.title)+'</strong><small>'+esc(x.journal)+' · '+esc(x.year||'')+'</small></span><b class="paper-citations">'+esc(Number(x.citations).toLocaleString())+'<small>citations</small></b></a></li>').join(''):'<li class="top-papers-empty">Top-five ranking appears after Google Scholar citation data syncs.</li>';
  $('#featured-grid').innerHTML=featured.map(x=>'<article class="article-card"><a class="article-image" '+linkAttrs(x.url)+' aria-label="Open '+esc(x.title)+'"><img src="'+esc(x.image)+'" alt="'+esc(x.journal)+' article front page" loading="lazy"></a><p class="article-meta">'+esc(x.year)+' · '+esc(x.journal)+'</p><h3>'+esc(x.title)+'</h3><p class="journal"><a '+linkAttrs(x.url)+'>Read article ↗</a></p></article>').join('');
  const all=[...data.items].sort((a,b)=>(Number(b.year)||0)-(Number(a.year)||0)); $('#publication-count').textContent='All publications and manuscripts · '+all.length;
  $('#publication-list').innerHTML=all.map(x=>{const dest=x.url||(x.doi?'https://doi.org/'+x.doi:'');return '<article class="publication-row"><span class="pub-year">'+(x.year?esc(x.year):'—')+'</span><div><h3>'+esc(x.title)+'</h3><p>'+esc(x.journal)+' · '+esc(x.status||x.type)+(Number.isFinite(x.citations)?' · '+esc(x.citations)+' citations':'')+'</p></div><div class="pub-link">'+(dest?'<a '+linkAttrs(dest)+'>'+(x.doi?'DOI: '+esc(x.doi):'Publisher page')+' ↗</a>':'')+'</div></article>';}).join('');
}
function renderGallery(data) {
  const items=data.items||[]; $('#gallery-grid').innerHTML=items.length?items.map(x=>'<figure class="gallery-card"><img src="'+esc(x.image)+'" alt="'+esc(x.alt||x.caption||'Lakhan Lal gallery photo')+'" loading="lazy"><figcaption>'+esc(x.caption||'')+'</figcaption></figure>').join(''):'<div class="gallery-empty"><span>＋</span><div><strong>Your gallery starts here</strong><p>Upload a photo to <code>assets/images/gallery/</code>, then add its path, caption and alt text to <code>content/gallery.json</code>.</p></div></div>';
}
function renderAudience(data) {
  const root=$('#audience-data'); if(!Number.isFinite(data.totalVisitors)){root.innerHTML='<p class="audience-empty">Add aggregate counts to <code>content/analytics-summary.json</code>; Google Analytics reports stay private.</p>';return;}
  root.innerHTML='<div class="audience-total"><b>'+Number(data.totalVisitors).toLocaleString()+'</b><span>total visitors'+(data.updatedAt?' · updated '+esc(data.updatedAt):'')+'</span></div><div class="country-list"><h3>Visitors by country</h3>'+((data.countries||[]).slice(0,8).map(x=>'<span><b>'+Number(x.visitors).toLocaleString()+'</b> '+esc(x.country)+'</span>').join('')||'<span>No country breakdown yet.</span>')+'</div>';
}
function setupAnimations() {
  if(matchMedia('(prefers-reduced-motion: reduce)').matches||!('IntersectionObserver'in window))return;
  const items=document.querySelectorAll('main > section,.research-card,.article-card,.gallery-card,.top-papers li');
  items.forEach((x,i)=>{x.classList.add('reveal');if(x.matches('.research-card,.article-card,.gallery-card,.top-papers li'))x.style.setProperty('--reveal-delay',Math.min(i%5,4)*70+'ms');});
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');io.unobserve(e.target);}}),{threshold:.12});items.forEach(x=>io.observe(x));
}
function setupAnalytics() {
  const id=window.SITE_CONFIG?.analyticsMeasurementId?.trim(); if(!/^G-[A-Z0-9]+$/.test(id||''))return;
  const banner=$('#consent-banner'), load=()=>{if(window.analyticsStarted)return;window.analyticsStarted=true;const s=document.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtag/js?id='+encodeURIComponent(id);document.head.append(s);window.dataLayer=window.dataLayer||[];window.gtag=function(){window.dataLayer.push(arguments);};window.gtag('consent','default',{analytics_storage:'granted'});window.gtag('js',new Date());window.gtag('config',id);};
  const choice=localStorage.getItem('analytics-consent');if(choice==='yes')load();else if(!choice)banner.hidden=false;
  $('#analytics-accept').addEventListener('click',()=>{localStorage.setItem('analytics-consent','yes');banner.hidden=true;load();});
  $('#analytics-decline').addEventListener('click',()=>{localStorage.setItem('analytics-consent','no');banner.hidden=true;});
  $('#analytics-settings').hidden=false;$('#analytics-settings').addEventListener('click',()=>{localStorage.removeItem('analytics-consent');banner.hidden=false;});
  document.addEventListener('click',e=>{if(!window.analyticsStarted)return;const a=e.target.closest('a');if(a&&a.id==='cv-link')window.gtag('event','download_cv',{transport_type:'beacon'});else if(a&&/^https?:/.test(a.href)&&new URL(a.href).origin!==location.origin)window.gtag('event','click_external',{link_url:a.href,transport_type:'beacon'});});
}
async function init() {
  try { ensureSections(); const [p,c,pubs,f,projects,g,a]=await Promise.all([read('content/profile.json'),read('content/covers.json'),read('content/publications.json'),read('content/featured.json'),read('content/projects.json'),read('content/gallery.json'),read('content/analytics-summary.json')]);
    renderProfile(p);renderCovers(c);renderPublications(pubs,f);renderProjects(projects);renderGallery(g);renderAudience(a);setupAnalytics();setupAnimations();
  } catch(e){console.error(e);const n=document.createElement('p');n.className='load-error';n.textContent='Some page content could not be loaded. Please refresh or check the site data files.';$('main').prepend(n);}
  const t=$('.menu-toggle'),nav=$('#main-nav');t.addEventListener('click',()=>{const open=t.getAttribute('aria-expanded')==='true';t.setAttribute('aria-expanded',String(!open));nav.classList.toggle('open',!open);});nav.addEventListener('click',e=>{if(e.target.closest('a')){nav.classList.remove('open');t.setAttribute('aria-expanded','false');}});
}
init();
// Make every publication row open its paper in a new tab.
(() => {
  const list = document.querySelector('#publication-list');
  if (!list) return;
  const wireRows = () => list.querySelectorAll('.publication-row').forEach(row => {
    if (row.dataset.rowLinkReady) return;
    const paperLink = row.querySelector('.pub-link a');
    if (!paperLink?.href) return;
    row.dataset.rowLinkReady = 'true';
    row.tabIndex = 0;
    row.setAttribute('role', 'link');
    row.setAttribute('aria-label', 'Open publication: ' + (row.querySelector('h3')?.textContent || ''));
    row.style.cursor = 'pointer';
    const openPaper = event => {
      if (event.target.closest('a')) return;
      window.open(paperLink.href, '_blank', 'noopener,noreferrer');
    };
    row.addEventListener('click', openPaper);
    row.addEventListener('keydown', event => {
      if ((event.key === 'Enter' || event.key === ' ') && !event.target.closest('a')) {
        event.preventDefault();
        window.open(paperLink.href, '_blank', 'noopener,noreferrer');
      }
    });
  });
  new MutationObserver(wireRows).observe(list, { childList: true });
  wireRows();
})();
