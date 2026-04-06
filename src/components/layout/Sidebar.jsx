import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, ClipboardList, BarChart2, Users, LogOut, Clock } from 'lucide-react';
import { Avatar } from '../ui';

const NAV = [
  { id: "/", label: "Dashboard", icon: LayoutDashboard },
  { id: "/reports", label: "Manajemen Laporan", icon: FileText, badge: 3 },
  { id: "/assign", label: "Assignment Teknisi", icon: ClipboardList },
  { id: "/sla", label: "SLA Tracking", icon: Clock },
  { id: "/analytics", label: "Analytics", icon: BarChart2 },
  { id: "/users", label: "Manajemen User", icon: Users },
];

export default function Sidebar() {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    navigate('/login');
  };
  return (
    <aside className="fixed left-0 top-0 w-[240px] h-screen bg-dark-card border-r border-dark-border flex flex-col z-[100]">
      {/* Logo */}
      <div className="px-[18px] py-[20px] pb-[16px] border-b border-dark-border">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center shadow-[0_0_16px_rgba(220,38,38,0.15)] flex-shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-white">
               <path d="M12 3L1 9l4 2.18V17h2v-4.82L12 15l11-6-11-6zm6.18 6L12 12.72 5.82 9 12 5.28 18.18 9zM17 16l-5 3-5-3v2l5 3 5-3v-2z" />
            </svg>
          </div>
          <div>
            <div className="font-bold text-[15px] text-ui-text leading-tight">
              Campus<span className="text-brand-primary">Fix</span>
            </div>
            <div className="text-[10px] text-ui-muted tracking-widest mt-0.5">ADMIN PANEL</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="p-3 flex-1 flex flex-col gap-0.5 mt-2">
        {NAV.map((n) => (
          <NavLink
            key={n.id}
            to={n.id}
            className={({ isActive }) =>
              `sidebar-item ${isActive ? "active" : ""}`
            }
          >
             <n.icon className="w-4 h-4" />
             {n.label}
             {n.badge && (
               <span className="ml-auto bg-ui-danger text-white rounded-full text-[10px] font-bold px-[7px] py-[1px]">
                 {n.badge}
               </span>
             )}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="px-3 py-3.5 border-t border-dark-border">
        <div className="flex items-center gap-2.5">
          <Avatar initials="MR" size={34} />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-ui-text whitespace-nowrap overflow-hidden text-ellipsis">Muhammad Ragil</div>
            <div className="text-[10px] text-ui-muted">Administrator</div>
          </div>
          <button 
            className="p-1.5 text-ui-dim hover:text-brand-primary transition-colors bg-transparent border-none outline-none cursor-pointer" 
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
