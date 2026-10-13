/**
 * public/js/home.js
 * Home page logic: loads and renders featured curated posters
 */

document.addEventListener('DOMContentLoaded', async () => {
  const featuredGrid = document.getElementById('featuredGrid');
  if (!featuredGrid) return;

  try {
    featuredGrid.innerHTML = '<div style="grid-column: 1 / -1; padding: 2rem 0; color: var(--text-muted); text-align: center;">Loading curated pieces...</div>';

    const res = await fetchPosters({ featured: 'true' });
    const posters = res.data && res.data.length > 0 ? res.data.slice(0, 6) : [];

    if (posters.length === 0) {
      featuredGrid.innerHTML = '<div style="grid-column: 1 / -1; padding: 2rem 0; color: var(--text-muted); text-align: center;">No featured posters found.</div>';
      return;
    }

    featuredGrid.innerHTML = posters.map(poster => `
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
    console.error('Error rendering featured posters:', error);
    featuredGrid.innerHTML = '<div style="grid-column: 1 / -1; padding: 2rem 0; color: var(--text-muted); text-align: center;">Unable to load featured posters at this time.</div>';
  }
});
