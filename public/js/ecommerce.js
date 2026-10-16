/**
 * public/js/ecommerce.js
 * NovaMart E-Commerce Client Engine
 * Handles catalog search & filters, product modals, cart persistence,
 * live order placement to MongoDB, and real-time MongoDB Compass status inspection.
 */

// Global State
const state = {
  products: [],
  categories: [],
  activeCategory: 'All',
  searchQuery: '',
  minPrice: '',
  maxPrice: '',
  minRating: '',
  sort: 'featured',
  cart: JSON.parse(localStorage.getItem('novamart_cart') || '[]'),
  appliedCoupon: null,
  discountAmount: 0,
  activeProductModal: null,
  selectedVariant: ''
};

// DOM Ready initialization
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initCategoryNav();
  initFilters();
  initCart();
  initCheckout();
  initCompassInspector();
  initDealTimer();

  // Load initial data
  fetchCategories();
  fetchProducts();
  fetchFeaturedDeals();
  pollDatabaseStatus();

  // Poll DB status every 12 seconds
  setInterval(pollDatabaseStatus, 12000);
});

/* ==========================================================================
   1. API CALLS & DATA FETCHING
   ========================================================================== */

async function fetchProducts() {
  const grid = document.getElementById('products-grid');
  const countEl = document.getElementById('results-count');
  if (grid) grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px;"><div class="pulse-dot" style="margin: 0 auto 12px auto;"></div>Loading products from MongoDB...</div>';

  const params = new URLSearchParams();
  if (state.activeCategory && state.activeCategory !== 'All') params.append('category', state.activeCategory);
  if (state.searchQuery) params.append('search', state.searchQuery);
  if (state.minPrice) params.append('minPrice', state.minPrice);
  if (state.maxPrice) params.append('maxPrice', state.maxPrice);
  if (state.minRating) params.append('minRating', state.minRating);
  if (state.sort) params.append('sort', state.sort);

  try {
    const res = await fetch(`/api/products?${params.toString()}`);
    const data = await res.json();

    if (data.success) {
      state.products = data.products;
      if (countEl) countEl.innerText = `${data.total} items`;
      renderProducts(data.products);
      updateCategoryFacetCounts(data.categories);
    } else {
      if (grid) grid.innerHTML = '<div style="grid-column: 1/-1; padding: 40px; text-align: center;">No products found matching your filters.</div>';
    }
  } catch (error) {
    console.error('Error fetching products:', error);
    if (grid) grid.innerHTML = '<div style="grid-column: 1/-1; padding: 40px; text-align: center; color: #dc2626;">Error connecting to database. Please make sure MongoDB is running.</div>';
  }
}

async function fetchCategories() {
  try {
    const res = await fetch('/api/categories');
    const data = await res.json();
    if (data.success) {
      state.categories = data.categories;
      renderCategoryTiles(data.categories);
      renderCategorySelectOptions(data.categories);
      renderSidebarCategoryList(data.categories);
    }
  } catch (err) {
    console.error('Error fetching categories:', err);
  }
}

async function fetchFeaturedDeals() {
  try {
    const res = await fetch('/api/products/deals/featured');
    const data = await res.json();
    if (data.success && data.dealsOfDay && data.dealsOfDay.length > 0) {
      const deal = data.dealsOfDay[0];
      const dealTitleEl = document.getElementById('ticker-deal-title');
      const dealPriceEl = document.getElementById('ticker-deal-price');
      if (dealTitleEl) dealTitleEl.innerText = deal.title;
      if (dealPriceEl) dealPriceEl.innerText = `₹${deal.price.toLocaleString('en-IN')} (Save ${deal.discountPercentage}%)`;
    }
  } catch (err) {
    console.error('Error fetching deals:', err);
  }
}

/* ==========================================================================
   2. RENDERING LOGIC (AMAZON / FLIPKART STYLE)
   ========================================================================== */

