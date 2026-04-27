import React, { useState, useEffect } from 'react';
import { Badge } from '../components/ui';
import { LineChart, Line, XAxis, Tooltip as RechartsTooltip, ResponsiveContainer, YAxis, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
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
  const [overview, setOverview] = useState(null);
  const [advancedStats, setAdvancedStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData(period);
  }, [period]);

  const fetchData = async (p) => {
    const periodParam = p === 'Bulan Ini' ? 'bulan_ini' : 'tahun_ini';
    setIsLoading(true);
    try {
      const [resWeekly, resMonthly, resOverview, resAdvanced] = await Promise.all([
        api.get('/analytics/weekly'),
        api.get('/analytics/monthly'),
        api.get(`/analytics/overview?period=${periodParam}`),
        api.get(`/analytics/advanced-stats?period=${periodParam}`)
      ]);
      setWeeklyData(resWeekly.data || []);
      setMonthlyData(resMonthly.data || []);
      setOverview(resOverview.data);
      setAdvancedStats(resAdvanced.data);
    } catch (err) {
      console.error("Gagal load analytics", err);
    } finally {
      setIsLoading(false);
    }
  };

  const chartData = period === 'Bulan Ini' ? weeklyData : monthlyData;
  const xAxis = period === 'Bulan Ini' ? 'day' : 'month';

  // Tren data: Bulan Ini = weekly, Tahun Ini = monthly
  const trendData = period === 'Bulan Ini' ? weeklyData : monthlyData;
  const trendXKey = period === 'Bulan Ini' ? 'day' : 'month';
  const totalMasukTrend = trendData.reduce((acc, curr) => acc + curr.laporan, 0);
  const totalSelesaiTrend = trendData.reduce((acc, curr) => acc + curr.selesai, 0);

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

      {/* Tren Laporan (Faktual) */}
      <div className="card p-6 border-brand-primary/20 bg-dark-card/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-3 opacity-10">
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
        </div>
        <div className="flex justify-between items-end mb-6">
          <div>
            <h3 className="text-[14px] font-bold text-ui-text mb-1">{period === 'Bulan Ini' ? 'Tren Laporan Harian' : 'Tren Laporan Bulanan'}</h3>
            <p className="text-[11px] text-ui-muted">Data faktual {period === 'Bulan Ini' ? '7 hari terakhir' : '6 bulan terakhir'}</p>
          </div>
          <div className="flex gap-4 text-[10px] items-center">
            <span className="flex items-center gap-1.5 text-ui-dim"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Masuk ({totalMasukTrend})</span>
            <span className="flex items-center gap-1.5 text-ui-dim"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Selesai ({totalSelesaiTrend})</span>
          </div>
        </div>
        
        <div className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey={trendXKey} stroke="#6b7280" fontSize={10} axisLine={false} tickLine={false} />
              <YAxis stroke="#6b7280" fontSize={10} axisLine={false} tickLine={false} />
              <RechartsTooltip 
                contentStyle={{ backgroundColor: '#1f242d', border: '1px solid #2e3643', borderRadius: '8px', fontSize: '11px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Line type="monotone" dataKey="laporan" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} name="Laporan Masuk" />
              <Line type="monotone" dataKey="selesai" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} name="Selesai" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* KPI Tambahan: SLA, CSAT, Bottleneck */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-2">
        {/* SLA Donut Chart - DINAMIS */}
        <div className="card p-5 border-ui-success/20 bg-dark-card/50">
          <h3 className="text-[13px] font-bold text-ui-text mb-1">Rasio Ketepatan Waktu (SLA)</h3>
          <p className="text-[10px] text-ui-muted mb-4">Persentase laporan yang selesai sebelum deadline</p>
          <div className="h-40 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={advancedStats?.sla?.chart || []} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={2} dataKey="value" stroke="none">
                  <Cell fill="#10b981" />
                  <Cell fill="#dc2626" />
                </Pie>
                <RechartsTooltip contentStyle={{ backgroundColor: '#1f242d', border: '1px solid #2e3643', borderRadius: '8px', fontSize: '11px' }} itemStyle={{ color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col">
               <span className="text-xl font-bold text-ui-success">{advancedStats?.sla?.percentage}%</span>
               <span className="text-[9px] text-ui-muted uppercase tracking-widest mt-0.5">Tepat Waktu</span>
            </div>
          </div>
          <div className="flex gap-4 mt-2 text-[10px] justify-center items-center">
            <span className="flex items-center gap-1.5 text-ui-dim"><span className="w-2 h-2 rounded-full bg-ui-success"></span> Tepat Waktu</span>
            <span className="flex items-center gap-1.5 text-ui-dim"><span className="w-2 h-2 rounded-full bg-ui-danger"></span> Terlambat</span>
          </div>
        </div>

        {/* CSAT Bar Chart - DINAMIS */}
        <div className="card p-5 border-brand-primary/20 bg-dark-card/50">
          <h3 className="text-[13px] font-bold text-ui-text mb-1">Kepuasan Pelapor (CSAT)</h3>
          <p className="text-[10px] text-ui-muted mb-2">Distribusi rating dari database pelapor</p>
          <div className="flex flex-col gap-2 mt-3">
             {[5, 4, 3, 2, 1].map((rating) => {
                const item = advancedStats?.csat?.distribution?.find(d => parseInt(d.rating) === rating);
                const count = item ? parseInt(item.count) : 0;
                const total = advancedStats?.csat?.distribution?.reduce((acc, curr) => acc + parseInt(curr.count), 0) || 1;
                const pct = (count / total) * 100;
                const color = rating >= 4 ? "bg-brand-primary" : rating === 3 ? "bg-ui-warning" : "bg-ui-danger";
                
                return (
                  <div key={rating} className="flex items-center gap-3">
                    <span className="text-[10px] text-ui-dim w-14">{rating} Bintang</span>
                    <div className="flex-1 h-3.5 bg-dark-bg rounded-md overflow-hidden border border-dark-border/50">
                      <div className={`h-full ${color} rounded-r-sm`} style={{ width: `${pct}%` }}></div>
                    </div>
                    <span className="text-[10px] text-ui-muted font-bold font-mono w-6 text-right">{count}</span>
                  </div>
                );
             })}
          </div>
          <div className="text-[10px] text-center text-ui-muted mt-4">Rata-rata rating: <strong className="text-brand-primary text-[13px]">{advancedStats?.csat?.average || 0} / 5.0</strong></div>
        </div>

        {/* Bottleneck Bar Chart - DINAMIS */}
        <div className="card p-5 border-ui-info/20 bg-dark-card/50">
          <h3 className="text-[13px] font-bold text-ui-text mb-1">Analisis Durasi Penyelesaian</h3>
          <p className="text-[10px] text-ui-muted mb-2">Rata-rata waktu pengerjaan per kategori (Jam)</p>
          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={advancedStats?.bottlenecks || []} margin={{ top: 10, right: 0, left: -25, bottom: 0 }} layout="horizontal">
                <XAxis dataKey="category" stroke="#6b7280" fontSize={9} axisLine={false} tickLine={false} />
                <YAxis stroke="#6b7280" fontSize={9} axisLine={false} tickLine={false} domain={[0, 'auto']} />
                <RechartsTooltip contentStyle={{ backgroundColor: '#1f242d', border: '1px solid #2e3643', borderRadius: '8px', fontSize: '11px' }} itemStyle={{ color: '#fff' }} formatter={(value) => `${value} Jam`} />
                <Bar dataKey="process" fill="#f59e0b" name="Waktu Pengerjaan" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-4 mt-1 text-[10px] justify-center items-center">
            <span className="flex items-center gap-1.5 text-ui-dim"><span className="w-2 h-2 rounded-[2px] bg-[#f59e0b]"></span> Durasi Pengerjaan (Rata-rata Jam)</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Distribusi Prioritas Laporan */}
        <div className="card p-5 border-ui-warning/20 bg-dark-card/50">
          <h3 className="text-[13px] font-bold text-ui-text mb-1">Distribusi Prioritas Laporan</h3>
          <p className="text-[10px] text-ui-muted mb-4">Sebaran tingkat prioritas dari seluruh laporan</p>
          <div className="h-44 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={advancedStats?.priorities || []} 
                  cx="50%" cy="50%" 
                  innerRadius={45} outerRadius={68} 
                  paddingAngle={3} 
                  dataKey="value" 
                  stroke="none"
                >
                  {(advancedStats?.priorities || []).map((entry, idx) => {
                    const colorMap = { 'Kritis': '#dc2626', 'Tinggi': '#f59e0b', 'Sedang': '#3b82f6', 'Rendah': '#6b7280' };
                    return <Cell key={idx} fill={colorMap[entry.name] || '#6b7280'} />;
                  })}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#1f242d', border: '1px solid #2e3643', borderRadius: '8px', fontSize: '11px' }} 
                  itemStyle={{ color: '#fff' }}
                  formatter={(value, name) => [`${value} laporan`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col">
              <span className="text-xl font-bold text-ui-text">{overview?.total_laporan || 0}</span>
              <span className="text-[9px] text-ui-muted uppercase tracking-widest mt-0.5">Total</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-[10px] justify-center items-center">
            {[
              { label: 'Kritis', color: 'bg-ui-danger' },
              { label: 'Tinggi', color: 'bg-ui-warning' },
              { label: 'Sedang', color: 'bg-blue-500' },
              { label: 'Rendah', color: 'bg-ui-muted' },
            ].map(l => (
              <span key={l.label} className="flex items-center gap-1.5 text-ui-dim">
                <span className={`w-2 h-2 rounded-full ${l.color}`}></span> {l.label}
              </span>
            ))}
          </div>
        </div>

        {/* Status Laporan */}
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
