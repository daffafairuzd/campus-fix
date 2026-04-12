import React, { useState, useEffect } from 'react';
import { Bell, Sun, Moon } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { getEcho } from '../../echo';

export default function Header() {
  const location = useLocation();
  const [showNotif, setShowNotif] = useState(false);
  const [isDark, setIsDark] = useState(true);
  
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Dynamic user data
  const user = JSON.parse(localStorage.getItem('user') || '{"name":"Admin"}');
  const firstName = user.name.split(' ')[0];

  const PAGE_META = {
    "/": { title: "Dashboard", subtitle: `Selamat datang kembali, ${firstName} 👋` },
    "/reports": { title: "Manajemen Laporan", subtitle: "Kelola dan pantau semua laporan kerusakan fasilitas" },
    "/assign": { title: "Assignment Teknisi", subtitle: "Tugaskan teknisi ke laporan yang membutuhkan penanganan" },
    "/analytics": { title: "Analytics & Laporan", subtitle: "Statistik, tren, dan kinerja sistem" },
    "/users": { title: "Manajemen User", subtitle: "Kelola akun admin, teknisi, dan pelapor" },
    "/sla": { title: "SLA Tracking", subtitle: "Pantau deadline perbaikan laporan aktif" },
  };

  const meta = PAGE_META[location.pathname] || { title: "Halaman Tidak Ditemukan", subtitle: "" };

  useEffect(() => {
    setIsDark(localStorage.getItem('theme') !== 'light');
    
    // Inisialisasi Real-time Echo Channel
    const echo = getEcho();
    if (echo) {
      // Dengarkan event update status dari channel "reports" (Public Channel)
      const channel = echo.channel('reports');
      channel.listen('.report.status.updated', (e) => {
         const newNotif = {
           id: Date.now(),
           title: "Status Laporan Diperbarui",
           report_number: e.report_number,
           message: `Laporan ${e.title} sekarang berstatus: ${e.status.replace('_', ' ').toUpperCase()}`,
           time: "Baru saja",
         };
         setNotifications(prev => [newNotif, ...prev]);
         setUnreadCount(prev => prev + 1);
      });
      
      // Cleanup
      return () => {
         channel.stopListening('.report.status.updated');
      };
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = isDark ? 'light' : 'dark';
    setIsDark(!isDark);
    localStorage.setItem('theme', nextTheme);
    if(nextTheme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  return (
    <header className="sticky top-0 z-50 bg-dark-card/80 backdrop-blur-md border-b border-dark-border px-7 py-3.5 flex items-center justify-between">
      <div>
        <h1 className="text-[18px] font-bold text-ui-text">{meta.title}</h1>
        {meta.subtitle && (
          <p className="text-xs text-ui-muted mt-0.5">{meta.subtitle}</p>
        )}
      </div>
      <div className="flex items-center gap-3">
        <button 
          className="p-2 text-ui-dim hover:text-ui-text transition-colors bg-transparent border-none cursor-pointer"
          onClick={toggleTheme}
          title={isDark ? "Ganti ke Light Mode" : "Ganti ke Dark Mode"}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
        <div className="relative border-l border-dark-border pl-3">
          <button 
            className="p-2 text-ui-dim hover:text-ui-text transition-colors bg-transparent border-none cursor-pointer relative"
            onClick={() => {
              setShowNotif(!showNotif);
              if (unreadCount > 0) {
                 setUnreadCount(0); // mark as read when opened
              }
            }}
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-ui-danger rounded-full border-2 border-dark-card animate-pulse-slow pointer-events-none"></span>}
          </button>
          
          {showNotif && (
            <div className="absolute right-0 top-12 w-80 bg-dark-card border border-dark-border rounded-xl shadow-2xl overflow-hidden animate-fade-in z-50">
               <div className="px-4 py-3 border-b border-dark-border bg-dark-hover flex justify-between items-center">
                 <span className="text-[13px] font-bold text-ui-text">Notifikasi Baru</span>
                 <span className="text-[10px] text-brand-primary cursor-pointer hover:underline" onClick={() => setNotifications([])}>Bersihkan</span>
               </div>
               <div className="flex flex-col max-h-64 overflow-y-auto custom-scrollbar">
                 {notifications.length === 0 ? (
                    <div className="p-4 text-center text-ui-muted text-xs">Belum ada notifikasi</div>
                 ) : notifications.map(n => (
                   <div key={n.id} className="px-4 py-3 border-b border-dark-border hover:bg-dark-bg transition-colors cursor-pointer">
                     <div className="text-[12px] font-semibold text-ui-text flex justify-between">
                       <span>{n.title}</span><span className="text-[10px] text-brand-primary">{n.report_number}</span>
                     </div>
                     <div className="text-[11px] text-ui-muted mt-1">{n.message}</div>
                     <div className="text-[9px] text-ui-dim mt-1.5">{n.time}</div>
                   </div>
                 ))}
               </div>
               <div className="px-4 py-2 border-t border-dark-border bg-dark-bg text-center cursor-pointer">
                 <span className="text-[11px] text-brand-primary font-medium">Lihat Semua</span>
               </div>
            </div>
          )}
        </div>
        <div className="text-xs text-ui-muted font-mono tracking-wide">
          {new Date().toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
        </div>
      </div>
    </header>
  );
}
