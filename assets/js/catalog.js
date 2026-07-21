/**
 * ILERI concept catalogue.
 *
 * Product specifications below are design-direction copy only. Fibre content,
 * performance, care instructions and final sizing must be confirmed against
 * production samples before the products are offered for sale.
 */

export const CATALOG_VERSION = 1;

export const CONCEPT_NOTICE =
  'Concept specification only. Final materials, measurements, performance and care guidance require production verification.';

export const SIZES = Object.freeze(['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL']);

export const COLOURS = deepFreeze([
  { key: 'ivory', name: 'Ivory', hex: '#F3EDE2' },
  { key: 'sage', name: 'Sage', hex: '#959781' },
  { key: 'navy', name: 'Navy', hex: '#182438' },
  { key: 'chocolate', name: 'Chocolate', hex: '#493426' },
  { key: 'burgundy', name: 'Burgundy', hex: '#651F31' },
]);

const ALL_COLOURS = Object.freeze(COLOURS.map(({ key }) => key));

export const PRODUCTS = deepFreeze([
  {
    id: 'scrub-signature-set',
    handle: 'signature-scrub-set',
    name: 'The Signature Scrub Set',
    price: 128,
    currency: 'GBP',
    status: 'concept',
    purchasable: false,
    image: 'assets/images/scrub-signature-burgundy.jpg',
    images: [
      {
        src: 'assets/images/scrub-signature-burgundy.jpg',
        alt: 'Concept image of the Signature Scrub Set in Burgundy',
        colour: 'burgundy',
      },
    ],
    description:
      'A coordinated scrub top and trouser concept with a composed, tailored line and practical everyday proportions. Designed as the defining expression of the ILERI uniform direction.',
    sizes: SIZES,
    colours: ALL_COLOURS,
    fit: {
      name: 'Tailored',
      summary:
        'Concept fit follows the body cleanly without feeling restrictive, with room intended for repeated movement through a shift.',
      status: 'concept',
    },
    material: {
      summary:
        'Proposed soft-touch stretch workwear fabric with a smooth, matte face. Final fibre composition and performance testing are pending.',
      composition: 'To be confirmed after production sampling.',
      status: 'concept',
    },
    care: {
      summary: 'Provisional care direction only; the final garment label will govern.',
      instructions: ['Machine wash with similar colours', 'Wash cool', 'Line dry where possible'],
      status: 'concept',
    },
    features: [
      {
        name: 'Coordinated set',
        detail: 'A unified top-and-trouser silhouette intended to simplify shift dressing.',
        status: 'concept',
      },
      {
        name: 'Considered storage',
        detail: 'Pocket placement is being developed around everyday clinical essentials.',
        status: 'concept',
      },
      {
        name: 'Double-bar signature',
        detail: 'A restrained brand detail intended for the chest and pocket area.',
        status: 'concept',
      },
    ],
    notice: CONCEPT_NOTICE,
  },
  {
    id: 'scrub-essential-v-neck',
    handle: 'essential-v-neck-top',
    name: 'The Essential V-Neck Top',
    price: 58,
    currency: 'GBP',
    status: 'concept',
    purchasable: false,
    image: 'assets/images/scrub-essential-sage.jpg',
    images: [
      {
        src: 'assets/images/scrub-essential-sage.jpg',
        alt: 'Concept image of the Essential V-Neck Top in Sage',
        colour: 'sage',
      },
    ],
    description:
      'A clean V-neck scrub-top concept intended as an easy, dependable foundation for daily clinical wear, with restrained detailing and an unfussy profile.',
    sizes: SIZES,
    colours: ALL_COLOURS,
    fit: {
      name: 'Regular',
      summary:
        'Concept fit is straight and easy through the body, with practical ease intended at the shoulder and sleeve.',
      status: 'concept',
    },
    material: {
      summary:
        'Proposed breathable stretch workwear fabric with a soft hand and low-sheen finish. Final composition and claims are pending testing.',
      composition: 'To be confirmed after production sampling.',
      status: 'concept',
    },
    care: {
      summary: 'Provisional care direction only; the final garment label will govern.',
      instructions: ['Machine wash with similar colours', 'Wash cool', 'Do not use fabric softener unless approved'],
      status: 'concept',
    },
    features: [
      {
        name: 'Clean V-neck',
        detail: 'A modest neckline concept designed for layering and repeat wear.',
        status: 'concept',
      },
      {
        name: 'Everyday pockets',
        detail: 'Storage positions are being evaluated with healthcare-professional feedback.',
        status: 'concept',
      },
      {
        name: 'Quiet branding',
        detail: 'The double-bar detail is intended to remain subtle and tonal.',
        status: 'concept',
      },
    ],
    notice: CONCEPT_NOTICE,
  },
  {
    id: 'scrub-performance-jogger',
    handle: 'performance-jogger',
    name: 'The Performance Jogger',
    price: 64,
    currency: 'GBP',
    status: 'concept',
    purchasable: false,
    image: 'assets/images/scrub-performance-navy.jpg',
    images: [
      {
        src: 'assets/images/scrub-performance-navy.jpg',
        alt: 'Concept image of the Performance Jogger in Navy',
        colour: 'navy',
      },
    ],
    description:
      'A streamlined scrub-jogger concept balancing an athletic outline with a calm, professional finish for active shifts and everyday commuting.',
    sizes: SIZES,
    colours: ALL_COLOURS,
    fit: {
      name: 'Athletic',
      summary:
        'Concept fit is easy through the seat and thigh before tapering toward the ankle for a secure, movement-ready profile.',
      status: 'concept',
    },
    material: {
      summary:
        'Proposed flexible performance fabric with a matte finish. Stretch recovery, breathability and durability claims remain subject to testing.',
      composition: 'To be confirmed after production sampling.',
      status: 'concept',
    },
    care: {
      summary: 'Provisional care direction only; the final garment label will govern.',
      instructions: ['Machine wash with similar colours', 'Wash cool', 'Reshape while damp'],
      status: 'concept',
    },
    features: [
      {
        name: 'Tapered leg',
        detail: 'An athletic silhouette intended to stay neat while moving.',
        status: 'concept',
      },
      {
        name: 'Adjustable waist',
        detail: 'A drawcord-waist concept intended for flexible, secure wear.',
        status: 'concept',
      },
      {
        name: 'Practical storage',
        detail: 'Pocket configuration is being refined around frequently carried essentials.',
        status: 'concept',
      },
    ],
    notice: CONCEPT_NOTICE,
  },
  {
    id: 'scrub-tailored-trouser',
    handle: 'tailored-scrub-trouser',
    name: 'The Tailored Scrub Trouser',
    price: 68,
    currency: 'GBP',
    status: 'concept',
    purchasable: false,
    image: 'assets/images/scrub-tailored-chocolate.jpg',
    images: [
      {
        src: 'assets/images/scrub-tailored-chocolate.jpg',
        alt: 'Concept image of the Tailored Scrub Trouser in Chocolate',
        colour: 'chocolate',
      },
    ],
    description:
      'A refined scrub-trouser concept with a relaxed straight line, designed to feel composed across clinical work, travel and the hours around a shift.',
    sizes: SIZES,
    colours: ALL_COLOURS,
    fit: {
      name: 'Relaxed',
      summary:
        'Concept fit offers ease through the hip and thigh with a clean, gently tailored leg.',
      status: 'concept',
    },
    material: {
      summary:
        'Proposed structured stretch workwear fabric with a soft, matte surface. Final composition, opacity and wear testing are pending.',
      composition: 'To be confirmed after production sampling.',
      status: 'concept',
    },
    care: {
      summary: 'Provisional care direction only; the final garment label will govern.',
      instructions: ['Machine wash with similar colours', 'Wash cool', 'Line dry where possible'],
      status: 'concept',
    },
    features: [
      {
        name: 'Relaxed tailored line',
        detail: 'A straight-leg direction intended to balance ease with a polished finish.',
        status: 'concept',
      },
      {
        name: 'Flexible waistband',
        detail: 'A comfort-led waist construction is being developed for long wear.',
        status: 'concept',
      },
      {
        name: 'Discreet pockets',
        detail: 'Storage is intended to sit cleanly within the trouser silhouette.',
        status: 'concept',
      },
    ],
    notice: CONCEPT_NOTICE,
  },
]);

