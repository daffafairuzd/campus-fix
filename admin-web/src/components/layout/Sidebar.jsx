import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, ClipboardList, BarChart2, Users, LogOut, Clock } from 'lucide-react';
import { Avatar } from '../ui';
import api from '../../api';

export default function Sidebar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{"name":"Admin", "role":"admin"}');
  const initials = user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  const [pendingCount, setPendingCount] = useState(0);

  // Fetch jumlah laporan menunggu untuk badge dinamis
  useEffect(() => {
    const fetchPending = async () => {
      try {
        const res = await api.get('/reports?status=menunggu');
        const data = res.data;
        const count = data.total ?? (Array.isArray(data.data) ? data.data.length : 0);
        setPendingCount(count);
      } catch { /* silent */ }
    };
    fetchPending();
    const interval = setInterval(fetchPending, 60000); // refresh tiap 60 detik
    return () => clearInterval(interval);
  }, []);

  const NAV = [
    { id: '/', label: 'Dashboard', icon: LayoutDashboard },
    { id: '/reports', label: 'Manajemen Laporan', icon: FileText, badge: pendingCount },
    { id: '/assign', label: 'Assignment Teknisi', icon: ClipboardList },
    { id: '/sla', label: 'SLA Tracking', icon: Clock },
    { id: '/analytics', label: 'Analytics', icon: BarChart2 },
    { id: '/users', label: 'Manajemen User', icon: Users },
  ];

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    navigate('/login');
  };

  return (
    <aside className="fixed left-0 top-0 w-[240px] h-screen bg-dark-card border-r border-dark-border flex flex-col z-[100]">
      {/* Logo */}
      <div className="px-[18px] py-[20px] pb-[16px] border-b border-dark-border">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-md flex items-center justify-center flex-shrink-0 overflow-hidden bg-white p-0.5 shadow-sm">
            <img src="/logo.png" alt="CampusFix" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="font-display font-bold text-[15px] text-brand-secondary leading-tight">
              Campus<span className="text-brand-primary">Fix</span>
            </div>
            <div className="text-[10px] text-ui-muted tracking-[0.2em] mt-0.5 font-medium">ADMIN PANEL</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="p-3 flex-1 flex flex-col gap-0.5 mt-2">
        {NAV.map((n) => (
          <NavLink
            key={n.id}
            to={n.id}
            className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
          >
            <n.icon className="w-4 h-4" />
            {n.label}
            {n.badge > 0 && (
              <span className="ml-auto bg-brand-primary/25 text-brand-secondary rounded-full text-[10px] font-bold px-[7px] py-[1px] border border-brand-primary/30">
                {n.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="px-3 py-3.5 border-t border-dark-border">
        <div className="flex items-center gap-2.5">
          <Avatar initials={initials} size={34} />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-ui-text whitespace-nowrap overflow-hidden text-ellipsis">{user.name}</div>
            <div className="text-[10px] text-ui-muted capitalize">{user.role || 'Administrator'}</div>
          </div>
          <button
            className="p-1.5 text-ui-muted hover:text-brand-primary transition-colors bg-transparent border-none outline-none cursor-pointer"
            title="Logout"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
