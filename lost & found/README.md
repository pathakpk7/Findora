# CampusFind — College Lost and Found Platform

[![Platform](https://img.shields.io/badge/Platform-Web-blue.svg)](https://firebase.google.com)
[![Frontend](https://img.shields.io/badge/Frontend-HTML5%20%7C%20CSS3%20%7C%20JS%20ES6-sky.svg)](https://developer.mozilla.org)
[![Backend](https://img.shields.io/badge/Backend-Firebase%20v10-amber.svg)](https://firebase.google.com)
[![Database](https://img.shields.io/badge/Database-Cloud%20Firestore-orange.svg)](https://firebase.google.com/docs/firestore)
[![Storage](https://img.shields.io/badge/Storage-Firebase%20Storage-yellow.svg)](https://firebase.google.com/docs/storage)

A modern, responsive, full-stack college web application designed for students and campus faculty to report lost belongings, list found items, search listings with multi-filter queries, and safely reclaim items through a confidential ownership verification workflow.

---

## 🎓 Key Features

1. **Clean Campus Aesthetic & Responsive UI**:
   - Modern college design with a clean white and light-blue palette.
   - Fully responsive layout optimized for smartphones, tablets, laptops, and desktops.
   - Interactive components: sticky navigation header, mobile drawer menu, status badges, toast feedback, confirmation dialogs, and skeleton loading states.

2. **Student Authentication (Firebase Auth)**:
   - Email and password registration with Student Name, College Email, Roll #, and Phone.
   - Secure login and persistent session state.
   - Protected routes (e.g. reporting items, dashboards, and submitting claims).
   - Self-service password reset functionality via automated email dispatch.

3. **Report Lost & Found Belongings**:
   - Dual-mode reporting form ("I Lost Something" vs. "I Found Something").
   - Categorization: *Electronics*, *Documents & IDs*, *Bags & Wallets*, *Books & Notes*, *Accessories*, and *Other*.
   - Campus location picker with auto-complete datalist (Libraries, Cafeterias, Laboratories, Lecture Halls, Sports Complex).
   - Photograph upload with drag-and-drop, instant preview, and client-side format/size validation (JPEG/PNG/WebP under 5MB).
   - Privacy-preserving contact preferences.

4. **Interactive Browse & Search Catalog**:
   - Instant search across title, description, category, and campus location.
   - Filtering chips by type (*All*, *Lost Only*, *Found Only*).
   - Category dropdown filter and location search.
   - Sorting by newest or oldest listings.

5. **Confidential Claim & Ownership Verification**:
   - To prevent false claims or theft of found items, claimants provide **confidential proof details** (e.g. lockscreen wallpaper, engravings, serial digits, hidden bag contents).
   - **Privacy Guarantee**: Proof details are **strictly hidden from the public** and only visible to the item poster and verified campus administrators.
   - The original poster reviews claims and can **Approve** (which safely reveals contact coordinates) or **Reject** with an explanation.

6. **Student Dashboard ("My Listings" & "Claims")**:
   - **My Listings Tab**: View active and resolved listings, toggle returned status, or delete listings.
   - **Incoming Claims Tab**: Review verification requests on found items with confidential proof.
   - **My Submitted Claims Tab**: Track submitted claims with live status updates (*Pending*, *Approved*, *Rejected*).

7. **Campus Administrator Dashboard**:
   - Real-time platform analytics: total listings, active lost reports, found items, resolved items, pending claims, and flagged content reports.
   - Listings management table with direct status toggling and removal options.
   - Inappropriate content / spam moderation queue with single-click dismiss or item deletion actions.
   - Role-based server-side security rules in Firestore.

8. **One-Click Demo Data Generator**:
   - Built-in **"Seed Demo Listings"** button to immediately populate realistic campus data (MacBooks, student IDs, calculators, backpacks) for presentations, vivas, and grading.

---

## 📁 Project Architecture

```
lost & found/
├── index.html                 # Landing page (Hero, Recent listings, How it works, Stats)
├── browse.html                # Search catalog with filter sidebar and responsive cards
├── report.html                # Multi-step lost/found item submission with photo upload
├── item-details.html          # Detailed listing view, claim modal, report modal
├── dashboard.html             # Student dashboard (My Listings, Incoming Claims, Tracking)
├── admin.html                 # Administrator portal (Platform metrics, Listings, Flag queue)
├── login.html                 # Student login, registration, and password reset
├── profile.html               # Profile view, student details, and password change
├── css/
│   ├── main.css               # Design tokens, reset, typography, header, footer
│   ├── components.css         # Buttons, cards, badges, modals, forms, toasts, tables
│   ├── pages.css              # Layouts for hero, browse grid, forms, details, dashboard
│   └── responsive.css         # Breakpoints for mobile drawer, tablets, and desktops
├── js/
│   ├── firebase-config.js     # Firebase config object with credentials checker
│   ├── firebase-init.js       # Firebase SDK v10 initialization (Auth, Firestore, Storage)
│   ├── auth.js                # Auth methods, session listeners, and role-based guards
│   ├── db.js                  # Cloud Firestore CRUD for items, claims, reports, and stats
│   ├── storage.js             # Image upload handling, MIME-type and 5MB size validation
│   ├── ui.js                  # Modals, toasts, navigation states, and date helpers
│   ├── seed-data.js           # Realistic campus demo listings seeder
│   └── pages/
│       ├── home.js            # Landing page controller
│       ├── browse.js          # Search catalog and filtering controller
│       ├── report.js          # Item reporting controller
│       ├── item-details.js    # Item details and claim submission controller
│       ├── dashboard.js       # Student dashboard controller
│       ├── admin.js           # Admin portal controller
│       ├── login.js           # Authentication forms controller
│       └── profile.js         # Profile management controller
├── firestore.rules            # Production-grade Firestore security rules
├── storage.rules              # Production-grade Firebase Storage security rules
├── firebase.json              # Firebase Hosting and emulator configuration
├── .firebaserc                # Firebase project configuration
├── .env.example               # Reference environment variables
└── README.md                  # Project documentation and setup guide
```

---

## 🛠️ Setup & Installation

### Step 1: Clone or Open the Workspace
Clone the repository or extract the project directory on your computer:
```bash
cd "lost & found"
```

### Step 2: Configure Firebase Project
1. Visit the [Firebase Console](https://console.firebase.google.com/) and click **Add project**.
2. Name your project (e.g. `campusfind-college`).
3. Under **Build**, configure the following 3 services:
   - **Authentication**: Enable the **Email/Password** sign-in provider.
   - **Firestore Database**: Click **Create Database**, choose your region, and start in **Production mode** (or test mode).
   - **Storage**: Click **Get Started**, choose your region, and enable default bucket.
4. Go to **Project Settings** (gear icon) > **General** > **Your apps** > click the **Web (</>)** icon.
5. Register the app and copy your `firebaseConfig` object.

### Step 3: Add Credentials to the Project
Open [`js/firebase-config.js`](file:///c:/Users/ashis/OneDrive/Desktop/lost%20&%20found/js/firebase-config.js) and paste your credentials:
```javascript
const defaultFirebaseConfig = {
  apiKey: "AIzaSyYourActualApiKeyHere",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcd1234efgh"
};
```
> **Pro Tip**: You can also launch the app in your browser and click the banner at the top to paste your credentials directly into the in-app configuration modal!

### Step 4: Deploy Security Rules
In the Firebase Console:
- Copy the contents of [`firestore.rules`](file:///c:/Users/ashis/OneDrive/Desktop/lost%20&%20found/firestore.rules) into the **Firestore Database > Rules** tab and click **Publish**.
- Copy the contents of [`storage.rules`](file:///c:/Users/ashis/OneDrive/Desktop/lost%20&%20found/storage.rules) into the **Storage > Rules** tab and click **Publish**.

*(Alternatively, if you have the Firebase CLI installed, run `firebase deploy --only firestore:rules,storage`).*

---

## 🚀 Running the Application Locally

You can serve CampusFind with any static web server:

### Option A: Using Node.js `serve` / `npx`
```bash
npx serve .
```
Open [http://localhost:3000](http://localhost:3000) in your web browser.

### Option B: Using Python
```bash
# Python 3
python -m http.server 8000
```
Open [http://localhost:8000](http://localhost:8000) in your browser.

### Option C: Using Firebase CLI
```bash
npm install -g firebase-tools
firebase login
firebase serve --only hosting
```

---

## 🧪 Demonstration & Testing Walkthrough

Follow these steps for a complete demonstration of all features during project evaluations:

1. **Seed Sample Campus Listings**:
   - Open the homepage and click **"Seed Demo Listings"** in the hero or evaluation banner.
   - 8 realistic campus items (MacBook Air, Student ID, Casio Calculator, Backpack, Watch, Textbook) will be loaded directly into your Firestore database.

2. **Student Registration & Login**:
   - Go to `login.html`, click **Register**, and enter your details:
     - Name: `Ashish Sharma`
     - Email: `ashish@college.edu`
     - Student ID: `21BCE1042`
     - Password: `password123`
   - You will automatically be logged in and redirected to your student dashboard.

3. **Report a Lost or Found Item**:
   - Click **Report Item** in the navigation bar.
   - Choose **"I Found Something"**, enter item name (e.g. *Boat Earbuds in Library*), select Category *Electronics*, select campus location, and attach an optional photograph.
   - Click **Submit Listing**.

4. **Submit a Claim**:
   - Go to **Browse Items** and select any found item.
   - Click **Claim This Item**.
   - In the confidential claim modal, enter specific proof: *"It has a scratch near the volume rocker and a blue sticker on the back"*.
   - Submit the claim.

5. **Review Claims in Dashboard**:
   - Navigate to **My Listings** > **Incoming Claims** tab.
   - View the claim and observe how the confidential proof is presented in a highlighted security box.
   - Click **Approve Claim** to verify ownership and coordinate collection.

6. **Admin Dashboard & Moderation**:
   - Go to `admin.html`.
   - If testing as a regular student, click **"Grant Admin Role to My Account"** to promote your account.
   - View live platform statistics, manage listings, and review the flagged content queue.

---

## 🔒 Security & Privacy Implementation

- **No Hardcoded Secrets**: Client-side initialization uses standard Firebase Web configuration without embedding secret master service account keys.
- **Role-Based Access Control**: Admins are verified server-side through Firestore document checks (`users/{uid}.role == 'admin'`).
- **Private Claims**: Only the claimant, listing owner, and admins have Firestore permission to read confidential proof text.
- **Storage Limits**: Restricted to image MIME types under 5MB.

---

## 📜 License
Developed as an educational college miniproject / B.Tech project demonstration. Free to use and customize for academic purposes.
