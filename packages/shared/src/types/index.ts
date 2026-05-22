// ============================================================
// USER SERVICE TYPES
// ============================================================
export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  role: 'customer' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface UserAddress {
  id: string;
  user_id: string;
  label: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  district: string;
  postal_code: string | null;
  is_default: boolean;
  created_at: string;
}

// ============================================================
// PRODUCT SERVICE TYPES
// ============================================================
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: 'active' | 'inactive';
  created_at: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  base_price: number;
  brand_id: string | null;
  status: 'active' | 'inactive' | 'draft';
  created_at: string;
  updated_at: string;
  brand?: Brand;
  categories?: Category[];
  variants?: ProductVariant[];
  images?: ProductImage[];
}

export interface ProductVariant {
  id: string;
  product_id: string;
  size: string;
  color: string;
  stock_qty: number;
  price_adj: number;
  sku: string | null;
  created_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_path: string;
  is_main: boolean;
  sort_order: number;
  created_at: string;
}

// ============================================================
// ORDER SERVICE TYPES
// ============================================================
export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface Order {
  id: string;
  customer_id: string;
  status: OrderStatus;
  total_amount: number;
  shipping_name: string;
  shipping_phone: string;
  shipping_addr: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
  payment?: Payment;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id: string | null;
  product_name: string;
  variant_desc: string | null;
  quantity: number;
  unit_price: number;
  subtotal: number;
  created_at: string;
}

// ============================================================
// PAYMENT SERVICE TYPES
// ============================================================
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface Payment {
  id: string;
  order_id: string;
  stripe_payment_id: string | null;
  stripe_session_id: string | null;
  amount: number;
  currency: string;
  payment_method: string | null;
  payment_status: PaymentStatus;
  payment_date: string | null;
  created_at: string;
}

// ============================================================
// CART (CLIENT-SIDE ONLY — localStorage/state)
// ============================================================
export interface CartItem {
  product_id: string;
  variant_id: string;
  product_name: string;
  variant_desc: string;
  image_path: string;
  unit_price: number;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
}

// ============================================================
// API RESPONSES
// ============================================================
export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  limit: number;
}
