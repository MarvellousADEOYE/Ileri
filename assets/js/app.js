import {
  ACCESSORIES,
  COLOURS,
  PRODUCTS,
  formatMoney,
  getAccessoryByHandle,
  getColourByKey,
  getProductByHandle,
} from './catalog.js';
import { CONTENT_PAGES, JOURNAL_ARTICLES } from './content.js';
import store from './store.js';

const CONTACT_EMAIL = 'hello@ilericollective.com';
const app = document.getElementById('app');
const params = new URLSearchParams(window.location.search);
const view = params.get('view') || 'home';
let toastTimer;

const escapeHTML = (value = '') => String(value).replace(/[&<>'"]/g, (character) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  "'": '&#39;',
  '"': '&quot;',
}[character]));

const route = (targetView, routeParams = {}) => {
  const query = new URLSearchParams({ view: targetView });
  Object.entries(routeParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') query.set(key, value);
  });
  return `?${query.toString()}`;
};

const icon = (name) => `<svg aria-hidden="true"><use href="#icon-${name}"/></svg>`;

function colourName(key) {
  return getColourByKey(key)?.name || key;
}

function setPageMeta(title, description) {
  document.title = `${title} — ILERI`;
  document.querySelector('meta[name="robots"]')?.setAttribute('content', 'index,follow');
  document.querySelector('meta[name="description"]')?.setAttribute('content', description);
  document.querySelector('meta[property="og:title"]')?.setAttribute('content', `${title} — ILERI`);
  document.querySelector('meta[property="og:description"]')?.setAttribute('content', description);
  const canonical = new URL(window.location.href);
  canonical.hash = '';
  if (view === 'home') {
    canonical.pathname = '/';
    canonical.search = '';
  }
  document.querySelector('link[rel="canonical"]')?.setAttribute('href', canonical.href);
  document.querySelector('meta[property="og:url"]')?.setAttribute('content', canonical.href);
}

function setStructuredData(data) {
  document.getElementById('pageStructuredData')?.remove();
  const script = document.createElement('script');
  script.id = 'pageStructuredData';
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(data).replace(/</g, '\\u003c');
  document.head.appendChild(script);
}

function showToast(message) {
  const toast = document.getElementById('toast');
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.hidden = false;
  requestAnimationFrame(() => toast.classList.add('show'));
  toastTimer = window.setTimeout(() => {
    toast.classList.remove('show');
    window.setTimeout(() => { toast.hidden = true; }, 220);
  }, 3200);
}

function productCard(product) {
  const wishlisted = store.isWishlisted(product.id);
  const campaignColour = product.images?.[0]?.colour;
  const swatches = COLOURS.map((colour) => `
    <span class="swatch" style="--swatch:${colour.hex}" title="${escapeHTML(colour.name)}">
      <span class="visually-hidden">${escapeHTML(colour.name)}</span>
    </span>`).join('');

  return `
    <article class="product-card" data-product-card data-fit="${escapeHTML(product.fit.name.toLowerCase())}" data-colours="${escapeHTML(product.colours.join(' '))}">
      <div class="product-media">
        <a href="${route('product', { handle: product.handle })}" aria-label="View ${escapeHTML(product.name)}">
          <img src="${escapeHTML(product.image)}" alt="${escapeHTML(product.images?.[0]?.alt || product.name)}" loading="lazy" decoding="async" width="627" height="627">
        </a>
        <span class="badge">Concept preview</span>
        <button class="wishlist-button ${wishlisted ? 'active' : ''}" type="button" data-wishlist="${escapeHTML(product.id)}" aria-pressed="${wishlisted}" aria-label="${wishlisted ? 'Remove' : 'Add'} ${escapeHTML(product.name)} ${wishlisted ? 'from' : 'to'} wishlist">
          ${icon('heart')}
        </button>
      </div>
      <div class="product-copy">
        <div class="meta">${escapeHTML(product.fit.name)} fit${campaignColour ? ` · Campaign image: ${escapeHTML(colourName(campaignColour))}` : ''}</div>
        <h3><a href="${route('product', { handle: product.handle })}">${escapeHTML(product.name)}</a></h3>
        <p class="price">Planned price ${formatMoney(product.price, product.currency)}</p>
        <div class="swatches" aria-label="Planned colours">${swatches}</div>
        <a class="text-link" href="${route('product', { handle: product.handle })}">View concept and fit ${icon('arrow')}</a>
      </div>
    </article>`;
}

function accessoryCard(accessory) {
  return `
    <article class="product-card accessory-card">
      <a class="product-media" href="${route('accessory', { handle: accessory.handle })}">
        <img src="${escapeHTML(accessory.image)}" alt="Concept image of ${escapeHTML(accessory.name)}" loading="lazy" decoding="async" width="627" height="627">
        <span class="badge">Coming later</span>
      </a>
      <div class="product-copy">
        <div class="meta">Everyday essential · Concept</div>
        <h3><a href="${route('accessory', { handle: accessory.handle })}">${escapeHTML(accessory.name)}</a></h3>
        <p>${escapeHTML(accessory.description)}</p>
        <a class="text-link" href="${route('accessory', { handle: accessory.handle })}">Explore the direction ${icon('arrow')}</a>
      </div>
    </article>`;
}

