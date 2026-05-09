import type {
  User,
  Livestock,
  Sale,
  Expense,
  DashboardStats,
  ApiResponse,
  LivestockStatus,
  PaymentStatus,
  ExpenseCategory,
  LivestockType,
} from "../../src/types";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const err = await res
      .json<{ error: string }>()
      .catch(() => ({ error: "Request failed" }));
    throw new Error(err.error ?? `HTTP ${res.status}`);
  }

  return res.json<T>();
}

// Auth
export const authApi = {
  login: (email: string, password: string) =>
    request<ApiResponse<User>>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  logout: () =>
    request<ApiResponse<{ ok: boolean }>>("/api/auth/logout", {
      method: "POST",
    }),
  me: () => request<ApiResponse<User>>("/api/auth/me"),
};

// Dashboard
export const dashboardApi = {
  get: () => request<ApiResponse<DashboardStats>>("/api/dashboard"),
};

// Livestock
export const livestockApi = {
  list: (status?: LivestockStatus) =>
    request<ApiResponse<Livestock[]>>(
      `/api/livestock${status ? `?status=${status}` : ""}`
    ),

  get: (id: string) => request<ApiResponse<Livestock>>(`/api/livestock/${id}`),

  create: (form: FormData) =>
    fetch("/api/livestock", {
      method: "POST",
      credentials: "include",
      body: form,
    }).then(async (r) => {
      if (!r.ok) throw new Error((await r.json<{ error: string }>()).error);
      return r.json<ApiResponse<Livestock>>();
    }),

  update: (id: string, data: Partial<Livestock>) =>
    request<ApiResponse<Livestock>>(`/api/livestock/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  updateStatus: (id: string, status: LivestockStatus) =>
    request<ApiResponse<Livestock>>(`/api/livestock/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  uploadPhoto: (id: string, form: FormData) =>
    fetch(`/api/livestock/${id}/photo`, {
      method: "POST",
      credentials: "include",
      body: form,
    }).then(async (r) => {
      if (!r.ok) throw new Error((await r.json<{ error: string }>()).error);
      return r.json<ApiResponse<{ image_url: string }>>();
    }),

  delete: (id: string) =>
    request<ApiResponse<{ ok: boolean }>>(`/api/livestock/${id}`, {
      method: "DELETE",
    }),
};

// Sales
export const salesApi = {
  list: () => request<ApiResponse<Sale[]>>("/api/sales"),
  get: (id: string) => request<ApiResponse<Sale>>(`/api/sales/${id}`),
  create: (data: {
    livestock_id: string;
    buyer_name: string;
    selling_price: number;
    amount_paid: number;
    payment_status: PaymentStatus;
    sale_date: string;
    delivery_date?: string;
    notes?: string;
  }) =>
    request<ApiResponse<Sale>>("/api/sales", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<Sale>) =>
    request<ApiResponse<Sale>>(`/api/sales/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    request<ApiResponse<{ ok: boolean }>>(`/api/sales/${id}`, {
      method: "DELETE",
    }),
};

// Expenses
export const expensesApi = {
  list: () => request<ApiResponse<Expense[]>>("/api/expenses"),

  create: (form: FormData) =>
    fetch("/api/expenses", {
      method: "POST",
      credentials: "include",
      body: form,
    }).then(async (r) => {
      if (!r.ok) throw new Error((await r.json<{ error: string }>()).error);
      return r.json<ApiResponse<Expense>>();
    }),

  update: (id: string, data: Partial<Expense>) =>
    request<ApiResponse<Expense>>(`/api/expenses/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  uploadPhoto: (id: string, form: FormData) =>
    fetch(`/api/expenses/${id}/photo`, {
      method: "POST",
      credentials: "include",
      body: form,
    }).then(async (r) => {
      if (!r.ok) throw new Error((await r.json<{ error: string }>()).error);
      return r.json<ApiResponse<{ image_url: string }>>();
    }),

  delete: (id: string) =>
    request<ApiResponse<{ ok: boolean }>>(`/api/expenses/${id}`, {
      method: "DELETE",
    }),
};
