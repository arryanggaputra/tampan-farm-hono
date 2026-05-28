export type LivestockStatus = "available" | "sold" | "booking" | "dead";
export type PaymentStatus = "dp" | "lunas";
export type ExpenseCategory = "kandang" | "pakan" | "obat" | "upah" | "lainnya";
export type LivestockType = "Morino" | "Texel" | "Jawa" | "Lainnya";
export type SourceOfFunds = "INVESTOR_CASH" | "ROLLING_PROFIT";

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
  selling_price: number | null;
  purchase_date: string;
  vendor: string | null;
  status: LivestockStatus;
  image_url: string | null;
  notes: string | null;
  source_of_funds: SourceOfFunds;
  reinvested_from_sale_id: string | null;
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
  share_investor_amount: number;
  share_operator_amount: number;
  expense_date: string;
  image_url: string | null;
  created_at: string;
}

export interface BagiHasilMember {
  id: string;
  name: string;
  percentage: number;
  sort_order: number;
  created_at: string;
}

export interface BagiHasilMemberWithShare extends BagiHasilMember {
  share_amount: number;
}

export interface DashboardStats {
  revenue: number;
  cogs: number;
  gross_profit: number;
  expense_investor: number;
  expense_operator: number;
  total_expenses: number;
  net_profit_total: number;
  members: BagiHasilMemberWithShare[];
  jumlahHewanTersedia: number;
  jumlahTerjual: number;
  totalInvestorCapital: number;
}

export interface ApiResponse<T> {
  data: T;
}

export interface ApiError {
  error: string;
  code?: string;
}
