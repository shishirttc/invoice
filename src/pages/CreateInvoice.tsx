import React, { useState, useMemo, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Invoice, InvoiceItem } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Trash2, ArrowLeft, Save } from 'lucide-react';

export const CreateInvoice: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { customers, inventory, addInvoice, updateInvoice, invoices, lastInvoiceCounter } = useStore();
  const navigate = useNavigate();

  const isEditMode = Boolean(id);
  const existingInvoice = isEditMode ? invoices.find((inv) => inv.id === id) : null;

  const nextInvoiceNumber = `INV-${new Date().getFullYear()}-${String(lastInvoiceCounter + 1).padStart(6, '0')}`;

  const [formData, setFormData] = useState<Partial<Invoice>>({
    invoiceNumber: nextInvoiceNumber,
    customerId: '',
    date: new Date().toISOString().split('T')[0],
    items: [],
    taxRate: 0,
    discount: 0,
    status: 'Draft',
    notes: 'Thank you for your business.',
  });

  useEffect(() => {
    if (isEditMode && existingInvoice) {
      setFormData(existingInvoice);
    }
  }, [isEditMode, existingInvoice]);

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [
        ...(formData.items || []),
        { id: uuidv4(), productId: '', name: '', quantity: 1, price: 0, total: 0 },
      ],
    });
  };

  const handleRemoveItem = (itemId: string) => {
    setFormData({
      ...formData,
      items: formData.items?.filter((item) => item.id !== itemId),
    });
  };

  const handleItemChange = (itemId: string, field: keyof InvoiceItem, value: any) => {
    const updatedItems = formData.items?.map((item) => {
      if (item.id === itemId) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'productId') {
          const product = inventory.find((p) => p.id === value);
          if (product) {
            updatedItem.name = product.name;
            updatedItem.price = product.price;
          }
        }
        updatedItem.total = updatedItem.quantity * updatedItem.price;
        return updatedItem;
      }
      return item;
    });
    setFormData({ ...formData, items: updatedItems });
  };

  const totals = useMemo(() => {
    const subtotal = formData.items?.reduce((sum, item) => sum + item.total, 0) || 0;
    const discountAmount = formData.discount || 0;
    const afterDiscount = subtotal - discountAmount;
    const taxAmount = afterDiscount * ((formData.taxRate || 0) / 100);
    const total = afterDiscount + taxAmount;
    return { subtotal, taxAmount, total };
  }, [formData.items, formData.discount, formData.taxRate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerId || !formData.items?.length) {
      alert('Please select a customer and add at least one item.');
      return;
    }

    // Check for duplicate invoice number
    const isDuplicate = invoices.some(inv => 
      inv.invoiceNumber.toLowerCase() === formData.invoiceNumber?.toLowerCase() && 
      inv.id !== id
    );

    if (isDuplicate) {
      alert(`Invoice number "${formData.invoiceNumber}" already exists. Please use a unique number.`);
      return;
    }

    const invoiceData: Invoice = {
      id: isEditMode ? id! : uuidv4(),
      invoiceNumber: formData.invoiceNumber!,
      customerId: formData.customerId,
      date: formData.date!,
      items: formData.items!,
      subtotal: totals.subtotal,
      taxRate: formData.taxRate || 0,
      taxAmount: totals.taxAmount,
      discount: formData.discount || 0,
      total: totals.total,
      amountPaid: isEditMode ? existingInvoice?.amountPaid || 0 : 0,
      status: formData.status as any,
      notes: formData.notes || '',
      payments: isEditMode ? existingInvoice?.payments || [] : [],
    };

    if (isEditMode) {
      updateInvoice(id!, invoiceData);
    } else {
      addInvoice(invoiceData);
    }
    navigate(`/invoices/${invoiceData.id}`);
  };

  return (
    <div className="max-w-5xl mx-auto pb-20 px-4 sm:px-0">
      <div className="flex justify-between items-center mb-8">
        <div>
          <button onClick={() => navigate('/invoices')} className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-blue-600 mb-2">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Invoices
          </button>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            {isEditMode ? 'Edit Invoice' : 'Create New Invoice'}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white shadow-xl rounded-2xl border border-gray-100 overflow-hidden">
          <div className="bg-slate-900 p-8 text-white grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Customer</label>
              <select
                required
                value={formData.customerId}
                onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                className="w-full bg-slate-800 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500 text-white font-bold"
              >
                <option value="">Select Customer</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Invoice #</label>
              <input type="text" required value={formData.invoiceNumber} onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })} className="w-full bg-slate-800 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500 text-white font-bold" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Date</label>
              <input type="date" required value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="w-full bg-slate-800 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500 text-white font-bold" />
            </div>
          </div>

          <div className="p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Invoice Items</h3>
              <button type="button" onClick={handleAddItem} className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-sm font-black hover:bg-blue-100 transition-colors">
                <Plus className="mr-2 h-4 w-4" /> Add Item
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="hidden lg:grid grid-cols-12 gap-4 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                <div className="col-span-5">Product/Description</div>
                <div className="col-span-2 text-center">Quantity</div>
                <div className="col-span-2 text-right">Price</div>
                <div className="col-span-2 text-right">Total</div>
                <div className="col-span-1"></div>
              </div>

              {formData.items?.map((item) => (
                <div key={item.id} className="grid grid-cols-1 lg:grid-cols-12 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 items-center group">
                  <div className="col-span-1 lg:col-span-5">
                    <select
                      value={item.productId}
                      onChange={(e) => handleItemChange(item.id, 'productId', e.target.value)}
                      className="w-full bg-white border-gray-200 rounded-xl py-2 px-4 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold"
                    >
                      <option value="">Select a product</option>
                      {inventory.map((p) => (
                        <option key={p.id} value={p.id}>{p.name} (${p.price})</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-1 lg:col-span-2">
                    <input type="number" step="0.01" min="0" placeholder="0.00" value={item.quantity} onChange={(e) => handleItemChange(item.id, 'quantity', parseFloat(e.target.value) || 0)} className="w-full bg-white border-gray-200 rounded-xl py-2 px-4 text-center text-sm font-bold" />
                  </div>
                  <div className="col-span-1 lg:col-span-2">
                    <input type="number" step="0.01" min="0" placeholder="0.00" value={item.price} onChange={(e) => handleItemChange(item.id, 'price', parseFloat(e.target.value) || 0)} className="w-full bg-white border-gray-200 rounded-xl py-2 px-4 text-right text-sm font-bold" />
                  </div>
                  <div className="col-span-1 lg:col-span-2 text-right">
                    <span className="text-sm font-black text-slate-900">${item.total.toFixed(2)}</span>
                  </div>
                  <div className="col-span-1 text-right">
                    <button type="button" onClick={() => handleRemoveItem(item.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-8 bg-slate-50 border-t border-slate-100">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Notes & Terms</label>
                  <textarea rows={4} value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="w-full bg-white border-gray-200 rounded-2xl p-4 focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none" placeholder="Enter notes..." />
                </div>
                <div className="w-64">
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Invoice Status</label>
                  <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as any })} className="w-full bg-white border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold">
                    <option value="Draft">Draft</option>
                    <option value="Sent">Sent</option>
                    <option value="Partially Paid">Partially Paid</option>
                    <option value="Paid">Paid</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-bold">Subtotal</span>
                  <span className="font-black text-slate-900">${totals.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm gap-4">
                  <span className="text-gray-500 font-bold">Discount ($)</span>
                  <input type="number" step="0.01" value={formData.discount} onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })} className="w-32 bg-white border-gray-200 rounded-xl py-2 px-4 text-right font-black focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div className="flex justify-between items-center text-sm gap-4">
                  <span className="text-gray-500 font-bold">Tax Rate (%)</span>
                  <input type="number" step="0.1" value={formData.taxRate} onChange={(e) => setFormData({ ...formData, taxRate: parseFloat(e.target.value) || 0 })} className="w-32 bg-white border-gray-200 rounded-xl py-2 px-4 text-right font-black focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div className="pt-6 border-t-2 border-slate-900 flex justify-between items-center">
                  <span className="text-lg font-black text-slate-900 uppercase">Grand Total</span>
                  <span className="text-3xl font-black text-blue-600 tracking-tighter">${totals.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 no-print">
          <button type="button" onClick={() => navigate('/invoices')} className="px-6 py-3 border border-gray-300 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-colors">
            Discard Changes
          </button>
          <button type="submit" className="px-8 py-3 bg-blue-600 text-white rounded-xl font-black shadow-lg shadow-blue-600/20 hover:bg-blue-700 hover:shadow-xl transition-all flex items-center gap-2">
            <Save className="h-5 w-5" />
            {isEditMode ? 'Update Invoice' : 'Create Invoice'}
          </button>
        </div>
      </form>
    </div>
  );
};
