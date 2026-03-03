import { create } from 'zustand';
import { Company, Customer, Product, Invoice, Payment, ActivityLog } from '../types';
import { v4 as uuidv4 } from 'uuid';

const API_URL = window.location.origin.includes('localhost')
  ? 'http://localhost:5000/api'
  : '/api'; // Default API path
interface AppState {
  company: Company;
  customers: Customer[];
  inventory: Product[];
  invoices: Invoice[];
  activities: ActivityLog[];
  lastInvoiceCounter: number;
  isAuthenticated: boolean;
  
  // Actions
  initialize: () => Promise<void>;
  login: (password: string) => boolean;
  logout: () => void;
  setCompany: (company: Company) => Promise<void>;
  addCustomer: (customer: Customer) => Promise<void>;
  updateCustomer: (id: string, customer: Customer) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (id: string, product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addInvoice: (invoice: Invoice) => Promise<void>;
  updateInvoice: (id: string, invoice: Invoice) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
  addPayment: (invoiceId: string, payment: Payment) => Promise<void>;
  adjustCustomerBalance: (customerId: string, amount: number) => Promise<void>;
  clearHistory: () => void;
}

const defaultCompany: Company = {
  name: 'Liking Plus',
  address: '4th Floor (Lift-4), 166 (Alokar More), New Market Road,\nRajshahi, Bangladesh',
  phone: '01797770919',
  email: 'likingplusofficial@gmail.com',
  website: 'www.likingplus.com',
  taxId: '',
};

const createLog = (action: ActivityLog['action'], type: ActivityLog['entityType'], name: string, details: string): ActivityLog => ({
  id: uuidv4(),
  action,
  entityType: type,
  entityName: name,
  timestamp: new Date().toISOString(),
  details
});

export const useStore = create<AppState>((set, get) => ({
  company: defaultCompany,
  customers: [],
  inventory: [],
  invoices: [],
  activities: [],
  lastInvoiceCounter: 0,
  isAuthenticated: false,

  initialize: async () => {
    try {
      const [comp, cust, inv, invoices, acts] = await Promise.all([
        fetch(`${API_URL}/company`).then(r => r.json()),
        fetch(`${API_URL}/customers`).then(r => r.json()),
        fetch(`${API_URL}/inventory`).then(r => r.json()),
        fetch(`${API_URL}/invoices`).then(r => r.json()),
        fetch(`${API_URL}/activities`).then(r => r.json()),
      ]);

      set({ 
        company: Object.keys(comp).length ? comp : defaultCompany,
        customers: cust || [],
        inventory: inv || [],
        invoices: invoices || [],
        activities: acts || [],
        lastInvoiceCounter: invoices?.length || 0
      });
    } catch (err) {
      console.error('Failed to initialize store:', err);
    }
  },

  login: (password: string) => {
    if (password === 'admin123') { 
      set({ isAuthenticated: true });
      return true;
    }
    return false;
  },

  logout: () => set({ isAuthenticated: false }),

  setCompany: async (company) => {
    await fetch(`${API_URL}/company`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(company)
    });
    set({ company });
  },
  
  addCustomer: async (customer) => {
    const newCustomer = { ...customer, balance: customer.balance || 0 };
    await fetch(`${API_URL}/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCustomer)
    });
    
    const log = createLog('Created', 'Customer', customer.name, 'New customer added');
    await fetch(`${API_URL}/activities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(log)
    });

    set((state) => ({ 
      customers: [...state.customers, newCustomer],
      activities: [log, ...state.activities]
    }));
  },
  
  updateCustomer: async (id, customer) => {
    await fetch(`${API_URL}/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customer)
    });
    
    const log = createLog('Updated', 'Customer', customer.name, 'Customer info updated');
    await fetch(`${API_URL}/activities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(log)
    });

    set((state) => ({
      customers: state.customers.map((c) => (c.id === id ? customer : c)),
      activities: [log, ...state.activities]
    }));
  },
  
  deleteCustomer: async (id) => {
    const customer = get().customers.find(c => c.id === id);
    await fetch(`${API_URL}/customers/${id}`, { method: 'DELETE' });
    
    const log = createLog('Deleted', 'Customer', customer?.name || 'Unknown', 'Customer removed');
    await fetch(`${API_URL}/activities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(log)
    });

    set((state) => ({
      customers: state.customers.filter((c) => c.id !== id),
      activities: [log, ...state.activities]
    }));
  },
  
  addProduct: async (product) => {
    await fetch(`${API_URL}/inventory`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    });
    
    const log = createLog('Created', 'Product', product.name, `Added at ৳${product.price}`);
    await fetch(`${API_URL}/activities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(log)
    });