function renderProducts(products) {
  const grid = document.getElementById('products-grid');
  if (!grid) return;

  if (products.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 48px 16px; background: #fff; border-radius: 8px;">
        <h3 style="margin-bottom: 8px; color: #0f172a;">No Matching Products Found</h3>
        <p style="color: #64748b; margin-bottom: 16px;">Try adjusting your search terms or clearing the price & rating filters.</p>
        <button class="price-go-btn" onclick="resetFilters()">Reset All Filters</button>
      </div>
    `;
    return;
  }

  grid.innerHTML = products.map(product => {
    let badgeHtml = '';
    if (product.badge === 'Bestseller') {
      badgeHtml = `<span class="card-badge badge-bestseller">#1 Bestseller</span>`;
    } else if (product.badge === 'Deal of the Day' || product.isDealOfDay) {
      badgeHtml = `<span class="card-badge badge-deal">Limited Deal</span>`;
    } else if (product.badge === "Amazon's Choice") {
      badgeHtml = `<span class="card-badge badge-choice">Nova's Choice</span>`;
    } else if (product.badge === 'Top Rated') {
      badgeHtml = `<span class="card-badge badge-toprated">★ Top Rated</span>`;
    }

    const mainImage = product.images && product.images.length > 0 ? product.images[0] : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80';
    const originalPriceHtml = product.originalPrice > product.price 
      ? `<span class="original-price">₹${product.originalPrice.toLocaleString('en-IN')}</span>` 
      : '';
    const discountHtml = product.discountPercentage > 0 
      ? `<span class="discount-tag">(${product.discountPercentage}% off)</span>` 
      : '';

    return `
      <div class="product-card" data-id="${product._id}">
        ${badgeHtml}
        <div class="product-img-wrap" onclick="openProductModal('${product._id}')">
          <img src="${mainImage}" alt="${product.title}" loading="lazy" />
        </div>
        <div class="product-brand">${product.brand || product.category}</div>
        <h3 class="product-title" onclick="openProductModal('${product._id}')" title="${product.title}">
          ${product.title}
        </h3>
        
        <div class="product-rating-row">
          <span class="rating-badge">${product.rating || 4.5} ★</span>
          <span class="review-count-text">(${product.reviewCount ? product.reviewCount.toLocaleString('en-IN') : 120})</span>
        </div>

        <div class="price-row">
          <span class="selling-price">₹${product.price.toLocaleString('en-IN')}</span>
          ${originalPriceHtml}
          ${discountHtml}
        </div>

        <div class="delivery-badge">✓ Free Delivery by Tomorrow</div>

        <div class="card-actions">
          <button class="btn-add-cart" onclick="addToCart('${product._id}')">
            Add to Cart
          </button>
          <button class="btn-quick-view" onclick="openProductModal('${product._id}')" title="Quick View">
            👁️
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function renderCategoryTiles(categories) {
  const container = document.getElementById('category-tiles-grid');
  if (!container) return;

  container.innerHTML = categories.map(cat => `
    <div class="category-tile" onclick="selectCategory('${cat.name}')">
      <div class="tile-title">${cat.icon} ${cat.name}</div>
      <img src="${cat.bannerImage}" alt="${cat.name}" class="tile-img" loading="lazy" />
      <div class="tile-link">Explore ${cat.name} &rarr;</div>
    </div>
  `).join('');
}

function renderCategorySelectOptions(categories) {
  const select = document.getElementById('search-category');
  if (!select) return;
  select.innerHTML = `<option value="All">All Departments</option>` + 
    categories.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
}

function renderSidebarCategoryList(categories) {
  const list = document.getElementById('sidebar-categories-list');
  if (!list) return;

  list.innerHTML = `
    <li class="filter-item ${state.activeCategory === 'All' ? 'active' : ''}" onclick="selectCategory('All')">
      <span>All Categories</span>
      <span class="filter-count">${state.products.length}</span>
    </li>
  ` + categories.map(cat => `
    <li class="filter-item ${state.activeCategory === cat.name ? 'active' : ''}" onclick="selectCategory('${cat.name}')">
      <span>${cat.name}</span>
      <span class="filter-count" id="count-cat-${cat.slug}">${cat.itemCount || 0}</span>
    </li>
  `).join('');
}

function updateCategoryFacetCounts(countsArray) {
  if (!countsArray) return;
  countsArray.forEach(item => {
    const el = document.getElementById(`count-cat-${item.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`);
    if (el) el.innerText = item.count;
  });
}

/* ==========================================================================
   3. NAVIGATION, SEARCH & FILTER CONTROLS
   ========================================================================== */

function initNavbar() {
  const searchInput = document.getElementById('search-input');
  const searchBtn = document.getElementById('search-submit');
  const categorySelect = document.getElementById('search-category');

  if (searchInput && searchBtn) {
    searchBtn.addEventListener('click', () => {
      state.searchQuery = searchInput.value.trim();
      fetchProducts();
    });

    searchInput.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') {
        state.searchQuery = searchInput.value.trim();
        fetchProducts();
      }
    });
  }

  if (categorySelect) {
    categorySelect.addEventListener('change', (e) => {
      state.activeCategory = e.target.value;
      fetchProducts();
    });
  }
}

function initCategoryNav() {
  const navItems = document.querySelectorAll('.sub-nav-item[data-category]');
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const cat = item.getAttribute('data-category');
      selectCategory(cat);
    });
  });
}

function selectCategory(categoryName) {
  state.activeCategory = categoryName;

  // Update sub-nav active states
  document.querySelectorAll('.sub-nav-item').forEach(item => {
    item.classList.toggle('active', item.getAttribute('data-category') === categoryName);
  });

  // Update sidebar category list active states
  document.querySelectorAll('#sidebar-categories-list .filter-item').forEach(item => {
    const label = item.querySelector('span') ? item.querySelector('span').innerText : '';
    item.classList.toggle('active', (categoryName === 'All' && label === 'All Categories') || label === categoryName);
  });

  // Update header dropdown
  const catSelect = document.getElementById('search-category');
  if (catSelect) catSelect.value = categoryName;

  fetchProducts();
}

function initFilters() {
  // Sort dropdown
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      state.sort = e.target.value;
      fetchProducts();
    });
  }

  // Price range Apply button
  const priceBtn = document.getElementById('apply-price-btn');
  if (priceBtn) {
    priceBtn.addEventListener('click', () => {
      const minVal = document.getElementById('price-min').value;
      const maxVal = document.getElementById('price-max').value;
      state.minPrice = minVal ? Number(minVal) : '';
      state.maxPrice = maxVal ? Number(maxVal) : '';
      fetchProducts();
    });
  }

  // Rating radio filters
  document.querySelectorAll('.rating-filter-item').forEach(item => {
    item.addEventListener('click', () => {
      const rating = item.getAttribute('data-rating');
      state.minRating = rating;
      fetchProducts();
    });
  });
}

function resetFilters() {
  state.activeCategory = 'All';
  state.searchQuery = '';
  state.minPrice = '';
  state.maxPrice = '';
  state.minRating = '';
  state.sort = 'featured';

  const sInput = document.getElementById('search-input');
  if (sInput) sInput.value = '';
  const pMin = document.getElementById('price-min');
  if (pMin) pMin.value = '';
  const pMax = document.getElementById('price-max');
  if (pMax) pMax.value = '';
  const sSelect = document.getElementById('sort-select');
  if (sSelect) sSelect.value = 'featured';

  selectCategory('All');
}

/* ==========================================================================
   4. PRODUCT DETAIL MODAL & VARIANT SELECTOR
   ========================================================================== */

async function openProductModal(productIdOrSlug) {
  const modal = document.getElementById('product-detail-modal-backdrop');
  if (!modal) return;

  try {
    const res = await fetch(`/api/products/${productIdOrSlug}`);
    const data = await res.json();
    if (!data.success) return showToast('Product not found', 'warning');

    const product = data.product;
    state.activeProductModal = product;

    // Set title, brand, rating
    document.getElementById('modal-product-brand').innerText = product.brand || product.category;
    document.getElementById('modal-product-title').innerText = product.title;
    document.getElementById('modal-product-rating').innerText = `${product.rating} ★`;
    document.getElementById('modal-product-reviews').innerText = `(${product.reviewCount} verified customer ratings)`;

    // Pricing
    document.getElementById('modal-selling-price').innerText = `₹${product.price.toLocaleString('en-IN')}`;
    const origEl = document.getElementById('modal-original-price');
    const discEl = document.getElementById('modal-discount-tag');
    if (product.originalPrice > product.price) {
      origEl.innerText = `M.R.P.: ₹${product.originalPrice.toLocaleString('en-IN')}`;
      origEl.style.display = 'inline';
      discEl.innerText = `${product.discountPercentage}% OFF`;
      discEl.style.display = 'inline';
    } else {
      origEl.style.display = 'none';
      discEl.style.display = 'none';
    }

    // Images
    const mainImg = document.getElementById('modal-main-img');
    const thumbsContainer = document.getElementById('modal-thumbs-container');
    const images = (product.images && product.images.length > 0) ? product.images : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'];
    mainImg.src = images[0];

    thumbsContainer.innerHTML = images.map((img, idx) => `
      <div class="thumb-item ${idx === 0 ? 'active' : ''}" onclick="switchModalImage('${img}', this)">
        <img src="${img}" alt="Thumbnail ${idx}" />
      </div>
    `).join('');

    // Description & Highlights
    document.getElementById('modal-description').innerText = product.description;
    const highlightsList = document.getElementById('modal-highlights-list');
    if (product.highlights && product.highlights.length > 0) {
      highlightsList.innerHTML = product.highlights.map(h => `<li>${h}</li>`).join('');
    } else {
      highlightsList.innerHTML = '<li>Premium quality verified product</li>';
    }

    // Specifications Table
    const specsTbody = document.getElementById('modal-specs-tbody');
    if (product.specifications && product.specifications.length > 0) {
      specsTbody.innerHTML = product.specifications.map(s => `
        <tr><td>${s.label}</td><td>${s.value}</td></tr>
      `).join('');
    } else {
      specsTbody.innerHTML = `<tr><td>Brand</td><td>${product.brand}</td></tr><tr><td>Category</td><td>${product.category}</td></tr>`;
    }

    // Variants
    const variantContainer = document.getElementById('modal-variants-container');
    if (product.variants && product.variants.length > 0) {
      variantContainer.innerHTML = product.variants.map(v => {
        state.selectedVariant = `${v.name}: ${v.options[0]}`;
        return `
          <div class="variant-picker-section">
            <div class="variant-label">${v.name}:</div>
            <div class="variant-options-group">
              ${v.options.map((opt, i) => `
                <div class="variant-option-chip ${i === 0 ? 'selected' : ''}" onclick="selectVariantChip('${v.name}: ${opt}', this)">
                  ${opt}
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }).join('');
    } else {
      state.selectedVariant = '';
      variantContainer.innerHTML = '';
    }

    // Verified Reviews
    const reviewsList = document.getElementById('modal-reviews-list');
    if (product.reviews && product.reviews.length > 0) {
      reviewsList.innerHTML = product.reviews.map(r => `
        <div style="padding: 10px 0; border-bottom: 1px solid #f1f5f9;">
          <div style="font-weight: 700; font-size: 13px; color: #0f172a;">${r.user} <span style="color: #067d62; font-size: 11px;">✓ Verified Purchase</span></div>
          <div style="color: var(--star-gold); font-size: 12px; margin: 2px 0;">${'★'.repeat(r.rating)}</div>
          <div style="font-weight: 600; font-size: 13px;">${r.title || ''}</div>
          <div style="font-size: 13px; color: #475569;">${r.comment}</div>
        </div>
      `).join('');
    } else {
      reviewsList.innerHTML = '<div style="font-size: 13px; color: #64748b;">No customer reviews yet. Be the first to review!</div>';
    }

    modal.classList.add('open');
  } catch (err) {
    console.error('Error opening product modal:', err);
  }
}

function switchModalImage(src, el) {
  document.getElementById('modal-main-img').src = src;
  document.querySelectorAll('#modal-thumbs-container .thumb-item').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
}

function selectVariantChip(variantStr, el) {
  state.selectedVariant = variantStr;
  el.parentElement.querySelectorAll('.variant-option-chip').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
}

function closeProductModal() {
  const modal = document.getElementById('product-detail-modal-backdrop');
  if (modal) modal.classList.remove('open');
}

/* ==========================================================================
   5. SHOPPING CART ENGINE (LOCALSTORAGE + PERSISTENCE)
   ========================================================================== */

function initCart() {
  updateCartBadge();
  renderCartDrawer();

  const cartHeaderBtn = document.getElementById('header-cart-btn');
  const cartCloseBtn = document.getElementById('cart-drawer-close');
  const backdrop = document.getElementById('cart-drawer-backdrop');

  if (cartHeaderBtn) cartHeaderBtn.addEventListener('click', openCartDrawer);
  if (cartCloseBtn) cartCloseBtn.addEventListener('click', closeCartDrawer);
  if (backdrop) backdrop.addEventListener('click', closeCartDrawer);

  // Modal add to cart
  const modalAddBtn = document.getElementById('modal-btn-add-cart');
  if (modalAddBtn) {
    modalAddBtn.addEventListener('click', () => {
      if (state.activeProductModal) {
        addToCart(state.activeProductModal._id, state.selectedVariant);
      }
    });
  }

  // Modal Buy Now
  const modalBuyBtn = document.getElementById('modal-btn-buy-now');
  if (modalBuyBtn) {
    modalBuyBtn.addEventListener('click', () => {
      if (state.activeProductModal) {
        addToCart(state.activeProductModal._id, state.selectedVariant);
        closeProductModal();
        openCheckoutModal();
      }
    });
  }

  // Coupon apply
  const applyCouponBtn = document.getElementById('apply-coupon-btn');
  if (applyCouponBtn) {
    applyCouponBtn.addEventListener('click', () => {
      const input = document.getElementById('coupon-input');
      if (input) applyCoupon(input.value.trim());
    });
  }
}

function addToCart(productId, variantOverride) {
  const product = state.products.find(p => p._id === productId) || state.activeProductModal;
  if (!product) return;

  const variant = variantOverride || (product.variants && product.variants[0] ? `${product.variants[0].name}: ${product.variants[0].options[0]}` : '');
  const existingIndex = state.cart.findIndex(item => item.productId === product._id && item.variant === variant);

  if (existingIndex > -1) {
    state.cart[existingIndex].quantity += 1;
  } else {
    state.cart.push({
      productId: product._id,
      title: product.title,
      brand: product.brand,
      image: (product.images && product.images[0]) || '',
      price: product.price,
      originalPrice: product.originalPrice,
      quantity: 1,
      variant
    });
  }

  saveCart();
  updateCartBadge();
  renderCartDrawer();
  showToast(`Added "${product.title.slice(0, 24)}..." to cart!`, 'success');
  openCartDrawer();
}

function updateCartQty(index, delta) {
  if (!state.cart[index]) return;
  state.cart[index].quantity += delta;

  if (state.cart[index].quantity <= 0) {
    state.cart.splice(index, 1);
  }

  saveCart();
  updateCartBadge();
  renderCartDrawer();
}

function removeFromCart(index) {
  state.cart.splice(index, 1);
  saveCart();
  updateCartBadge();
  renderCartDrawer();
}

function saveCart() {
  localStorage.setItem('novamart_cart', JSON.stringify(state.cart));
}

function updateCartBadge() {
  const totalQty = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  const badge = document.getElementById('cart-badge-count');
  if (badge) badge.innerText = totalQty;
}

function renderCartDrawer() {
  const container = document.getElementById('cart-items-container');
  const subtotalEl = document.getElementById('cart-subtotal');
  const discountEl = document.getElementById('cart-discount');
  const totalEl = document.getElementById('cart-total');
  const deliveryEl = document.getElementById('cart-delivery');
  if (!container) return;

  if (state.cart.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 48px 16px; color: #64748b;">
        <div style="font-size: 48px; margin-bottom: 12px;">🛒</div>
        <h4 style="color: #0f172a; margin-bottom: 6px;">Your Cart is Empty</h4>
        <p style="font-size: 13px;">Add products from our tech, fashion, or gaming catalog to proceed.</p>
      </div>
    `;
    if (subtotalEl) subtotalEl.innerText = '₹0';
    if (discountEl) discountEl.innerText = '-₹0';
    if (deliveryEl) deliveryEl.innerText = '₹0';
    if (totalEl) totalEl.innerText = '₹0';
    return;
  }

  let subtotal = 0;
  container.innerHTML = state.cart.map((item, idx) => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;

    return `
      <div class="cart-item-row">
        <img src="${item.image}" alt="${item.title}" class="cart-item-img" />
        <div class="cart-item-info">
          <div class="cart-item-title">${item.title}</div>
          ${item.variant ? `<div class="cart-item-variant">${item.variant}</div>` : ''}
          <div class="cart-item-price">₹${item.price.toLocaleString('en-IN')}</div>
          <div class="qty-control">
            <button class="qty-btn" onclick="updateCartQty(${idx}, -1)">-</button>
            <span class="qty-number">${item.quantity}</span>
            <button class="qty-btn" onclick="updateCartQty(${idx}, 1)">+</button>
            <button class="btn-remove-cart" onclick="removeFromCart(${idx})">Delete</button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Calculate discounts & totals
  let discount = 0;
  if (state.appliedCoupon === 'SAVE10') {
    discount = Math.round(subtotal * 0.10);
  } else if (state.appliedCoupon === 'FESTIVE20') {
    discount = Math.round(subtotal * 0.20);
  } else if (state.appliedCoupon === 'FLAT500' && subtotal >= 2000) {
    discount = 500;
  }
  state.discountAmount = discount;

  const deliveryFee = subtotal > 499 ? 0 : 40;
  const finalTotal = Math.max(0, subtotal - discount + deliveryFee);

  if (subtotalEl) subtotalEl.innerText = `₹${subtotal.toLocaleString('en-IN')}`;
  if (discountEl) discountEl.innerText = `-₹${discount.toLocaleString('en-IN')}`;
  if (deliveryEl) deliveryEl.innerText = deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`;
  if (totalEl) totalEl.innerText = `₹${finalTotal.toLocaleString('en-IN')}`;
}

function applyCoupon(code) {
  const upper = code.toUpperCase();
  if (upper === 'SAVE10') {
    state.appliedCoupon = 'SAVE10';
    renderCartDrawer();
    showToast('Coupon "SAVE10" applied! 10% instant discount.', 'success');
  } else if (upper === 'FESTIVE20') {
    state.appliedCoupon = 'FESTIVE20';
    renderCartDrawer();
    showToast('Coupon "FESTIVE20" applied! 20% instant discount.', 'success');
  } else {
    showToast('Invalid coupon. Try "SAVE10" or "FESTIVE20"', 'warning');
  }
}

function openCartDrawer() {
  const drawer = document.getElementById('cart-drawer');
  const backdrop = document.getElementById('cart-drawer-backdrop');
  if (drawer) drawer.classList.add('open');
  if (backdrop) backdrop.classList.add('open');
}

function closeCartDrawer() {
  const drawer = document.getElementById('cart-drawer');
  const backdrop = document.getElementById('cart-drawer-backdrop');
  if (drawer) drawer.classList.remove('open');
  if (backdrop) backdrop.classList.remove('open');
}

/* ==========================================================================
   6. CHECKOUT & REAL-TIME MONGODB ORDER PLACEMENT
   ========================================================================== */

function initCheckout() {
  const checkoutBtn = document.getElementById('btn-checkout-drawer');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      if (state.cart.length === 0) return showToast('Your cart is empty', 'warning');
      closeCartDrawer();
      openCheckoutModal();
    });
  }

  // Payment method selection
  document.querySelectorAll('.payment-card-opt').forEach(opt => {
    opt.addEventListener('click', () => {
      document.querySelectorAll('.payment-card-opt').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
    });
  });

  // Submit Order
  const form = document.getElementById('checkout-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await submitOrder();
    });
  }
}

