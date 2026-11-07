/**
 * CampusFind - Student Authentication Controller
 * Features: Fluid morphing switcher with physics-based sliding glider and dynamic height transition
 */

import { loginUser, registerUser, resetPassword, onAuthChange } from "../auth.js";
import { updateNavbar, setupMobileNav, setupModalListeners, initConfigChecker, showToast } from "../ui.js";

let currentAuthMode = "login";

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

  setupFluidAuthSwitcher();
  setupLoginForm();
  setupRegisterForm();
  setupResetForm();

  // Handle initial tab from query param
  const urlParams = new URLSearchParams(window.location.search);
  const requestedTab = urlParams.get("tab");
  if (requestedTab === "register") {
    switchAuthMode("register", false);
  } else if (requestedTab === "reset") {
    switchAuthMode("reset", false);
  } else {
    switchAuthMode("login", false);
  }

  // Adjust height on window resize
  window.addEventListener("resize", () => {
    adjustStageHeight(currentAuthMode);
  });
});

/**
 * Setup fluid interactive switcher
 */
function setupFluidAuthSwitcher() {
  const btnLogin = document.getElementById("btn-tab-login");
  const btnRegister = document.getElementById("btn-tab-register");
  const topToggleBtn = document.getElementById("auth-top-toggle-btn");

  if (btnLogin) {
    btnLogin.addEventListener("click", () => switchAuthMode("login"));
  }

  if (btnRegister) {
    btnRegister.addEventListener("click", () => switchAuthMode("register"));
  }

  // Top action toggle button
  if (topToggleBtn) {
    topToggleBtn.addEventListener("click", () => {
      const targetMode = topToggleBtn.dataset.target || (currentAuthMode === "login" ? "register" : "login");
      switchAuthMode(targetMode);
    });
  }

  // In-form link clicks (e.g. "Forgot Password?", "Create an account", "Back to Log In")
  document.querySelectorAll(".switch-tab-link").forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const targetMode = link.dataset.mode;
      if (targetMode) switchAuthMode(targetMode);
    });
  });
}

/**
 * Switch between "login", "register", and "reset" with smooth visual animation
 */
function switchAuthMode(mode, animate = true) {
  currentAuthMode = mode;

  const track = document.getElementById("auth-panes-track");
  const glider = document.getElementById("auth-switch-glider");
  const btnLogin = document.getElementById("btn-tab-login");
  const btnRegister = document.getElementById("btn-tab-register");
  const topToggleBtn = document.getElementById("auth-top-toggle-btn");
  const toggleLead = document.getElementById("toggle-lead-text");
  const toggleAction = document.getElementById("toggle-action-text");
  const title = document.getElementById("auth-title");
  const subtitle = document.getElementById("auth-subtitle");

  const paneLogin = document.getElementById("pane-login");
  const paneRegister = document.getElementById("pane-register");
  const paneReset = document.getElementById("pane-reset");

  // Update track active pane attribute
  if (track) {
    track.setAttribute("data-active-pane", mode);
  }

  // Update active pane classes
  [paneLogin, paneRegister, paneReset].forEach(pane => {
    if (pane) pane.classList.remove("active");
  });

  const activePane = mode === "register" ? paneRegister : (mode === "reset" ? paneReset : paneLogin);
  if (activePane) {
    activePane.classList.add("active");
  }

  // Glider positioning & Pill states
  if (glider && btnLogin && btnRegister) {
    if (mode === "login") {
      glider.style.opacity = "1";
      glider.style.transform = "translate3d(0%, 0, 0)";
      btnLogin.classList.add("active");
      btnLogin.setAttribute("aria-selected", "true");
      btnRegister.classList.remove("active");
      btnRegister.setAttribute("aria-selected", "false");
    } else if (mode === "register") {
      glider.style.opacity = "1";
      glider.style.transform = "translate3d(100%, 0, 0)";
      btnRegister.classList.add("active");
      btnRegister.setAttribute("aria-selected", "true");
      btnLogin.classList.remove("active");
      btnLogin.setAttribute("aria-selected", "false");
    } else {
      // Reset mode
      glider.style.opacity = "0";
      btnLogin.classList.remove("active");
      btnRegister.classList.remove("active");
    }
  }

  // Update Top Action Toggle Button
  if (topToggleBtn && toggleLead && toggleAction) {
    if (mode === "login") {
      toggleLead.textContent = "New student?";
      toggleAction.innerHTML = "Tap to Register &rarr;";
      topToggleBtn.dataset.target = "register";
    } else if (mode === "register") {
      toggleLead.textContent = "Already registered?";
      toggleAction.innerHTML = "Tap to Sign In &rarr;";
      topToggleBtn.dataset.target = "login";
    } else {
      toggleLead.textContent = "Remember credentials?";
      toggleAction.innerHTML = "Back to Sign In &rarr;";
      topToggleBtn.dataset.target = "login";
    }
  }

  // Header Title & Subtitle cross-fade
  if (title && subtitle) {
    if (animate) {
      title.style.opacity = "0";
      title.style.transform = "translateY(-4px)";
      subtitle.style.opacity = "0";
      subtitle.style.transform = "translateY(-4px)";

      setTimeout(() => {
        applyHeaderText(mode, title, subtitle);
        title.style.opacity = "1";
        title.style.transform = "translateY(0)";
        subtitle.style.opacity = "1";
        subtitle.style.transform = "translateY(0)";
      }, 140);
    } else {
      applyHeaderText(mode, title, subtitle);
    }
  }

  // Dynamic height adaptation of stage
  adjustStageHeight(mode);

  // Update URL history state
  const newURL = mode === "login" ? "login.html" : `login.html?tab=${mode}`;
  window.history.replaceState(null, "", newURL);
}

function applyHeaderText(mode, title, subtitle) {
  if (mode === "login") {
    title.textContent = "Welcome Back";
    subtitle.textContent = "Sign in to report belongings and verify ownership claims";
  } else if (mode === "register") {
    title.textContent = "Create Student Account";
    subtitle.textContent = "Join the verified campus network to report and reclaim items";
  } else {
    title.textContent = "Account Recovery";
    subtitle.textContent = "Enter your registered college address to reset credentials";
  }
}

/**
 * Adjust stage viewport height to match the active pane
 */
function adjustStageHeight(mode) {
  const stage = document.getElementById("auth-card-stage");
  const pane = mode === "register" ? 
    document.getElementById("pane-register") : 
    (mode === "reset" ? document.getElementById("pane-reset") : document.getElementById("pane-login"));

  if (stage && pane) {
    // Read natural height
    requestAnimationFrame(() => {
      const height = pane.scrollHeight;
      stage.style.height = `${height}px`;
    });
  }
}

/**
 * Handle student login submit
 */
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

/**
 * Handle student registration submit
 */
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

/**
 * Handle password reset submit
 */
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
      switchAuthMode("login");
    } catch (error) {
      console.error("Password reset failed:", error);
      showToast(error.message, "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `Send Reset Link`;
    }
  });
}
