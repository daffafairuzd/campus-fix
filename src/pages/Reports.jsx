import React, { useState } from 'react';
import { Search, Plus, X, Upload, Trash2 } from 'lucide-react';
import { REPORTS } from '../data';
import { Badge } from '../components/ui';

export default function Reports() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [filterPriority, setFilterPriority] = useState("Semua");
  const [sortBy, setSortBy] = useState("Waktu Terbaru");
  const [selectedReport, setSelectedReport] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [reportsData, setReportsData] = useState(REPORTS);
  
  // Modal Tabs State
  const [activeTab, setActiveTab] = useState('Detail'); // 'Detail' | 'Foto Bukti' | 'Riwayat'

  const filtered = reportsData.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = r.title.toLowerCase().includes(q) || r.id.toLowerCase().includes(q) || r.location.toLowerCase().includes(q);
    const matchStatus = filterStatus === "Semua" || r.status === filterStatus;
    const matchPriority = filterPriority === "Semua" || r.priority === filterPriority;
    return matchSearch && matchStatus && matchPriority;
  });

  const sortedAndFiltered = [...filtered].sort((a, b) => {
    if (sortBy === "Waktu Terbaru") {
      return new Date(b.date) - new Date(a.date);
    } else if (sortBy === "Waktu Terlama") {
      return new Date(a.date) - new Date(b.date);
    } else if (sortBy === "Deadline Mendekat") {
      return new Date(a.sla) - new Date(b.sla);
    } else if (sortBy === "Prioritas Tertinggi") {
      const pMap = { "Kritis": 3, "Tinggi": 2, "Minor": 1 };
      return (pMap[b.priority] || 0) - (pMap[a.priority] || 0);
    }
    return 0;
  });

  const handleAddReport = (e) => {
    e.preventDefault();
    const newId = `RPT-${String(reportsData.length + 1).padStart(3, '0')}`;
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;

    const newReport = {
      id: newId,
      title: e.target.title.value,
      description: e.target.description.value,
      category: e.target.category.value,
      location: e.target.location.value,
      status: "Menunggu",
      priority: e.target.priority.value,
      reporter: "Muhammad Ragil",
      date: formattedDate,
      technician: null,
      sla: "2026-04-07",
      rating: null,
      history: [
        { title: "Laporan dibuat", date: formattedDate, user: "Muhammad Ragil" }
      ]
    };
    setReportsData([newReport, ...reportsData]);
    setShowAddForm(false);
  };

  const handleUpdateStatus = () => {
    if(!selectedReport) return;
    
    let nextStatus = selectedReport.status;
    if(nextStatus === "Menunggu") nextStatus = "Dalam Proses";
    else if(nextStatus === "Dalam Proses") nextStatus = "Selesai";
    else nextStatus = "Menunggu";

    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;

    const newHistoryEntry = {
      title: `Status diubah menjadi: ${nextStatus}`,
      date: formattedDate,
      user: "Admin"
    };

    setReportsData(prev => prev.map(r => 
      r.id === selectedReport.id 
        ? { ...r, status: nextStatus, history: [...(r.history || []), newHistoryEntry] } 
        : r
    ));
    setSelectedReport(prev => ({ ...prev, status: nextStatus, history: [...(prev.history || []), newHistoryEntry] }));
  };

  const openModal = (r) => {
    setSelectedReport(r);
    setActiveTab('Detail');
  };

  return (
    <div className="p-6 md:p-7 flex flex-col gap-5 relative">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-ui-muted" />
          <input 
            className="input pl-9" 
            placeholder="Cari laporan, ID, atau lokasi..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
        </div>
        <select className="input w-[160px]" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          {["Semua", "Menunggu", "Dalam Proses", "Selesai", "Eskalasi"].map(s => <option key={s} className="bg-dark-bg">{s}</option>)}
        </select>
        <select className="input w-[140px]" value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
          {["Semua", "Kritis", "Tinggi", "Minor"].map(p => <option key={p} className="bg-dark-bg">{p}</option>)}
        </select>
        <select className="input w-[160px]" value={sortBy} onChange={e => setSortBy(e.target.value)}>
          {["Waktu Terbaru", "Waktu Terlama", "Deadline Mendekat", "Prioritas Tertinggi"].map(p => <option key={p} className="bg-dark-bg">{p}</option>)}
        </select>
        <button className="btn btn-primary" onClick={() => setShowAddForm(true)}>
          <Plus className="w-3.5 h-3.5" /> Tambah Laporan
        </button>
      </div>

      {/* Table */}
      <div className="card overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-dark-bg border-b border-dark-border">
              {["ID", "Judul & Lokasi", "Kategori", "Prioritas", "Status", "Pelapor", "SLA", "Teknisi", "Aksi"].map(h => (
                <th key={h} className="py-3 px-3.5 text-[10px] text-ui-muted font-bold tracking-wider uppercase">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedAndFiltered.map(r => {
              const slaDate = new Date(r.sla);
              const now = new Date("2026-04-05");
              const slaExpired = slaDate < now && r.status !== "Selesai";
              const slaNear = !slaExpired && (slaDate - now) < 86400000 * 2 && r.status !== "Selesai";
              return (
                <tr key={r.id} className="table-row border-b border-dark-border/40 last:border-0 cursor-pointer hover:bg-dark-hover transition-colors">
                  <td className="py-3.5 px-3.5 font-mono text-[11px] text-brand-primary">{r.id}</td>
                  <td className="py-3.5 px-3.5">
                    <div className="text-[13px] text-ui-text font-medium">{r.title}</div>
                    <div className="text-[11px] text-ui-muted mt-1">📍 {r.location}</div>
                  </td>
                  <td className="py-3.5 px-3.5">
                     <span className="inline-flex px-2 py-0.5 rounded-md text-[11px] font-semibold bg-dark-border border border-dark-border/50 text-ui-dim">
                        {r.category}
                     </span>
                  </td>
                  <td className="py-3.5 px-3.5"><Badge label={r.priority} priority={r.priority} /></td>
                  <td className="py-3.5 px-3.5"><Badge label={r.status} status={r.status} /></td>
                  <td className="py-3.5 px-3.5 text-[12px] text-ui-dim">{r.reporter}</td>
                  <td className="py-3.5 px-3.5">
                    <div className={`text-[11px] font-mono ${slaExpired ? 'text-ui-danger font-semibold' : slaNear ? 'text-ui-warning' : 'text-ui-muted'}`}>
                      {slaExpired ? "⚠ " : slaNear ? "⏰ " : ""}{r.sla}
                    </div>
                  </td>
                  <td className="py-3.5 px-3.5 text-[12px] text-ui-dim">
                     {r.technician || <span className="text-ui-warning italic">Belum assign</span>}
                  </td>
                  <td className="py-3.5 px-3.5">
                    <button 
                      className="btn btn-ghost py-1.5 px-2.5 text-[11px]"
                      onClick={() => openModal(r)}
                    >
                      Detail
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {sortedAndFiltered.length === 0 && (
          <div className="p-10 text-center text-ui-muted text-[13px]">Tidak ada laporan ditemukan.</div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-dark-bg/80 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedReport(null)}>
          <div className="bg-dark-card border border-dark-border rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="px-6 py-5 flex justify-between items-start bg-dark-hover">
              <div>
                <div className="font-mono text-[12px] text-brand-primary font-bold">{selectedReport.id}</div>
                <div className="font-bold text-ui-text text-[20px] mt-1">{selectedReport.title}</div>
              </div>
              <button className="text-ui-dim hover:text-ui-text p-1 bg-dark-bg rounded-md border border-dark-border transition-colors hover:bg-dark-border" onClick={() => setSelectedReport(null)}><X className="w-4 h-4"/></button>
            </div>
            
            {/* Modal Tabs Header */}
            <div className="px-6 flex gap-6 border-b border-dark-border bg-dark-hover/50 pt-2">
               {['Detail', 'Foto Bukti', 'Riwayat'].map(tab => (
                 <button 
                   key={tab}
                   onClick={() => setActiveTab(tab)}
                   className={`pb-3 text-[13px] font-bold transition-colors border-b-2 ${activeTab === tab ? 'border-brand-primary text-brand-primary' : 'border-transparent text-ui-muted hover:text-ui-text'}`}
                 >
                   {tab} {tab === 'Foto Bukti' && <span className="ml-1 bg-brand-primary/20 text-brand-primary px-1.5 py-0.5 rounded-full text-[10px]">0</span>}
                 </button>
               ))}
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              
              {/* Tab: Detail */}
              {activeTab === 'Detail' && (
                <div className="flex flex-col gap-4 animate-fade-in">
                  <div className="bg-dark-bg p-4 rounded-xl border border-dark-border mb-2">
                     <div className="text-[10px] text-ui-muted font-bold tracking-wider mb-2">DESKRIPSI KELUHAN</div>
                     <div className="text-[13px] text-ui-text leading-relaxed">
                       {selectedReport.description || <span className="text-ui-dim italic">Tidak ada deskripsi rinci.</span>}
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {[
                      ["Kategori", selectedReport.category],
                      ["Lokasi", selectedReport.location],
                      ["Pelapor", selectedReport.reporter],
                      ["Tanggal", selectedReport.date],
                      ["Prioritas", selectedReport.priority],
                      ["Status", selectedReport.status],
                      ["Teknisi", selectedReport.technician || "Belum ditugaskan"],
                      ["Deadline SLA", selectedReport.sla],
                    ].map(([k,v]) => (
                      <div key={k} className="bg-dark-bg p-4 rounded-xl border border-dark-border">
                        <div className="text-[10px] text-ui-muted font-bold tracking-wider mb-1.5">{k.toUpperCase()}</div>
                        <div className="text-[14px] text-ui-text font-bold">{v}</div>
                      </div>
                    ))}
                  </div>
                  
                  {selectedReport.rating && (
                    <div className="bg-dark-bg p-4 rounded-xl border border-dark-border flex justify-between items-center mt-2">
                       <div className="text-[10px] text-ui-muted font-bold tracking-wider">RATING PENYELESAIAN</div>
                       <div className="text-ui-warning text-lg tracking-widest leading-none">{"★".repeat(selectedReport.rating)}{"☆".repeat(5-selectedReport.rating)}</div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Foto Bukti */}
              {activeTab === 'Foto Bukti' && (
                <div className="flex flex-col gap-4 animate-fade-in h-48">
                  <div className="text-[11px] text-ui-muted font-bold uppercase tracking-wider">FOTO LAPORAN (0/5)</div>
                  
                  {/* Drag and Drop Box */}
                  <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-dark-border rounded-xl bg-dark-bg hover:bg-dark-hover hover:border-brand-primary/50 transition-colors cursor-pointer group">
                     <Upload className="w-8 h-8 text-ui-dim group-hover:text-brand-primary mb-3 transition-colors" />
                     <div className="text-[13px] text-ui-text font-medium mb-1">Drag & drop foto, atau klik untuk pilih</div>
                     <div className="text-[11px] text-ui-muted">PNG, JPG, WEBP — maks 5 foto</div>
                     <input type="file" accept="image/*" multiple className="hidden" />
                  </label>
                  
                  <div className="flex mt-2">
                    <button className="btn btn-primary flex items-center gap-2">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      Simpan Foto
                    </button>
                  </div>
                </div>
              )}

              {/* Tab: Riwayat */}
              {activeTab === 'Riwayat' && (
                <div className="flex flex-col gap-0 animate-fade-in pt-2 pl-4">
                  {(selectedReport.history || []).map((h, i) => (
                    <div key={i} className="relative pb-6 pl-6 border-l-2 border-dark-border last:border-l-transparent last:pb-0">
                       <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-brand-primary ring-4 ring-dark-card"></div>
                       <div className="text-[14px] font-bold text-ui-text leading-none mb-1.5">{h.title}</div>
                       <div className="text-[12px] text-ui-muted">{h.date} · oleh <span className="font-semibold text-ui-dim">{h.user}</span></div>
                    </div>
                  ))}
                </div>
              )}

            </div>

            {/* Modal Footer Actions */}
            <div className="px-6 py-4 bg-dark-hover flex gap-3 border-t border-dark-border">
              <button className="btn btn-primary bg-brand-primary text-white flex-1 hover:brightness-110" onClick={handleUpdateStatus}>Update Status</button>
              <button className="btn btn-ghost border border-dark-border px-6">Assign Teknisi</button>
              <button className="btn btn-danger p-2 px-3"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
      )}

      {/* Add Report Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-dark-bg/80 backdrop-blur-sm animate-fade-in" onClick={() => setShowAddForm(false)}>
          <div className="bg-dark-card border border-dark-border rounded-xl w-full max-w-lg shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-dark-border flex justify-between items-center bg-dark-hover">
              <div className="font-bold text-ui-text text-[15px]">Buat Laporan Baru</div>
              <button className="text-ui-dim hover:text-ui-text p-1" onClick={() => setShowAddForm(false)}><X className="w-4 h-4"/></button>
            </div>
            <form onSubmit={handleAddReport}>
               <div className="p-6 flex flex-col gap-4">
                 <div>
                   <label className="block text-[11px] font-semibold tracking-wider text-ui-muted mb-1.5">JUDUL MASALAH</label>
                   <input name="title" type="text" className="input text-[12px]" placeholder="Misal: AC mati total" required />
                 </div>
                 <div>
                   <label className="block text-[11px] font-semibold tracking-wider text-ui-muted mb-1.5">DESKRIPSI LENGKAP</label>
                   <textarea name="description" className="input text-[12px] h-20 py-2 resize-none" placeholder="Jelaskan detail masalah..." required></textarea>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-[11px] font-semibold tracking-wider text-ui-muted mb-1.5">KATEGORI</label>
                     <select name="category" className="input text-[12px]" required>
                       <option value="Listrik" className="bg-dark-bg">Listrik</option>
                       <option value="HVAC" className="bg-dark-bg">HVAC (AC)</option>
                       <option value="Plumbing" className="bg-dark-bg">Plumbing / Pipa</option>
                       <option value="Bangunan" className="bg-dark-bg">Bangunan / Sipil</option>
                       <option value="Jaringan" className="bg-dark-bg">Jaringan / WiFi</option>
                     </select>
                   </div>
                   <div>
                     <label className="block text-[11px] font-semibold tracking-wider text-ui-muted mb-1.5">PRIORITAS</label>
                     <select name="priority" className="input text-[12px]" required>
                       <option value="Minor" className="bg-dark-bg">Minor</option>
                       <option value="Tinggi" className="bg-dark-bg">Tinggi</option>
                       <option value="Kritis" className="bg-dark-bg">Kritis</option>
                     </select>
                   </div>
                 </div>
                 <div>
                   <label className="block text-[11px] font-semibold tracking-wider text-ui-muted mb-1.5">LOKASI RUANGAN/GEDUNG</label>
                   <input name="location" type="text" className="input text-[12px]" placeholder="Misal: Gedung A Lt. 2 Toilet Pria" required />
                 </div>
                 <div>
                   <label className="block text-[11px] font-semibold tracking-wider text-ui-muted mb-1.5">FOTO BUKTI (OPSIONAL)</label>
                   <input type="file" accept="image/*" className="input text-[12px] p-1.5 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-[11px] file:font-semibold file:bg-dark-hover file:text-brand-primary" />
                 </div>
               </div>
               <div className="px-6 py-4 bg-dark-hover flex justify-end gap-3 border-t border-dark-border">
                 <button type="button" className="btn btn-ghost" onClick={() => setShowAddForm(false)}>Batal</button>
                 <button type="submit" className="btn btn-primary">Simpan Laporan</button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