function openCheckoutModal() {
  const modal = document.getElementById('checkout-modal-backdrop');
  if (!modal) return;

  const total = document.getElementById('cart-total') ? document.getElementById('cart-total').innerText : '₹0';
  const displayTotal = document.getElementById('checkout-pay-total');
  if (displayTotal) displayTotal.innerText = total;

  modal.classList.add('open');
}

function closeCheckoutModal() {
  const modal = document.getElementById('checkout-modal-backdrop');
  if (modal) modal.classList.remove('open');
}

async function submitOrder() {
  const submitBtn = document.getElementById('btn-place-order');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerText = 'Saving Order to MongoDB...';
  }

  const selectedPayment = document.querySelector('.payment-card-opt.selected');
  const paymentMethod = selectedPayment ? selectedPayment.getAttribute('data-method') : 'cod';

  const orderPayload = {
    customer: {
      fullName: document.getElementById('cust-name').value,
      email: document.getElementById('cust-email').value,
      phone: document.getElementById('cust-phone').value,
      address: document.getElementById('cust-address').value,
      city: document.getElementById('cust-city').value,
      state: document.getElementById('cust-state').value,
      pincode: document.getElementById('cust-pincode').value
    },
    items: state.cart,
    couponCode: state.appliedCoupon,
    paymentMethod
  };

  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload)
    });

    const data = await res.json();

    if (data.success) {
      // Clear cart
      state.cart = [];
      saveCart();
      updateCartBadge();
      renderCartDrawer();

      closeCheckoutModal();
      openOrderSuccessModal(data.order, data.compassInfo);
      pollDatabaseStatus(); // update counts
    } else {
      showToast(data.message || 'Error placing order', 'warning');
    }
  } catch (error) {
    console.error('Error submitting order:', error);
    showToast('Failed to connect to MongoDB server. Ensure port 3000 is running.', 'warning');
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerText = 'Place Your Order';
    }
  }
}