export const ACCESSORIES = deepFreeze([
  {
    id: 'accessory-signature-thermos',
    handle: 'signature-thermos',
    name: 'The Signature Thermos',
    status: 'coming-soon',
    purchasable: false,
    price: null,
    currency: 'GBP',
    image: 'assets/images/accessory-thermos.jpg',
    description: 'A 500ml double-wall thermos concept shaped around the ILERI double-bar design language.',
    conceptDetails: ['Proposed stainless-steel construction', 'Leak-resistant opening under development', 'Final thermal performance pending testing'],
    notice: CONCEPT_NOTICE,
  },
  {
    id: 'accessory-tritan-bottle',
    handle: 'tritan-water-bottle',
    name: 'Tritan Water Bottle',
    status: 'coming-soon',
    purchasable: false,
    price: null,
    currency: 'GBP',
    image: 'assets/images/accessory-tritan-bottle.jpg',
    description: 'A lightweight 750ml bottle concept with a carry strap and secure flip-straw lid direction.',
    conceptDetails: ['Proposed BPA-free Tritan body', 'Carry strap and lid lock under development', 'Final leak testing pending'],
    notice: CONCEPT_NOTICE,
  },
  {
    id: 'accessory-sanitiser-carrier',
    handle: 'sanitiser-carrier',
    name: 'Sanitiser Carrier',
    status: 'coming-soon',
    purchasable: false,
    price: null,
    currency: 'GBP',
    image: 'assets/images/accessory-sanitiser-carrier.jpg',
    description: 'A compact 50ml sanitiser-carrier concept intended to clip securely to workwear or a lanyard.',
    conceptDetails: ['Refillable flask direction', 'Clip and closure under development', 'Final material and leak testing pending'],
    notice: CONCEPT_NOTICE,
  },
  {
    id: 'accessory-everyday-flask',
    handle: 'everyday-flask',
    name: 'The Everyday Flask',
    status: 'coming-soon',
    purchasable: false,
    price: null,
    currency: 'GBP',
    image: 'assets/images/accessory-everyday-flask.jpg',
    description: 'A compact 500ml matte-flask concept intended for simple, everyday hydration around a shift.',
    conceptDetails: ['Proposed stainless-steel body', 'Compact profile under development', 'Final insulation and leak testing pending'],
    notice: CONCEPT_NOTICE,
  },
]);

