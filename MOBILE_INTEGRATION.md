# 📱 Mobile App Integration Checklist

## Overview
This checklist will help you integrate the admin dashboard's payment system with your Flutter mobile app.

## ✅ Step 1: Firestore Setup

### Create Required Document
In Firebase Console → Firestore:

- [ ] Create collection `app_settings`
- [ ] Create document `payment_methods` inside it
- [ ] Add initial data:
```json
{
  "googlePay": {
    "enabled": true,
    "merchantId": ""
  },
  "applePay": {
    "enabled": true,
    "merchantId": ""
  },
  "bankTransfer": {
    "enabled": false,
    "bankName": "",
    "accountNumber": "",
    "accountName": "",
    "instructions": ""
  }
}
```

## ✅ Step 2: Create Payment Settings Service in Flutter

Create `lib/services/payment_settings_service.dart`:

```dart
import 'package:cloud_firestore/cloud_firestore.dart';

class PaymentSettingsService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  // Fetch payment settings
  Future<Map<String, dynamic>> getPaymentSettings() async {
    try {
      final doc = await _firestore
          .collection('app_settings')
          .doc('payment_methods')
          .get();

      return doc.data() ?? {
        'googlePay': {'enabled': true},
        'applePay': {'enabled': true},
        'bankTransfer': {'enabled': false},
      };
    } catch (e) {
      print('Error fetching payment settings: $e');
      return {};
    }
  }

  // Listen to payment settings changes (real-time)
  Stream<Map<String, dynamic>> watchPaymentSettings() {
    return _firestore
        .collection('app_settings')
        .doc('payment_methods')
        .snapshots()
        .map((doc) => doc.data() ?? {});
  }

  // Check if a specific method is enabled
  Future<bool> isMethodEnabled(String methodName) async {
    final settings = await getPaymentSettings();
    return settings[methodName]?['enabled'] ?? false;
  }
}
```

## ✅ Step 3: Create Bank Transfer Service

Create `lib/services/bank_transfer_service.dart`:

```dart
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_storage/firebase_storage.dart';
import 'dart:io';

class BankTransferService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final FirebaseStorage _storage = FirebaseStorage.instance;

  // Submit bank transfer request
  Future<String> submitTransferRequest({
    required String userId,
    required String userName,
    required String userEmail,
    required double amount,
    required String packageType,
    required String referenceNumber,
    required String transferDate,
    File? proofImage,
  }) async {
    try {
      String? proofImageUrl;

      // Upload proof image if provided
      if (proofImage != null) {
        final timestamp = DateTime.now().millisecondsSinceEpoch;
        final ref = _storage.ref().child('bank_transfers/$userId/$timestamp.jpg');
        await ref.putFile(proofImage);
        proofImageUrl = await ref.getDownloadURL();
      }

      // Create transfer request
      final docRef = await _firestore.collection('bank_transfers').add({
        'userId': userId,
        'userName': userName,
        'userEmail': userEmail,
        'amount': amount,
        'packageType': packageType,
        'referenceNumber': referenceNumber,
        'transferDate': transferDate,
        'proofImageUrl': proofImageUrl,
        'status': 'pending',
        'createdAt': DateTime.now().toIso8601String(),
      });

      return docRef.id;
    } catch (e) {
      print('Error submitting transfer: $e');
      rethrow;
    }
  }

  // Get user's transfer requests
  Future<List<Map<String, dynamic>>> getUserTransfers(String userId) async {
    try {
      final snapshot = await _firestore
          .collection('bank_transfers')
          .where('userId', isEqualTo: userId)
          .orderBy('createdAt', descending: true)
          .get();

      return snapshot.docs.map((doc) {
        return {...doc.data(), 'id': doc.id};
      }).toList();
    } catch (e) {
      print('Error fetching transfers: $e');
      return [];
    }
  }

  // Listen to transfer status changes
  Stream<String?> watchTransferStatus(String transferId) {
    return _firestore
        .collection('bank_transfers')
        .doc(transferId)
        .snapshots()
        .map((doc) => doc.data()?['status'] as String?);
  }
}
```

## ✅ Step 4: Create Subscription Service

Create `lib/services/subscription_service.dart`:

