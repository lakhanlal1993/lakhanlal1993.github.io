import { readFile, writeFile } from 'node:fs/promises';

const authorId = 'RjztNlIAAAAJ';
const apiKey = process.env.SERPAPI_KEY;
if (!apiKey) {
  console.log('SERPAPI_KEY is not configured; keep the last saved Scholar data.');
  process.exit(0);
}

const cleanTitle = value => String(value || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const toNumber = value => { const found = String(value ?? '').replace(/,/g, '').match(/\d+/); return found ? Number(found[0]) : null; };
const publicationYear = article => {
  const supplied = toNumber(article.publication_info?.pub_year);
  if (supplied && supplied >= 1900 && supplied <= new Date().getFullYear() + 1) return supplied;
  const summary = article.publication_info?.summary || article.publication || '';
  const years = [...String(summary).matchAll(/\b(?:19|20)\d{2}\b/g)].map(match => Number(match[0]));
  return years.find(year => year >= 1900 && year <= new Date().getFullYear() + 1) || null;
};
const pageSize = 20;
const query = new URLSearchParams({engine:'google_scholar_author',author_id:authorId,hl:'en',num:String(pageSize)});
const articles = [];
let metricsTable = [];
for (let start = 0; start < 500; start += pageSize) {
  query.set('start',String(start));
  const response = await fetch(`https://serpapi.com/search.json?${query}&api_key=${encodeURIComponent(apiKey)}`);
  if (!response.ok) throw new Error(`Scholar provider returned HTTP ${response.status}; saved data was not changed.`);
  const data = await response.json();
  if (data.error || !Array.isArray(data.articles)) throw new Error(`Invalid Scholar response: ${data.error || 'article list missing'}; saved data was not changed.`);
  articles.push(...data.articles);
  if (Array.isArray(data.cited_by?.table)) metricsTable = data.cited_by.table;
  const total = Number(String(data.search_information?.total_results || '').replace(/[^\d]/g,'')) || 0;
  if (data.articles.length < pageSize || (total && articles.length >= total)) break;
}
if (!articles.length) throw new Error('Scholar returned no articles; saved data was not changed.');

const metric = label => {
  const row = metricsTable.find(item => Object.hasOwn(item, label));
  const values = row?.[label];
  return toNumber(values?.all ?? values?.since_2021 ?? values?.since_2020);
};
const file = 'content/publications.json';
const current = JSON.parse(await readFile(file,'utf8'));
const curated = current.items.filter(item => item.type === 'Submitted manuscript');
const oldEntries = current.items.filter(item => item.type !== 'Submitted manuscript');
const synced = articles.map(article => {
  const title = article.title || '';
  const normalized = cleanTitle(title);
  const previous = oldEntries.find(item => {
    const oldTitle = cleanTitle(item.title);
    return oldTitle === normalized || (Math.min(oldTitle.length,normalized.length) > 35 && (oldTitle.includes(normalized) || normalized.includes(oldTitle)));
  });
  const doi = previous?.doi || (/doi\.org\/(10\.[^\s/?]+)/i.exec(article.link || '')?.[1] || null);
  const summary = article.publication_info?.summary || article.publication || '';
  const priorType = previous?.type;
  const type = !priorType || priorType === 'Google Scholar record' || priorType === 'Submitted manuscript' ? 'Journal article' : priorType;
  return {
    ...(previous || {}),
    title: previous?.title || title,
    journal: previous?.journal || summary || 'Google Scholar record',
    year: publicationYear(article) || previous?.year || null,
    ...(doi ? {doi} : {}),
    ...(!previous && article.link ? {url:article.link} : {}),
    type,
    status: 'Published',
    citations: toNumber(article.cited_by?.value)
  };
});
const next = {
  lastUpdated: current.lastUpdated,
  scholarUrl: `https://scholar.google.com/citations?user=${authorId}&hl=en`,
  citationMetrics: { citations: metric('citations'), hIndex: metric('h_index'), i10Index: metric('i10_index'), syncedAt: new Date().toISOString().slice(0,10) },
  items: [...synced,...curated]
};
await writeFile(file,`${JSON.stringify(next,null,2)}\n`);
console.log(`Updated ${synced.length} Scholar records on ${next.citationMetrics.syncedAt}.`);
