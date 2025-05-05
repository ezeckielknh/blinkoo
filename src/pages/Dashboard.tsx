import { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Menu, X, Home, Link as LinkIcon, QrCode, FileBox, CreditCard, User, ChevronRight, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import DashboardHome from '../components/dashboard/DashboardHome';
import LinksManager from '../components/dashboard/LinksManager';
import QRGenerator from '../components/dashboard/QRGenerator';
import FileManager from '../components/dashboard/FileManager';
import Subscription from '../components/dashboard/Subscription';
import Profile from '../components/dashboard/Profile';

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Liens', href: '/dashboard/links', icon: LinkIcon },
    { name: 'QR Codes', href: '/dashboard/qr', icon: QrCode },
    { name: 'Fichiers', href: '/dashboard/files', icon: FileBox },
    { name: 'Abonnements', href: '/dashboard/subscription', icon: CreditCard },
    { name: 'Profil', href: '/dashboard/profile', icon: User },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile menu button */}
      <button
        className="fixed top-4 left-4 z-50 md:hidden bg-card p-2 rounded-lg"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-6 border-b border-gray-800">
            <Link to="/" className="flex items-center">
              <svg className="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 5L21 12L13 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 12H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-xl font-bold ml-2">Blinkoo</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                    isActive(item.href)
                      ? 'bg-primary text-white'
                      : 'hover:bg-card/60'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon size={20} className="mr-3" />
                  <span>{item.name}</span>
                  {isActive(item.href) && <ChevronRight size={16} className="ml-auto" />}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-gray-800">
            <div className="flex items-center px-4 py-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </div>
              <button
                onClick={logout}
                className="ml-2 p-2 text-gray-400 hover:text-danger rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
            <div className="px-4 mt-2">
              <div className="flex items-center">
                <div className="text-xs font-medium uppercase tracking-wider text-gray-400">
                  Plan actuel
                </div>
                <span className="ml-2 px-2 py-1 text-xs font-medium bg-primary/20 text-primary rounded-full">
                  {user?.plan}
                </span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="md:ml-64 min-h-screen">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          <Routes>
            <Route index element={<DashboardHome />} />
            <Route path="links" element={<LinksManager />} />
            <Route path="qr" element={<QRGenerator />} />
            <Route path="files" element={<FileManager />} />
            <Route path="subscription" element={<Subscription />} />
            <Route path="profile" element={<Profile />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;