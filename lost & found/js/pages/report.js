/**
 * CampusFind - Report Lost or Found Item Controller
 */

import { onAuthChange, logoutUser, requireAuth } from "../auth.js";
import { createItem } from "../db.js";
import { uploadItemImage } from "../storage.js";
import { updateNavbar, setupMobileNav, setupModalListeners, initConfigChecker, showToast } from "../ui.js";

let currentUser = null;
let userProfile = null;
let selectedFile = null;

document.addEventListener("DOMContentLoaded", () => {
  setupMobileNav();
  setupModalListeners();
  initConfigChecker();

  // Route protection
  requireAuth();

  onAuthChange((user, profile) => {
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

    // Prefill phone if user has it
    if (profile?.phone) {
      const phoneInput = document.getElementById("report-phone");
      if (phoneInput && !phoneInput.value) phoneInput.value = profile.phone;
    }
  });

  // Set default date to today
  const dateInput = document.getElementById("report-date");
  if (dateInput) {
    const today = new Date().toISOString().split("T")[0];
    dateInput.value = today;
    dateInput.max = today;
  }

  // Type Selector (Lost vs Found)
  setupTypeSelector();

  // Image Upload & Preview Handling
  setupImageUploader();

  // Form Submission
  setupFormSubmit();
});

function setupTypeSelector() {
  const cards = document.querySelectorAll(".type-toggle-card");
  const hiddenInput = document.getElementById("report-type");
  const formHeading = document.getElementById("report-form-heading");
  const descHelp = document.getElementById("desc-help-text");

  cards.forEach(card => {
    card.addEventListener("click", () => {
      cards.forEach(c => c.classList.remove("active-lost", "active-found"));
      const type = card.dataset.type;
      hiddenInput.value = type;

      if (type === "lost") {
        card.classList.add("active-lost");
        if (formHeading) formHeading.textContent = "Report a Lost Belonging";
        if (descHelp) descHelp.textContent = "Mention any identifiable marks, color, brand, or circumstances under which it was lost.";
      } else {
        card.classList.add("active-found");
        if (formHeading) formHeading.textContent = "Report a Found Item";
        if (descHelp) descHelp.textContent = "Describe the item clearly, but leave out confidential secrets (like passcode, cash amount, or lockscreen) so claimants can verify ownership!";
      }
    });
  });
}

function setupImageUploader() {
  const fileInput = document.getElementById("report-photo");
  const dropzone = document.getElementById("upload-dropzone");
  const previewContainer = document.getElementById("upload-preview");
  const previewImg = document.getElementById("preview-img");
  const removeBtn = document.getElementById("remove-preview-btn");

  if (!fileInput || !dropzone) return;

  dropzone.addEventListener("click", () => fileInput.click());

  // Drag and drop states
  ["dragenter", "dragover"].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.add("dragover");
    });
  });

  ["dragleave", "drop"].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.remove("dragover");
    });
  });

  dropzone.addEventListener("drop", (e) => {
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelection(files[0]);
    }
  });

  fileInput.addEventListener("change", (e) => {
    if (e.target.files.length > 0) {
      handleFileSelection(e.target.files[0]);
    }
  });

  if (removeBtn) {
    removeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      selectedFile = null;
      fileInput.value = "";
      if (previewContainer) previewContainer.style.display = "none";
      dropzone.style.display = "block";
    });
  }

  function handleFileSelection(file) {
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      showToast("Invalid file type. Please upload a JPG, PNG, or WebP photo.", "error");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast("File exceeds 5MB limit. Please choose a smaller photo.", "error");
      return;
    }

    selectedFile = file;

    const reader = new FileReader();
    reader.onload = (e) => {
      if (previewImg && previewContainer) {
        previewImg.src = e.target.result;
        previewContainer.style.display = "inline-block";
        dropzone.style.display = "none";
      }
    };
    reader.readAsDataURL(file);
  }
}

function setupFormSubmit() {
  const form = document.getElementById("report-form");
  const submitBtn = document.getElementById("submit-report-btn");

  if (!form || !submitBtn) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!currentUser) {
      showToast("Please log in to submit a listing.", "warning");
      return;
    }

    const type = document.getElementById("report-type").value || "lost";
    const name = document.getElementById("report-name").value.trim();
    const category = document.getElementById("report-category").value;
    const location = document.getElementById("report-location").value.trim();
    const date = document.getElementById("report-date").value;
    const description = document.getElementById("report-description").value.trim();
    const contactPref = document.getElementById("report-contact-pref").value;
    const contactPhone = document.getElementById("report-phone")?.value.trim() || "";

    if (!name || !category || !location || !date || !description) {
      showToast("Please fill in all required fields.", "warning");
      return;
    }

    try {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span class="spinner" style="width:1.1rem;height:1.1rem;"></span> Submitting...`;

      let imageUrl = "";
      let imagePath = "";

      // Upload photo if chosen
      if (selectedFile) {
        submitBtn.innerHTML = `<span class="spinner" style="width:1.1rem;height:1.1rem;"></span> Uploading Photograph...`;
        const uploadResult = await uploadItemImage(selectedFile, currentUser.uid);
        imageUrl = uploadResult.downloadURL;
        imagePath = uploadResult.storagePath;
      }

      submitBtn.innerHTML = `<span class="spinner" style="width:1.1rem;height:1.1rem;"></span> Saving Listing...`;

      const itemData = {
        name,
        type,
        category,
        location,
        date,
        description,
        imageUrl,
        imagePath,
        contactPreference: contactPref,
        contactPhone: contactPhone,
        status: "active",
        ownerId: currentUser.uid,
        ownerName: userProfile?.name || currentUser.displayName || "Student",
        ownerEmail: currentUser.email
      };

      const itemId = await createItem(itemData);
      showToast(`Listing for "${name}" created successfully!`, "success");

      setTimeout(() => {
        window.location.href = `item-details.html?id=${itemId}`;
      }, 1000);
    } catch (error) {
      console.error("Error creating listing:", error);
      showToast("Error creating listing: " + error.message, "error");
      submitBtn.disabled = false;
      submitBtn.innerHTML = `Submit Listing`;
    }
  });
}
