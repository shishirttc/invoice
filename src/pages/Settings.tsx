import React, { useState, useRef } from 'react';
import { useStore } from '../store/useStore';
import { Upload, X, Building2 } from 'lucide-react';

export const Settings: React.FC = () => {
  const { company, setCompany } = useStore();
  const [formData, setFormData] = useState(company);
  const [isSaved, setIsSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) { // 1MB Limit
        alert('Logo file size should be less than 1MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, logoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setFormData({ ...formData, logoUrl: '' });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCompany(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Company Settings</h1>

      <div className="bg-white shadow-sm rounded-xl border border-gray-100 p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Logo Upload Section */}
          <div className="space-y-4">
            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">Company Logo</label>
            <div className="flex items-center gap-8">
              <div className="relative group">
                <div className="w-32 h-32 rounded-2xl border-2 border-dashed border-gray-200 bg-slate-50 flex items-center justify-center overflow-hidden transition-all group-hover:border-blue-400">
                  {formData.logoUrl ? (
                    <img src={formData.logoUrl} alt="Company Logo" className="w-full h-full object-contain p-2" />
                  ) : (
                    <div className="text-center">
                      <Building2 className="mx-auto h-8 w-8 text-gray-300" />
                      <span className="text-[10px] font-bold text-gray-400 uppercase mt-1 block">No Logo</span>
                    </div>
                  )}
                </div>
                {formData.logoUrl && (
                  <button
                    type="button"
                    onClick={removeLogo}
                    className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center px-4 py-2 bg-slate-900 text-white text-xs font-black uppercase tracking-widest rounded-lg hover:bg-slate-800 transition-all shadow-md"
                >
                  <Upload className="mr-2 h-3.5 w-3.5" /> Upload Logo
                </button>
                <p className="text-[10px] text-gray-400 font-medium">PNG, JPG or WebP. Max 1MB.<br/>Recommended size: 512x512px</p>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleLogoUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-y-6 gap-x-6 sm:grid-cols-2 pt-6 border-t border-gray-100">
            <div className="sm:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-1">Company Name</label>
              <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-1">Business Address</label>
              <textarea rows={3} required value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Phone</label>
              <input type="text" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
              <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Website</label>
              <input type="text" value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Tax ID / VAT No.</label>
              <input type="text" value={formData.taxId} onChange={(e) => setFormData({ ...formData, taxId: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>

          <div className="flex justify-end items-center space-x-4 pt-6">
            {isSaved && <span className="text-sm font-bold text-emerald-600">Settings saved successfully!</span>}
            <button type="submit" className="inline-flex justify-center py-3 px-8 bg-blue-600 text-sm font-black uppercase tracking-widest text-white rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