function openOrderSuccessModal(order, compassInfo) {
  const modal = document.getElementById('success-modal-backdrop');
  if (!modal) return;

  document.getElementById('success-order-num').innerText = order.orderNumber;
  document.getElementById('success-order-total').innerText = `₹${order.pricing.totalAmount.toLocaleString('en-IN')}`;
  document.getElementById('success-order-cust').innerText = `${order.customer.fullName} (${order.customer.city}, ${order.customer.pincode})`;

  modal.classList.add('open');
}

function closeSuccessModal() {
  const modal = document.getElementById('success-modal-backdrop');
  if (modal) modal.classList.remove('open');
}

/* ==========================================================================
   7. LIVE MONGODB COMPASS INSPECTOR (FOR ASSIGNMENT DEMO)
   ========================================================================== */

function initCompassInspector() {
  const pill = document.getElementById('compass-live-pill');
  const closeBtn = document.getElementById('compass-modal-close');
  const backdrop = document.getElementById('compass-modal-backdrop');

  if (pill) pill.addEventListener('click', openCompassModal);
  if (closeBtn) closeBtn.addEventListener('click', closeCompassModal);
  if (backdrop) {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) closeCompassModal();
    });
  }

  const copyBtn = document.getElementById('btn-copy-compass-uri');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText('mongodb://localhost:27017');
      showToast('Copied "mongodb://localhost:27017" to clipboard!', 'success');
    });
  }
}

