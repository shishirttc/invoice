import React from 'react';
import { useStore } from '../store/useStore';
import { format, parseISO } from 'date-fns';
import { History as HistoryIcon, Trash2, Clock, CheckCircle, Edit, Plus, CreditCard, AlertCircle } from 'lucide-react';

export const History: React.FC = () => {
  const { activities, clearHistory } = useStore();

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'Created': return <Plus className="h-4 w-4 text-emerald-500" />;
      case 'Updated': return <Edit className="h-4 w-4 text-blue-500" />;
      case 'Deleted': return <Trash2 className="h-4 w-4 text-red-500" />;
      case 'Payment': return <CreditCard className="h-4 w-4 text-purple-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear all activity history? This cannot be undone.')) {
      clearHistory();
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <HistoryIcon className="h-6 w-6 text-blue-600" /> Activity History
          </h1>
          <p className="text-sm text-gray-500">Track every change made to your invoices, customers, and products</p>
        </div>
        {activities.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="inline-flex items-center px-4 py-2 bg-red-50 text-red-600 text-xs font-bold rounded-lg hover:bg-red-100 transition-colors"
          >
            <Trash2 className="mr-2 h-3.5 w-3.5" /> Clear History
          </button>
        )}
      </div>

      <div className="bg-white shadow-sm rounded-2xl border border-gray-100 overflow-hidden">
        <div className="divide-y divide-gray-100">
          {activities.length > 0 ? (
            activities.map((log) => (
              <div key={log.id} className="p-6 hover:bg-slate-50 transition-colors flex gap-6 items-start">
                <div className={`mt-1 flex-shrink-0 p-2 rounded-xl ${
                  log.action === 'Created' ? 'bg-emerald-50' : 
                  log.action === 'Updated' ? 'bg-blue-50' : 
                  log.action === 'Deleted' ? 'bg-red-50' : 
                  'bg-purple-50'
                }`}>
                  {getActionIcon(log.action)}
                </div>
                
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-start">
                    <h4 className="text-sm font-bold text-slate-900">
                      {log.action} {log.entityType}: <span className="text-blue-600">{log.entityName}</span>
                    </h4>
                    <span className="text-[10px] font-black uppercase text-gray-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {format(parseISO(log.timestamp), 'MMM dd, yyyy • hh:mm a')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{log.details}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center">
              <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <HistoryIcon className="h-8 w-8 text-slate-300" />
              </div>
              <h3 className="text-slate-900 font-bold">No history found</h3>
              <p className="text-gray-500 text-sm">Activities will appear here as you use the app.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
