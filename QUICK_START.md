# 🚀 Quick Start Guide - CeyGo Admin Dashboard

## What You Have

A complete Next.js admin dashboard with:
- ✅ Payment method configuration (Google Pay, Apple Pay, Bank Transfer)
- ✅ Bank transfer approval system with subscription activation
- ✅ User management interface
- ✅ Real-time dashboard analytics
- ✅ Firebase Admin SDK integration
- ✅ Secure authentication

## 3-Minute Setup

### Step 1: Get Firebase Credentials (2 minutes)

1. Open [Firebase Console](https://console.firebase.google.com)
2. Select your **cey-go-app** project
3. Click ⚙️ Settings → **Project settings**
4. Go to **Service accounts** tab
5. Click **Generate new private key** button
6. Download the JSON file

### Step 2: Configure Environment (30 seconds)

1. Open the downloaded JSON file
2. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```
3. Edit `.env.local` and paste values from JSON:
   ```env
   FIREBASE_PROJECT_ID=cey-go-app
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@cey-go-app.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Key-Here\n-----END PRIVATE KEY-----\n"
   
   ADMIN_EMAIL=admin@ceygo.com
   ADMIN_PASSWORD=YourSecurePassword123!
   ```

### Step 3: Run (30 seconds)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

**Login:**
- Email: `admin@ceygo.com`
- Password: `admin123` (or what you set in .env.local)

## 🎯 What You Can Do Now

### 1. Configure Payment Methods
**Dashboard → Payment Settings**
- Toggle Google Pay, Apple Pay, Bank Transfer on/off
- Add bank account details for transfers
- Save settings → Mobile app updates automatically

### 2. Approve Bank Transfers
**Dashboard → Bank Transfers**
- View pending payment requests
- See payment proof images
- Approve → Enter package type → User subscription activated!
- Reject → User gets notified

### 3. Manage Users
**Dashboard → Users**
- View all customers and drivers
- Search and filter
- See subscription status

## 📱 Mobile App Integration

Your Flutter app needs to:

### 1. Read Payment Settings
```dart
final settings = await FirebaseFirestore.instance
    .collection('app_settings')
    .doc('payment_methods')
    .get();

// Show available payment methods based on settings
if (settings.data()?['googlePay']?['enabled'] == true) {
  // Show Google Pay option
}
if (settings.data()?['bankTransfer']?['enabled'] == true) {
  // Show Bank Transfer option
}
```

### 2. Submit Bank Transfer
```dart
await FirebaseFirestore.instance.collection('bank_transfers').add({
  'userId': currentUser.uid,
  'userName': currentUser.displayName,
  'userEmail': currentUser.email,
  'amount': 50.0,
  'packageType': 'Premium',
  'referenceNumber': 'REF123456',
  'proofImageUrl': uploadedImageUrl,
  'status': 'pending',
  'createdAt': DateTime.now().toIso8601String(),
  'transferDate': DateTime.now().toIso8601String().split('T')[0],
});
```

### 3. Listen for Subscription Updates
```dart
FirebaseFirestore.instance
    .collection('users')
    .doc(userId)
    .snapshots()
    .listen((doc) {
      final subscription = doc.data()?['subscription'];
      if (subscription?['isActive'] == true) {
        // Show premium features!
      }
    });
```

## 🔥 Firestore Collections to Create

In Firebase Console → Firestore Database, create:

1. **Collection:** `app_settings`
   - **Document:** `payment_methods`
   ```json
   {
     "googlePay": { "enabled": true },
     "applePay": { "enabled": true },
     "bankTransfer": { "enabled": false }
   }
   ```

2. **Collection:** `users` (probably exists)
3. **Collection:** `bank_transfers` (will be created by users)
4. **Collection:** `bookings` (probably exists)
5. **Collection:** `notifications` (for user notifications)

## ⚡ Testing the Flow

1. **In Admin Dashboard:**
   - Go to Payment Settings
   - Enable Bank Transfer
   - Add bank details: 
     - Bank: "Commercial Bank"
     - Account: "1234567890"
     - Name: "CeyGo Pvt Ltd"
   - Save

2. **In Mobile App** (when you integrate):
   - User selects Premium package
   - Sees bank transfer option
   - Views bank details
   - Transfers money
   - Uploads proof
   - Submits request

3. **Back in Admin Dashboard:**
   - Go to Bank Transfers
   - See pending request
   - View proof image
   - Click Approve
   - Enter "Premium" and 30 days
   - Done! User's subscription is active

4. **Mobile App:**
   - User receives notification
   - Subscription activated
   - Premium features unlocked

## 🚀 Deploy to Production

### Option 1: Vercel (Easiest)
```bash
# Push to GitHub
git init
git add .
git commit -m "Initial commit"
git push origin main

# Go to vercel.com
# Import your GitHub repo
# Add environment variables
# Deploy!
```

### Option 2: Self-Host
```bash
npm run build
npm start
```

## 📚 Full Documentation

- **README.md** - Overview and quick start
- **DOCUMENTATION.md** - Complete API reference and guides
- **PROJECT_SUMMARY.md** - Technical details and architecture

## ⚠️ Before Going Live

- [ ] Change default admin password
- [ ] Add your Firebase credentials
- [ ] Test payment approval flow
- [ ] Set up Firestore security rules
- [ ] Enable Firebase indexes
- [ ] Use HTTPS in production
- [ ] Add rate limiting

## 💡 Tips

- **Default credentials:** admin@ceygo.com / admin123
- **Firebase Console:** Check Firestore for data
- **Browser Console:** Check for JavaScript errors
- **Network Tab:** Check API responses
- **Firestore Rules:** Make sure admin has read/write access

## 🆘 Common Issues

**Issue:** Can't login
- Check .env.local credentials
- Make sure dev server restarted after .env changes

**Issue:** No data showing
- Check Firestore collections exist
- Verify Firebase credentials
- Check browser console for errors

**Issue:** Payment settings not saving
- Check Firebase Admin SDK has write permissions
- Check Firestore rules
- See network tab for API errors

## 🎉 You're Ready!

Your admin dashboard is fully functional and ready to:
- Control payment methods in your app
- Approve bank transfers
- Activate user subscriptions automatically
- Manage users and analytics

Start by configuring payment settings and testing the bank transfer flow!

---

**Need Help?** Check DOCUMENTATION.md for detailed guides

**Dashboard Location:** `/Users/thanushkanth/Documents/Flutter/ceygo-admin-dashboard`
