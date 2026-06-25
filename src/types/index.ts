/** Global type definitions for Aditya Textile app */

export type UserRole = "owner" | "customer";
export type ReservationStatus = "pending" | "confirmed" | "ready" | "completed" | "cancelled" | "expired";
export type NotificationChannel = "push" | "whatsapp" | "email";
export type NotificationType = "reservation_confirmed" | "reservation_ready" | "reservation_expired" | "price_drop" | "restock" | "new_arrival" | "festive_launch" | "loyalty_reward";
export type Gender = "male" | "female" | "kids_boy" | "kids_girl";
export type AgeGroup = "adult" | "teen" | "child" | "toddler";
export type Festival = "diwali" | "eid" | "wedding_season" | "pongal" | "onam" | "christmas" | "navratri" | "holi" | "raksha_bandhan" | "karwa_chauth" | "general";
export type Language = "en" | "hi";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  colors?: string[];
  fabrics?: string[];
  occasions?: string[];
  sizes?: string[];
  inStockOnly?: boolean;
  isNewArrival?: boolean;
  isTrending?: boolean;
  search?: string;
  sortBy?: "price_asc" | "price_desc" | "newest" | "popular";
}
