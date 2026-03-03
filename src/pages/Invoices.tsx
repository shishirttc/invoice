import React, { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Trash2, Printer, Calendar } from 'lucide-react';
import { format, parseISO, isWithinInterval, startOfMonth, endOfMonth } from 'date-fns';

export const Invoices: React.FC = () => {
  const { invoices, customers, deleteInvoice, company } = useStore();
  const navigate = useNavigate();

  // Date range for printing (Defaults to current month)
  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));

  const getCustomerName = (id: string) => {
    const customer = customers.find((c) => c.id === id);
    return customer ? customer.name : 'Unknown Customer';
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this invoice? This action cannot be undone.')) {
      deleteInvoice(id);
    }
  };

  const formatCurrency = (val: number) => `৳${val.toLocaleString('en-BD', { minimumFractionDigits: 2 })}`;

  // Main table shows ALL invoices
  const allSortedInvoices = useMemo(() => [...invoices].reverse(), [invoices]);

  // Range-filtered invoices for PRINTING only
  const rangeInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const invDate = parseISO(inv.date);
      return isWithinInterval(invDate, {
        start: parseISO(startDate),
        end: parseISO(endDate)
      });
    });
  }, [invoices, startDate, endDate]);

  const rangeSortedInvoices = [...rangeInvoices].reverse();
  const totalRangeAmount = rangeInvoices.reduce((sum, inv) => sum + inv.total, 0);
  const totalRangePaid = rangeInvoices.reduce((sum, inv) => sum + (inv.amountPaid || 0), 0);
  const totalRangeDue = Math.max(0, totalRangeAmount - totalRangePaid);

  const handlePrintReport = () => {
    const originalTitle = document.title;
    document.title = `Invoice Report - ${startDate} to ${endDate}`;
    window.print();
    document.title = originalTitle;
  };

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="text-sm text-gray-500">Manage and track your customer billing</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/invoices/new"
            className="inline-flex items-center justify-center px-6 py-2.5 bg-blue-600 text-sm font-bold rounded-lg text-white hover:bg-blue-700 shadow-md transition-all"
          >
            <Plus className="mr-2 h-4 w-4" /> Create Invoice
          </Link>
        </div>
      </div>

      {/* Date Range Selector for Printing */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-wrap items-center gap-4 no-print">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-bold text-gray-700">Print Report Range:</span>
        </div>
        <div className="flex items-center gap-2">
          <input 
            type="date" 
            value={startDate} 
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-slate-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-gray-400 text-sm">to</span>
          <input 
            type="date" 
            value={endDate} 
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-slate-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={handlePrintReport}
          className="inline-flex items-center justify-center px-4 py-2 bg-slate-900 text-sm font-bold rounded-lg text-white hover:bg-slate-800 shadow-md"
        >
          <Printer className="mr-2 h-4 w-4" /> Print Range Report ({rangeInvoices.length})
        </button>
        <div className="ml-auto flex gap-6 text-sm">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-black text-gray-400">Range Total</span>
            <span className="font-bold text-blue-600">{formatCurrency(totalRangeAmount)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-black text-gray-400">Range Paid</span>
            <span className="font-bold text-emerald-600">{formatCurrency(totalRangePaid)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-black text-gray-400">Range Due</span>
            <span className="font-bold text-rose-600">{formatCurrency(totalRangeDue)}</span>
          </div>
        </div>
      </div>

      {/* Main Invoices Table (Shows ALL Invoices) */}
      <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden no-print">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">SL</th>
                <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Invoice #</th>
                <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-right text-xs font-black text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-right text-xs font-black text-gray-500 uppercase tracking-wider">Discount</th>
                <th className="px-6 py-4 text-right text-xs font-black text-gray-500 uppercase tracking-wider">Total Paid</th>
                <th className="px-6 py-4 text-right text-xs font-black text-gray-500 uppercase tracking-wider">Balance Due</th>
                <th className="px-6 py-4 text-center text-xs font-black text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-black text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {allSortedInvoices.map((invoice, index) => {
                const balanceDue = Math.max(0, invoice.total - (invoice.amountPaid || 0));
                return (
                  <tr 
                    key={invoice.id} 
                    onClick={() => navigate(`/invoices/${invoice.id}`)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors group"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-gray-400">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600 group-hover:underline">
                      {invoice.invoiceNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                      {getCustomerName(invoice.customerId)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {invoice.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-slate-900 font-bold">
                      {formatCurrency(invoice.total)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-rose-500 font-medium">
                      {invoice.discount > 0 ? `-${formatCurrency(invoice.discount)}` : '৳0.00'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-emerald-600 font-bold">
                      {formatCurrency(invoice.amountPaid || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-amber-600 font-black">
                      {formatCurrency(balanceDue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`px-2.5 py-1 inline-flex text-[10px] font-black uppercase rounded-full border ${
                        invoice.status === 'Paid' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                        invoice.status === 'Partially Paid' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                        invoice.status === 'Sent' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                        'bg-slate-100 text-slate-800 border-slate-200'
                      }`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/invoices/${invoice.id}`, { state: { autoPrint: true } });
                        }} 
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors inline-block mr-1"
                        title="Direct Print Invoice"
                      >
                        <Printer className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={(e) => handleDelete(e, invoice.id)} 
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors inline-block"
                        title="Delete Invoice"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {allSortedInvoices.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-12 py-12 text-center">
                    <div className="flex flex-col items-center text-gray-500">
                      <p className="font-medium mb-2">No invoices found</p>
                      <Link to="/invoices/new" className="text-blue-600 font-bold hover:underline text-sm">Create your first invoice</Link>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PRINT RANGE REPORT LAYOUT (Hidden on screen) */}
      <div className="hidden print:block w-full bg-white text-[#0f3460] font-sans p-0 m-0">
        <div className="border-b-2 border-gray-400 pb-4 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-black">Invoice Range Report</h1>
              <p className="text-lg text-gray-600 font-medium">Period: {startDate} to {endDate}</p>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold text-[#004e92]">{company.name}</h2>
              <p className="text-xs text-gray-500">Report Generated on: {format(new Date(), 'dd/MM/yyyy')}</p>
            </div>
          </div>
        </div>

        <table className="w-full text-[11px] mb-8 border-collapse">
          <thead>
            <tr className="bg-[#eef2f5] border-y border-gray-300">
              <th className="py-2 px-2 text-left font-bold text-black border">SL</th>
              <th className="py-2 px-2 text-left font-bold text-black border">Invoice #</th>
              <th className="py-2 px-2 text-left font-bold text-black border">Customer (Page Name)</th>
              <th className="py-2 px-2 text-left font-bold text-black border">Date</th>
              <th className="py-2 px-2 text-right font-bold text-black border">Amount</th>
              <th className="py-2 px-2 text-right font-bold text-black border">Paid</th>
              <th className="py-2 px-2 text-right font-bold text-black border">Due</th>
              <th className="py-2 px-2 text-center font-bold text-black border">Status</th>
            </tr>
          </thead>
          <tbody>
            {rangeSortedInvoices.map((invoice, index) => {
              const balanceDue = Math.max(0, invoice.total - (invoice.amountPaid || 0));
              return (
                <tr key={invoice.id} className="border-b border-gray-200">
                  <td className="py-2 px-2 border">{index + 1}</td>
                  <td className="py-2 px-2 font-bold text-black border">{invoice.invoiceNumber}</td>
                  <td className="py-2 px-2 border">{getCustomerName(invoice.customerId)}</td>
                  <td className="py-2 px-2 border">{format(parseISO(invoice.date), 'dd/MM/yy')}</td>
                  <td className="py-2 px-2 text-right border">{invoice.total.toFixed(2)}</td>
                  <td className="py-2 px-2 text-right border">{(invoice.amountPaid || 0).toFixed(2)}</td>
                  <td className="py-2 px-2 text-right border font-bold text-red-600">{balanceDue.toFixed(2)}</td>
                  <td className="py-2 px-2 text-center border">{invoice.status}</td>
                </tr>
              );
            })}
            {rangeSortedInvoices.length === 0 && (
              <tr>
                <td colSpan={8} className="py-10 text-center border italic text-gray-400">
                  No invoices found within this date range.
                </td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50 font-bold border-t-2 border-gray-400">
              <td colSpan={4} className="py-3 px-2 text-right border uppercase">Summary Total:</td>
              <td className="py-3 px-2 text-right border">৳{totalRangeAmount.toFixed(2)}</td>
              <td className="py-3 px-2 text-right border text-emerald-700">৳{totalRangePaid.toFixed(2)}</td>
              <td className="py-3 px-2 text-right border text-red-600">৳{totalRangeDue.toFixed(2)}</td>
              <td className="border"></td>
            </tr>
          </tfoot>
        </table>

        <div className="mt-12 flex justify-between px-10">
          <div className="text-center border-t border-black pt-2 w-40">
            <p className="text-xs font-bold text-black uppercase">Prepared By</p>
          </div>
          <div className="text-center border-t border-black pt-2 w-40">
            <p className="text-xs font-bold text-black uppercase">Authorized Signature</p>
          </div>
        </div>
      </div>
    </div>
  );
};
