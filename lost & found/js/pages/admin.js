/**
 * CampusFind - Administrator Dashboard Controller
 * Platform Analytics, Listing Moderation, Inappropriate Content Queue, and Demo Tools.
 */

import { onAuthChange, logoutUser, requireAuth, updateUserProfile } from "../auth.js";
import { getItems, getAllReports, updateReportStatus, deleteItem, updateItem, getPlatformStats } from "../db.js";
import { deleteItemImage } from "../storage.js";
import { updateNavbar, setupMobileNav, setupModalListeners, initConfigChecker, openModal, closeModal, showToast, formatDate, timeAgo, escapeHTML } from "../ui.js";
import { seedSampleData } from "../seed-data.js";

let currentUser = null;
let userProfile = null;
let itemToDelete = null;

document.addEventListener("DOMContentLoaded", () => {
  setupMobileNav();
  setupModalListeners();
  initConfigChecker();
  requireAuth();

  onAuthChange(async (user, profile) => {
    currentUser = user;
    userProfile = profile;
    updateNavbar(user, profile);

    const logoutBtn = document.getElementById("btn-logout");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", async () => {
        await logoutUser();
        window.location.reload();
      });
    }

    if (user) {
      if (profile?.role === "admin") {
        setupAdminDashboard();
        await loadAdminData();
      } else {
        renderAccessDenied(user);
      }
    }
  });
});

function renderAccessDenied(user) {
  const container = document.getElementById("admin-content-wrapper");
  if (!container) return;

  container.innerHTML = `
    <div class="empty-state" style="max-width:600px; margin:3rem auto;">
      <div class="empty-state-icon" style="background-color:#fee2e2; color:#ef4444;">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
      </div>
      <h3 class="empty-state-title">Administrator Privileges Required</h3>
      <p class="empty-state-desc">
        Your account (<strong>${escapeHTML(user.email)}</strong>) currently has the <strong>Student</strong> role. Admin privileges are required to moderate listings and view the report queue.
      </p>
      <div class="alert alert-info" style="text-align:left; font-size:0.875rem; margin-bottom:1.5rem;">
        <strong>B.Tech Project Evaluation Note:</strong><br>
        For project testing and viva evaluation, you can promote your current account to an <strong>Administrator</strong> with the button below:
      </div>
      <div style="display:flex; justify-content:center; gap:0.75rem;">
        <button type="button" class="btn btn-primary" id="btn-promote-admin">
          Grant Admin Role to My Account
        </button>
        <a href="dashboard.html" class="btn btn-outline">Back to Student Dashboard</a>
      </div>
    </div>
  `;

  const promoteBtn = document.getElementById("btn-promote-admin");
  if (promoteBtn) {
    promoteBtn.addEventListener("click", async () => {
      promoteBtn.disabled = true;
      promoteBtn.innerHTML = `<span class="spinner" style="width:1rem;height:1rem;"></span> Granting role...`;
      await updateUserProfile(user.uid, { role: "admin" });
      showToast("Granted Administrator role! Reloading dashboard...", "success");
      setTimeout(() => window.location.reload(), 1200);
    });
  }
}

function setupAdminDashboard() {
  const tabBtns = document.querySelectorAll(".tab-btn");
  const tabPanes = document.querySelectorAll(".tab-pane");

  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      tabBtns.forEach(b => b.classList.remove("active"));
      tabPanes.forEach(p => p.classList.remove("active"));

      btn.classList.add("active");
      const targetId = btn.dataset.target;
      const targetPane = document.getElementById(targetId);
      if (targetPane) targetPane.classList.add("active");
    });
  });

  // Seed data trigger in admin
  const seedBtn = document.getElementById("btn-admin-seed");
  if (seedBtn) {
    seedBtn.addEventListener("click", async () => {
      seedBtn.disabled = true;
      seedBtn.innerHTML = `<span class="spinner" style="width:1rem;height:1rem;"></span> Seeding...`;
      const ok = await seedSampleData();
      if (ok) {
        setTimeout(() => window.location.reload(), 1200);
      } else {
        seedBtn.disabled = false;
        seedBtn.innerHTML = `Seed Sample Campus Data`;
      }
    });
  }

  // Delete modal listener
  const confirmDeleteBtn = document.getElementById("btn-admin-confirm-delete");
  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener("click", async () => {
      if (!itemToDelete) return;
      try {
        confirmDeleteBtn.disabled = true;
        if (itemToDelete.imagePath) {
          await deleteItemImage(itemToDelete.imagePath);
        }
        await deleteItem(itemToDelete.id);
        closeModal("admin-delete-modal");
        showToast("Listing deleted by administrator.", "info");
        itemToDelete = null;
        await loadAdminData();
      } catch (error) {
        console.error("Error deleting item:", error);
        showToast("Error deleting item: " + error.message, "error");
      } finally {
        confirmDeleteBtn.disabled = false;
      }
    });
  }
}

async function loadAdminData() {
  try {
    // 1. Stats
    const stats = await getPlatformStats();
    document.getElementById("admin-stat-total").textContent = stats.totalListings;
    document.getElementById("admin-stat-lost").textContent = stats.lostItems;
    document.getElementById("admin-stat-found").textContent = stats.foundItems;
    document.getElementById("admin-stat-resolved").textContent = stats.resolvedItems;
    document.getElementById("admin-stat-claims").textContent = stats.pendingClaims;
    document.getElementById("admin-stat-reports").textContent = stats.reportsCount;

    // 2. All Listings
    const items = await getItems({ maxResults: 100 });
    renderAdminListingsTable(items);

    // 3. Moderation Reports Queue
    const reports = await getAllReports();
    renderReportsQueue(reports);
  } catch (error) {
    console.error("Error loading admin data:", error);
    showToast("Error loading admin records: " + error.message, "error");
  }
}

