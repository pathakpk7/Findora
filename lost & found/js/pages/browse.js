/**
 * CampusFind - Browse & Search Catalog Controller
 */

import { onAuthChange, logoutUser } from "../auth.js";
import { getItems } from "../db.js";
import { updateNavbar, setupMobileNav, setupModalListeners, initConfigChecker, formatDate, timeAgo, escapeHTML } from "../ui.js";

let currentFilters = {
  searchQuery: "",
  type: "all",
  category: "all",
  location: "all",
  status: "all",
  sortBy: "newest"
};

document.addEventListener("DOMContentLoaded", () => {
  setupMobileNav();
  setupModalListeners();
  initConfigChecker();

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

  // Parse URL search params
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has("q")) currentFilters.searchQuery = urlParams.get("q");
  if (urlParams.has("type")) currentFilters.type = urlParams.get("type");
  if (urlParams.has("category")) currentFilters.category = urlParams.get("category");
  if (urlParams.has("location")) currentFilters.location = urlParams.get("location");
  if (urlParams.has("status")) currentFilters.status = urlParams.get("status");

  // Sync UI elements with URL params
  syncFilterInputsWithState();

  // Attach event listeners
  setupFilterEventListeners();

  // Initial fetch
  fetchAndRenderItems();
});

function syncFilterInputsWithState() {
  const searchInput = document.getElementById("browse-search-input");
  if (searchInput) searchInput.value = currentFilters.searchQuery;

  // Type radios
  const typeRadio = document.querySelector(`input[name="filter-type"][value="${currentFilters.type}"]`);
  if (typeRadio) typeRadio.checked = true;

  // Category select
  const catSelect = document.getElementById("filter-category");
  if (catSelect) catSelect.value = currentFilters.category;

  // Location input
  const locInput = document.getElementById("filter-location");
  if (locInput && currentFilters.location !== "all") locInput.value = currentFilters.location;

  // Sort select
  const sortSelect = document.getElementById("browse-sort-select");
  if (sortSelect) sortSelect.value = currentFilters.sortBy;
}

function setupFilterEventListeners() {
  // Search input with debounce
  const searchInput = document.getElementById("browse-search-input");
  let debounceTimeout = null;
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(() => {
        currentFilters.searchQuery = e.target.value.trim();
        fetchAndRenderItems();
      }, 300);
    });
  }

  // Type radio buttons
  const typeRadios = document.querySelectorAll('input[name="filter-type"]');
  typeRadios.forEach(radio => {
    radio.addEventListener("change", (e) => {
      currentFilters.type = e.target.value;
      fetchAndRenderItems();
    });
  });

  // Category dropdown
  const catSelect = document.getElementById("filter-category");
  if (catSelect) {
    catSelect.addEventListener("change", (e) => {
      currentFilters.category = e.target.value;
      fetchAndRenderItems();
    });
  }

  // Location filter
  const locInput = document.getElementById("filter-location");
  if (locInput) {
    locInput.addEventListener("input", (e) => {
      clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(() => {
        currentFilters.location = e.target.value.trim() || "all";
        fetchAndRenderItems();
      }, 350);
    });
  }

  // Sort select
  const sortSelect = document.getElementById("browse-sort-select");
  if (sortSelect) {
    sortSelect.addEventListener("change", (e) => {
      currentFilters.sortBy = e.target.value;
      fetchAndRenderItems();
    });
  }

  // Reset Filters
  const clearBtn = document.getElementById("clear-filters-btn");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      currentFilters = {
        searchQuery: "",
        type: "all",
        category: "all",
        location: "all",
        status: "all",
        sortBy: "newest"
      };
      syncFilterInputsWithState();
      fetchAndRenderItems();
    });
  }
}

async function fetchAndRenderItems() {
  const container = document.getElementById("browse-items-grid");
  const countElem = document.getElementById("results-count");
  if (!container) return;

  container.innerHTML = `
    <div class="loading-container" style="grid-column: 1 / -1;">
      <div class="spinner spinner-lg"></div>
      <p>Searching campus listings...</p>
    </div>
  `;

  try {
    const items = await getItems(currentFilters);

    if (countElem) {
      countElem.innerHTML = `Found <strong>${items.length}</strong> ${items.length === 1 ? 'item' : 'items'}`;
    }

    if (items.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="empty-state-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </div>
          <h3 class="empty-state-title">No Matching Items Found</h3>
          <p class="empty-state-desc">Try clearing your search terms or expanding your filter categories. You can also report a new lost or found listing.</p>
          <div style="display:flex; justify-content:center; gap:0.75rem;">
            <button type="button" class="btn btn-outline btn-sm" id="empty-clear-btn">Clear All Filters</button>
            <a href="report.html" class="btn btn-primary btn-sm">Report Lost or Found</a>
          </div>
        </div>
      `;

      const emptyClear = document.getElementById("empty-clear-btn");
      if (emptyClear) {
        emptyClear.addEventListener("click", () => {
          document.getElementById("clear-filters-btn")?.click();
        });
      }
      return;
    }

    container.innerHTML = items.map(item => renderItemCard(item)).join("");
  } catch (error) {
    console.error("Error searching items:", error);
    container.innerHTML = `
      <div class="alert alert-danger" style="grid-column: 1 / -1;">
        Failed to load listings. Check your internet connection or Firebase setup.
      </div>
    `;
  }
}

function renderItemCard(item) {
  const isLost = item.type === "lost";
  const isResolved = item.status === "resolved";

  let badgeHTML = "";
  if (isResolved) {
    badgeHTML = `<span class="badge badge-resolved">Resolved</span>`;
  } else if (isLost) {
    badgeHTML = `<span class="badge badge-lost">Lost</span>`;
  } else {
    badgeHTML = `<span class="badge badge-found">Found</span>`;
  }

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
          ${badgeHTML}
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
