import test from 'node:test';
import assert from 'node:assert/strict';

import {
  DEFAULT_STORAGE_KEY,
  MAX_CART_QUANTITY,
  STORE_VERSION,
  Store,
  createMemoryStorage,
  createVariantKey,
} from '../assets/js/store.js';

test('variant keys are stable and normalise colour and size', () => {
  assert.equal(
    createVariantKey('scrub-signature-set', ' Burgundy ', 'xs'),
    'scrub-signature-set::burgundy::XS',
  );
  assert.throws(() => createVariantKey('', 'burgundy', 'XS'), /required/);
});

test('adding the same variant merges quantity while other sizes remain distinct', () => {
  const store = makeStore();

  const first = store.addToCart({
    productId: 'scrub-signature-set',
    colour: 'Burgundy',
    size: 'xs',
  });
  store.addToCart({
    productId: 'scrub-signature-set',
    colour: 'burgundy',
    size: 'XS',
    quantity: 2,
  });
  store.addToCart({
    productId: 'scrub-signature-set',
    colour: 'burgundy',
    size: 'S',
  });

  assert.equal(first.key, 'scrub-signature-set::burgundy::XS');
  assert.equal(store.cartItems.length, 2);
  assert.equal(store.getCartItem(first.key).quantity, 3);
  assert.equal(store.cartCount, 4);
  assert.equal(store.cartSubtotal, 512);
  assert.deepEqual(store.totals, {
    count: 4,
    subtotal: 512,
    currency: 'GBP',
    formattedSubtotal: '£512.00',
  });
});

test('cart items can be updated, removed and cleared', () => {
  const store = makeStore();
  const item = store.addToCart({
    productId: 'scrub-essential-v-neck',
    colour: 'sage',
    size: 'M',
  });

  assert.equal(store.updateCartItem(item.key, 3), true);
  assert.equal(store.cartCount, 3);
  assert.equal(store.updateCartItem(item.key, 0), true);
  assert.equal(store.cartCount, 0);
  assert.equal(store.removeCartItem('missing'), false);

  store.addToCart({
    productId: 'scrub-performance-jogger',
    colour: 'navy',
    size: 'L',
  });
  assert.equal(store.clearCart(), true);
  assert.equal(store.clearCart(), false);
  assert.throws(() => store.updateCartItem('missing', -1), /integer from 0 to 99/);
});

test('cart and wishlist persist with an explicit schema version', () => {
  const storage = createMemoryStorage();
  const storageKey = 'test:persistence';
  const firstStore = new Store({ storage, storageKey });

  firstStore.addToCart({
    productId: 'scrub-tailored-trouser',
    colour: 'chocolate',
    size: '2XL',
    quantity: 2,
  });
  assert.equal(firstStore.toggleWishlist('scrub-tailored-trouser'), true);

  const persisted = JSON.parse(storage.getItem(storageKey));
  assert.equal(persisted.version, STORE_VERSION);
  assert.equal(persisted.cart.length, 1);
  assert.deepEqual(persisted.wishlist, ['scrub-tailored-trouser']);

  const restoredStore = new Store({ storage, storageKey });
  assert.equal(restoredStore.cartCount, 2);
  assert.equal(restoredStore.isWishlisted('scrub-tailored-trouser'), true);
  assert.equal(restoredStore.toggleWishlist('scrub-tailored-trouser'), false);
  assert.equal(restoredStore.clearWishlist(), false);
});

test('malformed JSON and incompatible versions recover to empty state', () => {
  const malformedStorage = createMemoryStorage({ [DEFAULT_STORAGE_KEY]: '{not-json' });
  const malformedStore = new Store({ storage: malformedStorage });

  assert.equal(malformedStore.cartCount, 0);
  assert.deepEqual(malformedStore.wishlistIds, []);
  assert.equal(malformedStorage.getItem(DEFAULT_STORAGE_KEY), null);

  const oldStorage = createMemoryStorage({
    [DEFAULT_STORAGE_KEY]: JSON.stringify({ version: STORE_VERSION + 1, cart: [], wishlist: [] }),
  });
  const versionedStore = new Store({ storage: oldStorage });

  assert.equal(versionedStore.cartCount, 0);
  assert.equal(oldStorage.getItem(DEFAULT_STORAGE_KEY), null);
});

