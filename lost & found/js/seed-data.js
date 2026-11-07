/**
 * CampusFind - Sample Campus Demo Data Generator
 * Provides realistic college lost & found data for demonstration and testing.
 */

import { db, collection, addDoc, serverTimestamp } from "./firebase-init.js";
import { isFirebaseConfigured } from "./firebase-config.js";
import { showToast } from "./ui.js";

export const SAMPLE_CAMPUS_ITEMS = [
  {
    name: "MacBook Air M2 (Space Gray)",
    type: "found",
    category: "Electronics",
    location: "Main Library - 2nd Floor Study Cubicles",
    date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
    description: "Found a space gray MacBook Air left on desk #14 in the 2nd-floor quiet study area. It has a distinctive dark protective case and a GitHub sticker on the corner. Submitted to library reception desk.",
    imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
    status: "active",
    contactPreference: "portal",
    ownerName: "Campus Security Desk",
    ownerEmail: "security@campus.edu",
    ownerId: "sample_campus_security"
  },
  {
    name: "Student ID Card & Metro Smart Card",
    type: "found",
    category: "Documents",
    location: "Central Cafeteria (Counter 2)",
    date: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0],
    description: "Found a college lanyard with a Student ID card (Department of Computer Science) along with an blue RFID Metro pass. Kept safely with cafeteria manager Mr. Ramesh.",
    imageUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80",
    status: "active",
    contactPreference: "email",
    ownerName: "Priya Nair",
    ownerEmail: "priya.nair@student.campus.edu",
    ownerId: "sample_student_priya"
  },
  {
    name: "Casio FX-991EX ClassWiz Scientific Calculator",
    type: "lost",
    category: "Electronics",
    location: "Engineering Block B - Room 304",
    date: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
    description: "Accidentally left my Casio ClassWiz calculator on the front row bench after the Engineering Mathematics III tutorial. Has a small white tape with my initials 'R.K.' on the back cover.",
    imageUrl: "https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=800&q=80",
    status: "active",
    contactPreference: "phone",
    ownerName: "Rahul Kumar",
    ownerEmail: "rahul.k@student.campus.edu",
    ownerId: "sample_student_rahul"
  },
  {
    name: "Wildcraft Black & Teal Backpack",
    type: "found",
    category: "Bags",
    location: "Sports Complex Gymnasium Bleachers",
    date: new Date(Date.now() - 4 * 86400000).toISOString().split('T')[0],
    description: "Found after the inter-branch basketball match on Friday evening. Contains notebooks and a steel water bottle. Please verify inner contents to claim.",
    imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
    status: "active",
    contactPreference: "portal",
    ownerName: "Coach Sharma",
    ownerEmail: "sports@campus.edu",
    ownerId: "sample_staff_sports"
  },
  {
    name: "Titan Neo Watch (Silver Dial, Brown Leather Strap)",
    type: "lost",
    category: "Accessories",
    location: "Campus Cricket Ground Pavilion",
    date: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
    description: "Took off my watch before practice near the pavilion lockers and forgot to collect it. It was a graduation gift from my father with sentimental value. Reward offered!",
    imageUrl: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80",
    status: "active",
    contactPreference: "email",
    ownerName: "Amit Verma",
    ownerEmail: "amit.v@student.campus.edu",
    ownerId: "sample_student_amit"
  },
  {
    name: "Introduction to Algorithms (CLRS 4th Edition)",
    type: "lost",
    category: "Books",
    location: "Science Block Seminar Hall A",
    date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
    description: "Left my hardcover CLRS algorithms book in Seminar Hall A after the guest lecture. It has highlighter marks on chapter 6 (Heapsort) and my name inscribed inside the front cover.",
    imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
    status: "active",
    contactPreference: "portal",
    ownerName: "Sneha Patel",
    ownerEmail: "sneha.p@student.campus.edu",
    ownerId: "sample_student_sneha"
  },
  {
    name: "Noise ColorFit Pulse Smartwatch (Midnight Blue)",
    type: "found",
    category: "Electronics",
    location: "Computer Lab 3 (Turing Hall)",
    date: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0],
    description: "Found on workstation PC-22. The watch is powered on and locked. The owner can easily verify ownership by describing the current wallpaper and pairing screen.",
    imageUrl: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80",
    status: "active",
    contactPreference: "portal",
    ownerName: "Lab Assistant Mohan",
    ownerEmail: "cse.lab@campus.edu",
    ownerId: "sample_staff_cse"
  },
  {
    name: "Two Door Keys with a Red Ferrari Metal Keychain",
    type: "lost",
    category: "Accessories",
    location: "College Main Gate & Two-Wheeler Parking Lot",
    date: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
    description: "Dropped my hostel room keys somewhere between the main entry gate and bicycle stand B. Has a red Ferrari crest keychain.",
    imageUrl: "https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=800&q=80",
    status: "active",
    contactPreference: "email",
    ownerName: "Rohan Das",
    ownerEmail: "rohan.d@student.campus.edu",
    ownerId: "sample_student_rohan"
  }
];

/**
 * Inserts sample campus listings into Cloud Firestore.
 */
export async function seedSampleData() {
  if (!isFirebaseConfigured() || !db) {
    showToast("Please configure Firebase credentials before seeding demo data.", "warning");
    return false;
  }

  try {
    showToast("Loading sample college listings into Firestore...", "info");
    const itemsCollection = collection(db, "items");

    for (const item of SAMPLE_CAMPUS_ITEMS) {
      await addDoc(itemsCollection, {
        ...item,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }

    showToast("Successfully seeded 8 realistic college listings!", "success");
    return true;
  } catch (error) {
    console.error("Error seeding sample data:", error);
    showToast("Failed to seed sample data: " + error.message, "error");
    return false;
  }
}