function articleCard(article) {
  const imageMap = {
    'the-story-behind-the-name-ileri': 'assets/images/hero-lifestyle.jpg',
    'how-to-choose-the-right-scrub-fit': 'assets/images/scrub-signature-burgundy.jpg',
    'designing-everyday-essentials-for-healthcare': 'assets/images/accessory-sanitiser-carrier.jpg',
  };
  return `
    <article class="editorial-card">
      <a class="editorial-image" href="${route('article', { slug: article.slug })}" aria-label="Read ${escapeHTML(article.title)}">
        <img src="${imageMap[article.slug]}" alt="" loading="lazy" decoding="async" width="800" height="540">
      </a>
      <div class="eyebrow">${escapeHTML(article.category)}</div>
      <h3><a href="${route('article', { slug: article.slug })}">${escapeHTML(article.title)}</a></h3>
      <p>${escapeHTML(article.excerpt)}</p>
      <a class="text-link" href="${route('article', { slug: article.slug })}">Read the story ${icon('arrow')}</a>
    </article>`;
}

function renderHome() {
  setPageMeta('Designed to move with you', 'Explore ILERI’s pre-launch edit of premium healthcare workwear and everyday essentials.');
  setStructuredData({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'ILERI',
    url: 'https://ilericollective.com/',
    logo: 'https://ilericollective.com/assets/favicon.svg',
    email: CONTACT_EMAIL,
  });
  app.innerHTML = `
    <div class="page home-page">
      <section class="hero">
        <img class="hero-media" src="assets/images/hero-lifestyle.jpg" alt="Healthcare professional in burgundy scrubs holding an ILERI thermos concept" fetchpriority="high" decoding="async" width="1672" height="941">
        <div class="hero-overlay"></div>
        <div class="container hero-content">
          <div class="eyebrow">The first release · In development</div>
          <h1>Five considered colourways.<br>One thoughtfully designed collection.</h1>
          <p>Premium workwear and everyday essentials shaped around the realities of long shifts—and the people who work them.</p>
          <div class="button-row">
            <a class="btn btn-light" href="${route('shop')}">Explore the launch edit</a>
            <a class="btn btn-ghost-light" href="${route('page', { slug: 'about' })}">Discover ILERI</a>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="container">
          <div class="section-heading">
            <div>
              <div class="eyebrow">The colour story</div>
              <h2>Calm colour, purposeful form.</h2>
            </div>
            <p>Explore the planned palette. Final shades will be confirmed against production garments before launch.</p>
          </div>
          <div class="colour-grid">
            ${COLOURS.map((colour) => `
              <a class="colour-card" href="${route('shop', { colour: colour.key })}" style="--colour:${colour.hex}">
                <span class="colour-field"><svg aria-hidden="true"><use href="#icon-mark"/></svg></span>
                <strong>${escapeHTML(colour.name)}</strong>
                <span>Explore planned pieces</span>
              </a>`).join('')}
          </div>
        </div>
      </section>

      <section class="section section-tint">
        <div class="container">
          <div class="section-heading">
            <div>
              <div class="eyebrow">The launch edit</div>
              <h2>Workwear concepts, ready to explore.</h2>
            </div>
            <p>Choose planned colours and sizes, save favourites and build a launch bag. No stock is reserved and no payment is taken.</p>
          </div>
          <div class="product-grid">${PRODUCTS.map(productCard).join('')}</div>
          <div class="section-action"><a class="btn btn-primary" href="${route('shop')}">View the full edit</a></div>
        </div>
      </section>

      <section class="section">
        <div class="container">
          <div class="section-heading narrow">
            <div>
              <div class="eyebrow">Thoughtful in every detail</div>
              <h2>Designed around a working day.</h2>
            </div>
          </div>
          <div class="feature-grid">
            <article><span class="feature-number">01</span><h3>Movement first</h3><p>Fit directions are being developed around reaching, bending, walking and the repeated movement of a shift.</p></article>
            <article><span class="feature-number">02</span><h3>Useful storage</h3><p>Pocket placement is considered around the essentials healthcare professionals carry most often.</p></article>
            <article><span class="feature-number">03</span><h3>Quiet identity</h3><p>The ILERI double-bar signature is intended to stay subtle, tonal and recognisable.</p></article>
          </div>
          <div class="notice">All garment construction, material and performance details remain concept direction until production testing is complete.</div>
        </div>
      </section>

      <section class="section section-tint">
        <div class="container">
          <div class="section-heading">
            <div><div class="eyebrow">Beyond the uniform</div><h2>Everyday essentials, considered with the same care.</h2></div>
            <p>Hydration and carry concepts that extend the visual language of the collection.</p>
          </div>
          <div class="accessory-grid">${ACCESSORIES.map(accessoryCard).join('')}</div>
        </div>
      </section>

      <section class="story-band">
        <div class="container story-band-inner">
          <div>
            <div class="eyebrow">A promise, made wearable</div>
            <h2>ILERI draws on the Yoruba idea of promise and assurance.</h2>
          </div>
          <div>
            <p>The ambition is simple: create workwear and essentials with the same care healthcare professionals give to everyone else.</p>
            <a class="btn btn-light" href="${route('page', { slug: 'about' })}">Read our story</a>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="container">
          <div class="section-heading">
            <div><div class="eyebrow">The journal</div><h2>Behind the design.</h2></div>
            <a class="text-link" href="${route('journal')}">View all stories ${icon('arrow')}</a>
          </div>
          <div class="editorial-grid">${JOURNAL_ARTICLES.map(articleCard).join('')}</div>
        </div>
      </section>

      <section class="section teams-section">
        <div class="container teams-grid">
          <div>
            <div class="eyebrow">For healthcare teams</div>
            <h2>Help shape what comes next.</h2>
            <p>Hospitals, clinics and healthcare organisations can share their interest in team wear, fit support and future embroidery options.</p>
          </div>
          <form class="form-grid surface-card" data-email-form data-subject="ILERI healthcare team enquiry">
            <div class="field"><label for="homeOrg">Organisation</label><input id="homeOrg" name="Organisation" required autocomplete="organization"></div>
            <div class="field"><label for="homeWorkEmail">Work email</label><input id="homeWorkEmail" name="Work email" type="email" required autocomplete="email"></div>
            <div class="field full"><label for="homeTeamNote">Team size and general needs</label><textarea id="homeTeamNote" name="Team size and needs" rows="4"></textarea></div>
            <div class="full"><button class="btn btn-primary" type="submit">Prepare team enquiry</button><p class="form-note">Opens your email app. Nothing is sent automatically.</p></div>
          </form>
        </div>
      </section>

      <section class="newsletter">
        <div class="container newsletter-inner">
          <div><div class="eyebrow">Stay close</div><h2>Join the launch conversation.</h2><p>Prepare an email to register your interest in collection news and early access.</p></div>
          <form data-email-form data-subject="Join the ILERI launch list" class="newsletter-form">
            <label class="visually-hidden" for="homeLaunchEmail">Email address</label>
            <input id="homeLaunchEmail" name="Email address" type="email" required placeholder="you@example.com" autocomplete="email">
            <button class="btn btn-light" type="submit">Prepare email</button>
          </form>
        </div>
      </section>
    </div>`;
}

