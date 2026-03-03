import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { ArrowLeft, Mail, Phone, MapPin, Wallet, FileText, ArrowUpRight } from 'lucide-react';

export const CustomerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { customers, invoices } = useStore();

  const customer = customers.find((c) => c.id === id);
  const customerInvoices = invoices.filter((inv) => inv.customerId === id);

  if (!customer) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Customer not found</h2>
        <button onClick={() => navigate('/customers')} className="mt-4 text-blue-600 hover:underline">
          Back to Customers
        </button>
      </div>
    );
  }

  // Total Due Calculation (Never negative per invoice)
  const totalDue = customerInvoices.reduce((sum, inv) => sum + Math.max(0, inv.total - (inv.amountPaid || 0)), 0);
  const formatCurrency = (val: number) => `৳${val.toLocaleString('en-BD', { minimumFractionDigits: 2 })}`;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <button onClick={() => navigate('/customers')} className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-blue-600 transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Customers
      </button>

      {/* Customer Profile Header */}
      <div className="bg-white shadow-sm rounded-2xl border border-gray-100 overflow-hidden">
        <div className="bg-slate-900 p-8 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight">{customer.name}</h1>
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-300">
              <span className="flex items-center gap-2"><Mail className="h-4 w-4" /> {customer.email}</span>
              <span className="flex items-center gap-2"><Phone className="h-4 w-4" /> {customer.phone}</span>
              <span className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {customer.address}</span>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 min-w-[240px]">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Total Balance Due</p>
            <p className="text-3xl font-black text-amber-400">{formatCurrency(totalDue)}</p>
            {customer.balance > 0 && (
              <p className="mt-2 text-xs font-bold text-emerald-400 flex items-center">
                <Wallet className="mr-1 h-3 w-3" /> Advance Credit: {formatCurrency(customer.balance)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Customer Invoices List */}
      <div className="bg-white shadow-sm rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-100">
          <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" /> Invoice History
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Invoice #</th>
                <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Date</th>
                <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Total Amount</th>
                <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Balance</th>
                <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {customerInvoices.length > 0 ? (
                customerInvoices.slice().reverse().map((invoice) => {
                  const due = Math.max(0, invoice.total - (invoice.amountPaid || 0));
                  return (
                    <tr 
                      key={invoice.id} 
                      onClick={() => navigate(`/invoices/${invoice.id}`)}
                      className="hover:bg-slate-50 cursor-pointer transition-colors group"
                    >
                      <td className="px-8 py-4 whitespace-nowrap text-sm font-bold text-blue-600 group-hover:underline">
                        {invoice.invoiceNumber}
                      </td>
                      <td className="px-8 py-4 whitespace-nowrap text-sm text-gray-500">
                        {invoice.date}
                      </td>
                      <td className="px-8 py-4 whitespace-nowrap text-sm text-slate-900 font-bold">
                        {formatCurrency(invoice.total)}
                      </td>
                      <td className="px-8 py-4 whitespace-nowrap text-sm font-black text-amber-600">
                        {due > 0 ? formatCurrency(due) : 'Settled'}
                      </td>
                      <td className="px-8 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2.5 py-1 inline-flex text-[10px] font-black uppercase rounded-full border ${
                          invoice.status === 'Paid' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                          invoice.status === 'Partially Paid' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                          invoice.status === 'Sent' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                          'bg-slate-100 text-slate-800 border-slate-200'
                        }`}>
                          {invoice.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-8 py-12 text-center text-gray-400 italic">
                    No invoices found for this customer.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
