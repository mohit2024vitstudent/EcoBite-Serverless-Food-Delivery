'use strict';

const API_GATEWAY_URL = 'https://1r0cv3a963.execute-api.us-east-1.amazonaws.com/orders';
const CART_STORAGE_KEY = 'ecobite-demo-cart-v1';
const REVIEWS_STORAGE_KEY = 'ecobite-reviews-v1';
const TRACKING_STORAGE_KEY = 'ecobite-simulated-tracking-v1';
const DELIVERY_FEE = 40;
const SAMPLE_REVIEW_TEXT = 'Placeholder review text for the EcoBite demonstration only; it is not real customer feedback.';

const menuItems = [
  { id: 'paneer-bowl', name: 'Paneer Tikka Bowl', category: 'indian', label: 'Indian favorite', price: 249, rating: '4.9', emoji: '🍛', image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=700&q=80', vegetarian: true },
  { id: 'rainbow-salad', name: 'Rainbow Harvest Salad', category: 'vegetarian', label: 'Plant-powered', price: 219, rating: '4.8', emoji: '🥗', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=700&q=80', vegetarian: true },
  { id: 'masala-dosa', name: 'Crispy Masala Dosa', category: 'indian', label: 'South Indian', price: 179, rating: '4.9', emoji: '🥞', image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=700&q=80', vegetarian: true },
  { id: 'veggie-burger', name: 'Garden Veggie Burger', category: 'fast-food', label: 'Veggie goodness', price: 199, rating: '4.7', emoji: '🍔', image: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?auto=format&fit=crop&w=700&q=80', vegetarian: true },
  { id: 'margherita-pizza', name: 'Margherita Pizza', category: 'fast-food', label: 'Oven fresh', price: 279, rating: '4.8', emoji: '🍕', image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=700&q=80', vegetarian: true },
  { id: 'dal-khichdi', name: 'Comfort Dal Khichdi', category: 'indian', label: 'Feel-good food', price: 189, rating: '4.8', emoji: '🍲', image: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=700&q=80', vegetarian: true },
  { id: 'mango-cheesecake', name: 'Mango Cheesecake', category: 'desserts', label: 'Sweet treat', price: 149, rating: '4.9', emoji: '🍰', image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=700&q=80', vegetarian: true },
  { id: 'brownie', name: 'Fudgy Chocolate Brownie', category: 'desserts', label: 'Baked with love', price: 119, rating: '4.8', emoji: '🍫', image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=700&q=80', vegetarian: true }
];

const rescueItems = [
  { id: 'rescue-wrap', name: 'Roasted Veggie Wrap', category: 'vegetarian', label: 'Rescue pick · save 30%', price: 119, originalPrice: 169, rating: '4.8', emoji: '🌯', image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=700&q=80', vegetarian: true, rescue: true },
  { id: 'rescue-bowl', name: 'Seasonal Harvest Bowl', category: 'vegetarian', label: 'Rescue pick · save 25%', price: 149, originalPrice: 199, rating: '4.9', emoji: '🥙', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=700&q=80', vegetarian: true, rescue: true }
];
const produceItems = [
  { id: 'fresh-apple-kg', name: 'Apples', category: 'fruit', label: 'Seasonal pick', price: 180, unit: 'per kg', rating: '4.8', reviewCount: 24, emoji: '🍎', image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=700&q=80', available: true, productType: 'produce' },
  { id: 'fresh-banana-kg', name: 'Bananas', category: 'fruit', label: 'Everyday favorite', price: 60, unit: 'per kg', rating: '4.7', reviewCount: 19, emoji: '🍌', image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=700&q=80', available: true, productType: 'produce' },
  { id: 'fresh-orange-kg', name: 'Oranges', category: 'fruit', label: 'Seasonal pick', price: 120, unit: 'per kg', rating: '4.8', reviewCount: 16, emoji: '🍊', image: 'https://images.unsplash.com/photo-1547514701-42782101795e?auto=format&fit=crop&w=700&q=80', available: true, productType: 'produce' },
  { id: 'fresh-mango-kg', name: 'Mangoes', category: 'fruit', label: 'Seasonal pick', price: 160, unit: 'per kg', rating: '4.9', reviewCount: 31, emoji: '🥭', image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=700&q=80', available: true, productType: 'produce' },
  { id: 'fresh-tomato-kg', name: 'Tomatoes', category: 'vegetable', label: 'Market fresh', price: 40, unit: 'per kg', rating: '4.6', reviewCount: 14, emoji: '🍅', image: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=700&q=80', available: true, productType: 'produce' },
  { id: 'fresh-potato-kg', name: 'Potatoes', category: 'vegetable', label: 'Kitchen staple', price: 35, unit: 'per kg', rating: '4.7', reviewCount: 21, emoji: '🥔', image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=700&q=80', available: true, productType: 'produce' },
  { id: 'fresh-onion-kg', name: 'Onions', category: 'vegetable', label: 'Kitchen staple', price: 45, unit: 'per kg', rating: '4.6', reviewCount: 17, emoji: '🧅', image: 'https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=700&q=80', available: true, productType: 'produce' },
  { id: 'fresh-carrot-kg', name: 'Carrots', category: 'vegetable', label: 'Seasonal pick', price: 60, unit: 'per kg', rating: '4.8', reviewCount: 12, emoji: '🥕', image: 'https://images.unsplash.com/photo-1445282768818-728615cc910a?auto=format&fit=crop&w=700&q=80', available: true, productType: 'produce' },
  { id: 'fresh-spinach-bunch', name: 'Spinach', category: 'vegetable', label: 'Seasonal pick', price: 35, unit: 'per 250 g bunch', rating: '4.7', reviewCount: 11, emoji: '🥬', image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=700&q=80', available: true, productType: 'produce' }
];
const allItems = [...menuItems, ...rescueItems, ...produceItems];
const categories = { indian: 'Indian', 'fast-food': 'Fast food', vegetarian: 'Vegetarian', desserts: 'Desserts' };
const orderStages = ['Order placed', 'Preparing', 'Out for delivery', 'Delivered'];
let cart = loadJSON(CART_STORAGE_KEY, []);
let localReviews = loadJSON(REVIEWS_STORAGE_KEY, {});
let activeCategory = 'all';
let toastTimer;
let lastFocusedElement = null;
let reviewReturnFocus = null;
let reviewCurrentItemId = '';
let isSubmitting = false;

const elements = {
  menuGrid: document.querySelector('#menuGrid'), rescueGrid: document.querySelector('#rescueMeals'), produceGrid: document.querySelector('#produceGrid'), search: document.querySelector('#menuSearch'),
  emptyResults: document.querySelector('#emptyResults'), cartDrawer: document.querySelector('#cartDrawer'), cartOverlay: document.querySelector('#cartOverlay'),
  cartItems: document.querySelector('#cartItems'), cartEmpty: document.querySelector('#cartEmpty'), checkoutArea: document.querySelector('#checkoutArea'),
  cartCount: document.querySelector('#cartCount'), drawerItemCount: document.querySelector('#drawerItemCount'), cartSubtotal: document.querySelector('#cartSubtotal'), cartTotal: document.querySelector('#cartTotal'),
  checkoutForm: document.querySelector('#checkoutForm'), formMessage: document.querySelector('#formMessage'), placeOrderButton: document.querySelector('#placeOrderButton'),
  confirmationModal: document.querySelector('#confirmationModal'), orderReference: document.querySelector('#orderReference'), trackingCard: document.querySelector('#trackingCard'), toast: document.querySelector('#toast'),
  reviewModal: document.querySelector('#reviewModal'), reviewForm: document.querySelector('#reviewForm'), reviewList: document.querySelector('#reviewList'), reviewSummary: document.querySelector('#reviewSummary'), reviewMessage: document.querySelector('#reviewMessage')
};

function loadJSON(key, fallback) {
  try {
    const stored = JSON.parse(localStorage.getItem(key));
    return stored ?? fallback;
  } catch (error) {
    console.warn(`Could not read ${key} from local storage.`, error);
    return fallback;
  }
}

function saveJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn(`Could not save ${key} to local storage.`, error);
    showToast('Browser storage is unavailable. Your changes may not persist.');
    return false;
  }
}

function formatPrice(amount) {
  return `₹${Number(amount).toLocaleString('en-IN')}`;
}

function categoryName(category) {
  return categories[category] || category;
}

function getReviewStats(item) {
  const submitted = Array.isArray(localReviews[item.id]) ? localReviews[item.id] : [];
  const sampleCount = Number(item.reviewCount) || 12;
  const sampleAverage = Number(item.rating) || 4.7;
  const reviewTotal = submitted.reduce((sum, review) => sum + Number(review.rating), 0);
  const average = (sampleAverage * sampleCount + reviewTotal) / (sampleCount + submitted.length);
  return { average: average.toFixed(2), count: sampleCount + submitted.length, sampleCount, submitted };
}

function createFoodCard(item) {
  const card = document.createElement('article');
  card.className = `food-card${item.productType === 'produce' ? ' produce-card' : ''}`;
  card.dataset.itemId = item.id;
  const img = document.createElement('img');
  img.src = item.image;
  img.alt = `${item.name} ${item.productType === 'produce' ? 'fresh produce' : 'prepared dish'}`;
  img.loading = 'lazy';
  img.addEventListener('error', () => {
    const imageContainer = img.closest('.food-image');
    imageContainer.classList.add('fallback');
    imageContainer.textContent = item.emoji;
    imageContainer.setAttribute('aria-label', `${item.name} image unavailable`);
  }, { once: true });
  const imageContainer = document.createElement('div');
  imageContainer.className = 'food-image';
  imageContainer.append(img);
  const badge = document.createElement('span');
  badge.className = 'food-badge';
  badge.textContent = item.rescue ? 'Rescue pick' : item.label;
  const rating = document.createElement('span');
  rating.className = 'food-rating';
  const reviewStats = getReviewStats(item);
  rating.textContent = `★ ${reviewStats.average} · ${reviewStats.count}`;
  rating.setAttribute('aria-label', `${reviewStats.average} out of 5, ${reviewStats.count} sample and customer-submitted ratings`);
  imageContainer.append(badge, rating);
  const body = document.createElement('div');
  body.className = 'food-card-body';
  const meta = document.createElement('span');
  meta.className = 'food-meta';
  meta.textContent = item.productType === 'produce' ? `Fresh produce · ${categoryName(item.category)}` : categoryName(item.category);
  const title = document.createElement('h3');
  title.textContent = item.name;
  const bottom = document.createElement('div');
  bottom.className = 'food-card-bottom';
  const price = document.createElement('span');
  price.className = 'food-price';
  price.textContent = formatPrice(item.price);
  if (item.unit) {
    const unitLabel = document.createElement('small');
    unitLabel.className = 'unit-price-label';
    unitLabel.textContent = ` ${item.unit}`;
    price.append(unitLabel);
  }
  if (item.originalPrice) {
    const original = document.createElement('del');
    original.textContent = formatPrice(item.originalPrice);
    price.append(original);
  }
  const add = document.createElement('button');
  add.type = 'button';
  add.className = 'add-button';
  add.textContent = item.available === false ? 'Unavailable' : '＋ Add';
  add.disabled = item.available === false;
  add.setAttribute('aria-label', item.available === false ? `${item.name} unavailable` : `Add ${item.name} to basket`);
  add.addEventListener('click', () => addToCart(item.id));
  bottom.append(price, add);
  const cardFooter = document.createElement('div');
  cardFooter.className = 'food-card-footer';
  const sampleLabel = document.createElement('span');
  sampleLabel.className = 'rating-sample-label';
  sampleLabel.textContent = reviewStats.submitted.length ? 'Sample + local reviews' : 'Sample rating';
  cardFooter.append(sampleLabel);
  if (item.productType === 'produce') {
    const availability = document.createElement('span');
    availability.className = `availability-label${item.available === false ? ' unavailable' : ''}`;
    availability.textContent = item.available === false ? 'Currently unavailable' : '● In stock · sample availability';
    cardFooter.append(availability);
  }
  const reviewsButton = document.createElement('button');
  reviewsButton.type = 'button';
  reviewsButton.className = 'reviews-trigger';
  reviewsButton.textContent = `Read / write reviews (${reviewStats.count})`;
  reviewsButton.setAttribute('aria-label', `Read or write reviews for ${item.name}`);
  reviewsButton.addEventListener('click', () => openReviews(item.id, reviewsButton));
  cardFooter.append(reviewsButton);
  body.append(meta, title, bottom, cardFooter);
  card.append(imageContainer, body);
  return card;
}

function renderMenu() {
  const query = elements.search.value.trim().toLocaleLowerCase();
  const filtered = menuItems.filter(item => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory || (activeCategory === 'vegetarian' && item.vegetarian);
    const matchesSearch = `${item.name} ${item.label} ${categoryName(item.category)}`.toLocaleLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });
  elements.menuGrid.replaceChildren(...filtered.map(createFoodCard));
  elements.emptyResults.hidden = filtered.length > 0;
}

function renderRescue() {
  elements.rescueGrid.replaceChildren(...rescueItems.map(createFoodCard));
}

function renderProduce() {
  elements.produceGrid.replaceChildren(...produceItems.map(createFoodCard));
}

function openReviews(itemId, trigger) {
  const item = allItems.find(entry => entry.id === itemId);
  if (!item) return;
  reviewReturnFocus = trigger;
  reviewCurrentItemId = item.id;
  document.querySelector('#reviewItemId').value = item.id;
  document.querySelector('#reviewTitle').textContent = `${item.name} reviews`;
  elements.reviewMessage.textContent = '';
  renderReviews(item);
  elements.reviewModal.hidden = false;
  document.body.classList.add('no-scroll');
  document.querySelector('#reviewRating').focus();
}

function renderReviews(item) {
  const stats = getReviewStats(item);
  elements.reviewSummary.textContent = `★ ${stats.average} / 5 · ${stats.count} ratings (${stats.sampleCount} sample; ${stats.submitted.length} submitted on this device)`;
  elements.reviewList.replaceChildren();
  if (stats.sampleCount > 0) {
    [1, 2].forEach(exampleNumber => {
      const sample = document.createElement('article');
      sample.className = 'review-entry sample-review';
      const sampleTitle = document.createElement('strong');
      sampleTitle.textContent = `★ ${item.rating} · Sample review example ${exampleNumber}`;
      const sampleCopy = document.createElement('p');
      sampleCopy.textContent = SAMPLE_REVIEW_TEXT;
      const sampleLabel = document.createElement('span');
      sampleLabel.textContent = `${stats.sampleCount} illustrative sample ratings · placeholder text · not verified purchases`;
      sample.append(sampleTitle, sampleCopy, sampleLabel);
      elements.reviewList.append(sample);
    });
  }
  stats.submitted.slice().reverse().forEach(review => {
    const entry = document.createElement('article');
    entry.className = 'review-entry';
    const title = document.createElement('strong');
    title.textContent = `${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)} · Browser review`;
    const copy = document.createElement('p');
    copy.textContent = review.text;
    const label = document.createElement('span');
    label.textContent = 'Customer-submitted · saved in this browser · not verified';
    entry.append(title, copy, label);
    elements.reviewList.append(entry);
  });
}

function closeReviews() {
  elements.reviewModal.hidden = true;
  document.body.classList.remove('no-scroll');
  const replacementTrigger = [...document.querySelectorAll('.food-card')]
    .find(card => card.dataset.itemId === reviewCurrentItemId)?.querySelector('.reviews-trigger');
  (reviewReturnFocus?.isConnected ? reviewReturnFocus : replacementTrigger)?.focus?.();
}

function handleReviewSubmit(event) {
  event.preventDefault();
  const itemId = document.querySelector('#reviewItemId').value;
  const rating = Number(document.querySelector('#reviewRating').value);
  const text = document.querySelector('#reviewText').value.trim();
  const item = allItems.find(entry => entry.id === itemId);
  if (!item) {
    elements.reviewMessage.textContent = 'Please choose a product before submitting a review.';
    return;
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    elements.reviewMessage.textContent = 'Please select a rating from 1 to 5 stars.';
    return;
  }
  if (text.length < 5 || text.length > 300) {
    elements.reviewMessage.textContent = 'Write a review between 5 and 300 characters.';
    return;
  }
  const reviews = { ...localReviews, [itemId]: [...(localReviews[itemId] || []), { rating, text, createdAt: new Date().toISOString() }] };
  if (!saveJSON(REVIEWS_STORAGE_KEY, reviews)) {
    elements.reviewMessage.textContent = 'Browser storage is unavailable, so your review could not be saved. Please try again.';
    return;
  }
  localReviews = reviews;
  elements.reviewForm.reset();
  document.querySelector('#reviewItemId').value = item.id;
  elements.reviewMessage.textContent = 'Review saved in this browser. It is not sent to AWS.';
  renderReviews(item);
  renderMenu();
  renderRescue();
  renderProduce();
}

function addToCart(itemId) {
  const existing = cart.find(row => row.id === itemId);
  if (existing) existing.quantity += 1;
  else cart.push({ id: itemId, quantity: 1 });
  persistCart();
  showToast(`${allItems.find(item => item.id === itemId).name} added to your basket`);
}

function persistCart() {
  saveJSON(CART_STORAGE_KEY, cart);
  renderCart();
}

function renderCart() {
  cart = cart.filter(row => allItems.some(item => item.id === row.id) && Number.isInteger(row.quantity) && row.quantity > 0);
  const itemCount = cart.reduce((sum, row) => sum + row.quantity, 0);
  elements.cartCount.textContent = itemCount;
  document.querySelector('#openCart').setAttribute('aria-label', `Open cart, ${itemCount} ${itemCount === 1 ? 'item' : 'items'}`);
  elements.drawerItemCount.textContent = `(${itemCount})`;
  elements.cartItems.replaceChildren(...cart.map(row => createCartRow(row)));
  elements.cartEmpty.hidden = itemCount > 0;
  elements.checkoutArea.hidden = itemCount === 0;
  const subtotal = cart.reduce((sum, row) => sum + allItems.find(item => item.id === row.id).price * row.quantity, 0);
  elements.cartSubtotal.textContent = formatPrice(subtotal);
  elements.cartTotal.textContent = formatPrice(subtotal + (itemCount > 0 ? DELIVERY_FEE : 0));
}

function createCartRow(row) {
  const item = allItems.find(entry => entry.id === row.id);
  const container = document.createElement('div');
  container.className = 'cart-row';
  const img = document.createElement('img');
  img.className = 'cart-thumb';
  img.src = item.image;
  img.alt = '';
  img.addEventListener('error', () => { img.src = ''; img.alt = item.emoji; img.classList.add('fallback'); }, { once: true });
  const details = document.createElement('div');
  const title = document.createElement('h3');
  title.textContent = item.name;
  const price = document.createElement('span');
  price.className = 'cart-row-price';
  price.textContent = `${formatPrice(item.price)} ${item.unit || 'per serving'} · quantity ${row.quantity}`;
  const quantity = document.createElement('div');
  quantity.className = 'quantity-controls';
  const decrease = document.createElement('button');
  decrease.type = 'button'; decrease.textContent = '−'; decrease.setAttribute('aria-label', `Decrease ${item.name} quantity`);
  decrease.addEventListener('click', () => changeQuantity(item.id, -1));
  const count = document.createElement('span'); count.textContent = row.quantity;
  const increase = document.createElement('button');
  increase.type = 'button'; increase.textContent = '+'; increase.setAttribute('aria-label', `Increase ${item.name} quantity`);
  increase.addEventListener('click', () => changeQuantity(item.id, 1));
  quantity.append(decrease, count, increase);
  details.append(title, price, quantity);
  const remove = document.createElement('button');
  remove.type = 'button'; remove.className = 'remove-item'; remove.textContent = '×';
  remove.setAttribute('aria-label', `Remove ${item.name} from basket`);
  remove.addEventListener('click', () => removeFromCart(item.id));
  container.append(img, details, remove);
  return container;
}

function changeQuantity(itemId, delta) {
  const row = cart.find(entry => entry.id === itemId);
  if (!row) return;
  row.quantity += delta;
  if (row.quantity <= 0) cart = cart.filter(entry => entry.id !== itemId);
  persistCart();
}

function removeFromCart(itemId) {
  cart = cart.filter(row => row.id !== itemId);
  persistCart();
}

function setCartOpen(open) {
  if (open) lastFocusedElement = document.activeElement;
  else {
    elements.cartOverlay.classList.remove('visible');
    const returnFocusTarget = lastFocusedElement?.isConnected ? lastFocusedElement : document.querySelector('#openCart');
    returnFocusTarget.focus();
  }
  elements.cartDrawer.classList.toggle('open', open);
  elements.cartDrawer.setAttribute('aria-hidden', String(!open));
  elements.cartOverlay.hidden = !open;
  document.body.classList.toggle('no-scroll', open);
  if (open) {
    requestAnimationFrame(() => elements.cartOverlay.classList.add('visible'));
    elements.cartDrawer.focus();
  }
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => elements.toast.classList.remove('show'), 2400);
}

function validateCheckout() {
  const name = document.querySelector('#customerName').value.trim();
  const phone = document.querySelector('#customerPhone').value.replace(/[\s()-]/g, '');
  const address = document.querySelector('#customerAddress').value.trim();
  if (cart.length === 0) return 'Add at least one item before placing an order.';
  if (name.length < 2) return 'Please enter your name (at least 2 characters).';
  if (!/^\+?[0-9]{10,13}$/.test(phone)) return 'Enter a valid phone number with 10 to 13 digits.';
  if (address.length < 8) return 'Please enter a complete delivery address.';
  return '';
}

function buildOrderPayload() {
  return {
    orderReference: `EB-REQUEST-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    createdAt: new Date().toISOString(),
    customer: {
      name: document.querySelector('#customerName').value.trim(),
      phone: document.querySelector('#customerPhone').value.replace(/[\s()-]/g, ''),
      address: document.querySelector('#customerAddress').value.trim()
    },
    items: cart.map(row => {
      const item = allItems.find(entry => entry.id === row.id);
      return { id: item.id, name: item.name, quantity: row.quantity, unitPrice: item.price, unit: item.unit || 'per serving', productType: item.productType || (item.rescue ? 'rescue' : 'meal') };
    }),
    ecoPackaging: document.querySelector('#ecoPackaging').checked
  };
}

// Lambda is authoritative for catalog prices, subtotal and delivery fee. Never put secrets here.
async function submitOrder(order) {
  const response = await fetch(API_GATEWAY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(order)
  });
  const text = await response.text();
  let result;
  try {
    result = text ? JSON.parse(text) : {};
  } catch {
    throw new Error('The order service returned an unreadable response.');
  }
  if (!response.ok) {
    const message = result.message || result.error || `HTTP ${response.status}`;
    throw new Error(typeof message === 'string' ? message : `HTTP ${response.status}`);
  }
  if (typeof result.body === 'string') {
    try { result = JSON.parse(result.body); } catch { throw new Error('The order service returned invalid order details.'); }
  } else if (result.body && typeof result.body === 'object') {
    result = result.body;
  }
  if (result.order && typeof result.order === 'object') result = result.order;
  if (result.success === false || result.error) throw new Error(result.message || result.error || 'The order was rejected.');
  const orderReference = result.orderReference || result.orderId || result.order_id;
  if (!orderReference) throw new Error('The order service did not return an order reference.');
  return { ...result, orderReference };
}

async function handleCheckout(event) {
  event.preventDefault();
  if (isSubmitting) return;
  elements.formMessage.textContent = validateCheckout();
  if (elements.formMessage.textContent) return;
  const order = buildOrderPayload();
  isSubmitting = true;
  elements.placeOrderButton.disabled = true;
  elements.placeOrderButton.innerHTML = '<span class="button-spinner" aria-hidden="true"></span> Sending order…';
  try {
    const savedOrder = await submitOrder(order);
    elements.orderReference.textContent = savedOrder.orderReference;
    setCartOpen(false);
    elements.confirmationModal.hidden = false;
    document.body.classList.add('no-scroll');
    document.querySelector('#confirmationTitle').focus();
    const tracking = { orderReference: savedOrder.orderReference, statusIndex: 0 };
    saveJSON(TRACKING_STORAGE_KEY, tracking);
    updateTracking(tracking);
    cart = [];
    saveJSON(CART_STORAGE_KEY, cart);
    renderCart();
    elements.checkoutForm.reset();
    document.querySelector('#ecoPackaging').checked = true;
    elements.formMessage.textContent = '';
  } catch (error) {
    elements.formMessage.textContent = `We couldn't place the order. ${error.message} Please try again.`;
  } finally {
    isSubmitting = false;
    elements.placeOrderButton.disabled = false;
    elements.placeOrderButton.innerHTML = 'Place order <span aria-hidden="true">→</span>';
  }
}

function closeConfirmation() {
  elements.confirmationModal.hidden = true;
  document.body.classList.remove('no-scroll');
}

function updateTracking(order) {
  const stageIndex = Math.max(0, Math.min(orderStages.length - 1, Number(order.statusIndex) || 0));
  const card = document.createElement('div');
  const heading = document.createElement('div'); heading.className = 'tracking-head';
  const summary = document.createElement('div');
  const title = document.createElement('h3'); title.textContent = `Order ${order.orderReference}`;
  const status = document.createElement('p'); status.textContent = `Current status: ${orderStages[stageIndex]}`;
  summary.append(title, status);
  const simulated = document.createElement('span'); simulated.className = 'simulated-label'; simulated.textContent = 'SIMULATED · NOT LIVE TRACKING';
  heading.append(summary, simulated);
  const steps = document.createElement('div'); steps.className = 'tracking-steps';
  orderStages.forEach((stage, index) => {
    const step = document.createElement('div');
    step.className = `tracking-step${index <= stageIndex ? ' done' : ''}${index === stageIndex ? ' current' : ''}`;
    const dot = document.createElement('span'); dot.className = 'step-dot'; dot.textContent = index < stageIndex ? '✓' : String(index + 1);
    const label = document.createElement('span'); label.textContent = stage;
    step.append(dot, label); steps.append(step);
  });
  const controls = document.createElement('div'); controls.className = 'tracking-controls';
  const advance = document.createElement('button'); advance.type = 'button';
  advance.textContent = stageIndex < orderStages.length - 1 ? 'Simulate next update →' : 'Order delivered';
  advance.disabled = stageIndex >= orderStages.length - 1;
  advance.addEventListener('click', () => {
    const tracking = { orderReference: order.orderReference, statusIndex: Math.min(orderStages.length - 1, stageIndex + 1) };
    saveJSON(TRACKING_STORAGE_KEY, tracking);
    updateTracking(tracking);
  });
  controls.append(advance);
  card.append(heading, steps, controls);
  elements.trackingCard.replaceChildren(card);
}

function restoreLatestOrder() {
  const tracking = loadJSON(TRACKING_STORAGE_KEY, null);
  if (tracking?.orderReference) updateTracking(tracking);
}

function setupEvents() {
  document.querySelector('#categoryFilters').addEventListener('click', event => {
    const button = event.target.closest('[data-category]');
    if (!button) return;
    activeCategory = button.dataset.category;
    document.querySelectorAll('.category-chip').forEach(chip => {
      const selected = chip === button;
      chip.classList.toggle('active', selected);
      chip.setAttribute('aria-pressed', String(selected));
    });
    renderMenu();
  });
  elements.search.addEventListener('input', renderMenu);
  document.addEventListener('keydown', event => {
    if (event.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
      event.preventDefault(); elements.search.focus();
    }
    if (event.key === 'Escape') {
      setCartOpen(false);
      if (!elements.confirmationModal.hidden) closeConfirmation();
      if (!elements.reviewModal.hidden) closeReviews();
      setMobileNav(false);
    }
  });
  document.querySelector('#openCart').addEventListener('click', () => setCartOpen(true));
  document.querySelector('#closeCart').addEventListener('click', () => setCartOpen(false));
  elements.cartOverlay.addEventListener('click', () => setCartOpen(false));
  document.querySelectorAll('[data-close-cart]').forEach(button => button.addEventListener('click', () => { setCartOpen(false); document.querySelector('#menu').scrollIntoView({ behavior: 'smooth' }); }));
  elements.checkoutForm.addEventListener('submit', handleCheckout);
  elements.reviewForm.addEventListener('submit', handleReviewSubmit);
  document.querySelector('#closeReviews').addEventListener('click', closeReviews);
  elements.reviewModal.addEventListener('click', event => { if (event.target === elements.reviewModal) closeReviews(); });
  document.querySelector('#closeConfirmation').addEventListener('click', closeConfirmation);
  elements.confirmationModal.addEventListener('click', event => { if (event.target === elements.confirmationModal) closeConfirmation(); });
  document.querySelector('#trackOrderButton').addEventListener('click', () => {
    closeConfirmation();
    document.querySelector('#tracking').scrollIntoView({ behavior: 'smooth' });
  });
  document.querySelectorAll('[data-scroll-menu]').forEach(button => button.addEventListener('click', () => document.querySelector('#menu').scrollIntoView({ behavior: 'smooth' })));
  document.querySelector('#mobileMenuToggle').addEventListener('click', event => setMobileNav(event.currentTarget.getAttribute('aria-expanded') !== 'true'));
  document.querySelectorAll('#primaryNav a').forEach(link => link.addEventListener('click', () => setMobileNav(false)));
}

function setMobileNav(open) {
  const toggle = document.querySelector('#mobileMenuToggle');
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  document.querySelector('#primaryNav').classList.toggle('open', open);
}

function initialize() {
  document.querySelector('#year').textContent = new Date().getFullYear();
  renderMenu();
  renderRescue();
  renderProduce();
  renderCart();
  restoreLatestOrder();
  setupEvents();
}

initialize();