function renderShop() {
  const category = params.get('category') || 'scrubs';
  const requestedColour = params.get('colour');
  const initialColour = COLOURS.some((colour) => colour.key === requestedColour) ? requestedColour : 'all';
  setPageMeta('The launch edit', 'Browse ILERI’s planned collection of healthcare workwear and everyday essentials.');
  setStructuredData({
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'ILERI launch edit',
    url: window.location.href,
  });

  if (category === 'essentials') {
    app.innerHTML = `
      <div class="page">
        ${pageHero('Everyday essentials', 'Hydration and carry concepts extending the ILERI design language.', 'Beyond the uniform')}
        <section class="section section-tint"><div class="container"><div class="notice">These accessories are design concepts. Final materials, performance, prices and availability are not yet confirmed.</div><div class="accessory-grid">${ACCESSORIES.map(accessoryCard).join('')}</div></div></section>
      </div>`;
    return;
  }

  app.innerHTML = `
    <div class="page">
      ${pageHero('The launch edit', 'Explore planned fits, colourways and sizes before the first ILERI collection opens for sale.', 'Premium healthcare workwear')}
      <section class="section section-tint">
        <div class="container">
          <form class="filters" id="shopFilters" aria-label="Filter the collection">
            <div class="filter-row">
              <div class="field"><label for="colourFilter">Planned colour</label><select id="colourFilter" name="colour"><option value="all">All colours</option>${COLOURS.map((colour) => `<option value="${colour.key}" ${initialColour === colour.key ? 'selected' : ''}>${escapeHTML(colour.name)}</option>`).join('')}</select></div>
              <div class="field"><label for="fitFilter">Fit direction</label><select id="fitFilter" name="fit"><option value="all">All fits</option>${[...new Set(PRODUCTS.map((product) => product.fit.name.toLowerCase()))].map((fit) => `<option value="${fit}">${escapeHTML(fit[0].toUpperCase() + fit.slice(1))}</option>`).join('')}</select></div>
              <a class="chip" href="${route('shop', { category: 'essentials' })}">Everyday essentials</a>
            </div>
            <p id="filterCount" aria-live="polite"></p>
          </form>
          <div class="product-grid" id="shopGrid">${PRODUCTS.map(productCard).join('')}</div>
          <div class="notice">Planned colours and prices are indicative. Campaign images show one colour per concept and do not change when filtering.</div>
        </div>
      </section>
    </div>`;
  bindShopFilters(initialColour);
}

function pageHero(title, intro, eyebrow = '') {
  return `
    <section class="page-hero">
      <div class="container">
        ${eyebrow ? `<div class="eyebrow">${escapeHTML(eyebrow)}</div>` : ''}
        <h1>${escapeHTML(title)}</h1>
        <p>${escapeHTML(intro)}</p>
      </div>
    </section>`;
}

