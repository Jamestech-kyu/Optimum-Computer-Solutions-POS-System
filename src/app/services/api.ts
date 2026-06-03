import { type CompletedSale, type DayBalance, type POSProduct } from '../components/pages/POSPageEnhanced';
import type { SupplierOrderInvoice } from '../types/supplierOrder';
import type { AppSettings } from './settings';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');
const ACCESS_TOKEN_KEY = 'pos-api-access-token';
const REFRESH_TOKEN_KEY = 'pos-api-refresh-token';

export interface AppBackendState {
  products: POSProduct[];
  completedSales: CompletedSale[];
  dayBalance: DayBalance;
  supplierInvoices: SupplierOrderInvoice[];
  users: BackendUser[];
}

interface PaginatedResponse<T> {
  results: T[];
}

interface BackendProduct {
  id: number;
  sku: string;
  name: string;
  category_name: string | null;
  base_unit_name?: string | null;
  price: string | number;
  wholesale_price: string | number | null;
  quantity: number;
  image_url?: string;
  image_data?: string;
}

interface BackendSaleItem {
  product_id: number;
  name: string;
  price: string | number;
  quantity: string | number;
  base_quantity?: string | number;
  line_total: string | number;
}

interface BackendSale {
  id: number;
  receipt_number: string;
  customer_name: string;
  grand_total: string | number;
  amount_paid: string | number;
  payment_method: string;
  created_at: string;
  items: BackendSaleItem[];
}

interface BackendSupplierInvoice {
  id: number;
  supplier_id?: number | null;
  supplier_name: string;
  contact: string;
  invoice_number: string;
  order_date: string;
  amount: string | number;
  status: SupplierOrderInvoice['status'];
  items: number;
  payment_method: string;
}

interface BackendAppSetting {
  id: number;
  key: string;
  value: Partial<AppSettings>;
  updated_by: string;
  created_at: string;
  updated_at: string;
}

export interface BackendNotification {
  id: number;
  channel: string;
  severity: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  action_url: string;
  is_read: boolean;
  created_at: string;
}

export interface BackendUser {
  id: number;
  username: string;
  email: string;
  role: string;
  access_tier: string;
  two_factor_enabled: boolean;
  is_active: boolean;
  last_login?: string | null;
}

interface LoginResponse {
  success: boolean;
  message?: string;
  user?: {
    username: string;
    role: string;
  };
  two_factor_required?: boolean;
  verification_code?: string;
  tokens?: Partial<{
    access: string;
    refresh: string;
  }>;
}

interface RegisterResponse {
  success: boolean;
  message?: string;
  user?: {
    username: string;
    role: string;
  };
}

interface MpesaStkPushResponse {
  success: boolean;
  demo_mode?: boolean;
  message?: string;
  transaction?: {
    id?: number;
    checkout_request_id?: string;
    status?: string;
  };
}

interface ProductMutationResponse {
  success: boolean;
  data: BackendProduct;
}

export interface LoginResult {
  success: boolean;
  twoFactorRequired: boolean;
  verificationCode?: string;
  userRole?: string;
}

export type RegistrationRole = 'cashier' | 'storekeeper' | 'manager';

export interface RegisterAccountInput {
  username: string;
  email: string;
  password: string;
  role: RegistrationRole;
}

export interface MpesaPaymentInput {
  phoneNumber: string;
  amount: number;
  customerName?: string;
  accountReference?: string;
}

export interface ProductExcelImportResult {
  success: boolean;
  created: number;
  updated: number;
  errors: Array<{
    row: number;
    message: string;
  }>;
}

export interface CreateProductInput {
  name: string;
  sku: string;
  category_name?: string;
  base_unit_name?: string;
  price: number;
  wholesale_price?: number;
  cost_price?: number;
  quantity?: number;
  minimum_stock?: number;
  image_data?: string;
}

const getAccessToken = () => window.localStorage.getItem(ACCESS_TOKEN_KEY) || import.meta.env.VITE_API_TOKEN || '';

const unwrapList = <T>(data: T[] | PaginatedResponse<T>): T[] => Array.isArray(data) ? data : data.results;

const toNumber = (value: string | number | null | undefined) => Number(value ?? 0);

const mapProductFromApi = (product: BackendProduct): POSProduct => ({
  id: String(product.id),
  name: product.name,
  sku: product.sku,
  category: product.category_name || 'Uncategorized',
  uom: product.base_unit_name || 'piece',
  prices: {
    retail: toNumber(product.price),
    wholesale: toNumber(product.wholesale_price || product.price),
    corporate: toNumber(product.wholesale_price || product.price),
    loyal: toNumber(product.price)
  },
  stock: toNumber(product.quantity),
  tax: 0,
  image: product.image_data || product.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=100&h=100&fit=crop'
});

