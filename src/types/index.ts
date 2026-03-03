export interface Company {
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  taxId: string;
  logoUrl?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  balance: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
}

export interface InvoiceItem {
  id: string;
  productId: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Payment {
  id: string;
  date: string;
  amount: number;
  method: string;
  note?: string;
}

export interface ActivityLog {
  id: string;
  action: 'Created' | 'Updated' | 'Deleted' | 'Payment';
  entityType: 'Invoice' | 'Customer' | 'Product';
  entityName: string;
  timestamp: string;
  details: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  date: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  total: number;
  amountPaid: number;
  status: 'Draft' | 'Sent' | 'Partially Paid' | 'Paid';
  notes: string;
  payments: Payment[];
}
