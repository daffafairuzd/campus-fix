import React from 'react';
import { FileText, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { REPORTS, WEEKLY, TECHNICIANS } from '../data';
import { Avatar, Badge } from '../components/ui';
import { AreaChart, Area, ResponsiveContainer } from 'recharts'; // Keeping this if you still want recharts, otherwise we'll build the mini chart

const StatCard = ({ label, value, sub, icon: IconCard, accentColor, trend, className }) => (
  <div className={`card overflow-hidden relative px-5 py-5 ${className}`}>
    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-brand-glow/30 pointer-events-none" style={{ background: `linear-gradient(135deg, transparent 60%, ${accentColor}15)` }}></div>
    <div className="flex items-start justify-between relative z-10">
      <div>
        <div className="text-xs text-ui-muted tracking-wider mb-2 font-semibold uppercase">{label}</div>
        <div className="text-[28px] font-bold text-ui-text leading-none">{value}</div>
        {sub && <div className="text-[11px] text-ui-muted mt-2">{sub}</div>}
        {trend && (
          <div className={`text-[11px] mt-1.5 ${trend > 0 ? "text-ui-success" : "text-ui-danger"}`}>
            {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}% dari batas waktu
          </div>
        )}
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
  const recentReports = REPORTS.slice(0, 5);
  const slaAlert = REPORTS.filter(r => r.status !== "Selesai" && new Date(r.sla) <= new Date("2026-04-05"));

  return (
    <div className="p-6 md:p-7 flex flex-col gap-6">
      {/* SLA Alert */}
      {slaAlert.length > 0 && (
        <div className="bg-ui-danger/10 border border-ui-danger/25 rounded-xl px-4 py-3 flex items-center gap-3">
          <AlertTriangle className="w-4 h-4 text-ui-danger flex-shrink-0" />
          <span className="text-[13px] text-red-300">
            <strong className="text-ui-danger font-bold">{slaAlert.length} laporan</strong> mendekati atau melewati batas SLA — segera tindak lanjuti!
          </span>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Laporan" value="56" sub="Bulan April 2026" icon={FileText} accentColor="#dc2626" />
        <StatCard label="Dalam Proses" value="12" sub="4 mendekati deadline" icon={Clock} accentColor="#f59e0b" trend={-5} />
        <StatCard label="Selesai" value="38" sub="SLA compliance 84%" icon={CheckCircle2} accentColor="#10b981" trend={8} />
        <StatCard label="Eskalasi" value="2" sub="Butuh perhatian segera!" icon={AlertTriangle} accentColor="#ef4444" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Weekly trend */}
        <div className="card p-5">
          <div className="flex justify-between mb-4 items-start">
            <div>
              <div className="text-[13px] font-semibold text-ui-text">Tren Laporan Mingguan</div>
              <div className="text-[11px] text-ui-muted">Laporan masuk vs diselesaikan</div>
            </div>
            <div className="flex gap-3 text-[10px] text-ui-muted items-center">
              <span className="flex items-center"><span className="dot bg-brand-primary mr-1" />Masuk</span>
              <span className="flex items-center"><span className="dot bg-ui-muted/50 mr-1" />Selesai</span>
            </div>
          </div>
          <MiniBarChart data={WEEKLY} dataKey="laporan" maxKey="selesai" />
        </div>

        {/* Category breakdown */}
        <div className="card p-5">
          <div className="text-[13px] font-semibold text-ui-text mb-4">Laporan per Kategori</div>
          <div className="flex flex-col gap-2.5">
            {[
              { cat: "HVAC", val: 18, pct: 32 },
              { cat: "Listrik", val: 14, pct: 25 },
              { cat: "Lab", val: 10, pct: 18 },
              { cat: "Jaringan", val: 8, pct: 14 },
              { cat: "Lainnya", val: 6, pct: 11 },
            ].map(c => (
              <div key={c.cat}>
                <div className="flex justify-between mb-1.5">
                  <span className="text-xs text-ui-dim">{c.cat}</span>
                  <span className="text-xs text-ui-muted font-mono">{c.val}</span>
                </div>
                <div className="h-1.5 bg-dark-border rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-brand-primary to-brand-secondary shadow-[0_0_8px_rgba(220,38,38,0.5)]"
                    style={{ width: `${c.pct}%` }}
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
            {recentReports.map(r => (
              <tr key={r.id} className="table-row border-b border-dark-border/50 last:border-0">
                <td className="py-3 px-3 font-mono text-[11px] text-brand-primary">{r.id}</td>
                <td className="py-3 px-3 text-[13px] text-ui-text">{r.title}</td>
                <td className="py-3 px-3">
                  <span className="inline-flex px-2 py-0.5 rounded-md text-[11px] font-semibold bg-dark-border border border-dark-border/50 text-ui-dim">
                    {r.category}
                  </span>
                </td>
                <td className="py-3 px-3"><Badge label={r.priority} priority={r.priority} /></td>
                <td className="py-3 px-3"><Badge label={r.status} status={r.status} /></td>
                <td className="py-3 px-3 text-[12px] text-ui-dim">
                  {r.technician ? r.technician : <span className="text-ui-muted italic">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Technician load */}
      <div className="card p-5">
        <div className="text-[13px] font-semibold text-ui-text mb-4">Beban Teknisi</div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {TECHNICIANS.map(t => (
            <div key={t.id} className="text-center p-3.5 bg-dark-bg rounded-xl border border-dark-border flex flex-col items-center">
              <Avatar initials={t.avatar} size={40} success={t.status === "Tersedia"} warning={t.status !== "Tersedia"} />
              <div className="text-[12px] font-semibold text-ui-text mt-2.5">{t.name.split(" ")[0]}</div>
              <div className="text-[10px] text-ui-muted mt-0.5">{t.active} tugas aktif</div>
              <div className="mt-2.5">
                 <Badge label={t.status} status={t.status === "Tersedia" ? "Selesai" : "Menunggu"} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
