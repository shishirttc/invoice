import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import { Lock, FileText, AlertCircle } from 'lucide-react';

export const Login: React.FC = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const login = useStore((state) => state.login);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(password)) {
      navigate('/');
    } else {
      setError(true);
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl shadow-xl shadow-blue-600/30 mb-4">
            <FileText className="text-white h-8 w-8" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase">PRO<span className="text-blue-500">INVOICE</span></h1>
          <p className="text-slate-400 mt-2 font-medium">Invoice Management System</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="p-8 sm:p-10">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Secure Login</h2>
            <p className="text-slate-500 text-sm mb-8">Please enter your administrator password to continue.</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError(false);
                    }}
                    className={`w-full pl-12 pr-4 py-4 bg-slate-50 border ${
                      error ? 'border-red-500 ring-4 ring-red-500/10' : 'border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'
                    } rounded-2xl outline-none transition-all font-bold text-slate-900`}
                    placeholder="••••••••"
                  />
                </div>
                {error && (
                  <div className="mt-3 flex items-center gap-2 text-red-500 text-xs font-bold animate-shake">
                    <AlertCircle className="h-4 w-4" /> Incorrect password. Please try again.
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-slate-800 shadow-lg shadow-slate-900/20 transition-all active:scale-95"
              >
                Enter Dashboard
              </button>
            </form>
          </div>
          
          <div className="bg-slate-50 p-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> System Protected
            </p>
          </div>
        </div>
        
        <p className="text-center text-slate-500 text-xs mt-8 font-medium">
          Forgot password? Please contact system administrator.
        </p>
      </div>
    </div>
  );
};
