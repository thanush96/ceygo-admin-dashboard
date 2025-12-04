# 🔥 Firebase Setup for CeyGo Admin Dashboard

## Your Firebase Project Details

- **Project ID:** `cey-go-app`
- **Storage Bucket:** `cey-go-app.firebasestorage.app`
- **Region:** Auto-detected from your project

---

## 🚀 Quick Firebase Admin SDK Setup

### Step 1: Get Your Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select **cey-go-app** project
3. Click the ⚙️ gear icon → **Project settings**
4. Go to **Service accounts** tab
5. Click **Generate new private key**
6. Click **Generate key** to download JSON file

### Step 2: Configure Your Dashboard

The `.env.local` file has been created with your project ID. Now you need to add the service account credentials:

1. Open the downloaded JSON file
2. Copy these values from the JSON to `.env.local`:

```env
FIREBASE_PROJECT_ID=cey-go-app
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@cey-go-app.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Key\n-----END PRIVATE KEY-----\n"
```

**Important:** The private key must include `\n` for newlines!

### Step 3: Update .env.local

Open `.env.local` and replace:
- `FIREBASE_CLIENT_EMAIL` with the `client_email` from your JSON
- `FIREBASE_PRIVATE_KEY` with the `private_key` from your JSON

**Example JSON structure:**
```json
{
  "type": "service_account",
  "project_id": "cey-go-app",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@cey-go-app.iam.gserviceaccount.com",
  "client_id": "...",
  ...
}
```

### Step 4: Test Connection

```bash
npm run dev
```

Visit http://localhost:3000 and login with:
- Email: `admin@ceygo.com`
- Password: `admin123`

---

## 📋 Firestore Collections Setup

You need to create these collections in Firestore:

### 1. Create Payment Settings Document

In Firebase Console → Firestore Database:

1. Click **Start collection**
2. Collection ID: `app_settings`
3. Document ID: `payment_methods`
4. Add fields:

```
googlePay (map)
  └─ enabled: true (boolean)
  └─ merchantId: "" (string)

applePay (map)
  └─ enabled: true (boolean)
  └─ merchantId: "" (string)

bankTransfer (map)
  └─ enabled: false (boolean)
  └─ bankName: "" (string)
  └─ accountNumber: "" (string)
  └─ accountName: "" (string)
  └─ instructions: "" (string)
```

### 2. Existing Collections

These should already exist from your Flutter app:
- ✅ `users` - User accounts
- ✅ `bookings` - Ride bookings
- ✅ `notifications` - Notifications

### 3. New Collection (Auto-created)

- `bank_transfers` - Will be created when first user submits a bank transfer

---

## 🔐 Firestore Security Rules

Add these rules in Firebase Console → Firestore Database → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // App settings - read by all authenticated users, write by admin only
    match /app_settings/{document=**} {
      allow read: if request.auth != null;
      allow write: if false; // Only via Admin SDK
    }
    
    // Bank transfers - users can create their own, read their own
    match /bank_transfers/{transferId} {
      allow create: if request.auth != null 
        && request.resource.data.userId == request.auth.uid;
      allow read: if request.auth != null 
        && (resource.data.userId == request.auth.uid || isAdmin());
      allow update, delete: if false; // Only via Admin SDK
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if false; // Only via Admin SDK or specific functions
    }
    
    // Admin check function
    function isAdmin() {
      return request.auth != null 
        && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

---

## 📱 Storage Rules for Payment Proofs

In Firebase Console → Storage → Rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Bank transfer proof images
    match /bank_transfers/{userId}/{filename} {
      allow write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null;
    }
  }
}
```

---

## ✅ Verification Checklist

### In Firebase Console:

- [ ] Service account key generated
- [ ] Firestore Database enabled
- [ ] `app_settings/payment_methods` document created
- [ ] Firestore security rules updated
- [ ] Storage rules updated
- [ ] Authentication enabled (Email/Password)

### In Dashboard:

- [ ] `.env.local` updated with service account credentials
- [ ] Dev server running (`npm run dev`)
- [ ] Can login at http://localhost:3000
- [ ] Dashboard shows statistics
- [ ] Payment Settings page loads
- [ ] Can toggle payment methods

### Integration Test:

1. **In Dashboard:**
   - [ ] Go to Payment Settings
   - [ ] Enable Bank Transfer
   - [ ] Add bank details
   - [ ] Save successfully

2. **In Firestore Console:**
   - [ ] Verify `app_settings/payment_methods` updated
   - [ ] Check `bankTransfer.enabled = true`

3. **In Mobile App** (after integration):
   - [ ] Fetch payment settings
   - [ ] Bank transfer option appears
   - [ ] Submit test transfer
   - [ ] Appears in dashboard

---

## 🐛 Troubleshooting

### Error: "Permission denied"
**Solution:** Check Firestore security rules allow read/write from Admin SDK

### Error: "Invalid credentials"
**Solution:** 
1. Verify `FIREBASE_PROJECT_ID=cey-go-app`
2. Check client email format
3. Ensure private key includes `\n` characters
4. Restart dev server after .env.local changes

### Error: "Collection not found"
**Solution:** Create `app_settings/payment_methods` document in Firestore

### Dashboard shows no data
**Solution:**
1. Check Firebase Console → Firestore for existing data
2. Verify service account has "Firebase Admin SDK Administrator Service Agent" role
3. Check browser console for errors

---

## 📞 Firebase Project Info

Your project configuration:
```javascript
{
  projectId: "cey-go-app",
  storageBucket: "cey-go-app.firebasestorage.app",
  messagingSenderId: "216101225997",
  appId: "1:216101225997:web:26108be8fb6401bff37744"
}
```

**Note:** The dashboard uses Firebase Admin SDK (server-side), while your Flutter app uses the client SDK with the config above.

---

## 🎯 Next Steps

1. ✅ Generate service account key from Firebase Console
2. ✅ Update `.env.local` with credentials
3. ✅ Create `app_settings/payment_methods` in Firestore
4. ✅ Update Firestore security rules
5. ✅ Run `npm run dev` and test dashboard
6. ✅ Integrate mobile app using `MOBILE_INTEGRATION.md`

---

**Ready to go!** Once you add your service account credentials to `.env.local`, the dashboard will connect to your `cey-go-app` Firebase project.