test('invalid persisted items are discarded and duplicate variants are merged', () => {
  const storageKey = 'test:normalisation';
  const storage = createMemoryStorage({
    [storageKey]: JSON.stringify({
      version: STORE_VERSION,
      cart: [
        { productId: 'scrub-performance-jogger', colour: 'NAVY', size: 'm', quantity: 1 },
        { productId: 'scrub-performance-jogger', colour: 'navy', size: 'M', quantity: 2 },
        { productId: 'missing', colour: 'navy', size: 'M', quantity: 10 },
        { productId: 'scrub-performance-jogger', colour: 'navy', size: 'M', quantity: -1 },
      ],
      wishlist: ['scrub-performance-jogger', 'scrub-performance-jogger', 'missing'],
    }),
  });

  const store = new Store({ storage, storageKey });
  assert.equal(store.cartItems.length, 1);
  assert.equal(store.cartItems[0].quantity, 3);
  assert.deepEqual(store.wishlistIds, ['scrub-performance-jogger']);
});

test('cart quantities are capped to keep persisted and rendered state safe', () => {
  const storageKey = 'test:quantity-cap';
  const storage = createMemoryStorage({
    [storageKey]: JSON.stringify({
      version: STORE_VERSION,
      cart: [
        { productId: 'scrub-performance-jogger', colour: 'navy', size: 'M', quantity: 1_000_000 },
      ],
      wishlist: [],
    }),
  });
  const store = new Store({ storage, storageKey });

  assert.equal(store.cartCount, MAX_CART_QUANTITY);
  store.addToCart({ productId: 'scrub-performance-jogger', colour: 'navy', size: 'M' });
  assert.equal(store.cartCount, MAX_CART_QUANTITY);
  assert.throws(() => store.updateCartItem(store.cartItems[0].key, MAX_CART_QUANTITY + 1), /0 to 99/);
});

test('invalid products and options are rejected before state changes', () => {
  const store = makeStore();

  assert.throws(
    () => store.addToCart({ productId: 'missing', colour: 'navy', size: 'M' }),
    /Unknown product/,
  );
  assert.throws(
    () => store.addToCart({ productId: 'scrub-performance-jogger', colour: 'orange', size: 'M' }),
    /not configured/,
  );
  assert.throws(
    () => store.addToCart({ productId: 'scrub-performance-jogger', colour: 'navy', size: '4XL' }),
    /not configured/,
  );
  assert.throws(
    () => store.addToCart({ productId: 'scrub-performance-jogger', colour: 'navy', size: 'M', quantity: 0 }),
    /positive integer/,
  );
  assert.equal(store.cartCount, 0);
});

test('storage failures do not prevent in-memory shopping state', () => {
  const unavailableStorage = {
    getItem() {
      throw new Error('Storage unavailable');
    },
    setItem() {
      throw new Error('Storage unavailable');
    },
    removeItem() {
      throw new Error('Storage unavailable');
    },
  };
  const store = new Store({ storage: unavailableStorage });

  assert.doesNotThrow(() => {
    store.addToCart({
      productId: 'scrub-essential-v-neck',
      colour: 'ivory',
      size: 'XL',
    });
  });
  assert.equal(store.cartCount, 1);
  assert.ok(store.lastStorageError instanceof Error);
});

test('subscribers receive immutable-style snapshots and can unsubscribe', () => {
  const store = makeStore();
  const snapshots = [];
  const unsubscribe = store.subscribe((snapshot) => snapshots.push(snapshot));

  store.toggleWishlist('scrub-signature-set');
  unsubscribe();
  store.toggleWishlist('scrub-signature-set');

  assert.equal(snapshots.length, 1);
  assert.deepEqual(snapshots[0].wishlist, ['scrub-signature-set']);
});

function makeStore() {
  return new Store({ storage: createMemoryStorage(), storageKey: 'test:store' });
}
