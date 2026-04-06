import React from 'react';
import { Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { REPORTS } from '../data';
import { Badge } from '../components/ui';

export default function SlaTracking() {
  const activeReports = REPORTS.filter(r => r.status !== 'Selesai');
  
  // Simulated SLA calculations based on exact dates
  const now = new Date("2026-04-05T12:00:00");
  
  const slas = activeReports.map(r => {
    const slaDate = new Date(`${r.sla}T18:00:00`);
    const totalMs = slaDate - new Date(r.date);
    const passedMs = now - new Date(r.date);
    let percentage = (passedMs / totalMs) * 100;
    
    if (percentage > 100) percentage = 100;
    if (percentage < 0) percentage = 0;

    let warningLevel = 'safe'; // green
    if (percentage > 75) warningLevel = 'warning'; // yellow
    if (percentage > 95) warningLevel = 'danger'; // red
    if (slaDate < now) warningLevel = 'expired'; // flash red

    // mock hours left
    let hoursLeft = Math.round((slaDate - now) / (1000 * 60 * 60));
    let timeText = hoursLeft > 24 ? `${Math.floor(hoursLeft/24)} Hari` : `${hoursLeft} Jam`;
    if (hoursLeft < 0) timeText = `Telat ${Math.abs(hoursLeft)} Jam`;

    return { ...r, percentage, warningLevel, timeText };
  });

  return (
    <div className="p-6 md:p-7 flex flex-col gap-6">
      <div className="flex justify-between items-end mb-2">
        <div>
          <h1 className="text-xl font-bold text-ui-text flex items-center gap-2">
             <Clock className="text-brand-primary" /> Service Level Agreement (SLA)
          </h1>
          <p className="text-xs text-ui-muted mt-1">Pantau sisa waktu perbaikan sesuai prioritas layanan fasilitas</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
         <div className="card p-5 bg-dark-hover border-ui-success/20">
           <div className="text-[11px] text-ui-muted font-bold tracking-widest mb-2 flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-ui-success"/> SLA TERPENUHI (BULAN INI)</div>
           <div className="text-3xl font-bold text-ui-text">84<span className="text-lg text-ui-muted">%</span></div>
         </div>
         <div className="card p-5 bg-dark-hover border-ui-warning/20">
           <div className="text-[11px] text-ui-muted font-bold tracking-widest mb-2 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-ui-warning"/> MENDEKATI BATAS (&lt;24 JAM)</div>
           <div className="text-3xl font-bold text-ui-text">{slas.filter(s => s.warningLevel === 'warning' || s.warningLevel === 'danger').length}</div>
         </div>
         <div className="card p-5 bg-dark-hover border-ui-danger/20">
           <div className="text-[11px] text-ui-muted font-bold tracking-widest mb-2 flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5 text-ui-danger"/> MELEWATI BATAS (EXPIRED)</div>
           <div className="text-3xl font-bold text-ui-danger">{slas.filter(s => s.warningLevel === 'expired').length}</div>
         </div>
      </div>

      <div className="card p-6">
         <h2 className="text-[14px] font-bold text-ui-text mb-4">Tracking Aktif Berjalan</h2>
         
         <div className="flex flex-col gap-4">
           {slas.sort((a,b) => b.percentage - a.percentage).map(sla => (
             <div key={sla.id} className="p-4 bg-dark-bg border border-dark-border rounded-xl">
               <div className="flex justify-between items-start mb-3">
                 <div>
                   <div className="flex items-center gap-2 mb-1">
                     <span className="font-mono text-[11px] text-brand-primary">{sla.id}</span>
                     <Badge label={sla.priority} priority={sla.priority} />
                   </div>
                   <div className="text-[13px] font-bold text-ui-text">{sla.title}</div>
                   <div className="text-[11px] text-ui-dim mt-0.5">Teknisi: <span className="text-ui-muted">{sla.technician || 'Belum assign'}</span></div>
                 </div>
                 <div className="text-right">
                   <div className={`text-[13px] font-bold ${sla.warningLevel === 'expired' ? 'text-ui-danger animate-pulse' : sla.warningLevel === 'danger' ? 'text-ui-danger' : sla.warningLevel === 'warning' ? 'text-ui-warning' : 'text-ui-success'}`}>
                     {sla.timeText}
                   </div>
                   <div className="text-[10px] text-ui-muted font-mono mt-0.5">Deadline: {sla.sla}</div>
                 </div>
               </div>

               <div className="h-2.5 w-full bg-dark-border rounded-full overflow-hidden">
                 <div 
                   className={`h-full rounded-full transition-all duration-1000 relative ${sla.warningLevel === 'expired' ? 'bg-ui-danger' : sla.warningLevel === 'danger' ? 'bg-ui-danger' : sla.warningLevel === 'warning' ? 'bg-ui-warning' : 'bg-ui-success'}`}
                   style={{ width: `${sla.percentage}%` }}
                 >
                   {sla.warningLevel === 'expired' && (
                     <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                   )}
                 </div>
               </div>
               
               <div className="flex justify-between mt-1.5 text-[10px] font-mono text-ui-muted bg-transparent">
                 <span>0%</span>
                 <span>SLA Capacity: {Math.round(sla.percentage)}%</span>
                 <span>100%</span>
               </div>
             </div>
           ))}
         </div>
      </div>
    </div>
  );
}
