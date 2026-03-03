import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Customer } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Wallet, ArrowUpRight, Printer } from 'lucide-react';
import { format } from 'date-fns';

export const Customers: React.FC = () => {
  const { customers, invoices, addCustomer, updateCustomer, deleteCustomer, company } = useStore();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Customer, 'id' | 'balance'>>({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  const handleOpenModal = (e: React.MouseEvent, customer?: Customer) => {
    e.stopPropagation(); // Prevents navigating to details
    if (customer) {
      setEditingId(customer.id);
      setFormData({
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
      });
    } else {
      setEditingId(null);
      setFormData({ name: '', email: '', phone: '', address: '' });
    }
    setIsModalOpen(true);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevents navigating to details
    if (window.confirm('Are you sure you want to delete this customer? All their data will be removed.')) {
      deleteCustomer(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      const existing = customers.find(c => c.id === editingId);
      updateCustomer(editingId, { ...formData, id: editingId, balance: existing?.balance || 0 });
    } else {
      addCustomer({ ...formData, id: uuidv4(), balance: 0 });
    }
    setIsModalOpen(false);
  };

  const getCustomerStats = (customerId: string) => {
    const customerInvoices = invoices.filter((inv) => inv.customerId === customerId);
    const totalDue = customerInvoices.reduce((sum, inv) => sum + (inv.total - (inv.amountPaid || 0)), 0);
    const customer = customers.find(c => c.id === customerId);
    return {
      due: totalDue,
      advance: customer?.balance || 0
    };
  };

  const formatCurrency = (val: number) => `৳${val.toLocaleString('en-BD', { minimumFractionDigits: 2 })}`;

  const handlePrintCustomers = () => {
    const originalTitle = document.title;
    document.title = `Customer Balance Report - ${format(new Date(), 'dd MMM yyyy')}`;
    window.print();
    document.title = originalTitle;
  };

  const totalDueAll = customers.reduce((sum, c) => sum + getCustomerStats(c.id).due, 0);
  const totalAdvanceAll = customers.reduce((sum, c) => sum + getCustomerStats(c.id).advance, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-sm text-gray-500">Manage your clients and their account balances</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handlePrintCustomers}
            className="inline-flex items-center justify-center px-4 py-2.5 border border-gray-300 text-sm font-bold rounded-lg text-gray-700 bg-white hover:bg-gray-50 shadow-sm"
          >
            <Printer className="mr-2 h-4 w-4" /> Print Customer List
          </button>
          <button
            onClick={(e) => handleOpenModal(e)}
            className="inline-flex items-center justify-center px-6 py-2.5 bg-blue-600 text-sm font-bold rounded-lg text-white hover:bg-blue-700 shadow-md transition-all whitespace-nowrap"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Customer
          </button>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden no-print">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Page Name</th>
                <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-center text-xs font-black text-gray-500 uppercase tracking-wider">Balance Status</th>
                <th className="px-6 py-4 text-right text-xs font-black text-gray-500 uppercase tracking-wider">Account Summary</th>
                <th className="px-6 py-4 text-right text-xs font-black text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {customers.map((customer) => {
                const stats = getCustomerStats(customer.id);
                return (
                  <tr 
                    key={customer.id} 
                    onClick={() => navigate(`/customers/${customer.id}`)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors group"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-blue-600 group-hover:underline">{customer.name}</span>
                        <span className="text-xs text-gray-400 truncate max-w-[200px]">{customer.address}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col text-xs space-y-1">
                        <span className="text-gray-600 font-medium">{customer.email}</span>
                        <span className="text-gray-400">{customer.phone}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {stats.advance > 0 ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <Wallet className="mr-1 h-3 w-3" /> Advance
                        </span>
                      ) : stats.due > 0 ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-800 border-amber-200">
                          <ArrowUpRight className="mr-1 h-3 w-3" /> Due Payment
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-slate-100 text-slate-600 border border-slate-200">
                          Clear
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex flex-col">
                        {stats.due > 0 && (
                          <span className="text-sm font-black text-amber-600">Due: {formatCurrency(stats.due)}</span>
                        )}
                        {stats.advance > 0 && (
                          <span className="text-sm font-black text-emerald-600">Credit: {formatCurrency(stats.advance)}</span>
                        )}
                        {stats.due === 0 && stats.advance === 0 && (
                          <span className="text-sm font-bold text-gray-400">{formatCurrency(0)}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={(e) => handleOpenModal(e, customer)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors mr-1">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button onClick={(e) => handleDelete(e, customer.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* PRINT CUSTOMER LIST LAYOUT (Hidden on screen) */}
      <div className="hidden print:block w-full bg-white text-[#0f3460] font-sans p-0 m-0">
        <div className="border-b-2 border-gray-400 pb-4 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-black text-blue-900">Customer Balance Report</h1>
              <p className="text-lg text-gray-600 font-medium">Full Client List Summary</p>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold text-[#004e92]">{company.name}</h2>
              <p className="text-xs text-gray-500">Generated on: {format(new Date(), 'dd/MM/yyyy HH:mm')}</p>
            </div>
          </div>
        </div>

        <table className="w-full text-[11px] mb-8 border-collapse">
          <thead>
            <tr className="bg-[#eef2f5] border-y border-gray-300 text-blue-900">
              <th className="py-2 px-2 text-left font-bold border">SL</th>
              <th className="py-2 px-2 text-left font-bold border">Page Name</th>
              <th className="py-2 px-2 text-left font-bold border">Contact Name</th>
              <th className="py-2 px-2 text-left font-bold border">Phone</th>
              <th className="py-2 px-2 text-right font-bold border">Due Balance</th>
              <th className="py-2 px-2 text-right font-bold border">Advance Credit</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer, index) => {
              const stats = getCustomerStats(customer.id);
              return (
                <tr key={customer.id} className="border-b border-gray-200">
                  <td className="py-2 px-2 border text-center">{index + 1}</td>
                  <td className="py-2 px-2 border font-bold text-black">{customer.name}</td>
                  <td className="py-2 px-2 border">{customer.email}</td>
                  <td className="py-2 px-2 border">{customer.phone}</td>
                  <td className="py-2 px-2 border text-right font-bold text-red-600">
                    {stats.due > 0 ? stats.due.toFixed(2) : '-'}
                  </td>
                  <td className="py-2 px-2 border text-right font-bold text-emerald-700">
                    {stats.advance > 0 ? stats.advance.toFixed(2) : '-'}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50 font-bold border-t-2 border-gray-400">
              <td colSpan={4} className="py-3 px-2 text-right border uppercase text-blue-900">Total Company Outstandings:</td>
              <td className="py-3 px-2 text-right border text-red-600">৳{totalDueAll.toFixed(2)}</td>
              <td className="py-3 px-2 text-right border text-emerald-700">৳{totalAdvanceAll.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>

        <div className="mt-12 flex justify-between px-10">
          <div className="text-center border-t border-black pt-2 w-40">
            <p className="text-[10px] font-bold text-black uppercase">Prepared By</p>
          </div>
          <div className="text-center border-t border-black pt-2 w-40">
            <p className="text-[10px] font-bold text-black uppercase">Authorized Signature</p>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm no-print">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
              <h3 className="text-xl font-bold">{editingId ? 'Edit Customer' : 'Add New Customer'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Page Name</label>
                  <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Business or Page Name" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Name</label>
                  <input type="text" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Contact Person Name" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Phone</label>
                  <input type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="+880..." />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Address</label>
                  <textarea rows={3} value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none" placeholder="Full delivery address..." />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg">Save Customer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
