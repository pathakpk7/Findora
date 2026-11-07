/**
 * CampusFind - Firebase Configuration
 * 
 * Instructions:
 * 1. Create a Firebase project at https://console.firebase.google.com/
 * 2. Enable Authentication (Email/Password provider).
 * 3. Enable Cloud Firestore (in production or test mode).
 * 4. Enable Firebase Storage.
 * 5. Replace the placeholder values below with your Firebase project credentials.
 * 
 * Pro Tip: You can also save credentials in localStorage via the in-app
 * Configuration modal for quick local demonstration without modifying code.
 */

const LOCAL_STORAGE_KEY = 'campusfind_firebase_config';

// Default / fallback configuration template
const defaultFirebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Retrieve custom config saved in browser if any
function getActiveFirebaseConfig() {
  const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed.apiKey && !parsed.apiKey.includes('YOUR_')) {
        return parsed;
      }
    } catch (e) {
      console.warn("Invalid saved firebase config:", e);
    }
  }
  return defaultFirebaseConfig;
}

export const firebaseConfig = getActiveFirebaseConfig();

/**
 * Checks if the Firebase configuration is valid and configured with real keys.
 */
export function isFirebaseConfigured() {
  const cfg = getActiveFirebaseConfig();
  return (
    cfg.apiKey &&
    !cfg.apiKey.includes("YOUR_") &&
    cfg.projectId &&
    !cfg.projectId.includes("YOUR_")
  );
}

/**
 * Allows updating configuration dynamically from the in-app UI.
 */
export function saveFirebaseConfig(newConfig) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newConfig));
  window.location.reload();
}

export function clearFirebaseConfig() {
  localStorage.removeItem(LOCAL_STORAGE_KEY);
  window.location.reload();
}
