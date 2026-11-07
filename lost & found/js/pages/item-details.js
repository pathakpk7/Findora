/**
 * CampusFind - Item Details & Claim System Controller
 */

import { onAuthChange, logoutUser } from "../auth.js";
import { getItemById, updateItem, deleteItem, createClaim, createReport } from "../db.js";
import { deleteItemImage } from "../storage.js";
import { updateNavbar, setupMobileNav, setupModalListeners, initConfigChecker, openModal, closeModal, showToast, formatDate, timeAgo, escapeHTML } from "../ui.js";

let currentItem = null;
let currentUser = null;
let userProfile = null;

document.addEventListener("DOMContentLoaded", async () => {
  setupMobileNav();
  setupModalListeners();
  initConfigChecker();

  const urlParams = new URLSearchParams(window.location.search);
  const itemId = urlParams.get("id");

  if (!itemId) {
    showItemNotFound();
    return;
  }

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

    // Refresh action buttons based on whether user is owner
    if (currentItem) {
      renderActionButtons();
    }
  });

  await loadItemDetails(itemId);
  setupClaimModal();
  setupReportModal();
  setupDeleteModal();
});

async function loadItemDetails(itemId) {
  const container = document.getElementById("item-details-container");
  if (!container) return;

  try {
    currentItem = await getItemById(itemId);
    if (!currentItem) {
      showItemNotFound();
      return;
    }

    document.title = `${currentItem.name} | CampusFind`;

    const isLost = currentItem.type === "lost";
    const isResolved = currentItem.status === "resolved";

    let badgeHTML = "";
    if (isResolved) {
      badgeHTML = `<span class="badge badge-resolved" style="font-size:0.85rem; padding:0.35rem 0.85rem;">Resolved / Returned</span>`;
    } else if (isLost) {
      badgeHTML = `<span class="badge badge-lost" style="font-size:0.85rem; padding:0.35rem 0.85rem;">Lost Listing</span>`;
    } else {
      badgeHTML = `<span class="badge badge-found" style="font-size:0.85rem; padding:0.35rem 0.85rem;">Found Listing</span>`;
    }

    const mediaHTML = currentItem.imageUrl ? 
      `<img src="${escapeHTML(currentItem.imageUrl)}" alt="${escapeHTML(currentItem.name)}" id="item-main-img">` : 
      `<div class="item-details-placeholder">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
        <span style="font-size:0.95rem; margin-top:0.75rem; color:var(--neutral-500);">No photograph provided</span>
      </div>`;

    container.innerHTML = `
      <div class="item-details-grid">
        <div class="item-details-media">
          ${mediaHTML}
        </div>

        <div class="item-details-info">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; flex-wrap:wrap; gap:0.5rem;">
            <div style="display:flex; gap:0.5rem;">
              ${badgeHTML}
              <span class="badge badge-category" style="font-size:0.85rem; padding:0.35rem 0.85rem;">${escapeHTML(currentItem.category)}</span>
            </div>
            <button type="button" class="btn btn-outline btn-sm" id="btn-flag-listing" style="color:var(--neutral-500);" title="Report suspicious or inappropriate listing">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg>
              Report
            </button>
          </div>

          <h1 style="font-size:1.85rem; font-weight:800; color:var(--neutral-900); margin-bottom:1rem; line-height:1.25;">
            ${escapeHTML(currentItem.name)}
          </h1>

          <table class="item-meta-table">
            <tbody>
              <tr>
                <td>Campus Location</td>
                <td>
                  <strong style="color:var(--primary-700);">${escapeHTML(currentItem.location)}</strong>
                </td>
              </tr>
              <tr>
                <td>Date ${isLost ? "Lost" : "Found"}</td>
                <td>${formatDate(currentItem.date)}</td>
              </tr>
              <tr>
                <td>Listing Posted</td>
                <td>${timeAgo(currentItem.createdAt)}</td>
              </tr>
              <tr>
                <td>Reported By</td>
                <td>${escapeHTML(currentItem.ownerName || "Student")}</td>
              </tr>
            </tbody>
          </table>

          <div style="margin-bottom:1.75rem;">
            <h4 style="font-size:0.95rem; font-weight:700; color:var(--neutral-800); margin-bottom:0.5rem;">Description</h4>
            <p style="font-size:0.95rem; color:var(--neutral-700); line-height:1.6; white-space:pre-line;">
              ${escapeHTML(currentItem.description)}
            </p>
          </div>

          <div class="privacy-notice-box">
            <strong>Security Notice:</strong>
            ${isLost ? 
              `If you found this item, click <strong>"I Found This Item"</strong> below to connect with the owner.` : 
              `To claim this item, click <strong>"Claim This Item"</strong> and provide confidential identifying details to verify ownership before handoff.`
            }
          </div>

          <div id="item-actions-wrapper" style="margin-top:2rem; display:flex; gap:0.75rem; flex-wrap:wrap;">
            <!-- Rendered dynamically based on auth status -->
          </div>
        </div>
      </div>
    `;

    // Bind flag button
    const flagBtn = document.getElementById("btn-flag-listing");
    if (flagBtn) {
      flagBtn.addEventListener("click", () => {
        if (!currentUser) {
          showToast("Please log in to report a listing.", "warning");
          return;
        }
        openModal("report-modal");
      });
    }

    renderActionButtons();
  } catch (error) {
    console.error("Error loading item details:", error);
    showItemNotFound();
  }
}

