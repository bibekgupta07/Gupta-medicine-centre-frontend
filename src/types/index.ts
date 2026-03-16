// ============================================================
// AUTH
// ============================================================

export interface User {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  role: "customer" | "admin" | "pharmacist" | "delivery" | "finance";
  is_active: boolean;
  street?: string;
  city?: string;
  state?: string;
  pincode?: string;
  landmark?: string;
  profile_image?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// ============================================================
// CATEGORY
// ============================================================

export interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface CategoryCreate {
  name: string;
  description?: string;
  image?: string;
  is_active?: boolean;
  sort_order?: number;
}

export interface CategoryUpdate {
  name?: string;
  description?: string;
  image?: string;
  is_active?: boolean;
  sort_order?: number;
}

// ============================================================
// MEDICINE
// ============================================================

export interface Medicine {
  id: string;
  name: string;
  generic_name?: string;
  manufacturer: string;
  category_id: string;
  category_name?: string;
  description?: string;
  price: number;
  discount_percentage: number;
  stock_quantity: number;
  requires_prescription: boolean;
  dosage_form?: string;
  strength?: string;
  pack_size?: string;
  side_effects?: string;
  image?: string;
  is_active: boolean;
  is_featured?: boolean;
  created_at: string;
  updated_at: string;
}

export interface MedicineCreate {
  name: string;
  generic_name?: string;
  manufacturer: string;
  category_id: string;
  description?: string;
  price: number;
  discount_percentage?: number;
  stock_quantity: number;
  requires_prescription?: boolean;
  dosage_form?: string;
  strength?: string;
  pack_size?: string;
  side_effects?: string;
}

// ============================================================
// ORDER
// ============================================================

export interface OrderItem {
  medicine_id: string;
  medicine_name: string;
  quantity: number;
  price: number;
  discount_percentage: number;
  image?: string;
  subtotal: number;
}

export type OrderStatus = "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  user_name?: string;
  user_email?: string;
  user_phone?: string;
  items: OrderItem[];
  total_amount: number;
  status: OrderStatus;
  payment_method: string;
  payment_status: string;
  delivery_street?: string;
  delivery_city?: string;
  delivery_state?: string;
  delivery_pincode?: string;
  delivery_landmark?: string;
  delivery_phone?: string;
  prescription_id?: string;
  admin_notes?: string;
  cancellation_reason?: string;
  created_at: string;
  updated_at: string;
  confirmed_at?: string;
  shipped_at?: string;
  delivered_at?: string;
  cancelled_at?: string;
}

// ============================================================
// PRESCRIPTION
// ============================================================

export type PrescriptionStatus = "pending" | "approved" | "rejected";

export interface Prescription {
  id: string;
  user_id: string;
  user_name?: string;
  image_url: string;
  ocr_text?: string;
  status: PrescriptionStatus;
  admin_notes?: string;
  reviewed_by?: string;
  created_at: string;
}

// ============================================================
// NOTIFICATION
// ============================================================

