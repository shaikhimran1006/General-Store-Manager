
export interface StoreItem {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  imageUrl: string;
  sku: string;
  category: string;
  costPrice: number;
  reorderLevel: number;
  lowStockThreshold: number;
  supplier?: string;
  barcode?: string;
  brand?: string;
  unit: string; // e.g., 'piece', 'kg', 'liter', 'packet'
  location?: string; // Store location/aisle
  createdAt: Date;
  updatedAt: Date;
}

// Keep for backward compatibility
export interface InventoryItem extends StoreItem { }

export const formatToRupees = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(amount);
};

export interface CustomerTransaction {
  id: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  customerAddress?: string;
  paymentMethod: 'cash' | 'online' | 'card' | 'upi';
  timestamp: Date;
  total: number;
  items: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    unit: string;
    total: number;
    category: string;
  }[];
  subtotal: number;
  discount: number;
  discountAmount: number;
  vatRate: number;
  vatAmount: number;
  cashierName?: string;
  cashierId?: string;
  notes?: string;
  receiptNumber: string;
}

// Keep for backward compatibility
export interface Transaction extends CustomerTransaction { }

export interface StoreCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  parentCategory?: string;
  isActive: boolean;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  gstin?: string;
  bankDetails?: {
    accountNumber: string;
    ifsc: string;
    bankName: string;
  };
  paymentTerms?: string;
  creditLimit?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface StockAlert {
  id: string;
  itemId: string;
  itemName: string;
  currentStock: number;
  reorderLevel: number;
  alertType: 'low_stock' | 'out_of_stock' | 'expired' | 'near_expiry';
  message: string;
  isRead: boolean;
  createdAt: Date;
}

export const STORE_CATEGORIES = [
  'Groceries',
  'Snacks & Beverages',
  'Personal Care',
  'Household Items',
  'Stationery',
  'Electronics',
  'Dairy Products',
  'Fruits & Vegetables',
  'Medicines',
  'Toys & Games',
  'Clothing',
  'Hardware',
  'Other'
];

export const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'online', label: 'Online Payment' },
  { value: 'card', label: 'Card Payment' },
  { value: 'upi', label: 'UPI Payment' }
];

export const UNITS = [
  'piece',
  'kg',
  'gram',
  'liter',
  'ml',
  'packet',
  'box',
  'bottle',
  'can',
  'pouch',
  'meter',
  'dozen'
];
