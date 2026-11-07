/**
 * CampusFind - Authentication Service Module
 * Handles Student Registration, Login, Logout, Password Reset, and Role-Based Guards
 */

import { 
  auth, 
  db, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  sendPasswordResetEmail, 
  updateProfile,
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  serverTimestamp 
} from "./firebase-init.js";

import { isFirebaseConfigured } from "./firebase-config.js";
import { showToast } from "./ui.js";

let cachedUserProfile = null;

/**
 * Registers a new college student.
 * Creates an Auth user and a synchronized Firestore document in /users/{uid}.
 */
export async function registerUser(name, email, password, studentId = "", phone = "") {
  if (!isFirebaseConfigured() || !auth) {
    throw new Error("Firebase is not configured. Please enter your project keys first.");
  }

  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Update Auth Profile Display Name
  await updateProfile(user, { displayName: name });

  // Create Firestore User Document
  const userDocRef = doc(db, "users", user.uid);
  const userData = {
    uid: user.uid,
    name: name,
    email: email.toLowerCase(),
    studentId: studentId.trim(),
    phone: phone.trim(),
    role: "student", // default role
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  await setDoc(userDocRef, userData);
  cachedUserProfile = userData;
  return { user, profile: userData };
}

/**
 * Logs in an existing student or administrator.
 */
export async function loginUser(email, password) {
  if (!isFirebaseConfigured() || !auth) {
    throw new Error("Firebase is not configured. Please enter your project keys first.");
  }

  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  const profile = await getUserProfile(user.uid);
  cachedUserProfile = profile;
  return { user, profile };
}

/**
 * Logs out the current user and clears session cache.
 */
export async function logoutUser() {
  if (!auth) return;
  await signOut(auth);
  cachedUserProfile = null;
  showToast("Logged out successfully.", "info");
}

/**
 * Dispatches a password reset email via Firebase Auth.
 */
export async function resetPassword(email) {
  if (!isFirebaseConfigured() || !auth) {
    throw new Error("Firebase is not configured. Please enter your project keys first.");
  }
  await sendPasswordResetEmail(auth, email);
}

/**
 * Retrieves the current Firebase user.
 */
export function getCurrentUser() {
  return auth?.currentUser || null;
}

/**
 * Retrieves the user profile document from Firestore.
 */
export async function getUserProfile(uid) {
  if (!db || !uid) return null;
  try {
    const docRef = doc(db, "users", uid);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data();
    }
    return null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
}

/**
 * Updates profile details (name, studentId, phone).
 */
export async function updateUserProfile(uid, data) {
  if (!db || !uid) return;
  const docRef = doc(db, "users", uid);
  const updates = {
    ...data,
    updatedAt: serverTimestamp()
  };
  await updateDoc(docRef, updates);
  if (cachedUserProfile && cachedUserProfile.uid === uid) {
    cachedUserProfile = { ...cachedUserProfile, ...updates };
  }
}

/**
 * Sets an active auth state listener.
 * Automatically fetches the Firestore profile document for the authenticated user.
 */
export function onAuthChange(callback) {
  if (!auth) {
    callback(null, null);
    return () => {};
  }

  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      const profile = await getUserProfile(user.uid);
      cachedUserProfile = profile;
      callback(user, profile);
    } else {
      cachedUserProfile = null;
      callback(null, null);
    }
  });
}

/**
 * Guard utility for protected pages. Redirects to login if not authenticated.
 */
export function requireAuth(redirectUrl = null) {
  if (!isFirebaseConfigured() || !auth) {
    return;
  }

  onAuthStateChanged(auth, (user) => {
    if (!user) {
      const current = redirectUrl || encodeURIComponent(window.location.pathname + window.location.search);
      window.location.href = `login.html?redirect=${current}`;
    }
  });
}

/**
 * Guard utility for admin pages.
 */
export function requireAdmin(redirectUrl = "index.html") {
  if (!isFirebaseConfigured() || !auth) {
    return;
  }

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = `login.html?redirect=admin.html`;
      return;
    }
    const profile = await getUserProfile(user.uid);
    if (!profile || profile.role !== "admin") {
      alert("Access Denied: You need CampusFind Administrator privileges to access this area.");
      window.location.href = redirectUrl;
    }
  });
}