function bindShopFilters(initialColour = 'all') {
  const form = document.getElementById('shopFilters');
  if (!form) return;
  const apply = () => {
    const colour = form.elements.colour.value;
    const fit = form.elements.fit.value;
    let visible = 0;
    document.querySelectorAll('[data-product-card]').forEach((card) => {
      const matchesColour = colour === 'all' || card.dataset.colours.split(' ').includes(colour);
      const matchesFit = fit === 'all' || card.dataset.fit === fit;
      card.hidden = !(matchesColour && matchesFit);
      if (!card.hidden) visible += 1;
    });
    document.getElementById('filterCount').textContent = `${visible} concept${visible === 1 ? '' : 's'} shown`;
    const next = new URL(window.location.href);
    if (colour === 'all') next.searchParams.delete('colour'); else next.searchParams.set('colour', colour);
    if (fit === 'all') next.searchParams.delete('fit'); else next.searchParams.set('fit', fit);
    window.history.replaceState({}, '', next);
  };
  const requestedFit = params.get('fit');
  if ([...form.elements.fit.options].some((option) => option.value === requestedFit)) form.elements.fit.value = requestedFit;
  form.addEventListener('change', apply);
  if (initialColour !== 'all') form.elements.colour.value = initialColour;
  apply();
}

function renderProduct() {
  const product = getProductByHandle(params.get('handle'));
  if (!product) return renderNotFound();
  const defaultColour = product.images?.[0]?.colour || product.colours[0];
  const wishlisted = store.isWishlisted(product.id);
  setPageMeta(product.name, product.description);
  setStructuredData({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: `https://ilericollective.com/${product.image}`,
    brand: { '@type': 'Brand', name: 'ILERI' },
    category: 'Healthcare workwear concept',
  });
  app.innerHTML = `
    <div class="page">
      <nav class="container breadcrumbs" aria-label="Breadcrumb"><a href="${route('home')}">Home</a><span>/</span><a href="${route('shop')}">Launch edit</a><span>/</span><span aria-current="page">${escapeHTML(product.name)}</span></nav>
      <section class="section product-section">
        <div class="container product-layout">
          <div class="product-gallery">
            <img src="${escapeHTML(product.image)}" alt="${escapeHTML(product.images?.[0]?.alt || product.name)}" width="1254" height="1254">
            <p class="image-note">AI-generated campaign concept shown in ${escapeHTML(colourName(defaultColour))}. Final product photography and shades will be published before ordering opens.</p>
          </div>
          <div class="product-detail">
            <div class="eyebrow">Pre-launch garment concept</div>
            <h1>${escapeHTML(product.name)}</h1>
            <div class="product-price">Planned price ${formatMoney(product.price, product.currency)}</div>
            <p class="product-description">${escapeHTML(product.description)}</p>
            <form id="productOptions">
              <fieldset class="option-group">
                <legend>Planned colour: <strong id="selectedColourLabel">${escapeHTML(colourName(defaultColour))}</strong></legend>
                <div class="swatch-options">
                  ${product.colours.map((key) => {
                    const colour = getColourByKey(key);
                    return `<label class="swatch-option" style="--swatch:${colour.hex}"><input type="radio" name="colour" value="${colour.key}" ${colour.key === defaultColour ? 'checked' : ''}><span aria-hidden="true"></span><span class="visually-hidden">${escapeHTML(colour.name)}</span></label>`;
                  }).join('')}
                </div>
              </fieldset>
              <fieldset class="option-group">
                <legend>Planned size</legend>
                <div class="size-grid">${product.sizes.map((size, index) => `<label><input type="radio" name="size" value="${size}" ${index === 1 ? 'checked' : ''}><span>${size}</span></label>`).join('')}</div>
                <a class="text-link small-link" href="${route('page', { slug: 'size-guide' })}">How to measure ${icon('arrow')}</a>
              </fieldset>
              <div class="option-group"><label for="productQuantity">Quantity</label><select id="productQuantity" name="quantity">${[1, 2, 3, 4, 5, 6].map((quantity) => `<option>${quantity}</option>`).join('')}</select></div>
              <div class="notice compact">Adding this concept saves it to your launch bag on this device. It does not reserve stock or create an order.</div>
              <div class="product-actions">
                <button class="btn btn-primary" type="submit">Add to launch bag</button>
                <button class="btn btn-secondary ${wishlisted ? 'active' : ''}" type="button" data-wishlist="${escapeHTML(product.id)}" aria-pressed="${wishlisted}">${wishlisted ? 'Saved to wishlist' : 'Save to wishlist'}</button>
              </div>
            </form>
            <div class="product-accordions">
              <details open><summary>Fit direction</summary><p><strong>${escapeHTML(product.fit.name)}:</strong> ${escapeHTML(product.fit.summary)}</p></details>
              <details><summary>Material direction</summary><p>${escapeHTML(product.material.summary)}</p><p>${escapeHTML(product.material.composition)}</p></details>
              <details><summary>Concept features</summary><ul>${product.features.map((feature) => `<li><strong>${escapeHTML(feature.name)}</strong><span>${escapeHTML(feature.detail)}</span></li>`).join('')}</ul></details>
              <details><summary>Provisional care</summary><p>${escapeHTML(product.care.summary)}</p><ul>${product.care.instructions.map((instruction) => `<li>${escapeHTML(instruction)}</li>`).join('')}</ul></details>
            </div>
          </div>
        </div>
      </section>
      <section class="section section-tint"><div class="container"><div class="section-heading"><div><div class="eyebrow">Continue exploring</div><h2>Other planned pieces.</h2></div></div><div class="product-grid related-grid">${PRODUCTS.filter((item) => item.id !== product.id).slice(0, 3).map(productCard).join('')}</div></div></section>
    </div>`;

  document.getElementById('productOptions').addEventListener('change', (event) => {
    if (event.target.name === 'colour') document.getElementById('selectedColourLabel').textContent = colourName(event.target.value);
  });
  document.getElementById('productOptions').addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    try {
      store.addToCart({ productId: product.id, colour: data.get('colour'), size: data.get('size'), quantity: Number(data.get('quantity')) });
      showToast(`${product.name} was added to your launch bag.`);
      document.getElementById('cartDrawer').showModal();
    } catch (error) {
      showToast(error.message || 'That selection could not be saved.');
    }
  });
}

