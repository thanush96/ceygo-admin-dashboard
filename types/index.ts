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
export interface Driver {
  id: string;
  email: string;
  name?: string;
  driverName?: string;
  phone: string;
  role?: 'driver';
  isActive?: boolean;
  profileImageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  bio?: string;
  experienceYears?: number;
  licenseNumber?: string;
  isAvailable?: boolean;
  isVerified?: boolean;
  languages?: string[];
  specialties?: string[];
  pricingPackages?: Array<{
    id: string;
    name: string;
    type: string;
    price: number;
    description?: string;
    unit?: string;
    includedKm?: number;
    includedHours?: number;
    extraKmPrice?: number;
    extraHourPrice?: number;
    isActive?: boolean;
  }>;
  vehicleId?: string | null;
  vehicleInfo?: {
    make: string;
    model: string;
    year: string | number;
    plateNumber: string;
    color: string;
    type?: string;
    seats?: number;
    hasAC?: boolean;
    features?: string[];
  };
  documents?: {
    licenseUrl?: string;
    insuranceUrl?: string;
    vehicleRegistrationUrl?: string;
    nicUrl?: string;
    nicFrontUrl?: string;
    nicBackUrl?: string;
    isVerified?: boolean;
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

// Subscription Plan Types
export interface SubscriptionPlan {
  id: string;
  name: string;
  type: 'weekly' | 'biweekly' | 'monthly';
  durationDays: number;
  price: number;
  description: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Subscription History Types
export interface Subscription {
  id: string;
  driverId: string;
  passType: string;
  startDate: string;
  expiryDate: string;
  amount: number;
  paymentMethod: string;
  transactionId: string;
  status: 'active' | 'expired' | 'cancelled';
  createdAt: string;
  grantedByAdmin?: boolean;
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
    branch?: string;
    swiftCode?: string;
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
