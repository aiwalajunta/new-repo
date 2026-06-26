export type UserRole = "owner" | "staff" | "customer";
export type Language = "en" | "hi";
export type AppointmentStatus = "pending" | "confirmed" | "preparing" | "ready" | "arrived" | "trial" | "purchased" | "closed" | "cancelled";
export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

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
