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

export interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
  is_active: boolean;
  created_at: string;
}

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
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  medicine_id: string;
  medicine_name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Order {
  id: string;
  user_id: string;
  user_name?: string;
  user_email?: string;
  user_phone?: string;
  items: OrderItem[];
  total_amount: number;
  discount_amount: number;
  delivery_charge: number;
  final_amount: number;
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
  payment_method?: string;
  payment_status?: string;
  delivery_address?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Prescription {
  id: string;
  user_id: string;
  user_name?: string;
  image_url: string;
  ocr_text?: string;
  status: "pending" | "approved" | "rejected";
  admin_notes?: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id?: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

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
  is_read: boolean;
  created_at: string;
}

export interface Payment {
  id: string;
  order_id: string;
  user_id: string;
  amount: number;
  payment_method: "khalti" | "esewa" | "cod";
  status: "pending" | "completed" | "failed" | "refunded";
  transaction_id?: string;
  created_at: string;
}

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

export interface MedicineBatch {
  id: string;
  medicine_id: string;
  medicine_name?: string;
  batch_number: string;
  quantity: number;
  manufacturing_date: string;
  expiry_date: string;
  purchase_price: number;
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

export interface DashboardStats {
  total_users: number;
  total_orders: number;
  total_revenue: number;
  total_medicines: number;
  pending_orders: number;
  pending_prescriptions: number;
  low_stock_count: number;
  today_orders: number;
  today_revenue: number;
  recent_orders: Order[];
  monthly_revenue: { month: string; revenue: number }[];
  order_status_distribution: { status: string; count: number }[];
  top_medicines: { name: string; sold: number }[];
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}