export interface Notification {
  id: string;
  user_id?: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export interface NotificationCreate {
  user_id?: string;
  title: string;
  message: string;
  type?: string;
}

// ============================================================
// CHAT
// ============================================================

export interface ChatRoom {
  id: string;
  customer_id: string;
  customer_name: string;
  admin_id?: string;
  last_message?: string;
  last_message_at?: string;
  is_active: boolean;
  unread_count: number;
  created_at: string;
}

export interface Message {
  id: string;
  room_id: string;
  sender_id: string;
  sender_name: string;
  sender_role: string;
  content?: string;
  message_type: "text" | "image" | "file" | "prescription";
  file_url?: string;
  reply_to_id?: string;
  is_read: boolean;
  is_deleted?: boolean;
  created_at: string;
}

// ============================================================
// PAYMENT
// ============================================================

export type PaymentMethod = "khalti" | "esewa" | "cod";
export type PaymentStatus = "pending" | "completed" | "failed" | "refunded";

export interface Payment {
  id: string;
  order_id: string;
  user_id: string;
  amount: number;
  payment_method: PaymentMethod;
  status: PaymentStatus;
  transaction_id?: string;
  created_at: string;
}

// ============================================================
// COUPON
// ============================================================

export interface Coupon {
  id: string;
  code: string;
  description?: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_order_amount: number;
  max_discount?: number;
  usage_limit: number;
  used_count: number;
  per_user_limit: number;
  is_active: boolean;
  valid_from: string;
  valid_until: string;
  created_at: string;
}

export interface CouponCreate {
  code: string;
  description?: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_order_amount?: number;
  max_discount?: number;
  usage_limit?: number;
  per_user_limit?: number;
  valid_from: string;
  valid_until: string;
}

// ============================================================
// DELIVERY
// ============================================================

export interface DeliveryAgent {
  id: string;
  name: string;
  phone: string;
  email?: string;
  vehicle_type: string;
  vehicle_number?: string;
  is_available: boolean;
  is_active: boolean;
  current_lat?: number;
  current_lng?: number;
  total_deliveries: number;
  rating: number;
  created_at: string;
}

export interface DeliveryZone {
  id: string;
  name: string;
  base_charge: number;
  per_km_charge: number;
  min_order_free_delivery: number;
  estimated_time_minutes: number;
  is_active: boolean;
}

// ============================================================
// INVENTORY
// ============================================================

export interface MedicineBatch {
  id: string;
  medicine_id: string;
  medicine_name?: string;
  batch_number: string;
  quantity: number;
  manufacturing_date: string;
  expiry_date: string;
  purchase_price: number;
  supplier_id?: string;
  barcode?: string;
  created_at: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact_person: string;
  phone: string;
  email?: string;
  address?: string;
  is_active: boolean;
  created_at: string;
}

export interface PurchaseOrder {
  id: string;
  supplier_id: string;
  supplier_name?: string;
  items: { medicine_id: string; medicine_name?: string; quantity: number; unit_price: number }[];
  total_amount: number;
  status: "draft" | "ordered" | "received" | "cancelled";
  notes?: string;
  created_at: string;
  updated_at: string;
}

// ============================================================
// ANALYTICS
// ============================================================

export interface RevenueSummary {
  total_revenue: number;
  total_orders: number;
  average_order_value: number;
  top_selling_medicines: { name: string; sold: number; revenue?: number }[];
  payment_method_breakdown: Record<string, number>;
  daily_revenue: { date: string; revenue: number; orders?: number }[];
}

export interface DailySalesReport {
  id: string;
  date: string;
  total_orders: number;
  total_revenue: number;
  total_items_sold: number;
  new_users: number;
  average_order_value: number;
  top_medicines: { name: string; sold: number }[];
  payment_breakdown: Record<string, number>;
}

export interface DrugInteraction {
  id: string;
  medicine_a_name: string;
  medicine_b_name: string;
  severity: "mild" | "moderate" | "severe" | "contraindicated";
  description: string;
  recommendation: string;
  source?: string;
}

export interface GenericSubstitute {
  id: string;
  branded_medicine_id: string;
  branded_name: string;
  generic_medicine_id: string;
  generic_name: string;
  branded_price: number;
  generic_price: number;
  savings_percentage: number;
  is_verified: boolean;
  verified_by?: string;
  notes?: string;
  created_at: string;
}

// ============================================================
// DASHBOARD
// ============================================================

export interface DashboardData {
  stats: {
    total_users: number;
    total_medicines: number;
    total_orders: number;
    total_revenue: number;
    pending_orders: number;
    pending_prescriptions: number;
    low_stock_medicines: number;
    active_categories: number;
  };
  order_breakdown: {
    pending: number;
    confirmed: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
  recent_activities: { type: string; message: string; timestamp: string }[];
}

// ============================================================
// GENERIC PAGINATION
// ============================================================

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}
