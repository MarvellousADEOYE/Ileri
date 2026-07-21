import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { ACCESSORIES, COLOURS, PRODUCTS, SIZES } from '../assets/js/catalog.js';
import { CONTENT_PAGES, JOURNAL_ARTICLES } from '../assets/js/content.js';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));

test('catalogue identities and routes are unique', () => {
  const ids = [...PRODUCTS, ...ACCESSORIES].map(({ id }) => id);
  const handles = [...PRODUCTS, ...ACCESSORIES].map(({ handle }) => handle);
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(new Set(handles).size, handles.length);
});

test('every workwear concept has complete planned options and truthful status', () => {
  const colourKeys = COLOURS.map(({ key }) => key);
  PRODUCTS.forEach((product) => {
    assert.equal(product.status, 'concept');
    assert.equal(product.purchasable, false);
    assert.deepEqual(product.sizes, SIZES);
    assert.deepEqual(product.colours, colourKeys);
    assert.ok(product.notice.toLowerCase().includes('concept'));
    assert.ok(product.description.length > 40);
  });
});

test('every catalogue image exists inside the project', async () => {
  for (const item of [...PRODUCTS, ...ACCESSORIES]) {
    await access(new URL(`../${item.image}`, import.meta.url));
  }
});

test('required support and policy pages are present once', () => {
  const required = ['about', 'contact', 'delivery', 'returns', 'size-guide', 'care-guide', 'faq', 'privacy', 'terms', 'cookies', 'accessibility'];
  const slugs = CONTENT_PAGES.map(({ slug }) => slug);
  assert.equal(new Set(slugs).size, slugs.length);
  required.forEach((slug) => assert.ok(slugs.includes(slug), `Missing ${slug}`));
});

test('journal article routes are unique and have readable content', () => {
  const slugs = JOURNAL_ARTICLES.map(({ slug }) => slug);
  assert.equal(new Set(slugs).size, slugs.length);
  JOURNAL_ARTICLES.forEach((article) => {
    assert.ok(article.sections.length >= 2);
    assert.ok(article.excerpt.length > 40);
  });
});

test('site shell has no placeholder hash links and exposes core metadata', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  assert.doesNotMatch(html, /href=["']#["']/);
  assert.match(html, /rel="canonical"/);
  assert.match(html, /property="og:image"/);
  assert.match(html, /id="app"/);
  assert.match(html, /Pre-launch preview/);
});

test('sitemap includes every catalogue and content route', async () => {
  const sitemap = await readFile(new URL('../sitemap.xml', import.meta.url), 'utf8');
  PRODUCTS.forEach(({ handle }) => assert.match(sitemap, new RegExp(`handle=${handle}`)));
  ACCESSORIES.forEach(({ handle }) => assert.match(sitemap, new RegExp(`handle=${handle}`)));
  CONTENT_PAGES.forEach(({ slug }) => assert.match(sitemap, new RegExp(`slug=${slug}`)));
  JOURNAL_ARTICLES.forEach(({ slug }) => assert.match(sitemap, new RegExp(`slug=${slug}`)));
});

test('all test paths remain scoped to the project', () => {
  assert.match(projectRoot, /\/Documents\/Ileri\/$/);
});
