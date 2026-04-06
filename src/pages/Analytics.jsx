import React, { useState } from 'react';
import { WEEKLY, MONTHLY, TECHNICIANS } from '../data';
import { Avatar, Badge } from '../components/ui';

const BarGraph = ({ data, xAxisValue }) => {
  const max = Math.max(...data.map(d => Math.max(d.laporan, d.selesai)));
  
  return (
    <div className="flex h-64 items-end gap-3 mt-8">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center group relative h-full justify-end">
          {/* Tooltip */}
          <div className="absolute top-0 -mt-8 bg-dark-hover border border-dark-border text-ui-text text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-lg pointer-events-none">
             Masuk: <span className="font-bold text-brand-primary">{d.laporan}</span> | Selesai: <span className="font-bold text-ui-muted">{d.selesai}</span>
          </div>

          <div className="w-full flex justify-center gap-1 items-end flex-1 max-h-[80%]">
            <div 
              className="w-1/2 bg-gradient-to-t from-brand-primary to-brand-secondary rounded-t-sm relative shadow-[0_0_8px_rgba(220,38,38,0.3)] transition-all duration-300 min-h-[4px]"
              style={{ height: `${(d.laporan / max) * 100}%` }}
            ></div>
            <div 
              className="w-1/2 bg-ui-muted/30 rounded-t-sm transition-all duration-300 min-h-[4px]"
              style={{ height: `${(d.selesai / max) * 100}%` }}
            ></div>
          </div>
          <div className="text-[10px] text-ui-muted mt-3 uppercase tracking-widest">{d[xAxisValue]}</div>
        </div>
      ))}
    </div>
  );
};

export default function Analytics() {
  const [period, setPeriod] = useState('Bulan Ini');
  
  const chartData = period === 'Bulan Ini' ? WEEKLY : MONTHLY;
  const xAxis = period === 'Bulan Ini' ? 'day' : 'month';

  return (
    <div className="p-6 md:p-7 flex flex-col gap-6">
      <div className="flex justify-between items-center bg-dark-card p-4 rounded-xl border border-dark-border">
        <div>
          <h2 className="text-[15px] font-bold text-ui-text">Performa Penanganan Laporan</h2>
          <p className="text-[11px] text-ui-muted">Metrik ringkasan untuk {period.toLowerCase()}</p>
        </div>
        <div className="flex gap-2 p-1 bg-dark-bg rounded-lg border border-dark-border">
          {['Bulan Ini', 'Tahun Ini'].map(p => (
            <button 
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 rounded-md text-[11px] font-semibold transition-colors ${period === p ? 'bg-dark-hover text-brand-primary border border-brand-primary/20 shadow-[0_0_8px_rgba(220,38,38,0.1)]' : 'text-ui-muted hover:text-ui-text'}`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="card p-6">
         <div className="flex justify-between items-end mb-4">
           <div>
              <div className="text-[14px] font-bold text-ui-text">Laporan Masuk vs Terselesaikan</div>
              <div className="text-[11px] text-ui-muted mt-1">Total {chartData.reduce((acc,curr) => acc + curr.laporan, 0)} laporan masuk</div>
           </div>
           <div className="flex gap-4 text-[11px] text-ui-muted">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-brand-primary shadow-[0_0_4px_rgba(220,38,38,0.5)]"></span> Laporan Masuk</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-ui-muted/50"></span> Diselesaikan</span>
           </div>
         </div>
         
         <BarGraph data={chartData} xAxisValue={xAxis} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-5">
           <h3 className="text-[13px] font-bold text-ui-text mb-4">Top Pelapor</h3>
           <div className="flex flex-col gap-3">
             {[
               {name:"Ahmad Fauzi", count:8, img:"AF"},
               {name:"Siti Rahma", count:6, img:"SR"},
               {name:"Reza Alif", count:5, img:"RA"},
               {name:"Admin Ops", count:4, img:"AO"},
             ].map((u,i) => (
               <div key={u.name} className="flex items-center gap-3 p-2 rounded hover:bg-dark-bg transition-colors">
                 <span className="text-[11px] text-ui-muted w-3 text-right">{i+1}</span>
                 <Avatar initials={u.img} size={30} />
                 <span className="flex-1 text-[12px] font-medium text-ui-text">{u.name}</span>
                 <span className="text-[12px] font-bold font-mono text-brand-primary">{u.count}</span>
               </div>
             ))}
           </div>
        </div>

        <div className="card p-5">
           <h3 className="text-[13px] font-bold text-ui-text mb-4">Performa Teknisi</h3>
           <div className="flex flex-col gap-3">
             {TECHNICIANS.slice(0,4).map(t => (
               <div key={t.id} className="flex items-center gap-3">
                 <Avatar initials={t.avatar} size={30} success={true} />
                 <div className="flex-1">
                   <div className="text-[11px] font-medium text-ui-text mb-1">{t.name.split(" ")[0]}</div>
                   <div className="h-1.5 bg-dark-border rounded-full overflow-hidden">
                     <div className="h-full bg-gradient-to-r from-brand-secondary to-brand-primary" style={{ width: `${(t.completed / 35) * 100}%` }}></div>
                   </div>
                 </div>
                 <span className="text-[10px] text-ui-muted font-mono w-4 text-right">{t.completed}</span>
               </div>
             ))}
           </div>
        </div>

        <div className="card p-5">
           <h3 className="text-[13px] font-bold text-ui-text mb-4">Status Laporan (Bulan Ini)</h3>
           <div className="flex flex-col gap-3.5">
             {[
               {label:"Selesai", val:38, color:"bg-ui-success", shadow:"shadow-[0_0_8px_rgba(16,185,129,0.3)]", text:"text-ui-success"},
               {label:"Dalam Proses", val:12, color:"bg-ui-info", text:"text-ui-info"},
               {label:"Menunggu", val:4, color:"bg-ui-warning", text:"text-ui-warning"},
               {label:"Eskalasi", val:2, color:"bg-ui-danger", text:"text-ui-danger"},
             ].map(s => (
               <div key={s.label}>
                 <div className="flex justify-between items-center mb-1.5">
                   <span className="text-[11px] font-medium text-ui-dim">{s.label}</span>
                   <span className={`text-[12px] font-bold font-mono ${s.text}`}>{s.val}</span>
                 </div>
                 <div className="h-1.5 bg-dark-border rounded-full overflow-hidden">
                   <div className={`h-full rounded-full ${s.color} ${s.shadow || ''}`} style={{ width: `${(s.val / 56) * 100}%` }}></div>
                 </div>
               </div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
}
