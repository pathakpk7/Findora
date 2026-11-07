/**
 * CampusFind - Student Profile Controller
 */

import { onAuthChange, logoutUser, requireAuth, updateUserProfile, resetPassword } from "../auth.js";
import { updateNavbar, setupMobileNav, setupModalListeners, initConfigChecker, showToast, formatDate } from "../ui.js";

let currentUser = null;
let currentProfile = null;

document.addEventListener("DOMContentLoaded", () => {
  setupMobileNav();
  setupModalListeners();
  initConfigChecker();
  requireAuth();

  onAuthChange((user, profile) => {
    currentUser = user;
    currentProfile = profile;
    updateNavbar(user, profile);

    const logoutBtn = document.getElementById("btn-logout");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", async () => {
        await logoutUser();
        window.location.reload();
      });
    }

    if (user && profile) {
      populateProfileForm(user, profile);
    }
  });

  setupProfileUpdateForm();
  setupPasswordResetButton();
});

function populateProfileForm(user, profile) {
  const nameInput = document.getElementById("profile-name");
  const emailInput = document.getElementById("profile-email");
  const studentIdInput = document.getElementById("profile-student-id");
  const phoneInput = document.getElementById("profile-phone");
  const roleBadge = document.getElementById("profile-role-badge");
  const avatarLetter = document.getElementById("profile-avatar-letter");
  const headerName = document.getElementById("profile-header-name");
  const joinedDate = document.getElementById("profile-joined-date");

  if (nameInput) nameInput.value = profile.name || user.displayName || "";
  if (emailInput) emailInput.value = user.email || "";
  if (studentIdInput) studentIdInput.value = profile.studentId || "";
  if (phoneInput) phoneInput.value = profile.phone || "";

  if (headerName) headerName.textContent = profile.name || user.displayName || "Student";
  if (avatarLetter) avatarLetter.textContent = (profile.name || user.email || "S").charAt(0).toUpperCase();

  if (roleBadge) {
    const isAdmin = profile.role === "admin";
    roleBadge.textContent = isAdmin ? "Campus Administrator" : "Verified Student";
    roleBadge.className = `badge ${isAdmin ? 'badge-admin' : 'badge-found'}`;
  }

  if (joinedDate && profile.createdAt) {
    joinedDate.textContent = `Member since ${formatDate(profile.createdAt.toDate ? profile.createdAt.toDate() : profile.createdAt)}`;
  }
}

function setupProfileUpdateForm() {
  const form = document.getElementById("profile-form");
  const submitBtn = document.getElementById("btn-save-profile");

  if (!form || !submitBtn) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    const name = document.getElementById("profile-name").value.trim();
    const studentId = document.getElementById("profile-student-id").value.trim();
    const phone = document.getElementById("profile-phone").value.trim();

    try {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span class="spinner" style="width:1rem;height:1rem;"></span> Saving...`;

      await updateUserProfile(currentUser.uid, {
        name,
        studentId,
        phone
      });

      showToast("Profile updated successfully!", "success");
      document.getElementById("profile-header-name").textContent = name;
    } catch (error) {
      console.error("Profile update error:", error);
      showToast("Failed to update profile: " + error.message, "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `Save Profile Changes`;
    }
  });
}

function setupPasswordResetButton() {
  const btn = document.getElementById("btn-request-password-change");
  if (!btn) return;

  btn.addEventListener("click", async () => {
    if (!currentUser) return;
    try {
      btn.disabled = true;
      btn.innerHTML = `<span class="spinner" style="width:1rem;height:1rem;"></span> Sending Link...`;

      await resetPassword(currentUser.email);
      showToast(`Password reset link sent to ${currentUser.email}.`, "success");
    } catch (error) {
      console.error("Password reset error:", error);
      showToast("Could not send reset link: " + error.message, "error");
    } finally {
      btn.disabled = false;
      btn.innerHTML = `Send Password Reset Email`;
    }
  });
}
