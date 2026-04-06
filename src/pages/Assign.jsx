import React, { useState } from 'react';
import { Search, AlertTriangle, Plus } from 'lucide-react';
import { REPORTS, TECHNICIANS } from '../data';
import { Avatar, Badge } from '../components/ui';

export default function Assign() {
  const [search, setSearch] = useState("");
  const [reportsData, setReportsData] = useState(REPORTS);
  // Store selected technicians for a specific report being hover/active
  const [selectedTechs, setSelectedTechs] = useState({});

  const unassigned = reportsData.filter(r => !r.technician);
  const assigned = reportsData.filter(r => r.technician && r.status !== "Selesai");

  const toggleTech = (reportId, techName) => {
    setSelectedTechs(prev => {
      const current = prev[reportId] || [];
      if (current.includes(techName)) return { ...prev, [reportId]: current.filter(t => t !== techName) };
      return { ...prev, [reportId]: [...current, techName] };
    });
  };

  const submitAssign = (reportId) => {
    const techs = selectedTechs[reportId] || [];
    if (techs.length === 0) {
      alert("Pilih minimal satu teknisi!");
      return;
    }
    
    setReportsData(prev => prev.map(r => 
      r.id === reportId ? { ...r, technician: techs.join(", "), status: "Dalam Proses" } : r
    ));
    
    // Clear selection
    setSelectedTechs(prev => {
      const next = {...prev};
      delete next[reportId];
      return next;
    });
    
    alert(`Laporan ${reportId} berhasil ditugaskan ke: ${techs.join(", ")}`);
  };

  const filteredUnassigned = unassigned.filter(r => r.title.toLowerCase().includes(search.toLowerCase()) || r.id.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6 md:p-7 flex flex-col gap-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Kolom Belum Ditugaskan */}
        <div className="card p-5 border-dashed border-2 border-dark-border/60 bg-dark-bg/30 relative">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-[14px] font-bold text-ui-text flex items-center gap-2">
              Laporan Masuk 
              <span className="bg-ui-danger text-white rounded-full text-[10px] font-bold px-2 py-0.5">{unassigned.length}</span>
            </h2>
            <div className="relative w-48">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-ui-muted" />
              <input 
                className="input pl-9 h-8 text-[11px]" 
                placeholder="Cari ID atau judul..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex flex-col gap-3 min-h-[400px]">
            {filteredUnassigned.length === 0 ? (
               <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-dark-border rounded-xl">
                 <div className="text-ui-muted mb-2">🎉</div>
                 <div className="text-[12px] text-ui-dim">Semua laporan telah ditugaskan!</div>
               </div>
            ) : filteredUnassigned.map(r => (
              <div key={r.id} className="p-4 bg-dark-card border border-dark-border rounded-xl shadow-lg hover:border-brand-primary/50 transition-colors cursor-pointer group">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-mono font-bold text-brand-primary">{r.id}</span>
                  <Badge label={r.priority} priority={r.priority} />
                </div>
                <div className="text-[13px] font-bold text-ui-text leading-snug mb-1">{r.title}</div>
                <div className="text-[11px] text-ui-muted mb-3 flex justify-between">
                  <span>Kategori: {r.category}</span>
                  <span>📍 {r.location}</span>
                </div>
                
                <div className="pt-3 border-t border-dark-border mt-3">
                  <div className="flex justify-between items-center mb-3">
                    <div className="text-[10px] text-ui-danger font-mono font-semibold">SLA: {r.sla}</div>
                    <div className="text-[10px] text-ui-muted">Pilih Teknisi:</div>
                  </div>
                  
                  {/* Multi-select Pills */}
                  <div className="flex flex-wrap gap-2 mb-3">
                     {TECHNICIANS.filter(t => t.status !== "Cuti").map(t => {
                       const isSelected = (selectedTechs[r.id] || []).includes(t.name);
                       return (
                         <button 
                           key={t.id} 
                           onClick={(e) => { e.stopPropagation(); toggleTech(r.id, t.name); }}
                           className={`px-2 py-1 flex items-center gap-1.5 rounded-md text-[10px] font-semibold transition-colors border ${isSelected ? 'bg-brand-primary/20 border-brand-primary text-brand-primary' : 'bg-dark-hover border-dark-border text-ui-dim hover:text-ui-text hover:border-ui-muted'}`}
                         >
                           <Avatar initials={t.avatar} size={14} /> {t.name.split(" ")[0]}
                         </button>
                       );
                     })}
                  </div>

                  {/* Assign Button Manual Trigger */}
                  <div className="flex justify-end">
                    <button 
                      className={`btn py-1 px-3 text-[10px] ${(selectedTechs[r.id] || []).length > 0 ? 'btn-primary shadow-[0_0_8px_rgba(220,38,38,0.3)]' : 'bg-dark-hover text-ui-muted border-dark-border cursor-not-allowed'}`}
                      onClick={(e) => { e.stopPropagation(); submitAssign(r.id); }}
                      disabled={(selectedTechs[r.id] || []).length === 0}
                    >
                      Beri Penugasan ({(selectedTechs[r.id] || []).length})
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Kolom Kesiapan Teknisi */}
        <div className="flex flex-col gap-5">
          <div className="card p-5">
             <h2 className="text-[14px] font-bold text-ui-text mb-4">Status Tim Teknisi</h2>
             <div className="flex flex-col gap-3">
                {TECHNICIANS.map(t => (
                  <div key={t.id} className={`flex items-center gap-3 p-3 rounded-lg border ${t.status === 'Tersedia' ? 'bg-dark-bg border-ui-success/20' : t.status === 'Sibuk' ? 'bg-dark-hover border-ui-warning/30' : 'bg-dark-hover border-ui-danger/30 opacity-60'}`}>
                    <Avatar initials={t.avatar} size={36} success={t.status === "Tersedia"} warning={t.status === "Sibuk"} />
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-0.5">
                        <div className="text-[13px] font-bold text-ui-text">{t.name}</div>
                        <Badge label={t.status} status={t.status === "Tersedia" ? "Selesai" : t.status === "Sibuk" ? "Menunggu" : "Eskalasi"} />
                      </div>
                      <div className="text-[11px] text-ui-dim mb-1">Keahlian: {t.specialty}</div>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 flex-1 bg-dark-border rounded-full overflow-hidden">
                           <div 
                             className="h-full rounded-full bg-gradient-to-r from-ui-success to-brand-primary" 
                             style={{ width: `${(t.active / 5) * 100}%` }} 
                           />
                        </div>
                        <div className="text-[10px] font-mono text-ui-muted">{t.active} Aktif</div>
                      </div>
                    </div>
                  </div>
                ))}
             </div>
          </div>

          <div className="card p-5">
             <h2 className="text-[14px] font-bold text-ui-text mb-4">Sedang Dikerjakan ({assigned.length})</h2>
             <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-2">
                {assigned.map(r => (
                  <div key={r.id} className="p-3 bg-dark-bg border border-dark-border rounded-lg flex items-center justify-between">
                    <div>
                      <div className="text-[12px] font-semibold text-ui-text">{r.title}</div>
                      <div className="text-[10px] text-ui-dim mt-0.5">Teknisi: <strong className="text-ui-muted">{r.technician}</strong></div>
                    </div>
                    <Badge label={r.status} status={r.status} />
                  </div>
                ))}
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