function renderAccessory() {
  const accessory = getAccessoryByHandle(params.get('handle'));
  if (!accessory) return renderNotFound();
  setPageMeta(accessory.name, accessory.description);
  setStructuredData({ '@context': 'https://schema.org', '@type': 'Product', name: accessory.name, description: accessory.description, image: `https://ilericollective.com/${accessory.image}`, brand: { '@type': 'Brand', name: 'ILERI' } });
  app.innerHTML = `
    <div class="page">
      <nav class="container breadcrumbs" aria-label="Breadcrumb"><a href="${route('home')}">Home</a><span>/</span><a href="${route('shop', { category: 'essentials' })}">Everyday essentials</a><span>/</span><span aria-current="page">${escapeHTML(accessory.name)}</span></nav>
      <section class="section product-section"><div class="container product-layout">
        <div class="product-gallery"><img src="${escapeHTML(accessory.image)}" alt="Concept image of ${escapeHTML(accessory.name)}" width="1254" height="1254"><p class="image-note">AI-generated industrial-design concept. It is not a photograph of a manufactured product.</p></div>
        <div class="product-detail"><div class="eyebrow">Everyday essential · Coming later</div><h1>${escapeHTML(accessory.name)}</h1><p class="product-description">${escapeHTML(accessory.description)}</p><div class="notice">${escapeHTML(accessory.notice)}</div><div class="product-accordions"><details open><summary>Concept direction</summary><ul>${accessory.conceptDetails.map((detail) => `<li>${escapeHTML(detail)}</li>`).join('')}</ul></details></div><a class="btn btn-primary" href="mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`Interest in ${accessory.name}`)}">Email your interest</a><p class="form-note">Opens your email app. Nothing is sent automatically.</p></div>
      </div></section>
    </div>`;
}

function cartItemMarkup(item, compact = false) {
  const product = item.product;
  if (!product) return '';
  return `
    <article class="cart-item ${compact ? 'compact' : ''}">
      <a class="cart-item-image" href="${route('product', { handle: product.handle })}" aria-label="View ${escapeHTML(product.name)}"><img src="${escapeHTML(product.image)}" alt="" loading="lazy" width="240" height="240"></a>
      <div class="cart-item-copy">
        <h3><a href="${route('product', { handle: product.handle })}">${escapeHTML(product.name)}</a></h3>
        <p>${escapeHTML(colourName(item.colour))} · Size ${escapeHTML(item.size)}</p>
        <p>${formatMoney(item.lineTotal, product.currency)}</p>
        ${compact ? `<p>Quantity ${item.quantity}</p>` : `<div class="cart-item-controls"><label>Quantity <select data-cart-quantity="${escapeHTML(item.key)}">${Array.from({ length: Math.max(8, item.quantity) }, (_, index) => index + 1).map((quantity) => `<option ${quantity === item.quantity ? 'selected' : ''}>${quantity}</option>`).join('')}</select></label></div>`}
        <button class="text-button" type="button" data-remove-cart="${escapeHTML(item.key)}">Remove</button>
      </div>
    </article>`;
}

function renderCart() {
  setPageMeta('Your launch bag', 'Review the ILERI concepts saved to this browser for launch.');
  setStructuredData({ '@context': 'https://schema.org', '@type': 'WebPage', name: 'ILERI launch bag' });
  const items = store.cartItems;
  app.innerHTML = `
    <div class="page">
      ${pageHero('Your launch bag', 'Review planned colours, sizes and indicative prices. Nothing here reserves stock or creates an order.', 'Saved on this device')}
      <section class="section section-tint"><div class="container">
        ${items.length ? `<div class="cart-page"><div class="cart-list">${items.map((item) => cartItemMarkup(item)).join('')}</div><aside class="summary-card"><div class="eyebrow">Indicative summary</div><h2>${store.cartCount} item${store.cartCount === 1 ? '' : 's'}</h2><div class="summary-line"><span>Planned subtotal</span><strong>${store.totals.formattedSubtotal}</strong></div><p>Delivery, tax, stock and final prices are not calculated in this pre-launch preview.</p><a class="btn btn-primary full-button" href="${route('checkout')}">Prepare launch enquiry</a><button class="text-button" type="button" data-clear-cart>Clear launch bag</button></aside></div>` : emptyState('Your launch bag is empty.', 'Explore the collection, choose a planned colour and size, and save a concept here.', 'Explore the edit', route('shop'))}
      </div></section>
    </div>`;
}

