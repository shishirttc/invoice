import React, { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { FileText, Users, Package, DollarSign, Wallet, ArrowUpRight, Calendar, Tag, CheckCircle, Hash } from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  startOfDay, 
  startOfWeek, 
  startOfMonth, 
  startOfYear, 
  isAfter, 
  isSameDay,
  parseISO 
} from 'date-fns';

type FilterType = 'All' | 'Daily' | 'Weekly' | 'Monthly' | 'Yearly';

export const Dashboard: React.FC = () => {
  const { invoices, customers, inventory } = useStore();
  const [filter, setFilter] = useState<FilterType>('All');

  const getCustomerName = (id: string) => {
    const customer = customers.find((c) => c.id === id);
    return customer ? customer.name : 'Unknown';
  };

  const filteredInvoices = useMemo(() => {
    if (filter === 'All') return invoices;
    
    const now = new Date();
    let startDate: Date;

    switch (filter) {
      case 'Daily': startDate = startOfDay(now); break;
      case 'Weekly': startDate = startOfWeek(now, { weekStartsOn: 6 }); break; // Saturday (BD)
      case 'Monthly': startDate = startOfMonth(now); break;
      case 'Yearly': startDate = startOfYear(now); break;
      default: return invoices;
    }

    return invoices.filter(inv => {
      const invDate = parseISO(inv.date);
      return isAfter(invDate, startDate) || isSameDay(invDate, startDate);
    });
  }, [invoices, filter]);

  const stats = useMemo(() => {
    const totalRevenue = filteredInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const totalPaid = filteredInvoices.reduce((sum, inv) => sum + (inv.amountPaid || 0), 0);
    const totalDiscount = filteredInvoices.reduce((sum, inv) => sum + (inv.discount || 0), 0);
    const totalDue = Math.max(0, totalRevenue - totalPaid);
    
    // Calculate total quantity across all filtered invoices
    const totalQty = filteredInvoices.reduce((sum, inv) => 
      sum + inv.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
    );

    const formatCurrency = (val: number) => `৳${Math.round(val).toLocaleString('en-BD')}`;

    return [
      { name: 'Total Revenue', value: formatCurrency(totalRevenue), icon: DollarSign, color: 'text-blue-600', bg: 'bg-blue-100' },
      { name: 'Total Paid', value: formatCurrency(totalPaid), icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-100' },
      { name: 'Total Due', value: formatCurrency(totalDue), icon: ArrowUpRight, color: 'text-amber-600', bg: 'bg-amber-100' },
      { name: 'Total Discount', value: formatCurrency(totalDiscount), icon: Tag, color: 'text-rose-600', bg: 'bg-rose-100' },
      { name: 'Total Quantity', value: totalQty.toLocaleString('en-BD'), icon: Hash, color: 'text-purple-600', bg: 'bg-purple-100' },
      { name: 'Total Invoices', value: filteredInvoices.length, icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    ];
  }, [filteredInvoices]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-sm text-gray-500">Welcome back! Summary of your business operations.</p>
        </div>

        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-gray-100 shadow-sm no-print">
          {(['All', 'Daily', 'Weekly', 'Monthly', 'Yearly'] as FilterType[]).map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                filter === type
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-gray-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((item) => (
          <div key={item.name} className="bg-white overflow-hidden shadow-sm rounded-2xl border border-gray-100 p-6 group hover:shadow-lg transition-all duration-300">
            <div className="flex items-center">
              <div className={`flex-shrink-0 rounded-xl p-4 ${item.bg} group-hover:scale-110 transition-transform duration-300`}>
                <item.icon className={`h-6 w-6 ${item.color}`} aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-xs font-black text-gray-400 uppercase tracking-widest truncate">{item.name}</dt>
                  <dd>
                    <div className="text-2xl font-black text-slate-900 tracking-tight">{item.value}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-white shadow-sm rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-black text-slate-900 tracking-tight">Recent Activity ({filter})</h3>
          <Link to="/invoices" className="text-sm font-bold text-blue-600 hover:underline">View All</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Invoice #</th>
                <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Customer</th>
                <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Date</th>
                <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Amount</th>
                <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredInvoices.slice(-5).reverse().map((invoice) => (
                <tr key={invoice.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-8 py-4 whitespace-nowrap text-sm font-bold text-blue-600">
                    <Link to={`/invoices/${invoice.id}`}>{invoice.invoiceNumber}</Link>
                  </td>
                  <td className="px-8 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                    {getCustomerName(invoice.customerId)}
                  </td>
                  <td className="px-8 py-4 whitespace-nowrap text-sm text-gray-500">{invoice.date}</td>
                  <td className="px-8 py-4 whitespace-nowrap text-sm text-slate-900 font-black">৳{invoice.total.toLocaleString('en-BD', { minimumFractionDigits: 2 })}</td>
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
              ))}
              {filteredInvoices.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-12 text-center text-sm text-gray-400 italic">
                    No activity found for this period.
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
