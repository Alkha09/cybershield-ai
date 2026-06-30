import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Shield, LayoutDashboard, Link2, Mail, MessageSquare,
  FileText, Camera, History, User, Settings, LogOut,
  ChevronDown, Search, Bell
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/scan/url', label: 'URL Scanner', icon: Link2 },
  { path: '/scan/email', label: 'Email Scanner', icon: Mail },
  { path: '/scan/sms', label: 'SMS Scanner', icon: MessageSquare },
  { path: '/scan/text', label: 'Text Scanner', icon: FileText },
  { path: '/scan/screenshot', label: 'Screenshot', icon: Camera },
  { path: '/history', label: 'History', icon: History },
];

const bottomNav = [
  { path: '/profile', label: 'Profile', icon: User },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-slate-200 flex flex-col fixed h-full z-40">
        {/* Logo */}
        <div className="h-14 px-4 flex items-center border-b border-slate-200">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-blue-600 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-slate-900">CyberShield</span>
          </Link>
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto py-3 px-3">
          <div className="text-[11px] font-medium text-slate-400 px-3 mb-1.5 uppercase tracking-wider">Scanning</div>
          <div className="space-y-0.5 mb-4">
            {navItems.map(item => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] transition-colors ${
                    active
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-[18px] h-[18px]" />
                  {item.label}
                </Link>
              );
            })}
          </div>
          <div className="text-[11px] font-medium text-slate-400 px-3 mb-1.5 uppercase tracking-wider">Account</div>
          <div className="space-y-0.5">
            {bottomNav.map(item => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] transition-colors ${
                    active
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-[18px] h-[18px]" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* User */}
        <div className="border-t border-slate-200 p-3">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2.5 w-full px-2 py-2 rounded-md hover:bg-slate-100 transition-colors text-left"
          >
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-xs font-semibold">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] text-slate-900 font-medium truncate">{user?.name}</div>
              <div className="text-[11px] text-slate-500 truncate">{user?.email}</div>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
          </button>
          {profileOpen && (
            <div className="mt-1 px-2">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-2 py-2 text-[13px] text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col ml-60 min-w-0">
        {/* Top bar */}
        <header className="h-12 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4 flex-1">
            <div className="flex items-center gap-2 bg-slate-100 rounded-md px-3 py-1.5 w-72">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                placeholder="Search scans, history..."
                className="bg-transparent outline-none text-[13px] text-slate-700 placeholder-slate-400 w-full"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        {/* Page */}
        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