```dart
import 'package:cloud_firestore/cloud_firestore.dart';

class SubscriptionService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  // Get user subscription
  Future<Map<String, dynamic>?> getUserSubscription(String userId) async {
    try {
      final doc = await _firestore.collection('users').doc(userId).get();
      return doc.data()?['subscription'] as Map<String, dynamic>?;
    } catch (e) {
      print('Error fetching subscription: $e');
      return null;
    }
  }

  // Listen to subscription changes (real-time)
  Stream<Map<String, dynamic>?> watchSubscription(String userId) {
    return _firestore
        .collection('users')
        .doc(userId)
        .snapshots()
        .map((doc) => doc.data()?['subscription'] as Map<String, dynamic>?);
  }

  // Check if subscription is active
  Future<bool> isSubscriptionActive(String userId) async {
    final subscription = await getUserSubscription(userId);
    if (subscription == null) return false;

    final isActive = subscription['isActive'] ?? false;
    if (!isActive) return false;

    // Check expiry date
    final endDateStr = subscription['endDate'] as String?;
    if (endDateStr == null) return false;

    final endDate = DateTime.parse(endDateStr);
    return DateTime.now().isBefore(endDate);
  }
}
```

## ✅ Step 5: Create Payment Selection Screen

Create `lib/screens/payment/payment_selection_screen.dart`:

```dart
import 'package:flutter/material.dart';
import 'package:cey_go_app/services/payment_settings_service.dart';
import 'bank_transfer_screen.dart';

class PaymentSelectionScreen extends StatefulWidget {
  final String packageType;
  final double amount;

  const PaymentSelectionScreen({
    required this.packageType,
    required this.amount,
    super.key,
  });

  @override
  State<PaymentSelectionScreen> createState() => _PaymentSelectionScreenState();
}

class _PaymentSelectionScreenState extends State<PaymentSelectionScreen> {
  final _settingsService = PaymentSettingsService();
  Map<String, dynamic>? _settings;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadSettings();
  }

  Future<void> _loadSettings() async {
    final settings = await _settingsService.getPaymentSettings();
    setState(() {
      _settings = settings;
      _loading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return Scaffold(
        appBar: AppBar(title: const Text('Select Payment Method')),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    return Scaffold(
      appBar: AppBar(title: const Text('Select Payment Method')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          if (_settings?['googlePay']?['enabled'] == true)
            _buildPaymentOption(
              icon: Icons.account_balance_wallet,
              title: 'Google Pay',
              onTap: () => _handleGooglePay(),
            ),
          
          if (_settings?['applePay']?['enabled'] == true)
            _buildPaymentOption(
              icon: Icons.apple,
              title: 'Apple Pay',
              onTap: () => _handleApplePay(),
            ),
          
          if (_settings?['bankTransfer']?['enabled'] == true)
            _buildPaymentOption(
              icon: Icons.account_balance,
              title: 'Bank Transfer',
              subtitle: 'Manual approval required',
              onTap: () => _handleBankTransfer(),
            ),
        ],
      ),
    );
  }

  Widget _buildPaymentOption({
    required IconData icon,
    required String title,
    String? subtitle,
    required VoidCallback onTap,
  }) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: Icon(icon, size: 32),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
        subtitle: subtitle != null ? Text(subtitle) : null,
        trailing: const Icon(Icons.arrow_forward_ios),
        onTap: onTap,
      ),
    );
  }

  void _handleGooglePay() {
    // Implement Google Pay
  }

  void _handleApplePay() {
    // Implement Apple Pay
  }

  void _handleBankTransfer() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => BankTransferScreen(
          packageType: widget.packageType,
          amount: widget.amount,
          bankDetails: _settings?['bankTransfer'],
        ),
      ),
    );
  }
}
```

## ✅ Step 6: Create Bank Transfer Screen

Create `lib/screens/payment/bank_transfer_screen.dart`:

