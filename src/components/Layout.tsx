import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  FileText, 
  Settings, 
  History,
  Menu,
  X,
  LogOut
} from 'lucide-react';

export const Layout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useStore((state) => state.logout);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Invoices', href: '/invoices', icon: FileText },
    { name: 'Inventory', href: '/inventory', icon: Package },
    { name: 'Customers', href: '/customers', icon: Users },
    { name: 'History', href: '/history', icon: History },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white fixed inset-y-0 shadow-2xl z-50 border-r border-white/5">
        <div className="p-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30">
              <FileText className="text-white h-6 w-6" />
            </div>
            <h1 className="text-xl font-black tracking-tighter">PRO<span className="text-blue-500">INVOICE</span></h1>
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center gap-3 px-4 py-3.5 text-sm font-bold rounded-xl transition-all duration-200 group ${
                isActive(item.href)
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon className={`h-5 w-5 transition-colors ${isActive(item.href) ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'}`} />
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 space-y-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-bold text-red-400 hover:text-white hover:bg-red-500/10 rounded-xl transition-all duration-200 group"
          >
            <LogOut className="h-5 w-5 group-hover:scale-110 transition-transform" />
            <span>Logout</span>
          </button>

          <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">Status</p>
            <div className="text-xs font-bold text-emerald-400 flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span>System Online</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center sticky top-0 z-50 shadow-lg border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <FileText className="text-white h-5 w-5" />
          </div>
          <h1 className="text-lg font-black tracking-tighter uppercase">Pro<span className="text-blue-500">Invoice</span></h1>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 bg-white/5 rounded-lg">
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-slate-900 p-4 pt-24 animate-in fade-in slide-in-from-top duration-300">
          <nav className="space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all ${
                  isActive(item.href) ? 'bg-blue-600 text-white' : 'text-slate-400 bg-white/5'
                }`}
              >
                <item.icon />
                {item.name}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-red-400 bg-white/5"
            >
              <LogOut />
              <span>Logout</span>
            </button>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-10 pt-8">
        <Outlet />
      </main>
    </div>
  );
};
