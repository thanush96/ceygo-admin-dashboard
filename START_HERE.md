# 🎯 START HERE - CeyGo Admin Dashboard

## Your Firebase Project: cey-go-app ✅

I've configured the dashboard for your Firebase project!

---

## 🚀 3 Steps to Get Running

### Step 1: Get Firebase Service Account Key (2 minutes)

1. Open: https://console.firebase.google.com/project/cey-go-app/settings/serviceaccounts
2. Click **"Generate new private key"**
3. Click **"Generate key"** → Downloads a JSON file

### Step 2: Add Credentials to .env.local (1 minute)

Open the JSON file you just downloaded and copy these values:

1. Open `.env.local` in this folder
2. Replace these lines with values from your JSON:

```env
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@cey-go-app.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Actual-Key\n-----END PRIVATE KEY-----\n"
```

**Copy exactly as shown in the JSON file!**

### Step 3: Run the Dashboard (30 seconds)

```bash
npm run dev
```

Open: **http://localhost:3000**

Login:
- Email: `admin@ceygo.com`
- Password: `admin123`

---

## ✅ What You'll See

Once running, you can:

1. **Dashboard** - View statistics (users, bookings, revenue)
2. **Payment Settings** - Enable/disable Google Pay, Apple Pay, Bank Transfer
3. **Bank Transfers** - Approve user payment requests
4. **Users** - Manage user accounts

---

## 📱 Connect to Your Flutter App

After the dashboard is running, follow these steps to integrate with your mobile app:

1. Read: `MOBILE_INTEGRATION.md` - Complete Flutter code provided
2. Copy the services and screens to your Flutter app
3. Test the bank transfer flow end-to-end

---

## 🔥 Create Required Firestore Document

Before using Payment Settings, create this in Firestore:

**Firebase Console → Firestore Database:**

1. Click "+ Start collection"
2. Collection ID: `app_settings`
3. Click "Next"
4. Document ID: `payment_methods`
5. Add field: `googlePay` (map)
   - enabled: `true` (boolean)
6. Add field: `applePay` (map)
   - enabled: `true` (boolean)
7. Add field: `bankTransfer` (map)
   - enabled: `false` (boolean)
8. Click "Save"

---

## 📚 Documentation Files

- `FIREBASE_SETUP.md` - Detailed Firebase configuration
- `QUICK_START.md` - General quick start guide
- `MOBILE_INTEGRATION.md` - Flutter integration code
- `DOCUMENTATION.md` - Complete API reference
- `PROJECT_SUMMARY.md` - Technical overview

---

## 🆘 Need Help?

**Can't login?**
→ Make sure you updated `.env.local` with your service account credentials

**No data showing?**
→ Create the `app_settings/payment_methods` document in Firestore

**Error messages?**
→ Check browser console (F12) and terminal for error details

---

## 🎉 You're Almost There!

Just add your Firebase service account key to `.env.local` and run `npm run dev`!

**Service Account Link:**
https://console.firebase.google.com/project/cey-go-app/settings/serviceaccounts

---

**Project Ready:** ✅ Configured for cey-go-app  
**Next:** Add service account key → Run dashboard → Integrate mobile app