```dart
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:image_picker/image_picker.dart';
import 'package:cey_go_app/services/bank_transfer_service.dart';
import 'package:cey_go_app/services/firebase_auth_service.dart';
import 'dart:io';

class BankTransferScreen extends StatefulWidget {
  final String packageType;
  final double amount;
  final Map<String, dynamic>? bankDetails;

  const BankTransferScreen({
    required this.packageType,
    required this.amount,
    this.bankDetails,
    super.key,
  });

  @override
  State<BankTransferScreen> createState() => _BankTransferScreenState();
}

class _BankTransferScreenState extends State<BankTransferScreen> {
  final _formKey = GlobalKey<FormState>();
  final _referenceController = TextEditingController();
  final _dateController = TextEditingController();
  final _transferService = BankTransferService();
  final _authService = FirebaseAuthService();
  
  File? _proofImage;
  bool _submitting = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Bank Transfer')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Bank Details Card
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Transfer to:',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 12),
                      _buildBankInfo(
                        'Bank',
                        widget.bankDetails?['bankName'] ?? '',
                      ),
                      _buildBankInfo(
                        'Account Number',
                        widget.bankDetails?['accountNumber'] ?? '',
                        canCopy: true,
                      ),
                      _buildBankInfo(
                        'Account Name',
                        widget.bankDetails?['accountName'] ?? '',
                      ),
                      _buildBankInfo(
                        'Amount',
                        'LKR ${widget.amount.toStringAsFixed(2)}',
                        highlight: true,
                      ),
                    ],
                  ),
                ),
              ),
              
              const SizedBox(height: 24),
              
              // Instructions
              if (widget.bankDetails?['instructions'] != null)
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.blue.shade50,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(widget.bankDetails!['instructions']),
                ),
              
              const SizedBox(height: 24),
              
              // Reference Number
              TextFormField(
                controller: _referenceController,
                decoration: const InputDecoration(
                  labelText: 'Reference Number *',
                  hintText: 'Enter transfer reference',
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter reference number';
                  }
                  return null;
                },
              ),
              
              const SizedBox(height: 16),
              
              // Transfer Date
              TextFormField(
                controller: _dateController,
                decoration: const InputDecoration(
                  labelText: 'Transfer Date *',
                  suffixIcon: Icon(Icons.calendar_today),
                ),
                readOnly: true,
                onTap: _selectDate,
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please select transfer date';
                  }
                  return null;
                },
              ),
              
              const SizedBox(height: 24),
              
              // Upload Proof
              const Text(
                'Upload Payment Proof *',
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              InkWell(
                onTap: _pickImage,
                child: Container(
                  height: 200,
                  decoration: BoxDecoration(
                    border: Border.all(color: Colors.grey),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: _proofImage != null
                      ? Image.file(_proofImage!, fit: BoxFit.cover)
                      : const Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.upload, size: 48, color: Colors.grey),
                            SizedBox(height: 8),
                            Text('Tap to upload receipt'),
                          ],
                        ),
                ),
              ),
              
              const SizedBox(height: 32),
              
              // Submit Button
              SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton(
                  onPressed: _submitting ? null : _submitTransfer,
                  child: _submitting
                      ? const CircularProgressIndicator()
                      : const Text('Submit for Approval'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildBankInfo(String label, String value, {bool canCopy = false, bool highlight = false}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: const TextStyle(color: Colors.grey),
          ),
          Row(
            children: [
              Text(
                value,
                style: TextStyle(
                  fontWeight: highlight ? FontWeight.bold : FontWeight.normal,
                  fontSize: highlight ? 18 : 14,
                ),
              ),
              if (canCopy)
                IconButton(
                  icon: const Icon(Icons.copy, size: 16),
                  onPressed: () {
                    Clipboard.setData(ClipboardData(text: value));
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Copied to clipboard')),
                    );
                  },
                ),
            ],
          ),
        ],
      ),
    );
  }

  Future<void> _selectDate() async {
    final date = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime.now().subtract(const Duration(days: 30)),
      lastDate: DateTime.now(),
    );
    
    if (date != null) {
      _dateController.text = date.toIso8601String().split('T')[0];
    }
  }

  Future<void> _pickImage() async {
    final ImagePicker picker = ImagePicker();
    final XFile? image = await picker.pickImage(source: ImageSource.gallery);
    
    if (image != null) {
      setState(() {
        _proofImage = File(image.path);
      });
    }
  }

  Future<void> _submitTransfer() async {
    if (!_formKey.currentState!.validate()) return;
    if (_proofImage == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please upload payment proof')),
      );
      return;
    }

    setState(() => _submitting = true);

    try {
      final user = _authService.currentUser;
      if (user == null) throw Exception('User not logged in');

      await _transferService.submitTransferRequest(
        userId: user.uid,
        userName: user.displayName ?? 'Unknown',
        userEmail: user.email ?? '',
        amount: widget.amount,
        packageType: widget.packageType,
        referenceNumber: _referenceController.text,
        transferDate: _dateController.text,
        proofImage: _proofImage,
      );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Transfer submitted! Waiting for admin approval.'),
          ),
        );
        Navigator.of(context).popUntil((route) => route.isFirst);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _submitting = false);
      }
    }
  }

  @override
  void dispose() {
    _referenceController.dispose();
    _dateController.dispose();
    super.dispose();
  }
}
```

