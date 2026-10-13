/**
 * public/js/shop.js
 * Shop catalog logic: category filtering, live search with debounce, and sorting
 */

document.addEventListener('DOMContentLoaded', () => {
  const shopGrid = document.getElementById('shopGrid');
  const categoryFilters = document.getElementById('categoryFilters');
  const searchInput = document.getElementById('searchInput');
  const sortSelect = document.getElementById('sortSelect');
  const resultsCount = document.getElementById('resultsCount');

  if (!shopGrid) return;

  // Initialize query state from URL params if present
  const urlParams = new URLSearchParams(window.location.search);
  let currentCategory = urlParams.get('category') || 'All';
  let currentSearch = urlParams.get('search') || '';
  let currentSort = urlParams.get('sort') || 'newest';

  // Set initial UI states
  if (searchInput && currentSearch) {
    searchInput.value = currentSearch;
  }
  if (sortSelect && currentSort) {
    sortSelect.value = currentSort;
  }

  // Update active filter button
  function updateActiveFilterButton() {
    if (!categoryFilters) return;
    const buttons = categoryFilters.querySelectorAll('.filter-btn');
    buttons.forEach(btn => {
      const cat = btn.getAttribute('data-category');
      if (cat.toLowerCase() === currentCategory.toLowerCase()) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  // Fetch and display posters
  async function loadPosters() {
    shopGrid.innerHTML = '<div style="grid-column: 1 / -1; padding: 3rem 0; color: var(--text-muted); text-align: center;">Refreshing prints...</div>';

    try {
      const response = await fetchPosters({
        category: currentCategory,
        search: currentSearch,
        sort: currentSort
      });

      const posters = response.data || [];

      if (resultsCount) {
        resultsCount.textContent = `${posters.length} ${posters.length === 1 ? 'print' : 'prints'} available`;
      }

      if (posters.length === 0) {
        shopGrid.innerHTML = `
          <div style="grid-column: 1 / -1; padding: 4rem 1rem; text-align: center;">
            <p style="font-family: var(--font-serif); font-size: 1.5rem; margin-bottom: 0.5rem;">No prints found</p>
            <p style="color: var(--text-muted); font-size: 0.875rem; margin-bottom: 1.5rem;">We could not find any prints matching your selected filters.</p>
            <button id="resetFiltersBtn" class="btn btn-outline btn-sm">Reset All Filters</button>
          </div>
        `;

        const resetBtn = document.getElementById('resetFiltersBtn');
        if (resetBtn) {
          resetBtn.addEventListener('click', () => {
            currentCategory = 'All';
            currentSearch = '';
            currentSort = 'newest';
            if (searchInput) searchInput.value = '';
            if (sortSelect) sortSelect.value = 'newest';
            updateActiveFilterButton();
            loadPosters();
          });
        }
        return;
      }

      shopGrid.innerHTML = posters.map(poster => `
        <article class="poster-card">
          <a href="./poster.html?slug=${encodeURIComponent(poster.slug)}" class="poster-frame" aria-label="View ${poster.title}">
            <img 
              src="${formatImageUrl(poster.imageUrl)}" 
              alt="${poster.title} - ${poster.category} print" 
              class="poster-image" 
              loading="lazy"
            />
          </a>
          <div class="poster-caption">
            <div class="poster-meta">
              <span class="poster-category">${poster.category}</span>
              <span class="poster-price">from ${formatPrice(poster.price)}</span>
            </div>
            <h3 class="poster-title">
              <a href="./poster.html?slug=${encodeURIComponent(poster.slug)}">${poster.title}</a>
            </h3>
            <span class="poster-finish-tag">${poster.finish}</span>
          </div>
        </article>
      `).join('');

    } catch (error) {
      console.error('Error loading posters:', error);
      shopGrid.innerHTML = '<div style="grid-column: 1 / -1; padding: 3rem 0; color: var(--text-muted); text-align: center;">Failed to load catalog. Please check your connection.</div>';
    }
  }

  // Setup category button clicks
  if (categoryFilters) {
    categoryFilters.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;
      currentCategory = btn.getAttribute('data-category');
      updateActiveFilterButton();
      loadPosters();
    });
  }

  // Setup live search with debounce
  if (searchInput) {
    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        currentSearch = e.target.value.trim();
        loadPosters();
      }, 250);
    });
  }

  // Setup sort change
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentSort = e.target.value;
      loadPosters();
    });
  }

  // Initial load
  updateActiveFilterButton();
  loadPosters();
});
