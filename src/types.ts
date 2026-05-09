export type LivestockStatus = "available" | "sold" | "booking" | "dead";
export type PaymentStatus = "dp" | "lunas";
export type ExpenseCategory = "kandang" | "pakan" | "obat" | "upah" | "lainnya";
export type LivestockType = "Morino" | "Texel" | "Jawa" | "Lainnya";

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Livestock {
  id: string;
  name: string | null;
  type: LivestockType;
  weight_kg: number | null;
  purchase_price: number;
  purchase_date: string;
  vendor: string | null;
  status: LivestockStatus;
  image_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Sale {
  id: string;
  livestock_id: string;
  livestock_name: string | null;
  livestock_type: string;
  buyer_name: string;
  selling_price: number;
  amount_paid: number;
  payment_status: PaymentStatus;
  sale_date: string;
  delivery_date: string | null;
  notes: string | null;
  created_at: string;
}

export interface Expense {
  id: string;
  category: ExpenseCategory;
  description: string;
  cost: number;
  expense_date: string;
  created_at: string;
}

export interface DashboardStats {
  totalModalKeluar: number;
  totalPenjualan: number;
  profitLoss: number;
  jumlahHewanTersedia: number;
  totalBiayaOperasional: number;
}

export interface ApiResponse<T> {
  data: T;
}

export interface ApiError {
  error: string;
  code?: string;
}