async function pollDatabaseStatus() {
  try {
    const res = await fetch('/api/system/db-status');
    const data = await res.json();

    const pillText = document.getElementById('compass-status-text');
    if (pillText) {
      if (data.status === 'connected') {
        pillText.innerText = `🟢 MongoDB: Connected | ${data.mongodb.counts.products} Products | ${data.mongodb.counts.orders} Orders`;
      } else {
        pillText.innerText = `🔴 MongoDB: Connecting... | Port 27017`;
      }
    }

    // Update numbers in the inspector modal
    const pCountEl = document.getElementById('metric-products-count');
    const oCountEl = document.getElementById('metric-orders-count');
    const cCountEl = document.getElementById('metric-categories-count');
    if (pCountEl) pCountEl.innerText = data.mongodb.counts.products;
    if (oCountEl) oCountEl.innerText = data.mongodb.counts.orders;
    if (cCountEl) cCountEl.innerText = data.mongodb.counts.categories;

    // Render recent orders table
    const recentOrdersList = document.getElementById('compass-recent-orders-list');
    if (recentOrdersList && data.mongodb.recentOrders) {
      if (data.mongodb.recentOrders.length === 0) {
        recentOrdersList.innerHTML = '<tr><td colspan="4" style="text-align: center; color: #64748b; padding: 12px;">No orders placed yet. Place an order to see it live!</td></tr>';
      } else {
        recentOrdersList.innerHTML = data.mongodb.recentOrders.map(o => `
          <tr>
            <td style="font-weight: 700; color: #0284c7;">${o.orderNumber}</td>
            <td>${o.customer.fullName}</td>
            <td style="font-weight: 700;">₹${o.pricing.totalAmount.toLocaleString('en-IN')}</td>
            <td><span class="rating-badge" style="background: #0284c7;">${o.orderStatus}</span></td>
          </tr>
        `).join('');
      }
    }
  } catch (err) {
    console.warn('MongoDB status polling notice:', err.message);
  }
}

function openCompassModal() {
  const modal = document.getElementById('compass-modal-backdrop');
  if (modal) {
    pollDatabaseStatus();
    modal.classList.add('open');
  }
}

function closeCompassModal() {
  const modal = document.getElementById('compass-modal-backdrop');
  if (modal) modal.classList.remove('open');
}

/* ==========================================================================
   8. DEAL COUNTDOWN TIMER & TOAST UTILITY
   ========================================================================== */

function initDealTimer() {
  let secondsLeft = 14320; // ~4 hours
  setInterval(() => {
    secondsLeft = Math.max(0, secondsLeft - 1);
    const hrs = String(Math.floor(secondsLeft / 3600)).padStart(2, '0');
    const mins = String(Math.floor((secondsLeft % 3600) / 60)).padStart(2, '0');
    const secs = String(secondsLeft % 60).padStart(2, '0');

    const timerBox = document.getElementById('ticker-deal-timer');
    if (timerBox) timerBox.innerText = `${hrs}h : ${mins}m : ${secs}s`;
  }, 1000);
}

function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${type === 'success' ? '✓' : 'ℹ'}</span> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}