export function normaliseColour(value) {
  return String(value ?? '').trim().toLowerCase();
}

export function normaliseSize(value) {
  return String(value ?? '').trim().toUpperCase();
}

export function getColourByKey(key) {
  const normalisedKey = normaliseColour(key);
  return COLOURS.find((colour) => colour.key === normalisedKey) ?? null;
}

export function getProductById(id) {
  return PRODUCTS.find((product) => product.id === String(id ?? '')) ?? null;
}

export function getProductByHandle(handle) {
  return PRODUCTS.find((product) => product.handle === String(handle ?? '')) ?? null;
}

export function getAccessoryByHandle(handle) {
  return ACCESSORIES.find((accessory) => accessory.handle === String(handle ?? '')) ?? null;
}

export function getProductsByColour(colour) {
  const normalisedColour = normaliseColour(colour);
  return PRODUCTS.filter((product) => product.colours.includes(normalisedColour));
}

export function isValidProductOption(product, colour, size) {
  if (!product) return false;
  return (
    product.colours.includes(normaliseColour(colour)) &&
    product.sizes.includes(normaliseSize(size))
  );
}

export function formatMoney(amount, currency = 'GBP', locale = 'en-GB') {
  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount)) throw new TypeError('A finite monetary amount is required.');

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(numericAmount);
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.values(value).forEach(deepFreeze);
  return Object.freeze(value);
}
