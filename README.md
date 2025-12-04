# CeyGo Admin Dashboard

A comprehensive Next.js admin dashboard for managing the CeyGo ride-sharing mobile application. This dashboard provides full control over users, drivers, bookings, payment methods, and bank transfer approvals.

## Features

### 🎯 Core Features
- **Dashboard Overview** - Real-time statistics and analytics
- **User Management** - View, filter, and manage all users
- **Driver Management** - Approve drivers and verify documents
- **Booking Management** - Monitor and manage ride bookings
- **Payment Settings** - Enable/disable payment methods (Google Pay, Apple Pay, Bank Transfer)
- **Bank Transfer Approval** - Review and approve manual bank transfers
- **Notification System** - Send push notifications to users
- **Reports & Analytics** - Generate insights and reports

### 💳 Payment Method Configuration
Admins can control which payment methods are available in the mobile app:
- Toggle Google Pay, Apple Pay, and Bank Transfer on/off
- Configure bank account details for transfers
- Set custom instructions for users

### 🏦 Bank Transfer Workflow
1. User selects package in mobile app
2. User transfers money to admin's bank account
3. User uploads payment proof with reference number
4. Admin reviews transfer request in dashboard
5. Admin approves and activates user's subscription
6. User receives notification of activation

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Firebase Admin SDK
- **Database**: Cloud Firestore
- **Charts**: Recharts
- **Icons**: Lucide React

## Installation

1. Navigate to project:
   \`\`\`bash
   cd /Users/thanushkanth/Documents/Flutter/ceygo-admin-dashboard
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Create \`.env.local\` file with Firebase credentials

4. Run development server:
   \`\`\`bash
   npm run dev
   \`\`\`

5. Open http://localhost:3000

## Default Credentials
- Email: admin@ceygo.com
- Password: admin123

⚠️ Change these in production!

## Documentation

See full documentation in the dashboard README for:
- Detailed setup instructions
- API endpoints
- Firestore structure
- Deployment guide

---

Built for CeyGo Ride-Sharing App