const mapSaleFromApi = (sale: BackendSale): CompletedSale => ({
  id: sale.receipt_number || String(sale.id),
  customer: sale.customer_name || 'Walk-in Customer',
  amount: toNumber(sale.grand_total),
  cashAmount: sale.payment_method === 'cash' ? toNumber(sale.amount_paid) : 0,
  method: sale.payment_method,
  timestamp: new Date(sale.created_at),
  cashier: 'Cashier',
  items: (sale.items || []).map(item => ({
    productId: String(item.product_id),
    name: item.name,
    quantity: toNumber(item.quantity),
    stockUnits: toNumber(item.base_quantity || 1),
    price: toNumber(item.price),
    total: toNumber(item.line_total)
  }))
});

const mapSupplierInvoiceFromApi = (invoice: BackendSupplierInvoice): SupplierOrderInvoice => ({
  id: invoice.invoice_number || `SUP-INV-${invoice.id.toString().padStart(3, '0')}`,
  supplierId: invoice.supplier_id || invoice.id,
  supplierName: invoice.supplier_name,
  contact: invoice.contact,
  date: invoice.order_date,
  amount: toNumber(invoice.amount),
  status: invoice.status,
  items: invoice.items,
  paymentMethod: invoice.payment_method
});

const request = async <T>(path: string, options?: RequestInit & { skipAuth?: boolean }): Promise<T> => {
  const token = getAccessToken();
  const { skipAuth, ...requestOptions } = options || {};
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...requestOptions,
      headers: {
        'Content-Type': 'application/json',
        ...(token && !skipAuth ? { Authorization: `Bearer ${token}` } : {}),
        ...options?.headers
      }
    });
  } catch (error) {
    throw new Error('Cannot reach the backend API. Make sure the Django server is running on http://127.0.0.1:8000.');
  }

  if (!response.ok) {
    const text = await response.text();
    let message = text;

    try {
      const data = JSON.parse(text) as { message?: string; detail?: string };
      message = data.message || data.detail || text;
    } catch {
      message = text;
    }

    throw new Error(message || `API request failed: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
};

const storeTokens = (tokens?: LoginResponse['tokens']) => {
  if (!tokens?.access) {
    throw new Error('Login did not return an access token');
  }

  window.localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access);
  window.localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh || '');
};

export const login = async (username: string, password: string): Promise<LoginResult> => {
  const response = await request<LoginResponse>('/accounts/login/', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
    skipAuth: true
  });

  if (!response.success) {
    throw new Error(response.message || 'Login failed');
  }

  if (response.two_factor_required) {
    return {
      success: true,
      twoFactorRequired: true,
      verificationCode: response.verification_code,
      userRole: response.user?.role
    };
  }

  storeTokens(response.tokens);
  return { success: true, twoFactorRequired: false, userRole: response.user?.role };
};

export const verifyTwoFactor = async (username: string, code: string): Promise<LoginResult> => {
  const response = await request<LoginResponse>('/accounts/two-factor/verify/', {
    method: 'POST',
    body: JSON.stringify({ username, code }),
    skipAuth: true
  });

  if (!response.success) {
    throw new Error(response.message || 'Two-factor verification failed');
  }

  storeTokens(response.tokens);
  return { success: true, twoFactorRequired: false, userRole: response.user?.role };
};

export const registerAccount = async (account: RegisterAccountInput) => {
  const response = await request<RegisterResponse>('/accounts/register/', {
    method: 'POST',
    body: JSON.stringify(account),
    skipAuth: true
  });

  if (!response.success) {
    throw new Error(response.message || 'Account could not be created');
  }

  return response.user;
};

export const initiateMpesaPayment = async ({
  phoneNumber,
  amount,
  customerName = 'POS Customer',
  accountReference = 'POS-SALE'
}: MpesaPaymentInput) => {
  const response = await request<MpesaStkPushResponse>('/mpesa-transactions/stk-push/', {
    method: 'POST',
    body: JSON.stringify({
      phone_number: phoneNumber,
      amount,
      customer_name: customerName,
      account_reference: accountReference
    })
  });

  if (!response.success) {
    throw new Error(response.message || 'M-Pesa prompt could not be sent.');
  }

  return response;
};

const requestFile = async (path: string, options?: RequestInit): Promise<Blob> => {
  const token = getAccessToken();
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options?.headers
      }
    });
  } catch {
    throw new Error('Cannot reach the backend API. Make sure the Django server is running on http://127.0.0.1:8000.');
  }

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `API request failed: ${response.status} ${response.statusText}`);
  }

  return response.blob();
};

export const downloadProductImportTemplate = () => requestFile('/excel/template/products/');

export const importProductsFromExcel = async (file: File): Promise<ProductExcelImportResult> => {
  const token = getAccessToken();
  const formData = new FormData();
  formData.append('file', file);

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/excel/import/products/`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: formData
    });
  } catch {
    throw new Error('Cannot reach the backend API. Make sure the Django server is running on http://127.0.0.1:8000.');
  }

  const data = await response.json() as ProductExcelImportResult & { message?: string };

  if (!response.ok || !data.success) {
    throw new Error(data.message || data.errors?.map(error => `Row ${error.row}: ${error.message}`).join('; ') || 'Products could not be imported.');
  }

  return data;
};

