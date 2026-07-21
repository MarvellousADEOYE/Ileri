# ILERI storefront

This repository publishes the pre-launch ILERI website at [ilericollective.com](https://ilericollective.com) through GitHub Pages.

## What works

- Responsive catalogue, product details, search, fit and colour filters
- Colour, size and quantity selection
- Bag and wishlist saved in the visitor's browser
- Pre-launch enquiry drafts that open the visitor's email app
- Journal, brand, care, sizing, FAQ, contact and policy pages
- Sitemap, robots file, social metadata and custom 404 page

The current site does **not** accept orders or payments. Product imagery, specifications, prices and availability are clearly presented as pre-launch concepts until they are confirmed.

## Local preview

From this folder, run:

```sh
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Tests

With Node.js installed, run:

```sh
npm test
```

## Publishing

GitHub Pages publishes the `main` branch. Pushing a tested commit to `main` updates the live site after the Pages deployment finishes.

Before promoting the site more widely:

1. Configure Cloudflare Email Routing for `hello@ilericollective.com` and verify the destination inbox.
2. Replace concept imagery and provisional specifications with confirmed production information.
3. Complete owner-specific legal and privacy details.
4. Connect Shopify or another secure commerce backend before accepting payments or orders.
