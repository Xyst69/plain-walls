/**
 * public/js/cart.js
 * Shopping Cart management and Checkout workflow
 * Synchronizes with localStorage and dispatches order requests to POST /api/orders
 */

document.addEventListener('DOMContentLoaded', () => {
  const cartContainer = document.getElementById('cartContainer');
  if (!cartContainer) return;

  function renderCart() {
    const cart = getCart();

    if (cart.length === 0) {
      cartContainer.innerHTML = `
        <div class="empty-state">
          <h2 class="empty-title">Your Cart is Empty</h2>
          <p class="empty-desc">You have not added any prints to your cart yet. Explore our curated catalog of laminated art and botanical prints.</p>
          <a href="./shop.html" class="btn btn-primary">Browse Collection</a>
        </div>
      `;
      return;
    }

    const subtotal = getCartTotal();

    cartContainer.innerHTML = `
      <div class="cart-layout">
        <!-- Items Table Column -->
        <div class="cart-items-column">
          <table class="cart-items-table">
            <thead>
              <tr>
                <th>Print Item</th>
                <th style="text-align: center;">Size</th>
                <th style="text-align: center;">Quantity</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${cart.map(item => `
                <tr class="cart-item-row" data-id="${item.posterId}" data-size="${item.size}">
                  <td>
                    <div class="cart-item-info">
                      <div class="cart-thumb-wrap">
                        <img src="${formatImageUrl(item.imageUrl)}" alt="${item.title}" class="cart-thumb" />
                      </div>
                      <div>
                        <h4 class="cart-item-title">
                          <a href="./poster.html?slug=${encodeURIComponent(item.slug)}">${item.title}</a>
                        </h4>
                        <div class="cart-item-variant">${item.size} • ${item.finish || 'matte'}</div>
                        <button type="button" class="remove-item-btn" data-id="${item.posterId}" data-size="${item.size}">
                          Remove
                        </button>
                      </div>
                    </div>
                  </td>
                  <td style="text-align: center; font-size: 0.8125rem;">
                    ${item.size}
                  </td>
                  <td style="text-align: center;">
                    <div class="quantity-control" style="margin: 0 auto;">
                      <button type="button" class="qty-btn cart-qty-minus" data-id="${item.posterId}" data-size="${item.size}">−</button>
                      <span class="qty-display">${item.quantity}</span>
                      <button type="button" class="qty-btn cart-qty-plus" data-id="${item.posterId}" data-size="${item.size}">+</button>
                    </div>
                  </td>
                  <td style="text-align: right; font-weight: 500;">
                    ${formatPrice(item.price * item.quantity)}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div style="margin-top: var(--space-lg); display: flex; justify-content: space-between; align-items: center;">
            <a href="./shop.html" class="btn-text">← Continue Shopping</a>
            <button type="button" id="clearCartBtn" class="btn-text" style="color: var(--text-muted); border-color: var(--text-muted);">
              Empty Cart
            </button>
          </div>
        </div>

        <!-- Order Summary & Checkout Form Column -->
        <div class="checkout-column">
          <div class="order-summary-box">
            <h3 style="font-size: 1.5rem; margin-bottom: var(--space-md); border-bottom: 1px solid var(--border); padding-bottom: var(--space-xs);">
              Order Summary
            </h3>

            <div class="summary-row">
              <span style="color: var(--text-muted);">Subtotal (${getCartCount()} items)</span>
              <span>${formatPrice(subtotal)}</span>
            </div>

            <div class="summary-row">
              <span style="color: var(--text-muted);">Packaging & Insured Courier</span>
              <span style="color: var(--text); font-weight: 500;">Complimentary</span>
            </div>

            <div class="summary-row total-row">
              <span>Total Amount</span>
              <span>${formatPrice(subtotal)}</span>
            </div>

            <!-- Checkout Form -->
            <form id="checkoutForm" style="margin-top: var(--space-lg);" novalidate>
              <div class="label-caps" style="margin-bottom: var(--space-sm);">Shipping Information</div>

              <div id="checkoutErrors" style="display: none; background-color: #FBF0F0; border: 1px solid #E5C3C3; padding: 10px; margin-bottom: 16px; font-size: 0.8125rem; color: #9A2C2C;"></div>

              <div class="form-group">
                <label for="customerName" class="form-label">Full Name *</label>
                <input type="text" id="customerName" name="customerName" class="form-input" placeholder="e.g. Aarav Sharma" required />
              </div>

              <div class="form-group">
                <label for="email" class="form-label">Email Address *</label>
                <input type="email" id="email" name="email" class="form-input" placeholder="e.g. aarav@example.com" required />
              </div>

              <div class="form-group">
                <label for="phone" class="form-label">Contact Phone *</label>
                <input type="tel" id="phone" name="phone" class="form-input" placeholder="e.g. +91 98765 43210" required />
              </div>

              <div class="form-group">
                <label for="address" class="form-label">Complete Shipping Address *</label>
                <textarea id="address" name="address" class="form-textarea" placeholder="Flat / House no, Building, Street, City, State, PIN code" required></textarea>
              </div>

              <button type="submit" id="submitOrderBtn" class="btn btn-primary btn-block" style="margin-top: var(--space-sm);">
                Place Order (${formatPrice(subtotal)})
              </button>
            </form>
          </div>
        </div>
      </div>
    `;

    bindCartEvents();
  }

  function bindCartEvents() {
    // Quantity minus
    document.querySelectorAll('.cart-qty-minus').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const size = btn.getAttribute('data-size');
        const cart = getCart();
        const item = cart.find(i => i.posterId === id && i.size === size);
        if (item) {
          updateCartItemQuantity(id, size, item.quantity - 1);
          renderCart();
        }
      });
    });

    // Quantity plus
    document.querySelectorAll('.cart-qty-plus').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const size = btn.getAttribute('data-size');
        const cart = getCart();
        const item = cart.find(i => i.posterId === id && i.size === size);
        if (item) {
          updateCartItemQuantity(id, size, item.quantity + 1);
          renderCart();
        }
      });
    });

    // Remove item
    document.querySelectorAll('.remove-item-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const size = btn.getAttribute('data-size');
        removeCartItem(id, size);
        renderCart();
      });
    });

    // Empty entire cart
    const clearBtn = document.getElementById('clearCartBtn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to remove all items from your cart?')) {
          clearCart();
          renderCart();
        }
      });
    }

    // Checkout submission
    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
      checkoutForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const errorBox = document.getElementById('checkoutErrors');
        const submitBtn = document.getElementById('submitOrderBtn');

        errorBox.style.display = 'none';
        errorBox.innerHTML = '';

        const customerName = document.getElementById('customerName').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const address = document.getElementById('address').value.trim();

        const errors = [];
        if (!customerName || customerName.length < 2) errors.push('Please enter your full name.');
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Please enter a valid email address.');
        if (!phone || phone.length < 7) errors.push('Please provide a valid phone number.');
        if (!address || address.length < 5) errors.push('Please enter your full shipping address with PIN code.');

        if (errors.length > 0) {
          errorBox.innerHTML = errors.map(err => `<div>• ${err}</div>`).join('');
          errorBox.style.display = 'block';
          return;
        }

        const cart = getCart();
        if (cart.length === 0) {
          errorBox.textContent = 'Your cart is empty.';
          errorBox.style.display = 'block';
          return;
        }

        const orderPayload = {
          customerName,
          email,
          phone,
          address,
          items: cart.map(i => ({
            posterId: i.posterId,
            title: i.title,
            size: i.size,
            quantity: i.quantity,
            price: i.price
          }))
        };

        try {
          submitBtn.disabled = true;
          submitBtn.textContent = 'Recording Order...';

          const res = await submitOrder(orderPayload);
          const order = res.order;

          // Clear local cart upon successful database persistence
          clearCart();

          // Render clean confirmation message
          cartContainer.innerHTML = `
            <div class="confirmation-card">
              <span class="label-caps" style="color: #4C6B55;">Order Confirmed • Receipt Sent</span>
              <h2>Thank you, ${order.customerName}.</h2>
              <p style="color: var(--text-muted); font-size: 0.9375rem; margin-bottom: 1.5rem;">
                Your print order has been registered into our workshop queue. We will carefully produce, inspect, and laminate each piece before dispatching.
              </p>

              <div class="confirmation-details">
                <div style="display: flex; justify-content: space-between;">
                  <span class="label-caps">Order Reference</span>
                  <span style="font-family: monospace; font-size: 0.875rem;">${order.id}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span class="label-caps">Contact Email</span>
                  <span>${order.email}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span class="label-caps">Delivery Destination</span>
                  <span style="text-align: right; max-width: 320px;">${order.address}</span>
                </div>
                <div style="display: flex; justify-content: space-between; border-top: 1px dashed var(--border); padding-top: 8px;">
                  <span class="label-caps">Total Paid</span>
                  <span style="font-weight: 600; font-size: 1rem;">${formatPrice(order.total)}</span>
                </div>
              </div>

              <div style="margin-top: 1.5rem; display: flex; gap: 1rem;">
                <a href="./shop.html" class="btn btn-primary">Continue Browsing</a>
                <a href="./index.html" class="btn btn-outline">Return Home</a>
              </div>
            </div>
          `;
        } catch (err) {
          console.error('Order placement failure:', err);
          errorBox.textContent = err.message || 'Failed to place order. Please try again.';
          errorBox.style.display = 'block';
          submitBtn.disabled = false;
          submitBtn.textContent = `Place Order (${formatPrice(subtotal)})`;
        }
      });
    }
  }

  // Initial render
  renderCart();
});