function renderActionButtons() {
  const wrapper = document.getElementById("item-actions-wrapper");
  if (!wrapper || !currentItem) return;

  const isOwner = currentUser && (currentUser.uid === currentItem.ownerId);
  const isResolved = currentItem.status === "resolved";

  if (isOwner) {
    wrapper.innerHTML = `
      ${!isResolved ? `
        <button type="button" class="btn btn-success" id="btn-mark-resolved">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
          Mark as Returned / Resolved
        </button>
      ` : `
        <button type="button" class="btn btn-secondary" id="btn-reopen">
          Reopen Listing
        </button>
      `}
      <a href="dashboard.html" class="btn btn-outline">My Dashboard</a>
      <button type="button" class="btn btn-danger-outline" id="btn-delete-listing">Delete Listing</button>
    `;

    const resolveBtn = document.getElementById("btn-mark-resolved");
    if (resolveBtn) {
      resolveBtn.addEventListener("click", async () => {
        if (confirm("Are you sure you want to mark this item as resolved/returned?")) {
          await updateItem(currentItem.id, { status: "resolved" });
          showToast("Listing marked as resolved!", "success");
          window.location.reload();
        }
      });
    }

    const reopenBtn = document.getElementById("btn-reopen");
    if (reopenBtn) {
      reopenBtn.addEventListener("click", async () => {
        await updateItem(currentItem.id, { status: "active" });
        showToast("Listing reopened as active!", "success");
        window.location.reload();
      });
    }

    const deleteBtn = document.getElementById("btn-delete-listing");
    if (deleteBtn) {
      deleteBtn.addEventListener("click", () => openModal("delete-modal"));
    }
  } else {
    // Visitor / other student
    const isLost = currentItem.type === "lost";
    const claimButtonText = isLost ? "I Found This Item!" : "Claim This Item";

    wrapper.innerHTML = `
      ${!isResolved ? `
        <button type="button" class="btn btn-primary btn-lg" id="btn-open-claim">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
          ${claimButtonText}
        </button>
      ` : `
        <div class="alert alert-info" style="margin:0; width:100%;">
          This item has been returned to its rightful owner.
        </div>
      `}
      <button type="button" class="btn btn-outline btn-lg" id="btn-contact-poster">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
        Contact Poster
      </button>
    `;

    const openClaimBtn = document.getElementById("btn-open-claim");
    if (openClaimBtn) {
      openClaimBtn.addEventListener("click", () => {
        if (!currentUser) {
          showToast("Please log in to submit a claim.", "warning");
          setTimeout(() => {
            window.location.href = `login.html?redirect=item-details.html?id=${currentItem.id}`;
          }, 1000);
          return;
        }
        openModal("claim-modal");
      });
    }

    const contactBtn = document.getElementById("btn-contact-poster");
    if (contactBtn) {
      contactBtn.addEventListener("click", () => {
        if (!currentUser) {
          showToast("Please log in to contact the poster.", "warning");
          return;
        }
        openModal("contact-modal");
      });
    }
  }
}

