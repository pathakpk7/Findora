/**
 * CampusFind - Student Dashboard Controller
 * Manages My Listings, Incoming Claims Reviewer, and Submitted Claims Tracking.
 */

import { onAuthChange, logoutUser, requireAuth } from "../auth.js";
import { getItemsByOwner, getIncomingClaims, getSubmittedClaims, updateClaimStatus, updateItem, deleteItem } from "../db.js";
import { deleteItemImage } from "../storage.js";
import { updateNavbar, setupMobileNav, setupModalListeners, initConfigChecker, openModal, closeModal, showToast, formatDate, timeAgo, escapeHTML } from "../ui.js";

let currentUser = null;
let itemToDelete = null;

document.addEventListener("DOMContentLoaded", () => {
  setupMobileNav();
  setupModalListeners();
  initConfigChecker();
  requireAuth();

  onAuthChange(async (user, profile) => {
    currentUser = user;
    updateNavbar(user, profile);

    const logoutBtn = document.getElementById("btn-logout");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", async () => {
        await logoutUser();
        window.location.reload();
      });
    }

    if (user) {
      setupTabs();
      setupDeleteModal();
      await loadDashboardData(user.uid);
    }
  });
});

function setupTabs() {
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
}

async function loadDashboardData(userId) {
  try {
    // 1. Fetch Student Listings
    const listings = await getItemsByOwner(userId);
    renderMyListings(listings);

    // 2. Fetch Incoming Claims on my Found/Lost items
    const incomingClaims = await getIncomingClaims(userId);
    renderIncomingClaims(incomingClaims);

    // 3. Fetch Claims submitted by me
    const submittedClaims = await getSubmittedClaims(userId);
    renderSubmittedClaims(submittedClaims);

    // Update Counter Badges
    const countListings = document.getElementById("count-my-listings");
    const countIncoming = document.getElementById("count-incoming-claims");
    const countSubmitted = document.getElementById("count-submitted-claims");

    if (countListings) countListings.textContent = listings.length;
    if (countIncoming) countIncoming.textContent = incomingClaims.length;
    if (countSubmitted) countSubmitted.textContent = submittedClaims.length;

    // Stat cards
    const statActive = document.getElementById("stat-user-active");
    const statResolved = document.getElementById("stat-user-resolved");
    const statPendingClaims = document.getElementById("stat-user-pending-claims");

    if (statActive) {
      statActive.textContent = listings.filter(i => i.status === 'active').length;
    }
    if (statResolved) {
      statResolved.textContent = listings.filter(i => i.status === 'resolved').length;
    }
    if (statPendingClaims) {
      statPendingClaims.textContent = incomingClaims.filter(c => c.status === 'pending').length;
    }
  } catch (error) {
    console.error("Error loading dashboard data:", error);
    showToast("Error loading your dashboard records: " + error.message, "error");
  }
}

