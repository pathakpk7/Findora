/**
 * CampusFind - Student Authentication Controller (Login, Register, Forgot Password)
 */

import { loginUser, registerUser, resetPassword, onAuthChange } from "../auth.js";
import { updateNavbar, setupMobileNav, setupModalListeners, initConfigChecker, showToast } from "../ui.js";

document.addEventListener("DOMContentLoaded", () => {
  setupMobileNav();
  setupModalListeners();
  initConfigChecker();

  // If already logged in, redirect to dashboard
  onAuthChange((user, profile) => {
    updateNavbar(user, profile);
    if (user) {
      const urlParams = new URLSearchParams(window.location.search);
      const redirect = urlParams.get("redirect") || "dashboard.html";
      window.location.href = redirect;
    }
  });

  setupAuthTabs();
  setupLoginForm();
  setupRegisterForm();
  setupResetForm();

  // Activate specific tab if passed via URL
  const urlParams = new URLSearchParams(window.location.search);
  const requestedTab = urlParams.get("tab");
  if (requestedTab === "register") {
    document.querySelector('[data-target="pane-register"]')?.click();
  } else if (requestedTab === "reset") {
    document.querySelector('[data-target="pane-reset"]')?.click();
  }
});

function setupAuthTabs() {
  const tabBtns = document.querySelectorAll(".auth-tab-btn");
  const tabPanes = document.querySelectorAll(".auth-tab-pane");

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

  // Switch links inside cards
  document.querySelectorAll(".switch-tab-link").forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const target = link.dataset.target;
      document.querySelector(`[data-target="${target}"]`)?.click();
    });
  });
}

function setupLoginForm() {
  const form = document.getElementById("login-form");
  const submitBtn = document.getElementById("btn-submit-login");

  if (!form || !submitBtn) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;

    try {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span class="spinner" style="width:1rem;height:1rem;"></span> Logging in...`;

      await loginUser(email, password);
      showToast("Welcome back!", "success");

      const urlParams = new URLSearchParams(window.location.search);
      const redirect = urlParams.get("redirect") || "dashboard.html";
      setTimeout(() => {
        window.location.href = redirect;
      }, 500);
    } catch (error) {
      console.error("Login failed:", error);
      let msg = "Invalid email or password. Please try again.";
      if (error.code === "auth/user-not-found") msg = "No student account found with this email.";
      if (error.code === "auth/wrong-password") msg = "Incorrect password.";
      if (error.code === "auth/invalid-email") msg = "Please enter a valid email address.";
      showToast(msg, "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `Log In to CampusFind`;
    }
  });
}

function setupRegisterForm() {
  const form = document.getElementById("register-form");
  const submitBtn = document.getElementById("btn-submit-register");

  if (!form || !submitBtn) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("reg-name").value.trim();
    const email = document.getElementById("reg-email").value.trim();
    const studentId = document.getElementById("reg-student-id").value.trim();
    const phone = document.getElementById("reg-phone").value.trim();
    const password = document.getElementById("reg-password").value;
    const confirmPassword = document.getElementById("reg-confirm-password").value;

    if (password.length < 6) {
      showToast("Password must be at least 6 characters.", "warning");
      return;
    }

    if (password !== confirmPassword) {
      showToast("Passwords do not match.", "warning");
      return;
    }

    try {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span class="spinner" style="width:1rem;height:1rem;"></span> Creating Account...`;

      await registerUser(name, email, password, studentId, phone);
      showToast("Account created successfully! Welcome to CampusFind.", "success");

      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 800);
    } catch (error) {
      console.error("Registration failed:", error);
      let msg = error.message;
      if (error.code === "auth/email-already-in-use") {
        msg = "An account with this email already exists. Please log in.";
      }
      showToast(msg, "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `Create Student Account`;
    }
  });
}

function setupResetForm() {
  const form = document.getElementById("reset-form");
  const submitBtn = document.getElementById("btn-submit-reset");

  if (!form || !submitBtn) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("reset-email").value.trim();

    try {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span class="spinner" style="width:1rem;height:1rem;"></span> Sending Link...`;

      await resetPassword(email);
      showToast("Password reset link sent! Check your inbox.", "success");
      form.reset();
      document.querySelector('[data-target="pane-login"]')?.click();
    } catch (error) {
      console.error("Password reset failed:", error);
      showToast(error.message, "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `Send Reset Link`;
    }
  });
}