function setupClaimModal() {
  const form = document.getElementById("claim-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!currentUser || !currentItem) return;

    const proof = document.getElementById("claim-proof").value.trim();
    const message = document.getElementById("claim-message").value.trim();
    const phone = document.getElementById("claim-phone").value.trim();
    const submitBtn = document.getElementById("btn-submit-claim");

    if (!proof) {
      showToast("Please provide ownership verification details.", "warning");
      return;
    }

    try {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span class="spinner" style="width:1rem;height:1rem;"></span> Submitting...`;

      await createClaim({
        itemId: currentItem.id,
        itemTitle: currentItem.name,
        itemType: currentItem.type,
        ownerId: currentItem.ownerId,
        ownerName: currentItem.ownerName,
        ownerEmail: currentItem.ownerEmail,
        claimantId: currentUser.uid,
        claimantName: userProfile?.name || currentUser.displayName || "Student",
        claimantEmail: currentUser.email,
        claimantPhone: phone,
        proofDetails: proof,
        message: message
      });

      closeModal("claim-modal");
      showToast("Claim submitted successfully! The poster has been notified.", "success");
      form.reset();
    } catch (error) {
      console.error("Error submitting claim:", error);
      showToast("Error submitting claim: " + error.message, "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `Submit Claim`;
    }
  });
}

function setupReportModal() {
  const form = document.getElementById("report-flag-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!currentUser || !currentItem) return;

    const reason = document.getElementById("report-reason").value;
    const details = document.getElementById("report-details").value.trim();
    const submitBtn = document.getElementById("btn-submit-report");

    try {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span class="spinner" style="width:1rem;height:1rem;"></span> Submitting...`;

      await createReport({
        itemId: currentItem.id,
        itemTitle: currentItem.name,
        reporterId: currentUser.uid,
        reporterEmail: currentUser.email,
        reason: reason,
        details: details
      });

      closeModal("report-modal");
      showToast("Listing reported for admin review. Thank you for keeping CampusFind safe.", "success");
      form.reset();
    } catch (error) {
      console.error("Error submitting report:", error);
      showToast("Error reporting listing: " + error.message, "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `Submit Report`;
    }
  });
}

function setupDeleteModal() {
  const confirmBtn = document.getElementById("btn-confirm-delete");
  if (!confirmBtn) return;

  confirmBtn.addEventListener("click", async () => {
    if (!currentItem || !currentUser) return;

    try {
      confirmBtn.disabled = true;
      confirmBtn.innerHTML = `<span class="spinner" style="width:1rem;height:1rem;"></span> Deleting...`;

      if (currentItem.imagePath) {
        await deleteItemImage(currentItem.imagePath);
      }

      await deleteItem(currentItem.id);
      showToast("Listing deleted successfully.", "info");

      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 800);
    } catch (error) {
      console.error("Error deleting item:", error);
      showToast("Error deleting item: " + error.message, "error");
      confirmBtn.disabled = false;
      confirmBtn.innerHTML = `Confirm Delete`;
    }
  });
}

function showItemNotFound() {
  const container = document.getElementById("item-details-container");
  if (container) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        </div>
        <h3 class="empty-state-title">Listing Not Found</h3>
        <p class="empty-state-desc">This item listing may have been removed or the link is invalid.</p>
        <a href="browse.html" class="btn btn-primary btn-sm">Return to Browse Items</a>
      </div>
    `;
  }
}
