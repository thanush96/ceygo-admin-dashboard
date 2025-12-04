/**
 * Script to initialize payment settings in Firebase
 * Run this once to set up initial payment configuration
 * 
 * Usage: npm run init-payment-settings
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
const serviceAccount = require(path.join(__dirname, '../cey-go-app-firebase-adminsdk-fbsvc-8b10515563.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function initializePaymentSettings() {
  console.log('🔧 Initializing payment settings...');

  try {
    const paymentSettingsRef = db.collection('payment_settings').doc('config');

    const defaultSettings = {
      googlePay: {
        enabled: true,
        merchantId: null // Add your merchant ID here
      },
      applePay: {
        enabled: true,
        merchantId: null // Add your merchant ID here
      },
      bankTransfer: {
        enabled: true,
        bankDetails: {
          bankName: 'Bank of Ceylon',
          accountName: 'CeyGo Services',
          accountNumber: '1234567890',
          branch: 'Colombo Main Branch',
          swiftCode: 'BCEYLKLX'
        }
      }
    };

    await paymentSettingsRef.set(defaultSettings);

    console.log('✅ Payment settings initialized successfully!');
    console.log('\nCurrent settings:');
    console.log(JSON.stringify(defaultSettings, null, 2));
    console.log('\n📱 You can now manage these settings from the admin dashboard at:');
    console.log('   http://localhost:3000/dashboard/payment-settings');

  } catch (error) {
    console.error('❌ Error initializing payment settings:', error);
    process.exit(1);
  }

  process.exit(0);
}

initializePaymentSettings();