function renderCheckout() {
  const items = store.cartItems;
  setPageMeta('Prepare a launch enquiry', 'Prepare an email about the ILERI concepts saved in your launch bag.');
  if (!items.length) return renderCart();
  app.innerHTML = `
    <div class="page">
      ${pageHero('Prepare a launch enquiry', 'This is not checkout. Review your saved concepts, then prepare an email in your own mail app.', 'No payment · No reservation')}
      <section class="section section-tint"><div class="container checkout-grid">
        <form class="form-grid surface-card" data-email-form data-subject="ILERI launch bag enquiry" data-include-cart>
          <div class="field"><label for="enquiryName">Name</label><input id="enquiryName" name="Name" required autocomplete="name"></div>
          <div class="field"><label for="enquiryEmail">Email</label><input id="enquiryEmail" name="Email" type="email" required autocomplete="email"></div>
          <div class="field full"><label for="enquiryNote">What would you like to know?</label><textarea id="enquiryNote" name="Question" rows="5" placeholder="For example: launch timing, fit or team interest"></textarea></div>
          <label class="check-field full"><input type="checkbox" required name="Confirmation" value="I understand this is an enquiry, not an order."><span>I understand this prepares an email enquiry only. It does not place an order, reserve stock or take payment.</span></label>
          <div class="full"><button class="btn btn-primary" type="submit">Open email draft</button><p class="form-note">Your browser will ask to open your default email application. Review the draft before choosing whether to send it.</p></div>
        </form>
        <aside class="summary-card"><div class="eyebrow">Your saved edit</div>${items.map((item) => cartItemMarkup(item, true)).join('')}<div class="summary-line"><span>Planned subtotal</span><strong>${store.totals.formattedSubtotal}</strong></div></aside>
      </div></section>
    </div>`;
}

function renderWishlist() {
  const products = store.wishlistProducts;
  setPageMeta('Your wishlist', 'Review the ILERI concepts saved to your wishlist on this device.');
  setStructuredData({ '@context': 'https://schema.org', '@type': 'WebPage', name: 'ILERI wishlist' });
  app.innerHTML = `
    <div class="page">
      ${pageHero('Your wishlist', 'Concepts you have saved on this browser. Wishlist selections do not reserve stock.', 'Saved on this device')}
      <section class="section section-tint"><div class="container">${products.length ? `<div class="product-grid">${products.map(productCard).join('')}</div>` : emptyState('Your wishlist is empty.', 'Save a concept to compare planned fits and colours here.', 'Explore the edit', route('shop'))}</div></section>
    </div>`;
}

function emptyState(title, text, actionLabel, href) {
  return `<div class="empty-state"><svg aria-hidden="true"><use href="#icon-mark"/></svg><h2>${escapeHTML(title)}</h2><p>${escapeHTML(text)}</p><a class="btn btn-primary" href="${href}">${escapeHTML(actionLabel)}</a></div>`;
}

function renderJournal() {
  setPageMeta('The journal', 'Stories about the ILERI name, scrub fit and the design of everyday healthcare essentials.');
  setStructuredData({ '@context': 'https://schema.org', '@type': 'Blog', name: 'The ILERI Journal', url: window.location.href });
  app.innerHTML = `<div class="page">${pageHero('Behind the design.', 'Notes on purpose, fit and the thinking behind everyday healthcare essentials.', 'The journal')}<section class="section section-tint"><div class="container"><div class="editorial-grid">${JOURNAL_ARTICLES.map(articleCard).join('')}</div></div></section></div>`;
}

function renderArticle() {
  const article = JOURNAL_ARTICLES.find((item) => item.slug === params.get('slug'));
  if (!article) return renderNotFound();
  setPageMeta(article.title, article.excerpt);
  setStructuredData({ '@context': 'https://schema.org', '@type': 'Article', headline: article.title, description: article.excerpt, author: { '@type': 'Organization', name: 'ILERI' }, publisher: { '@type': 'Organization', name: 'ILERI' }, mainEntityOfPage: window.location.href });
  app.innerHTML = `
    <div class="page">
      <article class="content-page article-page">
        <header class="page-hero"><div class="container prose"><div class="eyebrow">${escapeHTML(article.category)}</div><h1>${escapeHTML(article.title)}</h1><p>${escapeHTML(article.excerpt)}</p></div></header>
        <div class="container prose prose-body">${article.sections.map(contentSection).join('')}<div class="article-footer"><a class="btn btn-secondary" href="${route('journal')}">Back to the journal</a></div></div>
      </article>
    </div>`;
}

