/**
 * CampusFind - UI Utilities Module
 * Toasts, Modals, Navbar management, Mobile Navigation, Date formatting, XSS sanitization
 */

import { isFirebaseConfigured, saveFirebaseConfig } from "./firebase-config.js";

// Toast System
export function showToast(message, type = 'info', duration = 4000) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const iconMap = {
    success: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
    error: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`,
    warning: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
    info: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0284c7" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`
  };

  toast.innerHTML = `
    <div style="flex-shrink:0;">${iconMap[type] || iconMap.info}</div>
    <div style="flex:1; line-height:1.4;">${escapeHTML(message)}</div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 250);
  }, duration);
}

// Modal Helpers
export function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
  }
}

export function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('show');
    document.body.style.overflow = '';
  }
}

export function setupModalListeners() {
  document.addEventListener('click', (e) => {
    if (e.target.matches('[data-close-modal]')) {
      const modal = e.target.closest('.modal-backdrop');
      if (modal) closeModal(modal.id);
    }
    if (e.target.classList.contains('modal-backdrop')) {
      closeModal(e.target.id);
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const openModalElem = document.querySelector('.modal-backdrop.show');
      if (openModalElem) closeModal(openModalElem.id);
    }
  });
}

// Mobile Nav Toggle
export function setupMobileNav() {
  const toggleBtn = document.getElementById('mobile-nav-toggle');
  const navMenu = document.getElementById('nav-menu');

  if (toggleBtn && navMenu) {
    toggleBtn.addEventListener('click', () => {
      navMenu.classList.toggle('open');
    });

    // Close when clicking any nav link
    navMenu.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
      });
    });
  }
}

// User Dropdown in Header
export function setupUserDropdown() {
  const userBtn = document.getElementById('user-nav-btn');
  const userMenu = document.getElementById('user-dropdown-menu');

  if (userBtn && userMenu) {
    userBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      userMenu.classList.toggle('show');
    });

    document.addEventListener('click', (e) => {
      if (!userMenu.contains(e.target) && !userBtn.contains(e.target)) {
        userMenu.classList.remove('show');
      }
    });
  }
}

// Update Header Navigation based on Auth State
export function updateNavbar(user, userProfile = null) {
  const authContainer = document.getElementById('header-auth-actions');
  const adminNavLink = document.getElementById('nav-link-admin');

  if (!authContainer) return;

  if (user) {
    const displayName = userProfile?.name || user.displayName || user.email.split('@')[0];
    const initial = displayName.charAt(0).toUpperCase();
    const isAdmin = userProfile?.role === 'admin';

    if (adminNavLink) {
      adminNavLink.style.display = isAdmin ? 'inline-flex' : 'none';
    }

    authContainer.innerHTML = `
      <div class="user-nav-dropdown">
        <button type="button" class="user-nav-btn" id="user-nav-btn">
          <div class="user-avatar-small">${initial}</div>
          <span class="user-nav-name">${escapeHTML(displayName)}</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </button>
        <div class="dropdown-menu" id="user-dropdown-menu">
          <div class="dropdown-header">
            <div class="dropdown-user-name">${escapeHTML(displayName)}</div>
            <div class="dropdown-user-email">${escapeHTML(user.email)}</div>
            ${isAdmin ? `<span class="badge badge-admin" style="margin-top:0.35rem;">Campus Admin</span>` : ''}
          </div>
          <a href="dashboard.html" class="dropdown-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            Student Dashboard
          </a>
          <a href="profile.html" class="dropdown-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            My Profile
          </a>
          ${isAdmin ? `
          <a href="admin.html" class="dropdown-item" style="color:#7e22ce;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            Admin Panel
          </a>` : ''}
          <div style="border-top: 1px solid var(--neutral-100); margin: 0.25rem 0;"></div>
          <button type="button" class="dropdown-item danger" id="btn-logout">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            Log Out
          </button>
        </div>
      </div>
    `;

    setupUserDropdown();
  } else {
    if (adminNavLink) {
      adminNavLink.style.display = 'none';
    }

    authContainer.innerHTML = `
      <a href="login.html" class="btn btn-outline btn-sm">Log In</a>
      <a href="login.html?tab=register" class="btn btn-primary btn-sm">Register</a>
    `;
  }
}

// Firebase Configuration Banner and Setup Dialog
export function initConfigChecker() {
  const configured = isFirebaseConfigured();
  const banner = document.getElementById('firebase-config-banner');
  if (banner) {
    if (!configured) {
      banner.classList.add('active');
    } else {
      banner.classList.remove('active');
    }
  }

  // Bind config modal triggers if present
  document.querySelectorAll('#open-config-modal-btn, #open-config-modal-btn-2, [data-open-config-modal]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openConfigModal();
    });
  });
}

export function openConfigModal() {
  let modal = document.getElementById('config-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'config-modal';
    modal.className = 'modal-backdrop';
    modal.innerHTML = `
      <div class="modal-dialog modal-lg">
        <div class="modal-header">
          <h3 class="modal-title">Firebase Project Configuration</h3>
          <button type="button" class="modal-close" data-close-modal>&times;</button>
        </div>
        <div class="modal-body">
          <div class="alert alert-info">
            <strong>CampusFind connects directly to Firebase!</strong><br>
            Paste your Firebase Web App credentials below or edit <code>js/firebase-config.js</code>. Your settings are saved securely in your browser session for testing.
          </div>
          <form id="config-form">
            <div class="form-group">
              <label class="form-label">API Key <span class="required">*</span></label>
              <input type="text" id="cfg-apiKey" class="form-control" placeholder="AIzaSy..." required>
            </div>
            <div class="form-group">
              <label class="form-label">Project ID <span class="required">*</span></label>
              <input type="text" id="cfg-projectId" class="form-control" placeholder="my-campus-find" required>
            </div>
            <div class="form-group">
              <label class="form-label">Auth Domain</label>
              <input type="text" id="cfg-authDomain" class="form-control" placeholder="my-campus-find.firebaseapp.com">
            </div>
            <div class="form-group">
              <label class="form-label">Storage Bucket</label>
              <input type="text" id="cfg-storageBucket" class="form-control" placeholder="my-campus-find.appspot.com">
            </div>
            <div class="form-group">
              <label class="form-label">Messaging Sender ID</label>
              <input type="text" id="cfg-messagingSenderId" class="form-control" placeholder="1029384756">
            </div>
            <div class="form-group">
              <label class="form-label">App ID</label>
              <input type="text" id="cfg-appId" class="form-control" placeholder="1:1029384756:web:abcd1234">
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:1.5rem; flex-wrap:wrap; gap:0.75rem;">
              <a href="https://console.firebase.google.com/" target="_blank" class="btn btn-outline btn-sm">
                Open Firebase Console &rarr;
              </a>
              <div style="display:flex; gap:0.5rem;">
                <button type="button" class="btn btn-outline" data-close-modal>Cancel</button>
                <button type="submit" class="btn btn-primary">Save & Connect</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    const form = document.getElementById('config-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const newConfig = {
        apiKey: document.getElementById('cfg-apiKey').value.trim(),
        projectId: document.getElementById('cfg-projectId').value.trim(),
        authDomain: document.getElementById('cfg-authDomain').value.trim() || `${document.getElementById('cfg-projectId').value.trim()}.firebaseapp.com`,
        storageBucket: document.getElementById('cfg-storageBucket').value.trim() || `${document.getElementById('cfg-projectId').value.trim()}.appspot.com`,
        messagingSenderId: document.getElementById('cfg-messagingSenderId').value.trim() || '123456789',
        appId: document.getElementById('cfg-appId').value.trim() || '1:123456789:web:sample'
      };
      saveFirebaseConfig(newConfig);
    });
  }

  // Pre-fill existing config if available
  const saved = localStorage.getItem('campusfind_firebase_config');
  if (saved) {
    try {
      const cfg = JSON.parse(saved);
      if (document.getElementById('cfg-apiKey')) document.getElementById('cfg-apiKey').value = cfg.apiKey || '';
      if (document.getElementById('cfg-projectId')) document.getElementById('cfg-projectId').value = cfg.projectId || '';
      if (document.getElementById('cfg-authDomain')) document.getElementById('cfg-authDomain').value = cfg.authDomain || '';
      if (document.getElementById('cfg-storageBucket')) document.getElementById('cfg-storageBucket').value = cfg.storageBucket || '';
      if (document.getElementById('cfg-messagingSenderId')) document.getElementById('cfg-messagingSenderId').value = cfg.messagingSenderId || '';
      if (document.getElementById('cfg-appId')) document.getElementById('cfg-appId').value = cfg.appId || '';
    } catch (e) {
      console.warn("Could not prefill config modal:", e);
    }
  }

  openModal('config-modal');
}

// Helpers
export function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function formatDate(dateString) {
  if (!dateString) return 'N/A';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return dateString;
  }
}

export function timeAgo(timestamp) {
  if (!timestamp) return 'Just now';
  let date;
  if (timestamp.toDate) {
    date = timestamp.toDate();
  } else if (typeof timestamp === 'string' || typeof timestamp === 'number') {
    date = new Date(timestamp);
  } else {
    return 'Recently';
  }

  const seconds = Math.floor((new Date() - date) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(date);
}
