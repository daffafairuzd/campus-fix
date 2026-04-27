import React from 'react';
import { Search, Plus, Loader2 } from 'lucide-react';
import { Badge } from '../../components/ui';

const PRIORITY_WEIGHT = { kritis:4, tinggi:3, sedang:2, rendah:1, Kritis:4, Tinggi:3, Sedang:2, Rendah:1 };

export default function ReportList({ reportsData, isLoading, onAdd, onDetail }) {
  const [search, setSearch] = React.useState('');
  const [filterStatus, setFilterStatus] = React.useState('Semua');
  const [filterPriority, setFilterPriority] = React.useState('Semua');
  const [sortBy, setSortBy] = React.useState('Waktu Terbaru');

  const sorted = [...reportsData]
    .filter(r => {
      const q = search.toLowerCase();
      return (
        (r.title.toLowerCase().includes(q) || r.report_number.toLowerCase().includes(q) || r.location.toLowerCase().includes(q)) &&
        (filterStatus === 'Semua' || r.status.toLowerCase() === filterStatus.toLowerCase().replace(' ', '_')) &&
        (filterPriority === 'Semua' || r.priority.toLowerCase() === filterPriority.toLowerCase())
      );
    })
    .sort((a, b) => {
      if (sortBy === 'Waktu Terbaru') return new Date(b.created_at) - new Date(a.created_at);
      if (sortBy === 'Waktu Terlama') return new Date(a.created_at) - new Date(b.created_at);
      if (sortBy === 'Deadline Mendekat') return new Date(a.sla_deadline) - new Date(b.sla_deadline);
      if (sortBy === 'Prioritas Tertinggi') return (PRIORITY_WEIGHT[b.priority]||0) - (PRIORITY_WEIGHT[a.priority]||0);
      return 0;
    });

  return (
    <div className="flex flex-col gap-5">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-ui-muted" />
          <input className="input pl-9" placeholder="Cari laporan, ID, atau lokasi..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input w-[160px]" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          {['Semua','Menunggu','Dalam Proses','Selesai','Eskalasi'].map(s => <option key={s} className="bg-dark-bg">{s}</option>)}
        </select>
        <select className="input w-[140px]" value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
          {['Semua','Kritis','Tinggi','Sedang','Rendah'].map(p => <option key={p} className="bg-dark-bg">{p}</option>)}
        </select>
        <select className="input w-[180px]" value={sortBy} onChange={e => setSortBy(e.target.value)}>
          {['Waktu Terbaru','Waktu Terlama','Deadline Mendekat','Prioritas Tertinggi'].map(p => <option key={p} className="bg-dark-bg">{p}</option>)}
        </select>
        <button className="btn btn-primary" onClick={onAdd}>
          <Plus className="w-3.5 h-3.5" /> Tambah Laporan
        </button>
      </div>

      {/* Table */}
      <div className="card overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-dark-bg border-b border-dark-border">
              {['ID','Judul & Lokasi','Kategori','Prioritas','Status','Pelapor','SLA','Teknisi','Aksi'].map(h => (
                <th key={h} className="py-3 px-3.5 text-[10px] text-ui-muted font-bold tracking-wider uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan="9" className="text-center py-10"><Loader2 className="w-6 h-6 animate-spin mx-auto text-brand-primary" /></td></tr>
            ) : sorted.map(r => {
              const slaDate = new Date(r.sla_deadline);
              const now = new Date();
              const slaExpired = slaDate < now && r.status !== 'selesai';
              const slaNear = !slaExpired && (slaDate - now) < 86400000 * 2 && r.status !== 'selesai';
              const activeTechs = (r.active_technicians || []).map(t => t.name).join(', ');
              return (
                <tr key={r.id} className="border-b border-dark-border/40 last:border-0 hover:bg-dark-hover transition-colors">
                  <td className="py-3.5 px-3.5 font-mono text-[11px] text-brand-primary">{r.report_number}</td>
                  <td className="py-3.5 px-3.5">
                    <div className="text-[13px] text-ui-text font-medium">{r.title}</div>
                    <div className="text-[11px] text-ui-muted mt-1">📍 {r.location}{r.latitude && r.longitude && ' 🗺️'}</div>
                  </td>
                  <td className="py-3.5 px-3.5">
                    <span className="inline-flex px-2 py-0.5 rounded-md text-[11px] font-semibold bg-dark-border border border-dark-border/50 text-ui-dim">{r.category}</span>
                  </td>
                  <td className="py-3.5 px-3.5"><Badge label={r.priority} priority={r.priority} /></td>
                  <td className="py-3.5 px-3.5"><Badge label={r.status} status={r.status} /></td>
                  <td className="py-3.5 px-3.5 text-[12px] text-ui-dim">{r.reporter?.name || 'Pelapor'}</td>
                  <td className="py-3.5 px-3.5">
                    <div className={`text-[11px] font-mono ${slaExpired ? 'text-ui-danger font-semibold' : slaNear ? 'text-ui-warning' : 'text-ui-muted'}`}>
                      {slaExpired ? '⚠ ' : slaNear ? '⏰ ' : ''}{slaDate.toLocaleDateString('id-ID')}
                    </div>
                  </td>
                  <td className="py-3.5 px-3.5 text-[12px] text-ui-dim">
                    {activeTechs || <span className="text-ui-warning italic">Belum assign</span>}
                  </td>
                  <td className="py-3.5 px-3.5">
                    <button className="btn btn-ghost py-1.5 px-2.5 text-[11px]" onClick={() => onDetail(r)}>Detail</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!isLoading && sorted.length === 0 && (
          <div className="p-10 text-center text-ui-muted text-[13px]">Tidak ada laporan ditemukan.</div>
        )}
      </div>
    </div>
  );
}