    set((state) => ({ 
      inventory: [...state.inventory, product],
      activities: [log, ...state.activities]
    }));
  },
  
  updateProduct: async (id, product) => {
    await fetch(`${API_URL}/inventory`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    });
    
    const log = createLog('Updated', 'Product', product.name, 'Product updated');
    await fetch(`${API_URL}/activities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(log)
    });

    set((state) => ({
      inventory: state.inventory.map((p) => (p.id === id ? product : p)),
      activities: [log, ...state.activities]
    }));
  },
  
  deleteProduct: async (id) => {
    const product = get().inventory.find(p => p.id === id);
    await fetch(`${API_URL}/inventory/${id}`, { method: 'DELETE' });
    
    const log = createLog('Deleted', 'Product', product?.name || 'Unknown', 'Product removed');
    await fetch(`${API_URL}/activities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(log)
    });

    set((state) => ({
      inventory: state.inventory.filter((p) => p.id !== id),
      activities: [log, ...state.activities]
    }));
  },
  
  addInvoice: async (invoice) => {
    const customer = get().customers.find(c => c.id === invoice.customerId);
    let amountPaid = 0;
    let newCustomerBalance = customer?.balance || 0;
    let payments: Payment[] = [];

    if (newCustomerBalance > 0) {
      const adjustment = Math.min(newCustomerBalance, invoice.total);
      amountPaid = adjustment;
      newCustomerBalance -= adjustment;
      payments.push({
        id: 'adj-' + Date.now(),
        date: new Date().toISOString().split('T')[0],
        amount: adjustment,
        method: 'Balance Adjustment',
        note: 'Paid from credit'
      });
    }

    let finalStatus = invoice.status;
    if (amountPaid >= invoice.total) {
      finalStatus = 'Paid';
    } else if (amountPaid > 0) {
      finalStatus = 'Partially Paid';
    } else if (finalStatus === 'Draft' && amountPaid === 0) {
      // Keep as Draft if no payment
      finalStatus = 'Draft';
    }

    const finalInvoice = { ...invoice, amountPaid, payments, status: finalStatus };
    
    await fetch(`${API_URL}/invoices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(finalInvoice)
    });

    // Update customer balance in DB
    if (customer) {
      await fetch(`${API_URL}/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...customer, balance: newCustomerBalance })
      });
    }

    const log = createLog('Created', 'Invoice', invoice.invoiceNumber, `Invoice for ${customer?.name}`);
    await fetch(`${API_URL}/activities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(log)
    });

    set((state) => ({
      invoices: [...state.invoices, finalInvoice],
      lastInvoiceCounter: state.lastInvoiceCounter + 1,
      customers: state.customers.map(c => c.id === invoice.customerId ? { ...c, balance: newCustomerBalance } : c),
      activities: [log, ...state.activities]
    }));
  },
  
  updateInvoice: async (id, updatedInvoice) => {
    await fetch(`${API_URL}/invoices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedInvoice)
    });
    
    const log = createLog('Updated', 'Invoice', updatedInvoice.invoiceNumber, 'Invoice modified');
    await fetch(`${API_URL}/activities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(log)
    });

    set((state) => ({
      invoices: state.invoices.map((i) => (i.id === id ? updatedInvoice : i)),
      activities: [log, ...state.activities]
    }));
  },
  
  deleteInvoice: async (id) => {
    const inv = get().invoices.find(i => i.id === id);
    if (!inv) return;
    
    await fetch(`${API_URL}/invoices/${id}`, { method: 'DELETE' });
    
    const log = createLog('Deleted', 'Invoice', inv.invoiceNumber, `Invoice deleted.`);
    await fetch(`${API_URL}/activities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(log)
    });

    set((state) => ({
      invoices: state.invoices.filter((i) => i.id !== id),
      activities: [log, ...state.activities]
    }));
  },
  
  addPayment: async (invoiceId, payment) => {
    const invoice = get().invoices.find(i => i.id === invoiceId);
    if (!invoice) return;

    await fetch(`${API_URL}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payment, invoiceId })
    });

    const newAmountPaid = (invoice.amountPaid || 0) + payment.amount;
    
    // Automatically determine status
    let newStatus: Invoice['status'] = invoice.status;
    if (newAmountPaid >= invoice.total) {
      newStatus = 'Paid';
    } else if (newAmountPaid > 0) {
      newStatus = 'Partially Paid';
    }

    const updatedInvoice = {
      ...invoice,
      amountPaid: newAmountPaid,
      status: newStatus,
      payments: [...(invoice.payments || []), payment]
    };

    await fetch(`${API_URL}/invoices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedInvoice)
    });

    const log = createLog('Payment', 'Invoice', invoice.invoiceNumber, `Payment ৳${payment.amount}`);
    await fetch(`${API_URL}/activities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(log)
    });

    set((state) => ({
      invoices: state.invoices.map((inv) => inv.id === invoiceId ? updatedInvoice : inv),
      activities: [log, ...state.activities]
    }));
  },
  
  adjustCustomerBalance: async (customerId, amount) => {
    const customer = get().customers.find(c => c.id === customerId);
    if (!customer) return;

    const newBalance = (customer.balance || 0) + amount;
    await fetch(`${API_URL}/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...customer, balance: newBalance })
    });

    const log = createLog('Updated', 'Customer', customer.name, `Manual balance adjustment ৳${amount}`);
    await fetch(`${API_URL}/activities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(log)
    });

    set((state) => ({
      customers: state.customers.map(c => c.id === customerId ? { ...c, balance: newBalance } : c),
      activities: [log, ...state.activities]
    }));
  },

  clearHistory: () => set({ activities: [] }),
}));
