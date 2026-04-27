import React, { useState, useEffect } from 'react';
import { Bell, Sun, Moon, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { getEcho } from '../../echo';
import api from '../../api';

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

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.unread_count);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  useEffect(() => {
    setIsDark(localStorage.getItem('theme') !== 'light');
    
    // Fetch real notifications from database
    if (localStorage.getItem('token')) {
        fetchNotifications();
    }
    
    // Inisialisasi Real-time Echo Channel
    const echo = getEcho();
    if (echo) {
      // Dengarkan event update status dari channel "reports" (Public Channel)
      const channel = echo.channel('reports');
      channel.listen('.report.status.updated', (e) => {
         const newNotif = {
           id: "temp_" + Date.now(), // dummy id
           title: "Status Laporan Diperbarui",
           report: { report_number: e.report_number },
           message: `Laporan ${e.title} sekarang berstatus: ${e.status.replace('_', ' ').toUpperCase()}`,
           created_at: new Date().toISOString(),
           is_read: false
         };
         setNotifications(prev => [newNotif, ...prev]);
         setUnreadCount(prev => prev + 1);
      });

      // Dengarkan event SLA Breached
      channel.listen('.report.sla.breached', (e) => {
         const newNotif = {
           id: "temp_sla_" + Date.now(),
           title: "SLA Laporan Terlewati",
           report: { report_number: e.report_number },
           message: `⚠️ Laporan ${e.title} telah melewati batas waktu SLA!`,
           created_at: new Date().toISOString(),
           is_read: false
         };
         setNotifications(prev => [newNotif, ...prev]);
         setUnreadCount(prev => prev + 1);
      });
      
      // Dengarkan event laporan baru
      channel.listen('.report.created', (e) => {
         const newNotif = {
           id: "temp_new_" + Date.now(),
           title: "Laporan Baru Masuk",
           report: { report_number: e.report_number },
           message: `Terdapat laporan baru: ${e.title} dari ${e.reporter_name}`,
           created_at: new Date().toISOString(),
           is_read: false
         };
         setNotifications(prev => [newNotif, ...prev]);
         setUnreadCount(prev => prev + 1);
      });
      
      // Listen to Private Channel for technician assignments if needed (Opsional)
      // echo.private(`user.${user.id}`).listen('.technician.assigned', (e) => {...})
      
      // Cleanup
      return () => {
         channel.stopListening('.report.status.updated');
         channel.stopListening('.report.sla.breached');
         channel.stopListening('.report.created');
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

  const handleMarkAllRead = async () => {
    try {
      await api.post('/notifications/read-all');
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.is_read && !String(notif.id).startsWith('temp_')) {
      try {
        await api.patch(`/notifications/${notif.id}/read`);
        setUnreadCount(prev => Math.max(0, prev - 1));
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
      } catch (err) {
        console.error("Failed to mark as read:", err);
      }
    } else if (!notif.is_read && String(notif.id).startsWith('temp_')) {
        // If it's a temporary socket notification, just clear it locally
        setUnreadCount(prev => Math.max(0, prev - 1));
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
    }
  };

  const handleDeleteNotification = async (e, notif) => {
    e.stopPropagation();
    if (String(notif.id).startsWith('temp_')) {
      setNotifications(prev => prev.filter(n => n.id !== notif.id));
      if (!notif.is_read) setUnreadCount(prev => Math.max(0, prev - 1));
      return;
    }
    
    try {
      await api.delete(`/notifications/${notif.id}`);
      setNotifications(prev => prev.filter(n => n.id !== notif.id));
      if (!notif.is_read) setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  const handleDeleteAllNotifications = async (e) => {
    e.stopPropagation();
    try {
      await api.delete('/notifications/delete-all');
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to delete all notifications:", err);
    }
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
            onClick={() => setShowNotif(!showNotif)}
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-ui-danger rounded-full border-2 border-dark-card animate-pulse-slow pointer-events-none"></span>}
          </button>
          
          {showNotif && (
            <div className="absolute right-0 top-12 w-80 bg-dark-card border border-dark-border rounded-xl shadow-2xl overflow-hidden animate-fade-in z-50">
               <div className="px-4 py-3 border-b border-dark-border bg-dark-hover flex justify-between items-center">
                 <span className="text-[13px] font-bold text-ui-text">Notifikasi Baru</span>
                 <div className="flex gap-3">
                   {notifications.length > 0 && (
                     <span className="text-[10px] text-ui-danger cursor-pointer hover:underline" onClick={handleDeleteAllNotifications}>Hapus Semua</span>
                   )}
                 </div>
               </div>
               <div className="flex flex-col max-h-64 overflow-y-auto custom-scrollbar">
                 {notifications.length === 0 ? (
                    <div className="p-4 text-center text-ui-muted text-xs">Belum ada notifikasi</div>
                 ) : notifications.map(n => (
                   <div 
                     key={n.id} 
                     onClick={() => handleNotificationClick(n)}
                     className={`px-4 py-3 border-b border-dark-border hover:bg-dark-hover transition-colors cursor-pointer ${!n.is_read ? 'bg-dark-bg/50' : ''}`}
                   >
                     <div className="text-[12px] font-semibold text-ui-text flex justify-between items-center">
                       <span className={!n.is_read ? 'text-brand-primary' : ''}>{n.title}</span>
                       <div className="flex items-center gap-2">
                         <span className="text-[10px] text-brand-primary/80">{n.report?.report_number || ''}</span>
                         <button onClick={(e) => handleDeleteNotification(e, n)} className="text-ui-muted hover:text-ui-danger p-1 -mr-1 rounded-md" title="Hapus Notifikasi"><X className="w-3.5 h-3.5" /></button>
                       </div>
                     </div>
                     <div className="text-[11px] text-ui-muted mt-1">{n.message}</div>
                     <div className="text-[9px] text-ui-dim mt-1.5">
                       {new Date(n.created_at).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                     </div>
                   </div>
                 ))}
               </div>
               <div className="px-4 py-2 border-t border-dark-border bg-dark-bg text-center cursor-pointer" onClick={handleMarkAllRead}>
                 <span className="text-[11px] text-brand-primary font-medium hover:underline">Tandai sudah dibaca</span>
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