## ✅ Step 7: Update User Model

Update `lib/models/user_model.dart` to include subscription:

```dart
class UserModel {
  final String id;
  final String email;
  final String name;
  final String? phone;
  final String role;
  final bool isActive;
  final SubscriptionModel? subscription;

  // ... existing code ...
}

class SubscriptionModel {
  final bool isActive;
  final String type;
  final DateTime startDate;
  final DateTime endDate;
  final String? paymentMethod;

  SubscriptionModel({
    required this.isActive,
    required this.type,
    required this.startDate,
    required this.endDate,
    this.paymentMethod,
  });

  factory SubscriptionModel.fromMap(Map<String, dynamic> map) {
    return SubscriptionModel(
      isActive: map['isActive'] ?? false,
      type: map['type'] ?? '',
      startDate: DateTime.parse(map['startDate']),
      endDate: DateTime.parse(map['endDate']),
      paymentMethod: map['paymentMethod'],
    );
  }
}
```

## ✅ Step 8: Add to Existing Subscription Flow

In your existing subscription purchase screen, add bank transfer option:

```dart
// In lib/screens/driver/subscription_purchase_screen.dart

void _handlePayment() async {
  // Show payment method selection
  Navigator.push(
    context,
    MaterialPageRoute(
      builder: (context) => PaymentSelectionScreen(
        packageType: selectedPackage.name,
        amount: selectedPackage.price,
      ),
    ),
  );
}
```

## ✅ Step 9: Test the Integration

### Test Checklist:

- [ ] Admin dashboard can be accessed
- [ ] Payment settings can be updated from dashboard
- [ ] Mobile app reads payment settings from Firestore
- [ ] Bank transfer option shows when enabled
- [ ] Bank details display correctly in mobile app
- [ ] User can upload payment proof
- [ ] Transfer request is created in Firestore
- [ ] Admin can see pending request in dashboard
- [ ] Admin can approve transfer
- [ ] User subscription is activated after approval
- [ ] User receives notification of activation
- [ ] Mobile app reflects subscription status

## 📋 Final Verification

Run through this complete flow:

1. **In Admin Dashboard:**
   - [ ] Login to dashboard
   - [ ] Go to Payment Settings
   - [ ] Enable Bank Transfer
   - [ ] Add bank details
   - [ ] Save settings

2. **In Mobile App:**
   - [ ] Navigate to subscription/package purchase
   - [ ] See bank transfer option
   - [ ] View bank details
   - [ ] Fill in reference and date
   - [ ] Upload payment proof
   - [ ] Submit request

3. **In Firestore Console:**
   - [ ] Check `bank_transfers` collection has new document
   - [ ] Verify status is "pending"

4. **In Admin Dashboard:**
   - [ ] Go to Bank Transfers
   - [ ] See new pending request
   - [ ] Click to view details
   - [ ] See uploaded proof image
   - [ ] Click Approve
   - [ ] Enter package type and duration

5. **In Firestore Console:**
   - [ ] Check user document has updated subscription
   - [ ] Verify `isActive` is true
   - [ ] Check `bank_transfers` document status is "approved"

6. **In Mobile App:**
   - [ ] User sees subscription active
   - [ ] Premium features accessible
   - [ ] Notification received

## 🎉 Integration Complete!

Once all checkboxes are completed, your payment system is fully integrated!

---

**Need Help?** Check DOCUMENTATION.md for detailed API reference
