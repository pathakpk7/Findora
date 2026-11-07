/**
 * CampusFind - Database Service Module (Cloud Firestore)
 * Complete CRUD operations for Items, Claims, Reports, and Platform Statistics.
 */

import { 
  db, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp 
} from "./firebase-init.js";

import { isFirebaseConfigured } from "./firebase-config.js";

const ITEMS_COLLECTION = "items";
const CLAIMS_COLLECTION = "claims";
const REPORTS_COLLECTION = "reports";

/* ==========================================================================
   1. Items Service
   ========================================================================== */

/**
 * Creates a new Lost or Found listing.
 */
export async function createItem(itemData) {
  if (!isFirebaseConfigured() || !db) {
    throw new Error("Firebase Firestore is not configured.");
  }

  const docRef = await addDoc(collection(db, ITEMS_COLLECTION), {
    ...itemData,
    status: itemData.status || "active",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  return docRef.id;
}

/**
 * Retrieves items based on multiple filter and search options.
 */
export async function getItems({
  type = "all",
  category = "all",
  status = "all",
  location = "all",
  searchQuery = "",
  sortBy = "newest",
  maxResults = 50
} = {}) {
  if (!isFirebaseConfigured() || !db) {
    return [];
  }

  try {
    const itemsRef = collection(db, ITEMS_COLLECTION);
    let q = query(itemsRef, orderBy("createdAt", sortBy === "oldest" ? "asc" : "desc"));

    // Note: For Firestore, combine client-side flexible search to avoid complex composite index requirements
    const snapshot = await getDocs(q);
    let results = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      results.push({ id: docSnap.id, ...data });
    });

    // Client-side filtering for immediate responsiveness and multi-field queries
    if (type && type !== "all") {
      results = results.filter(item => item.type === type);
    }

    if (category && category !== "all") {
      results = results.filter(item => item.category === category);
    }

    if (status && status !== "all") {
      results = results.filter(item => item.status === status);
    }

    if (location && location !== "all") {
      results = results.filter(item => item.location && item.location.toLowerCase().includes(location.toLowerCase()));
    }

    if (searchQuery && searchQuery.trim() !== "") {
      const qLower = searchQuery.toLowerCase().trim();
      results = results.filter(item => {
        const nameMatch = item.name && item.name.toLowerCase().includes(qLower);
        const descMatch = item.description && item.description.toLowerCase().includes(qLower);
        const locMatch = item.location && item.location.toLowerCase().includes(qLower);
        const catMatch = item.category && item.category.toLowerCase().includes(qLower);
        return nameMatch || descMatch || locMatch || catMatch;
      });
    }

    if (maxResults && results.length > maxResults) {
      results = results.slice(0, maxResults);
    }

    return results;
  } catch (error) {
    console.error("Error fetching items:", error);
    throw error;
  }
}

/**
 * Retrieves a single item listing by ID.
 */
export async function getItemById(itemId) {
  if (!isFirebaseConfigured() || !db) return null;
  const docRef = doc(db, ITEMS_COLLECTION, itemId);
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    return { id: snap.id, ...snap.data() };
  }
  return null;
}

/**
 * Updates an item listing.
 */
export async function updateItem(itemId, updateData) {
  if (!isFirebaseConfigured() || !db) return;
  const docRef = doc(db, ITEMS_COLLECTION, itemId);
  await updateDoc(docRef, {
    ...updateData,
    updatedAt: serverTimestamp()
  });
}

/**
 * Deletes an item listing.
 */
export async function deleteItem(itemId) {
  if (!isFirebaseConfigured() || !db) return;
  const docRef = doc(db, ITEMS_COLLECTION, itemId);
  await deleteDoc(docRef);
}

/**
 * Retrieves all items posted by a specific student.
 */
export async function getItemsByOwner(ownerId) {
  if (!isFirebaseConfigured() || !db || !ownerId) return [];
  const q = query(
    collection(db, ITEMS_COLLECTION),
    where("ownerId", "==", ownerId)
  );
  const snap = await getDocs(q);
  const items = [];
  snap.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
  // Sort in memory by createdAt desc
  items.sort((a, b) => {
    const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
    const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
    return timeB - timeA;
  });
  return items;
}

/* ==========================================================================
   2. Ownership Claim System
   ========================================================================== */

/**
 * Submits an ownership claim on a found or lost item.
 */