export const logout = () => {
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
};

export const hasStoredSession = () => Boolean(getAccessToken());

export const loadBackendState = async (fallbackDayBalance: DayBalance): Promise<AppBackendState> => {
  const [products, completedSales, supplierInvoices, users] = await Promise.all([
    request<BackendProduct[] | PaginatedResponse<BackendProduct>>('/products/'),
    request<BackendSale[] | PaginatedResponse<BackendSale>>('/sales/'),
    request<BackendSupplierInvoice[] | PaginatedResponse<BackendSupplierInvoice>>('/supplier-orders/'),
    request<BackendUser[] | PaginatedResponse<BackendUser>>('/accounts/users/')
  ]);

  const mappedProducts = unwrapList(products).map(mapProductFromApi);

  return {
    products: mappedProducts,
    completedSales: unwrapList(completedSales).map(mapSaleFromApi),
    dayBalance: fallbackDayBalance,
    supplierInvoices: unwrapList(supplierInvoices).map(mapSupplierInvoiceFromApi),
    users: unwrapList(users)
  };
};

export const saveSale = async (sale: CompletedSale) => {
  const createdSale = await request<BackendSale>('/sales/', {
    method: 'POST',
    body: JSON.stringify({
      customer_name: sale.customer,
      amount: sale.amount,
      subtotal: sale.items.reduce((sum, item) => sum + item.total, 0),
      discount: 0,
      tax: 0,
      grand_total: sale.amount,
      amount_paid: sale.cashAmount || sale.amount,
      payment_method: sale.cashAmount > 0 && sale.cashAmount >= sale.amount ? 'cash' : 'mixed',
      payment_reference: sale.id,
      items: sale.items.map(item => ({
        product_id: Number(item.productId),
        quantity: item.quantity,
        price_type: 'retail'
      }))
    })
  });

  return mapSaleFromApi(createdSale);
};

export const updateProductStock = (productId: string, stock: number) => request<BackendProduct>(`/products/update/${productId}/`, {
  method: 'PUT',
  body: JSON.stringify({ quantity: stock })
});

export const createProduct = async (product: CreateProductInput) => {
  const response = await request<ProductMutationResponse>('/products/add/', {
    method: 'POST',
    body: JSON.stringify(product)
  });

  return mapProductFromApi(response.data);
};

export const saveDayBalance = async (dayBalance: DayBalance) => dayBalance;

export const saveSupplierInvoice = async (invoice: SupplierOrderInvoice) => {
  const createdInvoice = await request<BackendSupplierInvoice>('/supplier-orders/', {
    method: 'POST',
    body: JSON.stringify({
      supplier_name: invoice.supplierName,
      contact: invoice.contact,
      order_date: invoice.date,
      amount: invoice.amount,
      status: invoice.status === 'delivered' ? 'paid' : invoice.status,
      items: invoice.items,
      payment_method: invoice.paymentMethod
    })
  });

  return mapSupplierInvoiceFromApi(createdInvoice);
};

export const loadAppSettings = async () => {
  const response = await request<BackendAppSetting>('/settings/');
  return response.value;
};

export const saveBackendAppSettings = async (settings: AppSettings) => {
  const response = await request<{ success: boolean; data: BackendAppSetting }>('/settings/', {
    method: 'PUT',
    body: JSON.stringify({ value: settings })
  });

  return response.data.value;
};

export const loadNotifications = async (unreadOnly = true) => {
  const query = unreadOnly ? '?is_read=false&ordering=-created_at' : '?ordering=-created_at';
  const response = await request<BackendNotification[] | PaginatedResponse<BackendNotification>>(`/payment-notifications/${query}`);
  return unwrapList(response);
};

export const markNotificationRead = (notificationId: number) => request<{ success: boolean }>(`/payment-notifications/${notificationId}/mark-read/`, {
  method: 'POST',
  body: JSON.stringify({})
});

export const markAllNotificationsRead = () => request<{ success: boolean }>('/payment-notifications/mark-all-read/', {
  method: 'POST',
  body: JSON.stringify({})
});
