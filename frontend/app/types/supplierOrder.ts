export type SupplierOrderStatus = 'requested' | 'pending' | 'delivered';

export interface SupplierOrderItem {
  productId: string;
  productName: string;
  requestedQuantity: number;
  deliveredQuantity: number;
  pendingQuantity: number;
  receivedQuantity?: number;
  rejectedQuantity?: number;
  rejectionReason?: string;
  unitCost: number;
}

export interface SupplierOrderInvoice {
  id: string;
  supplierId: number;
  supplierName: string;
  contact: string;
  date: string;
  amount: number;
  status: SupplierOrderStatus;
  items: number;
  orderItems?: SupplierOrderItem[];
  paymentMethod: string;
  paymentStatus?: 'unpaid' | 'partial' | 'paid' | string;
  paidAmount?: number;
  paidAt?: string;
  supplierPaymentMethod?: string;
  paymentReference?: string;
  paymentNotes?: string;
  deliveryNote?: string;
  goodsReceivingNote?: string;
  receivingLocation?: string;
  receivingNotes?: string;
  backendId?: number;
  backendStatus?: string;
  productId?: string;
  productName?: string;
  quantityDelivered?: number;
  quantityRequested?: number;
  quantityPending?: number;
}

export interface ReorderRequest {
  signal: number;
  productId: string;
  supplierId?: number;
  supplierName?: string;
  suggestedQuantity?: number;
  suggestedAmount?: number;
}

export interface BusinessExpense {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  paymentMethod: string;
  receipt: boolean;
  sourceInvoiceId?: string;
}

export interface StockMovement {
  id: string;
  item: string;
  type: 'in' | 'out';
  quantity: number;
  date: string;
  reason: string;
  sourceInvoiceId?: string;
}