function contentSection(section, faq = false) {
  const body = `${(section.paragraphs || []).map((paragraph) => `<p>${escapeHTML(paragraph)}</p>`).join('')}${section.bullets?.length ? `<ul>${section.bullets.map((bullet) => `<li>${escapeHTML(bullet)}</li>`).join('')}</ul>` : ''}`;
  if (faq) return `<details><summary>${escapeHTML(section.heading)}</summary><div>${body}</div></details>`;
  return `<section><h2>${escapeHTML(section.heading)}</h2>${body}</section>`;
}

function renderContentPage() {
  const page = CONTENT_PAGES.find((item) => item.slug === params.get('slug'));
  if (!page) return renderNotFound();
  const isFaq = page.slug === 'faq';
  setPageMeta(page.title.replace(/[.]$/, ''), page.intro);
  setStructuredData({
    '@context': 'https://schema.org',
    '@type': isFaq ? 'FAQPage' : 'WebPage',
    name: page.title,
    description: page.intro,
    url: window.location.href,
    ...(isFaq ? {
      mainEntity: page.sections.map((section) => ({
        '@type': 'Question',
        name: section.heading,
        acceptedAnswer: {
          '@type': 'Answer',
          text: [...(section.paragraphs || []), ...(section.bullets || [])].join(' '),
        },
      })),
    } : {}),
  });
  const contactForms = page.slug === 'contact' ? `
    <section><h2>Prepare an email enquiry</h2><form class="form-grid surface-card" data-email-form data-subject="ILERI website enquiry"><div class="field"><label for="contactName">Name</label><input id="contactName" name="Name" required autocomplete="name"></div><div class="field"><label for="contactEmail">Email</label><input id="contactEmail" name="Email" type="email" required autocomplete="email"></div><div class="field full"><label for="contactMessage">Message</label><textarea id="contactMessage" name="Message" rows="6" required></textarea></div><div class="full"><button class="btn btn-primary" type="submit">Open email draft</button><p class="form-note">Opens your email app. Nothing is sent automatically.</p></div></form></section>` : '';
  app.innerHTML = `
    <div class="page"><article class="content-page">
      <header class="page-hero"><div class="container prose"><div class="eyebrow">${escapeHTML(page.eyebrow)}</div><h1>${escapeHTML(page.title)}</h1><p>${escapeHTML(page.intro)}</p></div></header>
      <div class="container prose prose-body ${isFaq ? 'faq' : ''}">${page.sections.map((section) => contentSection(section, isFaq)).join('')}${contactForms}</div>
    </article></div>`;
}

function renderNotFound() {
  setPageMeta('Page not found', 'The requested ILERI page could not be found.');
  document.querySelector('meta[name="robots"]')?.setAttribute('content', 'noindex,follow');
  setStructuredData({ '@context': 'https://schema.org', '@type': 'WebPage', name: 'Page not found' });
  app.innerHTML = `<div class="page"><section class="section content-page"><div class="container prose"><div class="eyebrow">404</div><h1>This page has moved.</h1><p>Return to the collection and continue exploring.</p><a class="btn btn-primary" href="${route('home')}">Return home</a></div></section></div>`;
}

function renderView() {
  switch (view) {
    case 'home': renderHome(); break;
    case 'shop': renderShop(); break;
    case 'product': renderProduct(); break;
    case 'accessory': renderAccessory(); break;
    case 'cart': renderCart(); break;
    case 'checkout': renderCheckout(); break;
    case 'wishlist': renderWishlist(); break;
    case 'journal': renderJournal(); break;
    case 'article': renderArticle(); break;
    case 'page': renderContentPage(); break;
    default: renderNotFound();
  }
  app.focus({ preventScroll: true });
}

function updateBadges() {
  const cartBadge = document.getElementById('cartCount');
  const wishlistBadge = document.getElementById('wishlistCount');
  cartBadge.textContent = store.cartCount;
  cartBadge.hidden = store.cartCount === 0;
  wishlistBadge.textContent = store.wishlistIds.length;
  wishlistBadge.hidden = store.wishlistIds.length === 0;
}

function renderCartDrawer() {
  const items = store.cartItems;
  const itemContainer = document.getElementById('cartDrawerItems');
  const footer = document.getElementById('cartDrawerFooter');
  if (!items.length) {
    itemContainer.innerHTML = `<div class="empty-state compact"><p>Your launch bag is empty.</p><a class="btn btn-primary" href="${route('shop')}">Explore the edit</a></div>`;
    footer.innerHTML = '';
    return;
  }
  itemContainer.innerHTML = items.map((item) => cartItemMarkup(item, true)).join('');
  footer.innerHTML = `<div class="summary-line"><span>Planned subtotal</span><strong>${store.totals.formattedSubtotal}</strong></div><div class="drawer-actions"><a class="btn btn-secondary" href="${route('cart')}">Review bag</a><a class="btn btn-primary" href="${route('checkout')}">Prepare enquiry</a></div>`;
}

function updateChrome() {
  updateBadges();
  renderCartDrawer();
}

