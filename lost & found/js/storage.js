/**
 * CampusFind - Firebase Storage Service Module
 * Handles item photo uploads with strict MIME-type & size validation (max 5MB).
 */

import { storage, ref, uploadBytes, getDownloadURL, deleteObject } from "./firebase-init.js";
import { isFirebaseConfigured } from "./firebase-config.js";

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 Megabytes

/**
 * Validates and uploads an item photo to Firebase Storage.
 * @param {File} file - The image file selected by the student.
 * @param {string} userId - The authenticated student UID.
 * @returns {Promise<{downloadURL: string, storagePath: string}>}
 */
export async function uploadItemImage(file, userId) {
  if (!file) return { downloadURL: "", storagePath: "" };

  if (!isFirebaseConfigured() || !storage) {
    throw new Error("Firebase Storage is not configured. Please configure your project keys.");
  }

  // File type validation
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Invalid file type. Please upload a JPEG, PNG, or WebP photograph.");
  }

  // File size validation
  if (file.size > MAX_FILE_SIZE) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    throw new Error(`File is too large (${sizeMB}MB). Maximum allowed photograph size is 5MB.`);
  }

  // Generate safe unique filename
  const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const timestamp = Date.now();
  const storagePath = `items/${userId}/${timestamp}_${cleanName}`;
  const storageRef = ref(storage, storagePath);

  // Upload with metadata
  const metadata = {
    contentType: file.type,
    customMetadata: {
      uploadedBy: userId,
      uploadedAt: new Date().toISOString()
    }
  };

  const snapshot = await uploadBytes(storageRef, file, metadata);
  const downloadURL = await getDownloadURL(snapshot.ref);

  return { downloadURL, storagePath };
}

/**
 * Deletes an uploaded photograph from Firebase Storage.
 * @param {string} storagePath - The full path of the file in storage.
 */
export async function deleteItemImage(storagePath) {
  if (!storagePath || !storage) return;
  try {
    const fileRef = ref(storage, storagePath);
    await deleteObject(fileRef);
  } catch (error) {
    console.warn("Could not delete image from storage (it may have already been removed):", error);
  }
}
