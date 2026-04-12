import React, { useState, useEffect } from 'react';
import { Avatar, Badge } from '../components/ui';
import { LineChart, Line, XAxis, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceArea, YAxis, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts';
import api from '../api';
import { Loader2 } from 'lucide-react';

const BarGraph = ({ data, xAxisValue }) => {
  const max = Math.max(1, ...data.map(d => Math.max(d.laporan, d.selesai)));
  
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
  
  const [weeklyData, setWeeklyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [overview, setOverview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [resWeekly, resMonthly, resTechs, resOverview] = await Promise.all([
        api.get('/analytics/weekly'),
        api.get('/analytics/monthly'),
        api.get('/analytics/technicians'),
        api.get('/analytics/overview')
      ]);
      setWeeklyData(resWeekly.data || []);
      setMonthlyData(resMonthly.data || []);
      setTechnicians(resTechs.data || []);
      setOverview(resOverview.data);
    } catch (err) {
      console.error("Gagal load analytics", err);
    } finally {
      setIsLoading(false);
    }
  };

  const chartData = period === 'Bulan Ini' ? weeklyData : monthlyData;
  const xAxis = period === 'Bulan Ini' ? 'day' : 'month';

  if (isLoading) {
    return <div className="p-10 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand-primary" /></div>;
  }

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
              <div className="text-[11px] text-ui-muted mt-1">Total {chartData.reduce((acc,curr) => acc + curr.laporan, 0)} laporan masuk ({period})</div>
           </div>
           <div className="flex gap-4 text-[11px] text-ui-muted">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-brand-primary shadow-[0_0_4px_rgba(220,38,38,0.5)]"></span> Laporan Masuk</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-ui-muted/50"></span> Diselesaikan</span>
           </div>
         </div>
         
         <BarGraph data={chartData} xAxisValue={xAxis} />
      </div>

      {/* Advanced Data Mining UI */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-2">
        
        {/* Forecasting Chart */}
        <div className="card p-6 border-brand-primary/20 bg-dark-card/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
          </div>
          <h3 className="text-[14px] font-bold text-ui-text mb-1">Time-Series Forecasting</h3>
          <p className="text-[11px] text-ui-muted mb-6">Prediksi lonjakan laporan 3 bulan ke depan (Mock Data)</p>
          
          <div className="h-48 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[
                { month: "Des", actual: 20 },
                { month: "Jan", actual: 45 },
                { month: "Feb", actual: 35 },
                { month: "Mar", actual: 50 },
                { month: "Apr", actual: 23, forecast: 23 },
                { month: "Mei", actual: null, forecast: 45 },
                { month: "Jun", actual: null, forecast: 58 },
                { month: "Jul", actual: null, forecast: 65 },
              ]} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" stroke="#6b7280" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis stroke="#6b7280" fontSize={10} axisLine={false} tickLine={false} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#1f242d', border: '1px solid #2e3643', borderRadius: '8px', fontSize: '11px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <ReferenceArea x1="Apr" x2="Jul" fill="#dc2626" fillOpacity={0.05} />
                <Line type="monotone" dataKey="actual" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} name="Faktual" />
                <Line type="monotone" dataKey="forecast" stroke="#dc2626" strokeWidth={3} strokeDasharray="5 5" dot={{ r: 4, fill: '#dc2626' }} name="Prediksi" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-4 mt-4 text-[10px] justify-center items-center">
            <span className="flex items-center gap-1.5 text-ui-dim"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Laporan Faktual</span>
            <span className="flex items-center gap-1.5 text-ui-dim"><span className="w-2 h-2 rounded-full bg-ui-danger"></span> Prediksi Tren (AI)</span>
          </div>
        </div>

        {/* Heatmap Kerusakan */}
        <div className="card p-6 border-ui-warning/20 bg-dark-card/50">
          <h3 className="text-[14px] font-bold text-ui-text mb-1">Spatial Heatmap Kategori</h3>
          <p className="text-[11px] text-ui-muted mb-4">Mendeteksi kerentanan fasilitas gedung terhadap jenis masalah (Mock Data)</p>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-spacing-1 border-separate">
              <thead>
                <tr>
                  <th className="p-2 text-[10px] text-ui-muted uppercase tracking-wider">Lokasi</th>
                  {['HVAC', 'Listrik', 'Plumbing', 'Lift'].map(h => <th key={h} className="p-2 text-[10px] text-ui-muted uppercase tracking-wider text-center">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {[
                  { loc: "TULT", data: [34, 8, 2, 15] },
                  { loc: "GKU", data: [14, 12, 25, 4] },
                  { loc: "Asrama", data: [8, 24, 30, 0] },
                  { loc: "Rektorat", data: [5, 3, 1, 2] },
                ].map(row => (
                  <tr key={row.loc}>
                    <td className="p-2 text-[11px] font-bold text-ui-dim">{row.loc}</td>
                    {row.data.map((val, i) => {
                      // Simple heatmap coloring
                      const intensity = val > 20 ? 'bg-ui-danger/80' : val > 10 ? 'bg-ui-warning/70' : val > 0 ? 'bg-ui-info/40' : 'bg-dark-hover';
                      const textColor = val > 10 ? 'text-white font-bold' : 'text-ui-muted';
                      return (
                        <td key={i} className={`p-2 text-center text-[11px] rounded ${intensity} ${textColor} transition-colors hover:brightness-125`}>
                          {val}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex gap-4 mt-5 text-[10px] justify-center items-center">
            <span className="flex items-center gap-1.5 text-ui-dim"><span className="w-3 h-3 rounded bg-dark-hover"></span> Jarang</span>
            <span className="flex items-center gap-1.5 text-ui-dim"><span className="w-3 h-3 rounded bg-ui-info/40"></span> Sesekali</span>
            <span className="flex items-center gap-1.5 text-ui-dim"><span className="w-3 h-3 rounded bg-ui-warning/70"></span> Sering</span>
            <span className="flex items-center gap-1.5 text-ui-dim"><span className="w-3 h-3 rounded bg-ui-danger/80 border border-ui-danger"></span> Kritis</span>
          </div>
        </div>

      </div>

      {/* KPI Tambahan: SLA, CSAT, Bottleneck */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-2">
        {/* SLA Donut Chart */}
        <div className="card p-5 border-ui-success/20 bg-dark-card/50">
          <h3 className="text-[13px] font-bold text-ui-text mb-1">SLA Hit vs Miss Ratio</h3>
          <p className="text-[10px] text-ui-muted mb-4">Ketepatan waktu penyelesaian laporan</p>
          <div className="h-40 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={[ { name: 'Tepat Waktu', value: 92 }, { name: 'Terlambat', value: 8 } ]} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={2} dataKey="value" stroke="none">
                  <Cell fill="#10b981" />
                  <Cell fill="#dc2626" />
                </Pie>
                <RechartsTooltip contentStyle={{ backgroundColor: '#1f242d', border: '1px solid #2e3643', borderRadius: '8px', fontSize: '11px' }} itemStyle={{ color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col">
               <span className="text-xl font-bold text-ui-success">92%</span>
               <span className="text-[9px] text-ui-muted uppercase tracking-widest mt-0.5">Tepat Waktu</span>
            </div>
          </div>
          <div className="flex gap-4 mt-2 text-[10px] justify-center items-center">
            <span className="flex items-center gap-1.5 text-ui-dim"><span className="w-2 h-2 rounded-full bg-ui-success"></span> Tepat Waktu (Hit)</span>
            <span className="flex items-center gap-1.5 text-ui-dim"><span className="w-2 h-2 rounded-full bg-ui-danger"></span> Terlambat (Miss)</span>
          </div>
        </div>

        {/* CSAT Bar Chart */}
        <div className="card p-5 border-brand-primary/20 bg-dark-card/50">
          <h3 className="text-[13px] font-bold text-ui-text mb-1">Customer Satisfaction</h3>
          <p className="text-[10px] text-ui-muted mb-2">Distribusi rating dari pelapor bulan ini</p>
          <div className="flex flex-col gap-2 mt-3">
             {[
               { rating: "5 Bintang", count: 120, pct: 85, color: "bg-brand-primary" },
               { rating: "4 Bintang", count: 15, pct: 10, color: "bg-ui-info" },
               { rating: "3 Bintang", count: 4, pct: 3, color: "bg-ui-warning" },
               { rating: "2 Bintang", count: 2, pct: 1.5, color: "bg-ui-danger/80" },
               { rating: "1 Bintang", count: 1, pct: 0.5, color: "bg-ui-danger" },
             ].map((r, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-[10px] text-ui-dim w-14">{r.rating}</span>
                  <div className="flex-1 h-3.5 bg-dark-bg rounded-md overflow-hidden border border-dark-border/50">
                    <div className={`h-full ${r.color} rounded-r-sm`} style={{ width: `${r.pct}%` }}></div>
                  </div>
                  <span className="text-[10px] text-ui-muted font-bold font-mono w-6 text-right">{r.count}</span>
                </div>
             ))}
          </div>
          <div className="text-[10px] text-center text-ui-muted mt-4">Rata-rata rating: <strong className="text-brand-primary text-[13px]">4.8 / 5.0</strong></div>
        </div>

        {/* Bottleneck Stacked Bar */}
        <div className="card p-5 border-ui-info/20 bg-dark-card/50">
          <h3 className="text-[13px] font-bold text-ui-text mb-1">Time to Resolve vs Response</h3>
          <p className="text-[10px] text-ui-muted mb-2">Analisis durasi rata-rata per fase (Jam)</p>
          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { category: "Listrik", waiting: 1.5, process: 4.2 },
                { category: "HVAC", waiting: 1.2, process: 7.5 },
                { category: "Plumbing", waiting: 2.0, process: 2.1 },
                { category: "Lift", waiting: 3.5, process: 6.0 },
              ]} margin={{ top: 10, right: 0, left: -25, bottom: 0 }} layout="horizontal">
                <XAxis dataKey="category" stroke="#6b7280" fontSize={9} axisLine={false} tickLine={false} />
                <YAxis stroke="#6b7280" fontSize={9} axisLine={false} tickLine={false} />
                <RechartsTooltip contentStyle={{ backgroundColor: '#1f242d', border: '1px solid #2e3643', borderRadius: '8px', fontSize: '11px' }} itemStyle={{ color: '#fff' }} formatter={(value) => `${value} Jam`} />
                <Bar dataKey="waiting" stackId="a" fill="#6b7280" name="Waktu Menunggu" radius={[0, 0, 2, 2]} />
                <Bar dataKey="process" stackId="a" fill="#f59e0b" name="Waktu Pengerjaan" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-4 mt-1 text-[10px] justify-center items-center">
            <span className="flex items-center gap-1.5 text-ui-dim"><span className="w-2 h-2 rounded-[2px] bg-[#6b7280]"></span> Menunggu (Admin)</span>
            <span className="flex items-center gap-1.5 text-ui-dim"><span className="w-2 h-2 rounded-[2px] bg-[#f59e0b]"></span> Pengerjaan (Teknisi)</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-5">
           <h3 className="text-[13px] font-bold text-ui-text mb-4">Top Pelapor (Mock)</h3>
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
             {technicians.slice(0,4).map(t => (
               <div key={t.name} className="flex items-center gap-3">
                 <Avatar initials={t.name.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase()} size={30} success={true} />
                 <div className="flex-1">
                   <div className="text-[11px] font-medium text-ui-text mb-1">{t.name.split(" ")[0]}</div>
                   <div className="h-1.5 bg-dark-border rounded-full overflow-hidden">
                     <div className="h-full bg-gradient-to-r from-brand-secondary to-brand-primary" style={{ width: `${Math.min((t.completed_count / 10) * 100, 100)}%` }}></div>
                   </div>
                 </div>
                 <span className="text-[10px] text-ui-muted font-mono w-4 text-right" title="Tugas Selesai">{t.completed_count}</span>
               </div>
             ))}
             {technicians.length === 0 && <div className="text-[11px] text-ui-muted text-center py-4">Belum ada data performa</div>}
           </div>
        </div>

        <div className="card p-5">
           <h3 className="text-[13px] font-bold text-ui-text mb-4">Status Laporan (Semua Riwayat)</h3>
           <div className="flex flex-col gap-3.5">
             {[
               {label:"Selesai", val:overview?.selesai || 0, color:"bg-ui-success", shadow:"shadow-[0_0_8px_rgba(16,185,129,0.3)]", text:"text-ui-success"},
               {label:"Dalam Proses", val:overview?.dalam_proses || 0, color:"bg-ui-info", text:"text-ui-info"},
               {label:"Menunggu", val:overview?.menunggu || 0, color:"bg-ui-warning", text:"text-ui-warning"},
               {label:"Eskalasi", val:overview?.eskalasi || 0, color:"bg-ui-danger", text:"text-ui-danger"},
             ].map(s => {
               const total = overview?.total_laporan || 1; 
               const pct = (s.val / total) * 100;
               return (
                 <div key={s.label}>
                   <div className="flex justify-between items-center mb-1.5">
                     <span className="text-[11px] font-medium text-ui-dim">{s.label}</span>
                     <span className={`text-[12px] font-bold font-mono ${s.text}`}>{s.val}</span>
                   </div>
                   <div className="h-1.5 bg-dark-border rounded-full overflow-hidden">
                     <div className={`h-full rounded-full ${s.color} ${s.shadow || ''}`} style={{ width: `${pct}%` }}></div>
                   </div>
                 </div>
               );
             })}
           </div>
        </div>
      </div>
    </div>
  );
}