export async function createClaim(claimData) {
  if (!isFirebaseConfigured() || !db) {
    throw new Error("Firestore is not configured.");
  }

  const docRef = await addDoc(collection(db, CLAIMS_COLLECTION), {
    ...claimData,
    status: "pending", // 'pending' | 'approved' | 'rejected' | 'resolved'
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  return docRef.id;
}

/**
 * Retrieves claims received on listings owned by a student.
 */
export async function getIncomingClaims(ownerId) {
  if (!isFirebaseConfigured() || !db || !ownerId) return [];
  const q = query(
    collection(db, CLAIMS_COLLECTION),
    where("ownerId", "==", ownerId)
  );
  const snap = await getDocs(q);
  const claims = [];
  snap.forEach(doc => claims.push({ id: doc.id, ...doc.data() }));
  claims.sort((a, b) => {
    const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
    const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
    return timeB - timeA;
  });
  return claims;
}

/**
 * Retrieves claims submitted by a student.
 */
export async function getSubmittedClaims(claimantId) {
  if (!isFirebaseConfigured() || !db || !claimantId) return [];
  const q = query(
    collection(db, CLAIMS_COLLECTION),
    where("claimantId", "==", claimantId)
  );
  const snap = await getDocs(q);
  const claims = [];
  snap.forEach(doc => claims.push({ id: doc.id, ...doc.data() }));
  claims.sort((a, b) => {
    const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
    const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
    return timeB - timeA;
  });
  return claims;
}

/**
 * Updates claim status (Approve, Reject, or Resolve) and optional response note.
 */
export async function updateClaimStatus(claimId, status, posterResponse = "") {
  if (!isFirebaseConfigured() || !db) return;
  const docRef = doc(db, CLAIMS_COLLECTION, claimId);
  await updateDoc(docRef, {
    status: status,
    posterResponse: posterResponse,
    updatedAt: serverTimestamp()
  });
}

/* ==========================================================================
   3. Content Reports & Flagging System
   ========================================================================== */

/**
 * Reports suspicious, inappropriate, or spam listings.
 */
export async function createReport(reportData) {
  if (!isFirebaseConfigured() || !db) {
    throw new Error("Firestore is not configured.");
  }

  const docRef = await addDoc(collection(db, REPORTS_COLLECTION), {
    ...reportData,
    status: "pending", // 'pending' | 'reviewed' | 'dismissed'
    createdAt: serverTimestamp()
  });

  return docRef.id;
}

/**
 * Retrieves all flagged reports for the Admin moderation dashboard.
 */
export async function getAllReports() {
  if (!isFirebaseConfigured() || !db) return [];
  const snap = await getDocs(collection(db, REPORTS_COLLECTION));
  const reports = [];
  snap.forEach(doc => reports.push({ id: doc.id, ...doc.data() }));
  reports.sort((a, b) => {
    const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
    const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
    return timeB - timeA;
  });
  return reports;
}

/**
 * Updates a report status (Admin action).
 */
export async function updateReportStatus(reportId, status) {
  if (!isFirebaseConfigured() || !db) return;
  const docRef = doc(db, REPORTS_COLLECTION, reportId);
  await updateDoc(docRef, {
    status: status,
    reviewedAt: serverTimestamp()
  });
}

/* ==========================================================================
   4. Platform & Dashboard Statistics
   ========================================================================== */

export async function getPlatformStats() {
  if (!isFirebaseConfigured() || !db) {
    return {
      totalListings: 0,
      lostItems: 0,
      foundItems: 0,
      resolvedItems: 0,
      pendingClaims: 0,
      reportsCount: 0
    };
  }

  try {
    const itemsSnap = await getDocs(collection(db, ITEMS_COLLECTION));
    let totalListings = 0;
    let lostItems = 0;
    let foundItems = 0;
    let resolvedItems = 0;

    itemsSnap.forEach(d => {
      totalListings++;
      const data = d.data();
      if (data.status === 'resolved') resolvedItems++;
      if (data.type === 'lost') lostItems++;
      if (data.type === 'found') foundItems++;
    });

    const claimsSnap = await getDocs(collection(db, CLAIMS_COLLECTION));
    let pendingClaims = 0;
    claimsSnap.forEach(d => {
      if (d.data().status === 'pending') pendingClaims++;
    });

    const reportsSnap = await getDocs(collection(db, REPORTS_COLLECTION));
    let reportsCount = 0;
    reportsSnap.forEach(d => {
      if (d.data().status === 'pending') reportsCount++;
    });

    return {
      totalListings,
      lostItems,
      foundItems,
      resolvedItems,
      pendingClaims,
      reportsCount
    };
  } catch (error) {
    console.error("Error calculating platform stats:", error);
    return {
      totalListings: 0,
      lostItems: 0,
      foundItems: 0,
      resolvedItems: 0,
      pendingClaims: 0,
      reportsCount: 0
    };
  }
}
