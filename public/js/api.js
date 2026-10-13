/**
 * public/js/api.js
 * API Client & Global Helpers for "Plain Walls"
 */

// Base API URL supports both standard server hosting (http://localhost:3000)
// and direct browser file opening (file:///...)
const API_BASE = (typeof window !== 'undefined' && window.location.protocol === 'file:')
  ? 'http://localhost:3000/api'
  : '/api';

/**
 * Format relative image URLs to load reliably across both server and file:// protocols
 */
function formatImageUrl(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (typeof window !== 'undefined' && window.location.protocol === 'file:') {
    return '.' + (url.startsWith('/') ? url : '/' + url);
  }
  return url;
}

/**
 * Format numeric amount into INR currency string
 */
function formatPrice(amount) {
  if (typeof amount !== 'number') {
    amount = parseFloat(amount) || 0;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
}

/**
 * Fetch posters with optional filters
 */
async function fetchPosters({ category = '', search = '', sort = 'newest', featured = '' } = {}) {
  const params = new URLSearchParams();
  if (category && category !== 'All') params.append('category', category);
  if (search && search.trim() !== '') params.append('search', search.trim());
  if (sort) params.append('sort', sort);
  if (featured) params.append('featured', featured);

  const queryString = params.toString() ? `?${params.toString()}` : '';
  const response = await fetch(`${API_BASE}/posters${queryString}`);
  
  if (!response.ok) {
    throw new Error(`Failed to load posters (${response.status})`);
  }
  return await response.json();
}

/**
 * Fetch a single poster by its slug
 */
async function fetchPosterBySlug(slug) {
  if (!slug) throw new Error('Poster slug is required');
  const response = await fetch(`${API_BASE}/posters/${encodeURIComponent(slug)}`);
  
  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error(`Failed to load poster (${response.status})`);
  }
  const result = await response.json();
  return result.data;
}

/**
 * Check MongoDB and server health status
 */
async function fetchDbHealth() {
  const response = await fetch(`${API_BASE}/health`);
  if (!response.ok) {
    throw new Error(`Failed to check health (${response.status})`);
  }
  return await response.json();
}

/**
 * Create a new poster in MongoDB
 */
async function apiCreatePoster(posterData) {
  const response = await fetch(`${API_BASE}/posters`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(posterData)
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to create poster');
  }
  return data;
}

/**
 * Update an existing poster in MongoDB
 */
async function apiUpdatePoster(id, posterData) {
  const response = await fetch(`${API_BASE}/posters/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(posterData)
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to update poster');
  }
  return data;
}

/**
 * Delete a poster from MongoDB
 */
async function apiDeletePoster(id) {
  const response = await fetch(`${API_BASE}/posters/${id}`, {
    method: 'DELETE'
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to delete poster');
  }
  return data;
}

/**
 * Fetch all orders from MongoDB
 */
async function fetchOrdersList(adminKey = '') {
  const headers = {};
  if (adminKey) {
    headers['x-admin-key'] = adminKey;
  }
  const response = await fetch(`${API_BASE}/orders`, { headers });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to retrieve orders');
  }
  return data.data || [];
}

/**
 * Update order status in MongoDB
 */
async function apiUpdateOrderStatus(id, status) {
  const response = await fetch(`${API_BASE}/orders/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to update order');
  }
  return data;
}

/**
 * Delete an order from MongoDB
 */
async function apiDeleteOrder(id) {
  const response = await fetch(`${API_BASE}/orders/${id}`, {
    method: 'DELETE'
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to delete order');
  }
  return data;
}

/**
 * Submit an order to the API
 */
async function submitOrder(orderData) {
  const response = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(orderData)
  });

  const data = await response.json();
  if (!response.ok) {
    const errorMsg = data.errors ? data.errors.join(' ') : (data.message || 'Error creating order');
    throw new Error(errorMsg);
  }
  return data;
}

/**
 * Show a gentle toast notification in the bottom right corner
 */
function showToast(message) {
  let toast = document.getElementById('toastNotice');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toastNotice';
    toast.className = 'toast-notice';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.classList.remove('show');
  }, 2600);
}

// ============================================================================
// Cart Storage Management (LocalStorage)
// ============================================================================

const CART_STORAGE_KEY = 'plain_walls_cart';

function getCart() {
  try {
    const data = localStorage.getItem(CART_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error('Error reading cart from localStorage', err);
    return [];
  }
}

function saveCart(cart) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    updateCartBadge();
  } catch (err) {
    console.error('Error saving cart to localStorage', err);
  }
}

function addToCart(item) {
  const cart = getCart();
  // Find matching poster with identical size
  const existingIndex = cart.findIndex(
    i => i.posterId === item.posterId && i.size === item.size
  );

  if (existingIndex > -1) {
    cart[existingIndex].quantity += (item.quantity || 1);
  } else {
    cart.push({
      posterId: item.posterId,
      title: item.title,
      slug: item.slug,
      imageUrl: item.imageUrl,
      size: item.size,
      finish: item.finish || 'matte',
      price: item.price,
      quantity: item.quantity || 1
    });
  }

  saveCart(cart);
  showToast(`Added "${item.title}" (${item.size}) to your cart.`);
}

function updateCartItemQuantity(posterId, size, newQty) {
  let cart = getCart();
  if (newQty <= 0) {
    cart = cart.filter(i => !(i.posterId === posterId && i.size === size));
  } else {
    const item = cart.find(i => i.posterId === posterId && i.size === size);
    if (item) item.quantity = newQty;
  }
  saveCart(cart);
}

function removeCartItem(posterId, size) {
  let cart = getCart();
  cart = cart.filter(i => !(i.posterId === posterId && i.size === size));
  saveCart(cart);
}

function clearCart() {
  localStorage.removeItem(CART_STORAGE_KEY);
  updateCartBadge();
}

function getCartCount() {
  const cart = getCart();
  return cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
}

function getCartTotal() {
  const cart = getCart();
  return cart.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0);
}

function updateCartBadge() {
  const badges = document.querySelectorAll('.cart-count-badge');
  const count = getCartCount();
  badges.forEach(b => {
    b.textContent = count > 0 ? `(${count})` : '(0)';
  });
}

// Initialise badge on document load
document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
});
