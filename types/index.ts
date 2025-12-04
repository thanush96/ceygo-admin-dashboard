// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: 'customer' | 'driver' | 'admin';
  isActive: boolean;
  isVerified: boolean;
  profileImageUrl?: string;
  createdAt: string;
  subscription?: {
    isActive: boolean;
    type: string;
    startDate: string;
    endDate: string;
  };
}

// Driver Types
export interface Driver extends User {
  role: 'driver';
  documents: {
    licenseUrl?: string;
    insuranceUrl?: string;
    vehicleRegistrationUrl?: string;
    isVerified: boolean;
  };
  vehicle?: {
    make: string;
    model: string;
    year: number;
    plateNumber: string;
    color: string;
  };
  rating?: number;
  totalTrips?: number;
}

// Booking Types
export interface Booking {
  id: string;
  customerId: string;
  driverId?: string;
  pickupLocation: string;
  dropoffLocation: string;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  fare: number;
  createdAt: string;
  completedAt?: string;
}

// Payment Settings Types
export interface PaymentSettings {
  googlePay: {
    enabled: boolean;
    merchantId?: string;
  };
  applePay: {
    enabled: boolean;
    merchantId?: string;
  };
  bankTransfer: {
    enabled: boolean;
    bankName?: string;
    accountNumber?: string;
    accountName?: string;
    instructions?: string;
  };
}

// Bank Transfer Request Types
export interface BankTransferRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  packageType: string;
  transferDate: string;
  referenceNumber: string;
  proofImageUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  processedAt?: string;
  processedBy?: string;
  notes?: string;
}

// Notification Types
export interface NotificationTemplate {
  id: string;
  title: string;
  body: string;
  type: 'general' | 'booking' | 'payment' | 'promotion';
  targetAudience: 'all' | 'customers' | 'drivers';
}

// Analytics Types
export interface DashboardStats {
  totalUsers: number;
  totalDrivers: number;
  totalBookings: number;
  activeBookings: number;
  totalRevenue: number;
  pendingTransfers: number;
  newUsersThisMonth: number;
  completedTripsToday: number;
}
