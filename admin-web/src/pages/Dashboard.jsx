import React, { useState, useEffect } from 'react';
import { FileText, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Avatar, Badge } from '../components/ui';
import api from '../api';

const StatCard = ({ label, value, sub, icon: IconCard, accentColor, trend, className }) => (
  <div className={`card overflow-hidden relative px-5 py-5 ${className}`}>
    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-brand-glow/30 pointer-events-none" style={{ background: `linear-gradient(135deg, transparent 60%, ${accentColor}15)` }}></div>
    <div className="flex items-start justify-between relative z-10">
      <div>
        <div className="text-xs text-ui-muted tracking-wider mb-2 font-semibold uppercase">{label}</div>
        <div className="text-[28px] font-bold text-ui-text leading-none">{value}</div>
        {sub && <div className="text-[11px] text-ui-muted mt-2">{sub}</div>}
      </div>
      <div 
        className="w-[42px] h-[42px] rounded-xl flex items-center justify-center border"
        style={{ backgroundColor: `${accentColor}18`, borderColor: `${accentColor}30`, color: accentColor }}
      >
        <IconCard size={20} />
      </div>
    </div>
    <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-xl" style={{ background: `linear-gradient(90deg, ${accentColor}, transparent)` }}></div>
  </div>
);

const MiniBarChart = ({ data, dataKey, maxKey }) => {
  const max = Math.max(...data.map(d => Math.max(d[dataKey] || 0, d[maxKey] || 0)));
  if (!max) return <div className="h-20 flex items-center justify-center text-[10px] text-ui-muted">Tidak ada data</div>;
  
  return (
    <div className="flex items-end gap-1.5 h-20">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full flex flex-col gap-0.5 h-[60px] justify-end relative">
            {maxKey && (
              <div 
                className="w-full bg-ui-muted/20 rounded-t-sm min-h-[2px] absolute bottom-0 left-0" 
                style={{ height: `${(d[maxKey] / max) * 100}%` }}
              ></div>
            )}
            <div 
              className="w-full bg-gradient-to-b from-brand-primary to-brand-primary/50 rounded-t-sm min-h-[3px] shadow-[0_0_8px_rgba(220,38,38,0.4)] absolute bottom-0 left-0 z-10"
              style={{ height: `${(d[dataKey] / max) * 100}%` }}
            ></div>
          </div>
          <div className="text-[9px] text-ui-muted tracking-widest">{d.day || d.month}</div>
        </div>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const [overview, setOverview] = useState(null);
  const [weekly, setWeekly] = useState([]);
  const [categories, setCategories] = useState([]);
  const [recentReports, setRecentReports] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resOverview, resWeekly, resCats, resReports, resTechs] = await Promise.all([
          api.get('/analytics/overview'),
          api.get('/analytics/weekly'),
          api.get('/analytics/categories'),
          api.get('/reports?sort_by=created_at&sort_dir=desc'),
          api.get('/technicians')
        ]);
        
        setOverview(resOverview.data);
        setWeekly(resWeekly.data.reverse()); // Ensure chronological order if necessary
        setCategories(resCats.data);
        setRecentReports(resReports.data.data.slice(0, 5)); // top 5
        setTechnicians(resTechs.data.slice(0, 5)); // top 5 techs
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading || !overview) {
    return <div className="p-10 text-center text-ui-muted">Memuat data analytic...</div>;
  }

  return (
    <div className="p-6 md:p-7 flex flex-col gap-6 animate-fade-in">
      {/* SLA Alert */}
      {overview.sla_alert > 0 && (
        <div className="bg-ui-danger/10 border border-ui-danger/25 rounded-xl px-4 py-3 flex items-center gap-3">
          <AlertTriangle className="w-4 h-4 text-ui-danger flex-shrink-0" />
          <span className="text-[13px] text-red-300">
            <strong className="text-ui-danger font-bold">{overview.sla_alert} laporan</strong> mendekati atau melewati batas SLA — segera tindak lanjuti!
          </span>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Laporan" value={overview.total_laporan} sub="Bulan Ini" icon={FileText} accentColor="#dc2626" />
        <StatCard label="Dalam Proses" value={overview.dalam_proses} sub="Sedang dikerjakan" icon={Clock} accentColor="#f59e0b" />
        <StatCard label="Selesai" value={overview.selesai} sub={`SLA compliance ${overview.sla_compliance}%`} icon={CheckCircle2} accentColor="#10b981" />
        <StatCard label="Eskalasi" value={overview.eskalasi} sub="Perlu Vendor Eksternal" icon={AlertTriangle} accentColor="#ef4444" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Weekly trend */}
        <div className="card p-5">
          <div className="flex justify-between mb-4 items-start">
            <div>
              <div className="text-[13px] font-semibold text-ui-text">Tren Laporan Mingguan</div>
              <div className="text-[11px] text-ui-muted">7 Hari Terakhir</div>
            </div>
            <div className="flex gap-3 text-[10px] text-ui-muted items-center">
              <span className="flex items-center"><span className="dot bg-brand-primary mr-1" />Masuk</span>
              <span className="flex items-center"><span className="dot bg-ui-muted/50 mr-1" />Selesai</span>
            </div>
          </div>
          <MiniBarChart data={weekly} dataKey="laporan" maxKey="selesai" />
        </div>

        {/* Category breakdown */}
        <div className="card p-5">
          <div className="text-[13px] font-semibold text-ui-text mb-4">Laporan per Kategori (Bulan Ini)</div>
          <div className="flex flex-col gap-2.5">
            {categories.length === 0 ? <div className="text-[11px] text-ui-muted text-center py-4">Belum ada data</div> : 
              categories.map(c => (
              <div key={c.category}>
                <div className="flex justify-between mb-1.5">
                  <span className="text-xs text-ui-dim">{c.category}</span>
                  <span className="text-xs text-ui-muted font-mono">{c.total}</span>
                </div>
                <div className="h-1.5 bg-dark-border rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-brand-primary to-brand-secondary shadow-[0_0_8px_rgba(220,38,38,0.5)]"
                    style={{ width: `${c.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent reports */}
      <div className="card p-5 overflow-x-auto">
        <div className="text-[13px] font-semibold text-ui-text mb-4">Laporan Terbaru</div>
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-dark-border">
              {["ID", "Judul", "Kategori", "Prioritas", "Status", "Teknisi"].map(h => (
                <th key={h} className="py-2 px-3 text-[11px] text-ui-muted font-semibold tracking-wider uppercase bg-dark-bg/50">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recentReports.length === 0 ? <tr><td colSpan="6" className="text-center py-4 text-ui-muted text-[11px]">Belum ada laporan.</td></tr> : recentReports.map(r => {
              const techs = r.active_technicians?.map(t => t.name).join(', ');
              return (
                <tr key={r.id} className="table-row border-b border-dark-border/50 last:border-0 hover:bg-dark-hover">
                  <td className="py-3 px-3 font-mono text-[11px] text-brand-primary">{r.report_number}</td>
                  <td className="py-3 px-3 text-[13px] text-ui-text">{r.title}</td>
                  <td className="py-3 px-3">
                    <span className="inline-flex px-2 py-0.5 rounded-md text-[11px] font-semibold bg-dark-border border border-dark-border/50 text-ui-dim">
                      {r.category}
                    </span>
                  </td>
                  <td className="py-3 px-3"><Badge label={r.priority} priority={r.priority} /></td>
                  <td className="py-3 px-3"><Badge label={r.status} status={r.status} /></td>
                  <td className="py-3 px-3 text-[12px] text-ui-dim">
                    {techs ? techs : <span className="text-ui-muted italic">—</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Technician load */}
      <div className="card p-5">
        <div className="text-[13px] font-semibold text-ui-text mb-4">Kesiapan Teknisi</div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {technicians.length === 0 ? <div className="text-[11px] text-ui-muted col-span-5 text-center">Belum ada teknisi data</div> : technicians.map(t => (
            <div key={t.id} className="text-center p-3.5 bg-dark-bg rounded-xl border border-dark-border flex flex-col items-center group relative overflow-hidden">
              <Avatar initials={t.avatar} size={40} success={t.workload_status === "Tersedia"} warning={t.workload_status !== "Tersedia" && t.workload_status !== "Cuti"} muted={t.workload_status === "Cuti"} />
              <div className="text-[12px] font-semibold text-ui-text mt-2.5 truncate w-full">{t.name.split(" ")[0]}</div>
              <div className="text-[10px] text-ui-muted mt-0.5">{t.active_count}/{t.max_capacity} tugas</div>
              <div className="mt-2.5">
                 <Badge label={t.workload_status} status={t.workload_status === "Tersedia" ? "Selesai" : (t.workload_status === "Cuti" ? "Cuti" : "Menunggu")} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
