import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Printer, ArrowLeft, Mail, Phone, Globe, MapPin, CreditCard, Plus, History, CheckCircle2, Wallet, Edit2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';

export const InvoiceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { invoices, customers, company, addPayment } = useStore();
  
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');

  const invoice = invoices.find((i) => i.id === id);
  const customer = customers.find((c) => c.id === invoice?.customerId);

  useEffect(() => {
    if (invoice && customer && location.state?.autoPrint) {
      const timer = setTimeout(() => {
        handlePrint();
        // Reset state so it doesn't print again on refresh
        window.history.replaceState({}, document.title);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [invoice, customer, location.state]);

  if (!invoice || !customer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="bg-red-50 p-6 rounded-full mb-4">
          <ArrowLeft className="h-12 w-12 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Invoice not found</h2>
        <button onClick={() => navigate('/invoices')} className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg">
          Back to Invoices
        </button>
      </div>
    );
  }

  const handlePrint = () => {
    const originalTitle = document.title;
    document.title = `${customer.name} - ${invoice.invoiceNumber}`;
    window.print();
    document.title = originalTitle;
  };

  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) return;

    addPayment(invoice.id, {
      id: uuidv4(),
      date: format(new Date(), 'yyyy-MM-dd'),
      amount: amount,
      method: paymentMethod,
    });

    setIsPaymentModalOpen(false);
    setPaymentAmount('');
  };

  const balanceDue = invoice.total - (invoice.amountPaid || 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Partially Paid': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Sent': return 'bg-amber-100 text-amber-800 border-amber-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const formatCurrency = (val: number) => `৳${val.toLocaleString('en-BD', { minimumFractionDigits: 2 })}`;

  const numberToWords = (num: number): string => {
    if (num === 0) return 'Zero';
    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
    const convert = (n: number): string => {
      if (n < 20) return a[n];
      if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : ' ');
      if (n < 1000) return a[Math.floor(n / 100)] + 'Hundred ' + (n % 100 !== 0 ? convert(n % 100) : '');
      if (n < 100000) return convert(Math.floor(n / 1000)) + 'Thousand ' + (n % 1000 !== 0 ? convert(n % 1000) : '');
      if (n < 10000000) return convert(Math.floor(n / 100000)) + 'Lakh ' + (n % 100000 !== 0 ? convert(n % 100000) : '');
      return convert(Math.floor(n / 10000000)) + 'Crore ' + (n % 10000000 !== 0 ? convert(n % 10000000) : '');
    };
    return convert(Math.floor(num)).trim();
  };

  return (
    <div className="max-w-5xl mx-auto pb-20">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 no-print px-4 sm:px-0">
        <button onClick={() => navigate('/invoices')} className="inline-flex items-center text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
        </button>
        <div className="flex gap-3 w-full sm:w-auto">
          <button 
            onClick={() => navigate(`/invoices/edit/${invoice.id}`)}
            className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2.5 border border-gray-300 text-sm font-semibold rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-all shadow-sm"
          >
            <Edit2 className="mr-2 h-4 w-4" /> Edit
          </button>
          {balanceDue > 0 && (
            <button 
              onClick={() => setIsPaymentModalOpen(true)}
              className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2.5 bg-emerald-600 text-sm font-semibold rounded-lg text-white hover:bg-emerald-700 shadow-md transition-all"
            >
              <CreditCard className="mr-2 h-4 w-4" /> Add Payment
            </button>
          )}
          <button onClick={handlePrint} className="flex-1 sm:flex-none inline-flex items-center justify-center px-5 py-2.5 bg-blue-600 text-sm font-semibold rounded-lg text-white hover:bg-blue-700 shadow-md">
            <Printer className="mr-2 h-4 w-4" /> Print / PDF
          </button>
        </div>
      </div>

      {/* Screen Invoice Document (Hidden on Print) */}
      <div id="printable-invoice" className="bg-white shadow-2xl rounded-2xl overflow-hidden border border-gray-100 print:hidden">
        {/* Top Header */}
        <div className="bg-slate-900 p-8 sm:p-12 text-white flex flex-col sm:flex-row justify-between gap-8">
          <div className="space-y-4">
            <h1 className="text-5xl font-extrabold tracking-tight">INVOICE</h1>
            <div className="flex items-center text-slate-400 font-mono text-lg tracking-wider">
              <span className="opacity-50 mr-1">#</span>
              <span className="text-white">{invoice.invoiceNumber}</span>
            </div>
          </div>
          <div className="text-left sm:text-right space-y-2">
            {company.logoUrl && <img src={company.logoUrl} alt="Logo" className="h-12 w-auto object-contain sm:ml-auto mb-4 bg-white p-1 rounded" />}
            <h2 className="text-3xl font-bold tracking-tight text-white">{company.name}</h2>
            <div className="space-y-1 text-sm text-slate-300">
              <p className="flex items-center sm:justify-end gap-2"><MapPin className="h-3.5 w-3.5" /> {company.address}</p>
              <p className="flex items-center sm:justify-end gap-2"><Phone className="h-3.5 w-3.5" /> {company.phone}</p>
              <p className="flex items-center sm:justify-end gap-2"><Mail className="h-3.5 w-3.5" /> {company.email}</p>
            </div>
          </div>
        </div>

        <div className="p-8 sm:p-12">
          {/* Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-12 border-b border-gray-100 pb-12">
            <div>
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Invoice To</h4>
              <p className="text-xl font-bold text-gray-900">{customer.name}</p>
              <p className="text-sm text-gray-700 font-medium">{customer.email}</p>
              <p className="text-sm text-gray-500">{customer.phone}</p>
              <p className="text-sm text-gray-500 leading-relaxed whitespace-pre-line mt-2">{customer.address}</p>
              {customer.balance > 0 && (
                <div className="mt-3 inline-flex items-center px-3 py-1 bg-amber-50 text-amber-700 border border-amber-100 rounded-lg text-xs font-bold no-print">
                  <Wallet className="mr-2 h-3.5 w-3.5" /> Account Credit: {formatCurrency(customer.balance)}
                </div>
              )}
            </div>
            <div>
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Invoice Date</h4>
              <div className="space-y-2">
                <p className="text-sm"><span className="text-gray-500">Issued On:</span> <span className="font-bold">{invoice.date}</span></p>
              </div>
            </div>
            <div>
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Balance Status</h4>
              <div className={`p-4 rounded-xl border ${getStatusColor(invoice.status)}`}>
                <p className="text-xs font-bold uppercase mb-1">Current Status</p>
                <p className="text-xl font-black">{invoice.status}</p>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-12">
            <table className="min-w-full">
              <thead>
                <tr className="border-b-2 border-slate-900 text-left">
                  <th className="py-4 text-[11px] font-black uppercase tracking-wider">Description</th>
                  <th className="py-4 text-center text-[11px] font-black uppercase tracking-wider w-24">Qty</th>
                  <th className="py-4 text-right text-[11px] font-black uppercase tracking-wider w-32">Price</th>
                  <th className="py-4 text-right text-[11px] font-black uppercase tracking-wider w-32">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {invoice.items.map((item, index) => (
                  <tr key={index}>
                    <td className="py-5 font-bold text-gray-900">{item.name}</td>
                    <td className="py-5 text-center font-bold text-gray-700">{item.quantity}</td>
                    <td className="py-5 text-right font-bold text-gray-700">{formatCurrency(item.price).replace('৳', '')}</td>
                    <td className="py-5 text-right font-black text-slate-900">{formatCurrency(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Calculations & Payments */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-8 border-t border-gray-100">
            {/* Payment History */}
            <div>
              <h4 className="flex items-center text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4">
                <History className="mr-2 h-3.5 w-3.5" /> Payment History
              </h4>
              <div className="space-y-3">
                {invoice.payments?.length > 0 ? (
                  invoice.payments.map((p) => (
                    <div key={p.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="text-sm">
                        <p className="font-bold text-gray-900">{p.method}</p>
                        <p className="text-xs text-gray-500">Paid on: {p.date}</p>
                      </div>
                      <p className="font-black text-emerald-600">+{formatCurrency(p.amount)}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-400 italic">No payments recorded yet.</p>
                )}
              </div>
            </div>

            {/* Final Totals */}
            <div className="bg-slate-900 text-white p-8 rounded-2xl space-y-4">
              <div className="flex justify-between text-sm opacity-70">
                <span>Subtotal</span>
                <span>{formatCurrency(invoice.subtotal)}</span>
              </div>
              
              {invoice.discount > 0 && (
                <div className="flex justify-between text-sm text-rose-400 font-bold italic">
                  <span>Discount</span>
                  <span>-{formatCurrency(invoice.discount)}</span>
                </div>
              )}

              {invoice.taxAmount > 0 && (
                <div className="flex justify-between text-sm opacity-70">
                  <span>Tax ({invoice.taxRate}%)</span>
                  <span>+{formatCurrency(invoice.taxAmount)}</span>
                </div>
              )}

              <div className="flex justify-between text-sm text-emerald-400 font-bold border-t border-white/10 pt-4">
                <span>Total Amount (Net)</span>
                <span>{formatCurrency(invoice.total)}</span>
              </div>
              
              <div className="flex justify-between text-sm opacity-70">
                <span>Total Paid</span>
                <span>{formatCurrency(invoice.amountPaid || 0)}</span>
              </div>
              
              <div className="flex justify-between items-center pt-2 border-t border-white/20">
                <span className="text-lg font-black uppercase tracking-wider">Balance Due</span>
                <span className={`text-3xl font-black ${balanceDue <= 0 ? 'text-emerald-400' : 'text-blue-400'}`}>
                  {formatCurrency(balanceDue)}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="h-3 bg-slate-900"></div>
      </div>

      {/* CUSTOM PRINT LAYOUT (Liking Plus Style) */}
      <div className="hidden print:block w-full bg-white font-sans text-[#0f3460] p-0 m-0">
        {/* Top Titles Row */}
        <div className="flex justify-between items-end pb-2">
          <h1 className="text-4xl font-normal text-black">{invoice.invoiceNumber}</h1>
          <h1 className="text-4xl font-normal text-black uppercase tracking-widest">INVOICE</h1>
        </div>
        
        {/* Horizontal Line across the page */}
        <div className="border-b border-gray-400 mb-6"></div>

        {/* Company Info Row */}
        <div className="flex justify-between items-start mb-8">
          <div className="text-left w-1/2">
            {company.logoUrl ? (
              <img src={company.logoUrl} className="h-20 w-auto object-contain" alt="Logo" />
            ) : (
              <h2 className="text-2xl font-bold text-[#004e92]">{company.name}</h2>
            )}
          </div>
          <div className="text-right w-1/2">
            <h2 className="text-xl font-bold text-[#004e92] mb-1">{company.name}</h2>
            <p className="text-[13px] text-[#004e92]">{company.email}</p>
            <p className="text-[13px] text-[#004e92]">{company.phone}</p>
            <p className="text-[13px] text-[#004e92] whitespace-pre-line">{company.address}</p>
          </div>
        </div>

        <div className="flex justify-between items-start mt-8 mb-8">
          <div className="w-1/2">
            <h3 className="font-bold text-[#004e92] mb-1">Invoice To:</h3>
            <p className="font-bold text-black text-lg leading-tight">{customer.name}</p>
            <p className="text-black text-sm">{customer.email}</p>
            {customer.phone && <p className="text-black text-sm">Mobile: {customer.phone}</p>}
            <p className="text-black text-sm whitespace-pre-line max-w-[80%]">{customer.address}</p>
          </div>
          <div className="w-1/2 flex justify-end">
            <table className="text-sm text-right">
              <tbody>
                <tr>
                  <td className="font-bold text-[#004e92] pr-6 py-0.5">Date</td>
                  <td className="text-[#004e92]">:</td>
                  <td className="pl-6 text-black py-0.5">{format(new Date(invoice.date), 'dd/MM/yyyy')}</td>
                </tr>
                <tr>
                  <td className="font-bold text-[#004e92] pr-6 py-0.5">Sales Person</td>
                  <td className="text-[#004e92]">:</td>
                  <td className="pl-6 text-black py-0.5">Md. Salahuddin Shishir</td>
                </tr>
                <tr>
                  <td className="font-bold text-[#004e92] pr-6 py-0.5">Status</td>
                  <td className="text-[#004e92]">:</td>
                  <td className="pl-6 text-black py-0.5">{invoice.status}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <table className="w-full mb-8">
          <thead>
            <tr className="bg-[#eef2f5] text-[#004e92]">
              <th className="text-left py-2.5 px-4 font-normal text-sm w-1/2">Item & Description</th>
              <th className="text-center py-2.5 px-2 font-normal text-sm">Qty</th>
              <th className="text-right py-2.5 px-4 font-normal text-sm">Price</th>
              <th className="text-right py-2.5 px-4 font-normal text-sm">Discount</th>
              <th className="text-right py-2.5 px-4 font-normal text-sm">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, index) => (
              <tr key={index} className="border-b border-gray-100">
                <td className="py-3 px-4 text-[#004e92] text-sm font-medium">{item.name}</td>
                <td className="py-3 px-2 text-center text-[#004e92] text-sm">{item.quantity} pc</td>
                <td className="py-3 px-4 text-right text-[#004e92] text-sm">{item.price.toFixed(2)}</td>
                <td className="py-3 px-4 text-right text-[#004e92] text-sm">0.00</td>
                <td className="py-3 px-4 text-right text-[#004e92] text-sm">{item.total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-between items-start">
          <div className="w-7/12 pr-8">
            <p className="font-bold text-[#004e92] text-sm leading-relaxed">
              In Words: <span className="font-normal text-[#004e92]">{numberToWords(invoice.total)} BDT</span>
            </p>
            {invoice.notes && (
              <div className="mt-8">
                <p className="font-bold text-[#004e92] text-sm mb-1">Notes:</p>
                <p className="text-xs text-black whitespace-pre-line">{invoice.notes}</p>
              </div>
            )}
          </div>
          <div className="w-5/12 bg-[#f8f9fa] p-6 rounded-lg">
            <table className="w-full text-sm">
              <tbody>
                <tr>
                  <td className="text-[#004e92] py-1.5 text-left">Sub Total :</td>
                  <td className="text-right text-[#004e92] font-medium">৳{invoice.subtotal.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="text-[#004e92] py-1.5 text-left">Discount :</td>
                  <td className="text-right text-[#004e92] font-medium">৳{invoice.discount.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="text-[#004e92] py-1.5 text-left">VAT :</td>
                  <td className="text-right text-[#004e92] font-medium">৳{invoice.taxAmount.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="text-[#004e92] py-1.5 text-left">Adjustment Amount :</td>
                  <td className="text-right text-[#004e92] font-medium">৳0.00</td>
                </tr>
                <tr>
                  <td className="text-[#004e92] py-2.5 font-bold text-left">Grand Total :</td>
                  <td className="text-right text-[#004e92] font-bold">৳{invoice.total.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="text-[#004e92] py-2.5 font-bold text-left">Paid Amount:</td>
                  <td className="text-right text-[#004e92] font-bold">৳{(invoice.amountPaid || 0).toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="text-[#004e92] py-2.5 font-bold text-left">Remaining Due:</td>
                  <td className="text-right font-bold text-red-600">৳{balanceDue.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm no-print">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
              <h3 className="text-xl font-bold">Add Payment</h3>
              <button onClick={() => setIsPaymentModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleAddPayment} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Amount to Pay</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-gray-400">৳</span>
                  <input 
                    type="number" 
                    step="0.01"
                    required 
                    value={paymentAmount} 
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                    placeholder="0.00"
                  />
                </div>
                {parseFloat(paymentAmount) > balanceDue && (
                  <p className="mt-2 text-xs text-emerald-600 font-bold">
                    Note: {formatCurrency(parseFloat(paymentAmount) - balanceDue)} will be added to Customer Credit.
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">Remaining Balance: <span className="font-bold text-blue-600">{formatCurrency(balanceDue)}</span></p>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Payment Method</label>
                <select 
                  value={paymentMethod} 
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option>Cash</option>
                  <option>Bank Transfer</option>
                  <option>Card</option>
                  <option>Mobile Banking</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsPaymentModalOpen(false)} className="flex-1 px-4 py-3 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-600/20">Confirm Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