function searchIndex() {
  return [
    ...PRODUCTS.map((product) => ({ title: product.name, meta: `${product.fit.name} fit · Product concept`, text: `${product.description} ${product.colours.join(' ')}`, href: route('product', { handle: product.handle }) })),
    ...ACCESSORIES.map((accessory) => ({ title: accessory.name, meta: 'Everyday essential · Coming later', text: accessory.description, href: route('accessory', { handle: accessory.handle }) })),
    ...JOURNAL_ARTICLES.map((article) => ({ title: article.title, meta: article.category, text: article.excerpt, href: route('article', { slug: article.slug }) })),
    ...CONTENT_PAGES.map((page) => ({ title: page.title, meta: page.eyebrow, text: page.intro, href: route('page', { slug: page.slug }) })),
  ];
}

function bindShell() {
  document.querySelectorAll('[data-open-dialog]').forEach((button) => {
    button.addEventListener('click', () => {
      const dialog = document.getElementById(button.dataset.openDialog);
      if (!dialog?.open) dialog?.showModal();
      if (dialog?.id === 'searchDialog') window.setTimeout(() => document.getElementById('siteSearch').focus(), 0);
    });
  });
  document.querySelectorAll('[data-close-dialog]').forEach((button) => button.addEventListener('click', () => button.closest('dialog')?.close()));
  document.querySelectorAll('dialog').forEach((dialog) => dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  }));

  const searchInput = document.getElementById('siteSearch');
  const results = document.getElementById('searchResults');
  searchInput.addEventListener('input', () => {
    const query = searchInput.value.trim().toLowerCase();
    if (!query) {
      results.innerHTML = '<p class="search-empty">Search products, fit guidance, care and the ILERI story.</p>';
      return;
    }
    const matches = searchIndex().filter((item) => `${item.title} ${item.meta} ${item.text}`.toLowerCase().includes(query)).slice(0, 10);
    results.innerHTML = matches.length ? matches.map((item) => `<a class="search-result" href="${item.href}"><span><strong>${escapeHTML(item.title)}</strong><small>${escapeHTML(item.meta)}</small></span>${icon('arrow')}</a>`).join('') : '<p class="search-empty">No matches yet. Try “scrub”, “size”, “care” or a colour.</p>';
  });
  searchInput.dispatchEvent(new Event('input'));
}

document.addEventListener('click', (event) => {
  const wishlistButton = event.target.closest('[data-wishlist]');
  if (wishlistButton) {
    const product = PRODUCTS.find((item) => item.id === wishlistButton.dataset.wishlist);
    if (!product) return;
    const saved = store.toggleWishlist(product.id);
    document.querySelectorAll(`[data-wishlist="${CSS.escape(product.id)}"]`).forEach((button) => {
      button.classList.toggle('active', saved);
      button.setAttribute('aria-pressed', saved);
      if (button.matches('.btn')) button.textContent = saved ? 'Saved to wishlist' : 'Save to wishlist';
      else button.setAttribute('aria-label', `${saved ? 'Remove' : 'Add'} ${product.name} ${saved ? 'from' : 'to'} wishlist`);
    });
    showToast(saved ? `${product.name} was saved to your wishlist.` : `${product.name} was removed from your wishlist.`);
    if (view === 'wishlist' && !saved) renderWishlist();
    return;
  }

  const removeButton = event.target.closest('[data-remove-cart]');
  if (removeButton) {
    store.removeCartItem(removeButton.dataset.removeCart);
    showToast('The item was removed from your launch bag.');
    if (view === 'cart' || view === 'checkout') renderView();
    return;
  }

  if (event.target.closest('[data-clear-cart]')) {
    store.clearCart();
    showToast('Your launch bag was cleared.');
    if (view === 'cart' || view === 'checkout') renderView();
  }
});

document.addEventListener('change', (event) => {
  const quantitySelect = event.target.closest('[data-cart-quantity]');
  if (!quantitySelect) return;
  store.updateCartItem(quantitySelect.dataset.cartQuantity, Number(quantitySelect.value));
  showToast('Quantity updated.');
  if (view === 'cart') renderCart();
});

document.addEventListener('submit', (event) => {
  const form = event.target.closest('[data-email-form]');
  if (!form) return;
  event.preventDefault();
  const data = new FormData(form);
  const lines = [...data.entries()].map(([label, value]) => `${label}: ${value}`);
  if (form.hasAttribute('data-include-cart')) {
    lines.push('', 'Saved launch bag:');
    store.cartItems.forEach((item) => lines.push(`- ${item.product.name} — ${colourName(item.colour)}, size ${item.size}, quantity ${item.quantity}, planned line price ${formatMoney(item.lineTotal, item.product.currency)}`));
    lines.push(`Planned subtotal: ${store.totals.formattedSubtotal}`, '', 'I understand that this is an enquiry only and does not reserve stock or place an order.');
  }
  const subject = form.dataset.subject || 'ILERI website enquiry';
  window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
  showToast('Your email app should open with a draft. Nothing has been sent automatically.');
});

store.subscribe(updateChrome);
bindShell();
renderView();
updateChrome();
