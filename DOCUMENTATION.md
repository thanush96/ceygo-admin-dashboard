# CeyGo Admin Dashboard - Complete Documentation

## Table of Contents
1. [Setup Guide](#setup-guide)
2. [Environment Configuration](#environment-configuration)
3. [Firestore Structure](#firestore-structure)
4. [API Reference](#api-reference)
5. [Features Guide](#features-guide)
6. [Mobile App Integration](#mobile-app-integration)
7. [Deployment](#deployment)

## Setup Guide

### Prerequisites
- Node.js 18 or higher
- Firebase project with Firestore and Authentication
- Firebase Admin SDK service account

### Step-by-Step Setup

1. **Get Firebase Admin Credentials:**
   ```
   1. Go to Firebase Console (console.firebase.google.com)
   2. Select your project
   3. Go to Project Settings > Service Accounts
   4. Click "Generate New Private Key"
   5. Download the JSON file
   ```

2. **Create Environment File:**
   ```bash
   cp .env.local.example .env.local
   ```

3. **Configure Environment Variables:**
   Open `.env.local` and add your Firebase credentials from the downloaded JSON:
   ```env
   FIREBASE_PROJECT_ID=cey-go-app
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@cey-go-app.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Key-Here\n-----END PRIVATE KEY-----\n"
   
   ADMIN_EMAIL=admin@ceygo.com
   ADMIN_PASSWORD=YourSecurePassword123!
   ```

4. **Install and Run:**
   ```bash
   npm install
   npm run dev
   ```

5. **Access Dashboard:**
   Open http://localhost:3000 and login with your admin credentials

## Environment Configuration

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `FIREBASE_PROJECT_ID` | Your Firebase project ID | `cey-go-app` |
| `FIREBASE_CLIENT_EMAIL` | Service account email | `firebase-adminsdk@...` |
| `FIREBASE_PRIVATE_KEY` | Private key (with \n) | `"-----BEGIN..."` |
| `ADMIN_EMAIL` | Admin login email | `admin@ceygo.com` |
| `ADMIN_PASSWORD` | Admin login password | `SecurePass123!` |

### Security Notes
- Never commit `.env.local` to git
- Use strong passwords in production
- Rotate credentials regularly
- Enable 2FA for Firebase console

## Firestore Structure

### Collection: `users`
```typescript
{
  id: "user123",
  email: "john@example.com",
  name: "John Doe",
  phone: "+94771234567",
  role: "customer", // or "driver" or "admin"
  isActive: true,
  isVerified: true,
  profileImageUrl: "https://...",
  createdAt: "2024-12-02T10:00:00Z",
  subscription: {
    isActive: true,
    type: "Premium",
    startDate: "2024-12-01T00:00:00Z",
    endDate: "2024-12-31T23:59:59Z",
    paymentMethod: "bank_transfer"
  }
}
```

### Document: `app_settings/payment_methods`
```typescript
{
  googlePay: {
    enabled: true,
    merchantId: "BCR2DN4T..."
  },
  applePay: {
    enabled: true,
    merchantId: "merchant.com.ceygo"
  },
  bankTransfer: {
    enabled: true,
    bankName: "Commercial Bank",
    accountNumber: "1234567890",
    accountName: "CeyGo Pvt Ltd",
    instructions: "Please include your User ID in the transfer description"
  }
}
```

### Collection: `bank_transfers`
```typescript
{
  id: "transfer123",
  userId: "user123",
  userName: "John Doe",
  userEmail: "john@example.com",
  amount: 50,
  packageType: "Premium",
  transferDate: "2024-12-02",
  referenceNumber: "REF123456",
  proofImageUrl: "https://storage.../proof.jpg",
  status: "pending", // "approved" | "rejected"
  createdAt: "2024-12-02T10:00:00Z",
  processedAt: "2024-12-02T11:00:00Z",
  processedBy: "admin",
  notes: "Approved - Premium subscription activated"
}
```

### Collection: `bookings`
```typescript
{
  id: "booking123",
  customerId: "user123",
  driverId: "driver456",
  pickupLocation: "Colombo Fort",
  dropoffLocation: "Kandy",
  status: "completed",
  fare: 3500,
  createdAt: "2024-12-02T09:00:00Z",
  completedAt: "2024-12-02T12:00:00Z"
}
```

### Collection: `notifications`
```typescript
{
  id: "notif123",
  userId: "user123",
  title: "Payment Approved",
  body: "Your Premium subscription is now active",
  type: "payment",
  isRead: false,
  createdAt: "2024-12-02T11:00:00Z",
  payload: "subscription:premium"
}
```

## API Reference

### Authentication

#### POST `/api/auth/login`
Login to admin dashboard

**Request:**
```json
{
  "email": "admin@ceygo.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "base64-encoded-token"
}
```

### Payment Settings

#### GET `/api/payment-settings`
Get current payment method configuration

**Response:**
```json
{
  "googlePay": { "enabled": true, "merchantId": "..." },
  "applePay": { "enabled": true, "merchantId": "..." },
  "bankTransfer": {
    "enabled": true,
    "bankName": "Commercial Bank",
    "accountNumber": "1234567890",
    "accountName": "CeyGo Pvt Ltd",
    "instructions": "Include User ID in description"
  }
}
```

#### POST `/api/payment-settings`
Update payment method configuration

**Request:**
```json
{
  "googlePay": { "enabled": true },
  "applePay": { "enabled": true },
  "bankTransfer": {
    "enabled": true,
    "bankName": "Commercial Bank",
    "accountNumber": "1234567890",
    "accountName": "CeyGo Pvt Ltd"
  }
}
```

### Bank Transfers

#### GET `/api/bank-transfers?status=pending`
List bank transfer requests

**Query Parameters:**
- `status`: `all` | `pending` | `approved` | `rejected`

**Response:**
```json
[
  {
    "id": "transfer123",
    "userId": "user123",
    "userName": "John Doe",
    "amount": 50,
    "status": "pending",
    "createdAt": "2024-12-02T10:00:00Z"
  }
]
```

#### POST `/api/bank-transfers/[id]/approve`
Approve or reject a bank transfer

**Request:**
```json
{
  "status": "approved",
  "packageType": "Premium",
  "duration": 30,
  "notes": "Approved successfully"
}
```

### Dashboard Stats

#### GET `/api/dashboard/stats`
Get dashboard statistics

**Response:**
```json
{
  "totalUsers": 150,
  "totalDrivers": 45,
  "totalBookings": 320,
  "activeBookings": 12,
  "totalRevenue": 45000,
  "pendingTransfers": 5,
  "newUsersThisMonth": 23,
  "completedTripsToday": 8
}
```

### Users

#### GET `/api/users?role=customer&status=active`
List users with filters

**Query Parameters:**
- `role`: `all` | `customer` | `driver` | `admin`
- `status`: `all` | `active` | `inactive`

## Features Guide

### 1. Payment Settings Management

**Location:** Dashboard > Payment Settings

**How to Use:**
1. Toggle each payment method on/off
2. For Bank Transfer, fill in:
   - Bank Name
   - Account Number
   - Account Name
   - Transfer Instructions
3. Click "Save Settings"
4. Changes apply immediately to mobile app

**Impact on Mobile App:**
- Only enabled methods show in payment screen
- Bank transfer details displayed to users
- Users can choose available methods

### 2. Bank Transfer Approval

**Location:** Dashboard > Bank Transfers

**Workflow:**
1. **Review Pending Requests:**
   - Filter by "Pending"
   - View user details, amount, and reference number
   
2. **View Details:**
   - Click eye icon to see full details
   - View uploaded payment proof image
   - Check reference number

3. **Approve Transfer:**
   - Click "Approve" button
   - Enter package type (e.g., "Premium", "Standard")
   - Enter duration in days (default: 30)
   - System automatically:
     - Updates user subscription
     - Marks transfer as approved
     - Sends notification to user

4. **Reject Transfer:**
   - Click "Reject" button
   - Enter rejection reason
   - User receives notification

### 3. User Management

**Location:** Dashboard > Users

**Features:**
- Search by name or email
- Filter by role (Customer/Driver/Admin)
- Filter by status (Active/Inactive)
- View subscription details
- Activate/deactivate accounts

### 4. Dashboard Overview

**Location:** Dashboard (Home)

**Displays:**
- Total users and new signups
- Active bookings and trips
- Revenue statistics
- Pending transfer count
- Quick action buttons

## Mobile App Integration

### 1. Fetching Payment Settings

```dart
import 'package:cloud_firestore/cloud_firestore.dart';

Future<Map<String, dynamic>> getPaymentSettings() async {
  final doc = await FirebaseFirestore.instance
      .collection('app_settings')
      .doc('payment_methods')
      .get();
  
  return doc.data() ?? {};
}
```

### 2. Displaying Available Methods

```dart
Widget buildPaymentMethods(Map<String, dynamic> settings) {
  return Column(
    children: [
      if (settings['googlePay']?['enabled'] == true)
        PaymentMethodTile(
          title: 'Google Pay',
          onTap: () => handleGooglePay(),
        ),
      
      if (settings['applePay']?['enabled'] == true)
        PaymentMethodTile(
          title: 'Apple Pay',
          onTap: () => handleApplePay(),
        ),
      
      if (settings['bankTransfer']?['enabled'] == true)
        PaymentMethodTile(
          title: 'Bank Transfer',
          onTap: () => handleBankTransfer(settings['bankTransfer']),
        ),
    ],
  );
}
```

### 3. Submitting Bank Transfer Request

```dart
Future<void> submitBankTransfer({
  required String userId,
  required String userName,
  required String userEmail,
  required double amount,
  required String packageType,
  required String referenceNumber,
  String? proofImageUrl,
}) async {
  await FirebaseFirestore.instance.collection('bank_transfers').add({
    'userId': userId,
    'userName': userName,
    'userEmail': userEmail,
    'amount': amount,
    'packageType': packageType,
    'transferDate': DateTime.now().toIso8601String().split('T')[0],
    'referenceNumber': referenceNumber,
    'proofImageUrl': proofImageUrl,
    'status': 'pending',
    'createdAt': DateTime.now().toIso8601String(),
  });
}
```

### 4. Listening for Subscription Updates

```dart
Stream<bool> listenToSubscriptionStatus(String userId) {
  return FirebaseFirestore.instance
      .collection('users')
      .doc(userId)
      .snapshots()
      .map((doc) {
        final data = doc.data();
        return data?['subscription']?['isActive'] ?? false;
      });
}
```

## Deployment

### Deploy to Vercel

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/ceygo-admin-dashboard.git
   git push -u origin main
   ```

2. **Import to Vercel:**
   - Go to vercel.com
   - Click "Import Project"
   - Select your GitHub repository

3. **Add Environment Variables:**
   In Vercel dashboard, add all variables from `.env.local`

4. **Deploy:**
   Vercel automatically builds and deploys

### Deploy to Other Platforms

```bash
# Build production version
npm run build

# Start production server
npm start
```

## Troubleshooting

### Common Issues

**Issue:** Firebase Admin SDK authentication error
**Solution:** 
- Check private key format (must include `\n` for line breaks)
- Verify project ID matches Firebase console
- Ensure service account has proper permissions

**Issue:** API routes return 500 error
**Solution:**
- Check all environment variables are set
- Restart dev server after env changes
- Check Firebase console for Firestore data

**Issue:** Dashboard shows no data
**Solution:**
- Verify Firestore collections exist
- Check collection names match exactly
- Ensure proper Firestore indexes

## Best Practices

1. **Security:**
   - Use environment variables for sensitive data
   - Implement rate limiting in production
   - Enable Firestore security rules
   - Use HTTPS in production

2. **Performance:**
   - Index frequently queried fields in Firestore
   - Implement pagination for large lists
   - Cache payment settings

3. **User Experience:**
   - Provide clear error messages
   - Show loading states
   - Confirm destructive actions
   - Send email notifications for important events

## Support

For issues or questions:
- Check Firestore data structure
- Review Firebase console logs
- Check browser console for client errors
- Verify API responses in Network tab

---

Last Updated: December 2024