function renderMyListings(items) {
  const container = document.getElementById("my-listings-container");
  if (!container) return;

  if (items.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
        </div>
        <h3 class="empty-state-title">No Listings Yet</h3>
        <p class="empty-state-desc">You haven't reported any lost or found items yet.</p>
        <a href="report.html" class="btn btn-primary btn-sm">Report Lost or Found Item</a>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="table-responsive">
      <table class="data-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Type</th>
            <th>Category</th>
            <th>Date</th>
            <th>Status</th>
            <th style="text-align:right;">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(item => {
            const isLost = item.type === 'lost';
            const isResolved = item.status === 'resolved';
            return `
              <tr>
                <td>
                  <strong><a href="item-details.html?id=${item.id}" style="color:var(--neutral-900);">${escapeHTML(item.name)}</a></strong>
                  <div style="font-size:0.775rem; color:var(--neutral-500);">${escapeHTML(item.location)}</div>
                </td>
                <td>
                  <span class="badge ${isLost ? 'badge-lost' : 'badge-found'}">${isLost ? 'Lost' : 'Found'}</span>
                </td>
                <td><span class="badge badge-category">${escapeHTML(item.category)}</span></td>
                <td>${formatDate(item.date)}</td>
                <td>
                  <span class="badge ${isResolved ? 'badge-resolved' : 'badge-found'}">
                    ${isResolved ? 'Resolved' : 'Active'}
                  </span>
                </td>
                <td style="text-align:right;">
                  <div style="display:inline-flex; gap:0.4rem;">
                    <a href="item-details.html?id=${item.id}" class="btn btn-outline btn-sm">View</a>
                    ${!isResolved ? `
                      <button type="button" class="btn btn-success btn-sm btn-resolve-item" data-id="${item.id}">
                        Mark Returned
                      </button>
                    ` : ''}
                    <button type="button" class="btn btn-danger-outline btn-sm btn-trigger-delete" data-id="${item.id}" data-path="${item.imagePath || ''}">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;

  // Attach listing action listeners
  container.querySelectorAll(".btn-resolve-item").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      if (confirm("Mark this item as returned/resolved?")) {
        await updateItem(id, { status: "resolved" });
        showToast("Item marked as resolved!", "success");
        loadDashboardData(currentUser.uid);
      }
    });
  });

  container.querySelectorAll(".btn-trigger-delete").forEach(btn => {
    btn.addEventListener("click", () => {
      itemToDelete = {
        id: btn.dataset.id,
        imagePath: btn.dataset.path
      };
      openModal("delete-modal");
    });
  });
}

function renderIncomingClaims(claims) {
  const container = document.getElementById("incoming-claims-container");
  if (!container) return;

  if (claims.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
        </div>
        <h3 class="empty-state-title">No Claims Received</h3>
        <p class="empty-state-desc">When other students submit ownership verification claims on items you found, they will appear here for your review.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = claims.map(claim => {
    const isPending = claim.status === 'pending';
    const isApproved = claim.status === 'approved';
    const isRejected = claim.status === 'rejected';

    let statusBadge = "";
    if (isPending) statusBadge = `<span class="badge badge-pending">Pending Review</span>`;
    else if (isApproved) statusBadge = `<span class="badge badge-found">Approved</span>`;
    else if (isRejected) statusBadge = `<span class="badge badge-lost">Rejected</span>`;
    else statusBadge = `<span class="badge badge-resolved">Resolved</span>`;

    return `
      <div class="claim-card">
        <div class="claim-card-header">
          <div>
            <h4 style="font-size:1.05rem; font-weight:700; color:var(--neutral-900);">
              Claim for: <a href="item-details.html?id=${claim.itemId}">${escapeHTML(claim.itemTitle)}</a>
            </h4>
            <div style="font-size:0.825rem; color:var(--neutral-500); margin-top:0.2rem;">
              Submitted by <strong>${escapeHTML(claim.claimantName)}</strong> (${escapeHTML(claim.claimantEmail)}) &bull; ${timeAgo(claim.createdAt)}
            </div>
          </div>
          <div>${statusBadge}</div>
        </div>

        <div class="claim-secret-box">
          <strong style="display:block; margin-bottom:0.25rem;">🔒 Confidential Ownership Proof:</strong>
          <span>${escapeHTML(claim.proofDetails)}</span>
        </div>

        ${claim.message ? `
          <div style="font-size:0.875rem; color:var(--neutral-700); margin-bottom:0.75rem;">
            <strong>Note from Claimant:</strong> "${escapeHTML(claim.message)}"
          </div>
        ` : ''}

        ${claim.claimantPhone ? `
          <div style="font-size:0.825rem; color:var(--neutral-600); margin-bottom:0.75rem;">
            <strong>Phone / WhatsApp:</strong> ${escapeHTML(claim.claimantPhone)}
          </div>
        ` : ''}

        ${isPending ? `
          <div style="display:flex; gap:0.5rem; margin-top:1rem; border-top:1px solid var(--neutral-100); padding-top:0.75rem;">
            <button type="button" class="btn btn-success btn-sm btn-approve-claim" data-id="${claim.id}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
              Approve Claim (Verify Ownership)
            </button>
            <button type="button" class="btn btn-danger-outline btn-sm btn-reject-claim" data-id="${claim.id}">
              Reject Claim
            </button>
          </div>
        ` : ''}
      </div>
    `;
  }).join('');

  // Attach claim response listeners
  container.querySelectorAll(".btn-approve-claim").forEach(btn => {
    btn.addEventListener("click", async () => {
      const claimId = btn.dataset.id;
      if (confirm("Accept this claim? Your contact details will be shared with the claimant to arrange handoff.")) {
        await updateClaimStatus(claimId, "approved", "Approved by poster.");
        showToast("Claim approved! You can coordinate with the student to hand over the item.", "success");
        loadDashboardData(currentUser.uid);
      }
    });
  });

  container.querySelectorAll(".btn-reject-claim").forEach(btn => {
    btn.addEventListener("click", async () => {
      const claimId = btn.dataset.id;
      const reason = prompt("Enter a brief reason for rejection (optional):", "Identifying details did not match.") || "Proof details did not match.";
      await updateClaimStatus(claimId, "rejected", reason);
      showToast("Claim rejected.", "info");
      loadDashboardData(currentUser.uid);
    });
  });
}

function renderSubmittedClaims(claims) {
  const container = document.getElementById("submitted-claims-container");
  if (!container) return;

  if (claims.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline></svg>
        </div>
        <h3 class="empty-state-title">No Claims Submitted</h3>
        <p class="empty-state-desc">You have not claimed any found items yet.</p>
        <a href="browse.html" class="btn btn-primary btn-sm">Browse Campus Items</a>
      </div>
    `;
    return;
  }

  container.innerHTML = claims.map(claim => {
    const isApproved = claim.status === 'approved';
    const isPending = claim.status === 'pending';
    const isRejected = claim.status === 'rejected';

    let badge = "";
    if (isPending) badge = `<span class="badge badge-pending">Under Review by Poster</span>`;
    else if (isApproved) badge = `<span class="badge badge-found">Approved!</span>`;
    else if (isRejected) badge = `<span class="badge badge-lost">Rejected</span>`;
    else badge = `<span class="badge badge-resolved">Resolved</span>`;

    return `
      <div class="claim-card">
        <div class="claim-card-header">
          <div>
            <h4 style="font-size:1.05rem; font-weight:700; color:var(--neutral-900);">
              Item: <a href="item-details.html?id=${claim.itemId}">${escapeHTML(claim.itemTitle)}</a>
            </h4>
            <div style="font-size:0.825rem; color:var(--neutral-500); margin-top:0.2rem;">
              Submitted ${timeAgo(claim.createdAt)}
            </div>
          </div>
          <div>${badge}</div>
        </div>

        <div style="font-size:0.875rem; color:var(--neutral-700); margin-bottom:0.75rem;">
          <strong>Your Submitted Proof:</strong> ${escapeHTML(claim.proofDetails)}
        </div>

        ${isApproved ? `
          <div class="alert alert-success" style="margin-bottom:0.5rem;">
            <strong>Claim Approved by Poster!</strong><br>
            Please contact the finder to coordinate collection: 
            <strong>${escapeHTML(claim.ownerEmail)}</strong>
          </div>
        ` : ''}

        ${isRejected && claim.posterResponse ? `
          <div class="alert alert-danger" style="margin-bottom:0.5rem;">
            <strong>Poster Note:</strong> ${escapeHTML(claim.posterResponse)}
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
}

function setupDeleteModal() {
  const confirmBtn = document.getElementById("btn-dashboard-confirm-delete");
  if (!confirmBtn) return;

  confirmBtn.addEventListener("click", async () => {
    if (!itemToDelete) return;

    try {
      confirmBtn.disabled = true;
      confirmBtn.innerHTML = `<span class="spinner" style="width:1rem;height:1rem;"></span> Deleting...`;

      if (itemToDelete.imagePath) {
        await deleteItemImage(itemToDelete.imagePath);
      }

      await deleteItem(itemToDelete.id);
      closeModal("delete-modal");
      showToast("Listing deleted successfully.", "info");
      itemToDelete = null;

      await loadDashboardData(currentUser.uid);
    } catch (error) {
      console.error("Error deleting listing:", error);
      showToast("Error deleting listing: " + error.message, "error");
    } finally {
      confirmBtn.disabled = false;
      confirmBtn.innerHTML = `Confirm Delete`;
    }
  });
}
