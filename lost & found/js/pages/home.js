/**
 * CampusFind - Home Page Controller
 */

import { onAuthChange, logoutUser } from "../auth.js";
import { getItems, getPlatformStats } from "../db.js";
import { updateNavbar, setupMobileNav, setupModalListeners, initConfigChecker, showToast, formatDate, timeAgo, escapeHTML } from "../ui.js";
import { seedSampleData } from "../seed-data.js";

document.addEventListener("DOMContentLoaded", async () => {
  setupMobileNav();
  setupModalListeners();
  initConfigChecker();

  // Listen for Auth changes
  onAuthChange((user, profile) => {
    updateNavbar(user, profile);

    const logoutBtn = document.getElementById("btn-logout");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", async () => {
        await logoutUser();
        window.location.reload();
      });
    }
  });

  // Hero Quick Search
  const searchForm = document.getElementById("hero-search-form");
  if (searchForm) {
    searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const query = document.getElementById("hero-search-input").value.trim();
      window.location.href = `browse.html?q=${encodeURIComponent(query)}`;
    });
  }

  // Seed sample data button
  const seedBtn = document.getElementById("btn-seed-sample");
  if (seedBtn) {
    seedBtn.addEventListener("click", async () => {
      seedBtn.disabled = true;
      seedBtn.innerHTML = `<span class="spinner" style="width:1rem;height:1rem;"></span> Seeding...`;
      const ok = await seedSampleData();
      if (ok) {
        setTimeout(() => window.location.reload(), 1500);
      } else {
        seedBtn.disabled = false;
        seedBtn.innerHTML = `Seed Demo Listings`;
      }
    });
  }

  // Load platform stats
  loadStats();

  // Load recent listings
  loadRecentListings();
});

async function loadStats() {
  try {
    const stats = await getPlatformStats();
    const totalElem = document.getElementById("stat-total");
    const lostElem = document.getElementById("stat-lost");
    const foundElem = document.getElementById("stat-found");
    const resolvedElem = document.getElementById("stat-resolved");

    if (totalElem) totalElem.textContent = stats.totalListings;
    if (lostElem) lostElem.textContent = stats.lostItems;
    if (foundElem) foundElem.textContent = stats.foundItems;
    if (resolvedElem) resolvedElem.textContent = stats.resolvedItems;
  } catch (error) {
    console.warn("Could not load home stats:", error);
  }
}

async function loadRecentListings() {
  const container = document.getElementById("recent-items-grid");
  if (!container) return;

  try {
    const items = await getItems({ maxResults: 6 });

    if (items.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="empty-state-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          </div>
          <h3 class="empty-state-title">No Listings Yet</h3>
          <p class="empty-state-desc">The campus lost and found board is clean! Be the first to report a lost or found item, or load sample listings.</p>
          <div style="display:flex; justify-content:center; gap:0.75rem;">
            <a href="report.html" class="btn btn-primary btn-sm">Report an Item</a>
            <button type="button" class="btn btn-secondary btn-sm" id="btn-seed-empty">Load Demo Listings</button>
          </div>
        </div>
      `;

      const emptySeedBtn = document.getElementById("btn-seed-empty");
      if (emptySeedBtn) {
        emptySeedBtn.addEventListener("click", async () => {
          await seedSampleData();
          window.location.reload();
        });
      }
      return;
    }

    container.innerHTML = items.map(item => renderItemCard(item)).join("");
  } catch (error) {
    console.error("Error loading recent listings:", error);
    container.innerHTML = `
      <div class="alert alert-warning" style="grid-column: 1 / -1;">
        Could not load items. If your Firebase project is new, ensure Firestore is enabled and rules allow reading.
      </div>
    `;
  }
}

function renderItemCard(item) {
  const isLost = item.type === "lost";
  const badgeClass = isLost ? "badge-lost" : "badge-found";
  const typeText = isLost ? "Lost" : "Found";

  const mediaHTML = item.imageUrl ? 
    `<img src="${escapeHTML(item.imageUrl)}" alt="${escapeHTML(item.name)}" loading="lazy">` : 
    `<div class="media-placeholder">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
      <span style="font-size:0.75rem; margin-top:0.25rem;">No Photograph</span>
    </div>`;

  return `
    <div class="item-card">
      <div class="item-card-media">
        ${mediaHTML}
        <div class="item-card-badges">
          <span class="badge ${badgeClass}">${typeText}</span>
          <span class="badge badge-category">${escapeHTML(item.category || "General")}</span>
        </div>
      </div>
      <div class="item-card-content">
        <h4 class="item-card-title">${escapeHTML(item.name)}</h4>
        <p class="item-card-desc">${escapeHTML(item.description)}</p>
        <div class="item-card-meta">
          <div class="item-meta-row">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            <span style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${escapeHTML(item.location || "Campus")}</span>
          </div>
          <div class="item-meta-row">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            <span>${item.date ? formatDate(item.date) : timeAgo(item.createdAt)}</span>
          </div>
        </div>
        <div class="item-card-actions">
          <a href="item-details.html?id=${item.id}" class="btn btn-outline btn-sm btn-block">View Details &rarr;</a>
        </div>
      </div>
    </div>
  `;
}
