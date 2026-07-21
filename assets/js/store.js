import {
  PRODUCTS,
  formatMoney,
  normaliseColour,
  normaliseSize,
} from './catalog.js';

export const STORE_VERSION = 1;
export const DEFAULT_STORAGE_KEY = 'ileri:commerce-store';
export const MAX_CART_QUANTITY = 99;

/** Create the stable identity for one product/colour/size selection. */
export function createVariantKey(productId, colour, size) {
  const parts = [String(productId ?? '').trim(), normaliseColour(colour), normaliseSize(size)];
  if (parts.some((part) => !part)) {
    throw new TypeError('productId, colour and size are required to create a variant key.');
  }
  return parts.map(encodeURIComponent).join('::');
}

/** Minimal localStorage-compatible adapter, useful for tests and private sessions. */
export function createMemoryStorage(initialValues = {}) {
  const values = new Map(
    Object.entries(initialValues).map(([key, value]) => [String(key), String(value)]),
  );

  return {
    getItem(key) {
      const storageKey = String(key);
      return values.has(storageKey) ? values.get(storageKey) : null;
    },
    setItem(key, value) {
      values.set(String(key), String(value));
    },
    removeItem(key) {
      values.delete(String(key));
    },
    clear() {
      values.clear();
    },
  };
}

export class Store {
  constructor({
    storage,
    storageKey = DEFAULT_STORAGE_KEY,
    products = PRODUCTS,
    version = STORE_VERSION,
  } = {}) {
    if (!Array.isArray(products)) throw new TypeError('products must be an array.');
    if (!Number.isInteger(version) || version < 1) {
      throw new TypeError('version must be a positive integer.');
    }

    this.storage = resolveStorage(storage);
    this.storageKey = String(storageKey);
    this.version = version;
    this.lastStorageError = null;
    this.listeners = new Set();
    this.products = new Map(products.map((product) => [product.id, product]));
    this.currency = products[0]?.currency ?? 'GBP';
    this.state = this.loadState();
  }

  get cartItems() {
    return this.state.cart.map((item) => {
      const product = this.products.get(item.productId);
      const unitPrice = Number(product?.price ?? 0);
      return {
        ...item,
        product,
        unitPrice,
        lineTotal: roundMoney(unitPrice * item.quantity),
      };
    });
  }

  get wishlistIds() {
    return [...this.state.wishlist];
  }

  get wishlistProducts() {
    return this.state.wishlist
      .map((productId) => this.products.get(productId))
      .filter(Boolean);
  }

  get cartCount() {
    return this.state.cart.reduce((total, item) => total + item.quantity, 0);
  }

  get cartSubtotal() {
    return roundMoney(
      this.cartItems.reduce((total, item) => total + item.lineTotal, 0),
    );
  }

  get totals() {
    return {
      count: this.cartCount,
      subtotal: this.cartSubtotal,
      currency: this.currency,
      formattedSubtotal: formatMoney(this.cartSubtotal, this.currency),
    };
  }

  getSnapshot() {
    return {
      version: this.version,
      cart: this.state.cart.map((item) => ({ ...item })),
      wishlist: [...this.state.wishlist],
      totals: this.totals,
    };
  }

  getCartItem(variantKey) {
    const item = this.state.cart.find(({ key }) => key === variantKey);
    return item ? { ...item } : null;
  }

  addToCart({ productId, colour, size, quantity = 1 }) {
    const product = this.requireProduct(productId);
    const normalisedColour = normaliseColour(colour);
    const normalisedSize = normaliseSize(size);
    const normalisedQuantity = requirePositiveInteger(quantity, 'quantity');

    if (!product.colours?.includes(normalisedColour)) {
      throw new RangeError(`${product.name} is not configured in ${normalisedColour || 'that colour'}.`);
    }
    if (!product.sizes?.includes(normalisedSize)) {
      throw new RangeError(`${product.name} is not configured in size ${normalisedSize || '(missing)'}.`);
    }

    const key = createVariantKey(product.id, normalisedColour, normalisedSize);
    const cart = this.state.cart.map((item) => ({ ...item }));
    const existing = cart.find((item) => item.key === key);

    if (existing) existing.quantity = Math.min(MAX_CART_QUANTITY, existing.quantity + normalisedQuantity);
    else {
      cart.push({
        key,
        productId: product.id,
        colour: normalisedColour,
        size: normalisedSize,
        quantity: normalisedQuantity,
      });
    }

    this.commit({ ...this.state, cart });
    return this.getCartItem(key);
  }

  updateCartItem(variantKey, quantity) {
    const normalisedQuantity = Number(quantity);
    if (!Number.isInteger(normalisedQuantity) || normalisedQuantity < 0 || normalisedQuantity > MAX_CART_QUANTITY) {
      throw new TypeError(`quantity must be an integer from 0 to ${MAX_CART_QUANTITY}.`);
    }
    if (normalisedQuantity === 0) return this.removeCartItem(variantKey);

    const cart = this.state.cart.map((item) => ({ ...item }));
    const item = cart.find(({ key }) => key === variantKey);
    if (!item) return false;

    item.quantity = normalisedQuantity;
    this.commit({ ...this.state, cart });
    return true;
  }