function renderAdminListingsTable(items) {
  const container = document.getElementById("admin-listings-table-container");
  if (!container) return;

  if (items.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <h4 class="empty-state-title">No Listings on Platform</h4>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="table-responsive">
      <table class="data-table">
        <thead>
          <tr>
            <th>Item Details</th>
            <th>Type</th>
            <th>Category</th>
            <th>Location</th>
            <th>Poster</th>
            <th>Status</th>
            <th style="text-align:right;">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(item => {
            const isLost = item.type === "lost";
            const isResolved = item.status === "resolved";
            return `
              <tr>
                <td>
                  <strong><a href="item-details.html?id=${item.id}" target="_blank" style="color:var(--neutral-900);">${escapeHTML(item.name)}</a></strong>
                  <div style="font-size:0.775rem; color:var(--neutral-500);">${timeAgo(item.createdAt)}</div>
                </td>
                <td>
                  <span class="badge ${isLost ? 'badge-lost' : 'badge-found'}">${isLost ? 'Lost' : 'Found'}</span>
                </td>
                <td><span class="badge badge-category">${escapeHTML(item.category)}</span></td>
                <td>${escapeHTML(item.location)}</td>
                <td>
                  <div style="font-size:0.85rem; font-weight:600;">${escapeHTML(item.ownerName || "Student")}</div>
                  <div style="font-size:0.75rem; color:var(--neutral-500);">${escapeHTML(item.ownerEmail)}</div>
                </td>
                <td>
                  <select class="form-select status-toggle-select" data-id="${item.id}" style="padding:0.25rem 0.5rem; font-size:0.8rem; width:auto;">
                    <option value="active" ${!isResolved ? 'selected' : ''}>Active</option>
                    <option value="resolved" ${isResolved ? 'selected' : ''}>Resolved</option>
                  </select>
                </td>
                <td style="text-align:right;">
                  <button type="button" class="btn btn-danger-outline btn-sm btn-admin-delete" data-id="${item.id}" data-path="${item.imagePath || ''}">
                    Remove
                  </button>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;

  // Status Change listeners
  container.querySelectorAll(".status-toggle-select").forEach(select => {
    select.addEventListener("change", async (e) => {
      const id = e.target.dataset.id;
      const newStatus = e.target.value;
      await updateItem(id, { status: newStatus });
      showToast(`Status updated to ${newStatus}.`, "success");
    });
  });

  // Admin delete trigger
  container.querySelectorAll(".btn-admin-delete").forEach(btn => {
    btn.addEventListener("click", () => {
      itemToDelete = {
        id: btn.dataset.id,
        imagePath: btn.dataset.path
      };
      openModal("admin-delete-modal");
    });
  });
}

function renderReportsQueue(reports) {
  const container = document.getElementById("admin-reports-container");
  if (!container) return;

  const pendingReports = reports.filter(r => r.status === 'pending');

  if (pendingReports.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon" style="background-color:#d1fae5; color:#10b981;">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
        <h3 class="empty-state-title">Moderation Queue is Clear</h3>
        <p class="empty-state-desc">No inappropriate listings or spam reports are currently pending review.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = pendingReports.map(report => `
    <div class="card" style="margin-bottom:1rem; border-left:4px solid var(--lost-color);">
      <div class="card-body">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.75rem;">
          <div>
            <h4 style="font-size:1.05rem; font-weight:700; color:var(--neutral-900);">
              Reported Item: <a href="item-details.html?id=${report.itemId}" target="_blank">${escapeHTML(report.itemTitle)}</a>
            </h4>
            <div style="font-size:0.8rem; color:var(--neutral-500); margin-top:0.2rem;">
              Reported by: <strong>${escapeHTML(report.reporterEmail)}</strong> &bull; ${timeAgo(report.createdAt)}
            </div>
          </div>
          <span class="badge badge-lost" style="text-transform:uppercase;">Reason: ${escapeHTML(report.reason)}</span>
        </div>

        ${report.details ? `
          <div style="font-size:0.875rem; color:var(--neutral-700); background-color:var(--neutral-50); padding:0.75rem; border-radius:var(--radius-sm); margin-bottom:1rem;">
            <strong>Details:</strong> "${escapeHTML(report.details)}"
          </div>
        ` : ''}

        <div style="display:flex; gap:0.5rem; justify-content:flex-end;">
          <button type="button" class="btn btn-outline btn-sm btn-dismiss-report" data-id="${report.id}">
            Dismiss Report
          </button>
          <button type="button" class="btn btn-danger btn-sm btn-remove-reported-item" data-report-id="${report.id}" data-item-id="${report.itemId}">
            Delete Reported Listing
          </button>
        </div>
      </div>
    </div>
  `).join('');

  // Dismiss report
  container.querySelectorAll(".btn-dismiss-report").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      await updateReportStatus(id, "dismissed");
      showToast("Report dismissed.", "info");
      loadAdminData();
    });
  });

  // Remove reported item and resolve report
  container.querySelectorAll(".btn-remove-reported-item").forEach(btn => {
    btn.addEventListener("click", async () => {
      const reportId = btn.dataset.reportId;
      const itemId = btn.dataset.itemId;
      if (confirm("Are you sure you want to permanently delete this listing?")) {
        await deleteItem(itemId);
        await updateReportStatus(reportId, "resolved");
        showToast("Listing deleted and report marked resolved.", "success");
        loadAdminData();
      }
    });
  });
}
