/**
 * public/js/poster.js
 * Poster detail view logic: size variant selector, live price calculation, cart addition
 */

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('posterDetailContainer');
  if (!container) return;

  // Extract slug from URL parameter or pathname
  const urlParams = new URLSearchParams(window.location.search);
  let slug = urlParams.get('slug');

  if (!slug) {
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    if (pathParts.length >= 2 && pathParts[0] === 'poster') {
      slug = pathParts[1];
    }
  }

  // Fallback to first poster if none is provided in URL
  if (!slug) {
    slug = 'quiet-arch-no-3';
  }

  try {
    const poster = await fetchPosterBySlug(slug);

    if (!poster) {
      container.innerHTML = `
        <div class="empty-state">
          <h2 class="empty-title">Print Not Found</h2>
          <p class="empty-desc">The requested print could not be located in our gallery collection.</p>
          <a href="./shop.html" class="btn btn-primary">Return to Collection</a>
        </div>
      `;
      return;
    }

    // Default to first size variant (usually A4)
    let selectedSize = poster.sizes && poster.sizes.length > 0 ? poster.sizes[0] : { label: 'A4', price: poster.price };
    let currentQty = 1;

    // Render product detail layout
    container.innerHTML = `
      <div class="product-detail-layout">
        <!-- Left Column: Frame / Image -->
        <div class="product-gallery">
          <img 
            id="mainPosterImage"
            src="${formatImageUrl(poster.imageUrl)}" 
            alt="${poster.title}" 
            class="product-gallery-img"
          />
        </div>

        <!-- Right Column: Details & Actions -->
        <div class="product-info">
          <nav class="breadcrumb-nav" aria-label="Breadcrumb">
            <a href="./shop.html">Collection</a>
            <span>/</span>
            <span>${poster.category}</span>
          </nav>

          <h1 class="product-title">${poster.title}</h1>

          <div class="product-price-current" id="priceDisplay">
            ${formatPrice(selectedSize.price)}
          </div>

          <p class="product-description">${poster.description}</p>

          <!-- Size Variant Picker -->
          <div class="variant-picker">
            <span class="label-caps">Select Print Size</span>
            <div class="size-selector-group" id="sizeSelectorGroup">
              ${poster.sizes.map((s, index) => `
                <button 
                  type="button" 
                  class="size-option-btn ${index === 0 ? 'selected' : ''}" 
                  data-label="${s.label}" 
                  data-price="${s.price}"
                >
                  ${s.label} (${formatPrice(s.price)})
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Product Specification Details -->
          <div class="product-specs">
            <div class="spec-item">
              <span class="spec-title">Paper & Finish</span>
              <span class="spec-value" style="text-transform: capitalize;">${poster.finish} lamination</span>
            </div>
            <div class="spec-item">
              <span class="spec-title">Paper Weight</span>
              <span class="spec-value">300 gsm Archival Matte</span>
            </div>
            <div class="spec-item">
              <span class="spec-title">Selected Dimension</span>
              <span class="spec-value" id="dimensionDisplay">21.0 × 29.7 cm</span>
            </div>
            <div class="spec-item">
              <span class="spec-title">Delivery Status</span>
              <span class="spec-value">Dispatched within 48h</span>
            </div>
          </div>

          <!-- Quantity & Add to Cart -->
          <div style="display: flex; gap: var(--space-sm); align-items: stretch; margin-top: var(--space-xs);">
            <div class="quantity-control" aria-label="Quantity selector">
              <button type="button" class="qty-btn" id="qtyMinusBtn" aria-label="Decrease quantity">−</button>
              <span class="qty-display" id="qtyDisplay">1</span>
              <button type="button" class="qty-btn" id="qtyPlusBtn" aria-label="Increase quantity">+</button>
            </div>

            <button type="button" class="btn btn-primary" id="addToCartBtn" style="flex: 1;">
              Add to Cart
            </button>
          </div>

          <div style="margin-top: var(--space-sm); font-size: 0.75rem; color: var(--text-muted); line-height: 1.6;">
            Free insured shipping across India in reinforced zero-bend craft cylinders.
          </div>
        </div>
      </div>
    `;

    // Size dimensions map
    const dimensionsMap = {
      'A4': '21.0 × 29.7 cm (8.3 × 11.7 in)',
      'A3': '29.7 × 42.0 cm (11.7 × 16.5 in)',
      'A2': '42.0 × 59.4 cm (16.5 × 23.4 in)'
    };

    const priceDisplay = document.getElementById('priceDisplay');
    const dimensionDisplay = document.getElementById('dimensionDisplay');
    const sizeButtons = document.querySelectorAll('.size-option-btn');
    const qtyDisplay = document.getElementById('qtyDisplay');
    const qtyMinusBtn = document.getElementById('qtyMinusBtn');
    const qtyPlusBtn = document.getElementById('qtyPlusBtn');
    const addToCartBtn = document.getElementById('addToCartBtn');

    // Update size on click
    sizeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        sizeButtons.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');

        const label = btn.getAttribute('data-label');
        const price = parseFloat(btn.getAttribute('data-price'));
        selectedSize = { label, price };

        priceDisplay.textContent = formatPrice(price);
        if (dimensionDisplay && dimensionsMap[label]) {
          dimensionDisplay.textContent = dimensionsMap[label];
        }
      });
    });

    // Quantity controls
    qtyMinusBtn.addEventListener('click', () => {
      if (currentQty > 1) {
        currentQty -= 1;
        qtyDisplay.textContent = currentQty;
      }
    });

    qtyPlusBtn.addEventListener('click', () => {
      currentQty += 1;
      qtyDisplay.textContent = currentQty;
    });

    // Add to Cart action
    addToCartBtn.addEventListener('click', () => {
      addToCart({
        posterId: poster._id,
        title: poster.title,
        slug: poster.slug,
        imageUrl: poster.imageUrl,
        size: selectedSize.label,
        finish: poster.finish,
        price: selectedSize.price,
        quantity: currentQty
      });
    });

  } catch (error) {
    console.error('Error fetching poster detail:', error);
    container.innerHTML = '<div style="padding: 4rem 0; text-align: center; color: var(--text-muted);">Failed to load print details. Please try again.</div>';
  }
});