  removeCartItem(variantKey) {
    const cart = this.state.cart.filter(({ key }) => key !== variantKey);
    if (cart.length === this.state.cart.length) return false;
    this.commit({ ...this.state, cart });
    return true;
  }

  clearCart() {
    if (this.state.cart.length === 0) return false;
    this.commit({ ...this.state, cart: [] });
    return true;
  }

  toggleWishlist(productId) {
    const product = this.requireProduct(productId);
    const wishlist = new Set(this.state.wishlist);
    const isNowWishlisted = !wishlist.has(product.id);

    if (isNowWishlisted) wishlist.add(product.id);
    else wishlist.delete(product.id);

    this.commit({ ...this.state, wishlist: [...wishlist] });
    return isNowWishlisted;
  }

  isWishlisted(productId) {
    return this.state.wishlist.includes(String(productId ?? ''));
  }

  clearWishlist() {
    if (this.state.wishlist.length === 0) return false;
    this.commit({ ...this.state, wishlist: [] });
    return true;
  }

  clearAll() {
    const hadState = this.state.cart.length > 0 || this.state.wishlist.length > 0;
    this.commit(this.emptyState());
    return hadState;
  }

  subscribe(listener) {
    if (typeof listener !== 'function') throw new TypeError('listener must be a function.');
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  requireProduct(productId) {
    const product = this.products.get(String(productId ?? ''));
    if (!product) throw new RangeError(`Unknown product: ${String(productId ?? '')}`);
    return product;
  }

  emptyState() {
    return { version: this.version, cart: [], wishlist: [] };
  }

  loadState() {
    let raw;
    try {
      raw = this.storage.getItem(this.storageKey);
    } catch (error) {
      this.lastStorageError = error;
      return this.emptyState();
    }

    if (raw === null) return this.emptyState();

    try {
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object' || parsed.version !== this.version) {
        this.discardPersistedState();
        return this.emptyState();
      }
      return this.normaliseState(parsed);
    } catch (error) {
      this.lastStorageError = error;
      this.discardPersistedState();
      return this.emptyState();
    }
  }

  normaliseState(candidate) {
    const cartByKey = new Map();

    if (Array.isArray(candidate.cart)) {
      candidate.cart.forEach((item) => {
        if (!item || typeof item !== 'object') return;
        const product = this.products.get(String(item.productId ?? ''));
        const colour = normaliseColour(item.colour);
        const size = normaliseSize(item.size);
        const quantity = Number(item.quantity);

        if (
          !product ||
          !product.colours?.includes(colour) ||
          !product.sizes?.includes(size) ||
          !Number.isInteger(quantity) ||
          quantity < 1
        ) return;

        const key = createVariantKey(product.id, colour, size);
        const existing = cartByKey.get(key);
        if (existing) existing.quantity = Math.min(MAX_CART_QUANTITY, existing.quantity + quantity);
        else cartByKey.set(key, { key, productId: product.id, colour, size, quantity: Math.min(MAX_CART_QUANTITY, quantity) });
      });
    }

    const wishlist = Array.isArray(candidate.wishlist)
      ? [...new Set(candidate.wishlist.map(String))].filter((id) => this.products.has(id))
      : [];

    return {
      version: this.version,
      cart: [...cartByKey.values()],
      wishlist,
    };
  }

  commit(nextState) {
    this.state = this.normaliseState({ ...nextState, version: this.version });
    const snapshot = this.getSnapshot();

    try {
      this.storage.setItem(this.storageKey, JSON.stringify(this.state));
      this.lastStorageError = null;
    } catch (error) {
      this.lastStorageError = error;
    }

    this.listeners.forEach((listener) => {
      try {
        listener(snapshot);
      } catch {
        // A consumer callback must not prevent persistence or other listeners.
      }
    });

    return snapshot;
  }

  discardPersistedState() {
    try {
      this.storage.removeItem(this.storageKey);
    } catch (error) {
      this.lastStorageError = error;
    }
  }
}

function resolveStorage(storage) {
  if (storage === null) return createMemoryStorage();
  if (storage !== undefined) {
    assertStorageAdapter(storage);
    return storage;
  }

  try {
    if (globalThis.localStorage) {
      assertStorageAdapter(globalThis.localStorage);
      return globalThis.localStorage;
    }
  } catch {
    // Access can fail in privacy-restricted or sandboxed browser contexts.
  }

  return createMemoryStorage();
}

function assertStorageAdapter(storage) {
  const methods = ['getItem', 'setItem', 'removeItem'];
  if (!storage || methods.some((method) => typeof storage[method] !== 'function')) {
    throw new TypeError('storage must implement getItem, setItem and removeItem.');
  }
}

function requirePositiveInteger(value, label) {
  const numericValue = Number(value);
  if (!Number.isInteger(numericValue) || numericValue < 1) {
    throw new TypeError(`${label} must be a positive integer.`);
  }
  return numericValue;
}

function roundMoney(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

export const store = new Store();
export const browserStore = store;
export default store;
