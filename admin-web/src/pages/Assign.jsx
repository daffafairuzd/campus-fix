import React, { useState, useEffect } from 'react';
import { Search, AlertTriangle, Plus, Loader2, X } from 'lucide-react';
import { Avatar, Badge } from '../components/ui';
import api from '../api';

export default function Assign() {
  const [search, setSearch] = useState("");
  const [reportsData, setReportsData] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [selectedTechs, setSelectedTechs] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  
  // State untuk force override konfirmasi
  const [overrideConfirm, setOverrideConfirm] = useState(null); // { reportId, tech }
  const [assignments, setAssignments] = useState([]);
  const [cancelConfirm, setCancelConfirm] = useState(null); // { assignmentId, techName, reportNumber }

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [resReports, resTechs, resAssignments] = await Promise.all([
        api.get('/reports?sort_by=created_at&sort_dir=desc'),
        api.get('/technicians'),
        api.get('/assignments')
      ]);
      setReportsData(resReports.data.data || []);
      setTechnicians(resTechs.data || []);
      setAssignments(resAssignments.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const unassigned = reportsData.filter(r => (!r.active_technicians || r.active_technicians.length === 0) && r.status !== 'selesai' && r.status !== 'eskalasi');
  const assigned   = reportsData.filter(r => r.active_technicians && r.active_technicians.length > 0 && r.status !== "selesai");

  const filteredUnassigned = unassigned.filter(r =>
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    r.report_number.toLowerCase().includes(search.toLowerCase())
  );

  // Cek apakah semua teknisi (aktif) sedang sibuk
  const allBusy = technicians
    .filter(t => t.availability_status === 'aktif')
    .every(t => t.workload_status === 'Sibuk');

  const toggleTech = (reportId, tech) => {
    const status = tech.workload_status;

    // Jika teknisi Sibuk, minta konfirmasi override
    if (status === 'Sibuk') {
      setOverrideConfirm({ reportId, tech });
      return;
    }

    doToggleTech(reportId, tech);
  };

  const doToggleTech = (reportId, tech) => {
    setSelectedTechs(prev => {
      const current = prev[reportId] || [];
      const isSelected = current.find(t => t.id === tech.id);
      
      if (isSelected) {
         return { ...prev, [reportId]: current.filter(t => t.id !== tech.id) };
      }
      return { ...prev, [reportId]: [...current, tech] };
    });
    setOverrideConfirm(null);
  };

  const submitAssign = async (reportId, forceOverride = false) => {
    const techs = selectedTechs[reportId] || [];
    if (techs.length === 0) { alert("Pilih minimal satu teknisi!"); return; }
    
    try {
      await api.post(`/assignments`, {
        report_id: reportId,
        technician_ids: techs.map(t => t.user_id),
        force_override: forceOverride
      });
      
      setSelectedTechs(prev => { const next = {...prev}; delete next[reportId]; return next; });
      fetchData(); // Refresh both reports and technicians load
    } catch (err) {
      if (err.response?.status === 422 && err.response?.data?.requires_override) {
         alert(err.response.data.message);
      } else {
         alert("Gagal assign: " + (err.response?.data?.message || err.message));
      }
    }
  };

  const cancelAssignment = async (assignmentId) => {
    try {
      await api.delete(`/assignments/${assignmentId}`);
      setCancelConfirm(null);
      fetchData();
    } catch (err) {
      alert("Gagal membatalkan penugasan: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="p-6 md:p-7 flex flex-col gap-6">
      
      {/* Banner: semua teknisi sibuk */}
      {allBusy && (
        <div className="bg-ui-warning/10 border border-ui-warning/30 rounded-xl px-4 py-3 flex items-center gap-3">
          <AlertTriangle className="w-4 h-4 text-ui-warning flex-shrink-0" />
          <span className="text-[13px] text-yellow-300">
            <strong className="text-ui-warning font-bold">Semua teknisi aktif sedang sibuk.</strong> Anda masih dapat force-assign dengan mengklik teknisi yang sibuk dan mengkonfirmasi override.
          </span>
        </div>
      )}

      {/* Override Konfirmasi Dialog */}
      {overrideConfirm && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-dark-bg/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-dark-card border border-ui-warning/40 rounded-xl w-full max-w-sm shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-5 h-5 text-ui-warning flex-shrink-0" />
              <div className="font-bold text-ui-text text-[15px]">Override Kapasitas Teknisi</div>
            </div>
            <p className="text-[13px] text-ui-dim mb-5 leading-relaxed">
              <strong className="text-ui-text">{overrideConfirm.tech.name}</strong> sudah mencapai batas kapasitas penugasan. Yakin ingin tetap menugaskan ke teknisi ini?
            </p>
            <div className="flex gap-3">
              <button className="btn btn-ghost flex-1" onClick={() => setOverrideConfirm(null)}>Batal</button>
              <button 
                className="btn btn-primary flex-1 bg-ui-warning hover:bg-ui-warning/80 border-ui-warning"
                onClick={() => {
                  doToggleTech(overrideConfirm.reportId, overrideConfirm.tech);
                  submitAssign(overrideConfirm.reportId, true);
                }}
              >
                Ya, Override
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Assignment Konfirmasi Dialog */}
      {cancelConfirm && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-dark-bg/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-dark-card border border-ui-danger/40 rounded-xl w-full max-w-sm shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-ui-danger/15 flex items-center justify-center border border-ui-danger/30">
                <X className="w-5 h-5 text-ui-danger" />
              </div>
              <div className="font-bold text-ui-text text-[15px]">Batalkan Penugasan</div>
            </div>
            <p className="text-[13px] text-ui-dim mb-5 leading-relaxed">
              Yakin ingin membatalkan penugasan <strong className="text-ui-text">{cancelConfirm.techName}</strong> dari laporan <strong className="text-brand-primary">{cancelConfirm.reportNumber}</strong>?
            </p>
            <div className="flex gap-3">
              <button className="btn btn-ghost flex-1" onClick={() => setCancelConfirm(null)}>Kembali</button>
              <button
                className="btn btn-primary flex-1 bg-ui-danger hover:bg-ui-danger/80 border-ui-danger"
                onClick={() => cancelAssignment(cancelConfirm.assignmentId)}
              >
                Ya, Batalkan
              </button>
            </div>
          </div>
        </div>
      )}

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
              <div key={r.id} className="p-4 bg-dark-card border border-dark-border rounded-xl shadow-lg hover:border-brand-primary/50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-mono font-bold text-brand-primary">{r.report_number}</span>
                  <Badge label={r.priority} priority={r.priority} />
                </div>
                <div className="text-[13px] font-bold text-ui-text leading-snug mb-1">{r.title}</div>
                {r.description && (
                  <div className="text-[11px] text-ui-dim mb-2 line-clamp-2 bg-dark-bg/50 p-2 rounded border border-dark-border/50 italic">
                    "{r.description}"
                  </div>
                )}
                <div className="text-[11px] text-ui-muted mb-3 flex justify-between">
                  <span>Kategori: {r.category}</span>
                  <span>📍 {r.location}</span>
                </div>
                
                <div className="pt-3 border-t border-dark-border mt-3">
                  <div className="flex justify-between items-center mb-3">
                    <div className="text-[10px] text-ui-danger font-mono font-semibold">SLA: {new Date(r.sla_deadline).toLocaleDateString('id-ID')}</div>
                    <div className="text-[10px] text-ui-muted">Pilih Teknisi:</div>
                  </div>
                  
                  {/* Multi-select Pills dengan workload status */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {technicians.map(t => {
                      const isSelected = (selectedTechs[r.id] || []).find(tech => tech.id === t.id);
                      const isCuti = t.workload_status === 'Cuti';
                      const isBusy = t.workload_status === 'Sibuk';
                      
                      return (
                        <button 
                          key={t.id}
                          onClick={(e) => { e.stopPropagation(); if (!isCuti) toggleTech(r.id, t); }}
                          disabled={isCuti}
                          title={isCuti ? 'Teknisi sedang cuti' : isBusy ? 'Teknisi penuh – klik untuk override' : ''}
                          className={`px-2 py-1 flex items-center gap-1.5 rounded-md text-[10px] font-semibold transition-colors border
                            ${isSelected ? 'bg-brand-primary/20 border-brand-primary text-brand-primary'
                            : isCuti    ? 'bg-dark-hover border-dark-border text-ui-muted/40 cursor-not-allowed opacity-50'
                            : isBusy    ? 'bg-ui-warning/10 border-ui-warning/50 text-ui-warning hover:bg-ui-warning/20'
                            : 'bg-dark-hover border-dark-border text-ui-dim hover:text-ui-text hover:border-ui-muted'}`}
                        >
                          <Avatar initials={t.avatar} size={14} success={!isBusy && !isCuti} warning={isBusy} muted={isCuti} />
                          {t.name.split(" ")[0]}
                          {isBusy && <span className="text-[8px] ml-0.5">⚠</span>}
                        </button>
                      );
                    })}
                  </div>

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
              {technicians.map(t => {
                const status = t.workload_status;
                const loadPct = Math.min((t.active_count / t.max_capacity) * 100, 100);
                return (
                  <div key={t.id} className={`flex items-center gap-3 p-3 rounded-lg border ${status === 'Tersedia' ? 'bg-dark-bg border-ui-success/20' : status === 'Sibuk' ? 'bg-dark-hover border-ui-warning/30' : 'bg-dark-hover border-ui-muted/20 opacity-60'}`}>
                    <Avatar initials={t.avatar} size={36} success={status === "Tersedia"} warning={status === "Sibuk"} muted={status === "Cuti"} />
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-0.5">
                        <div className="text-[13px] font-bold text-ui-text">{t.name}</div>
                        <Badge label={status} status={status} />
                      </div>
                      <div className="text-[11px] text-ui-dim mb-1">Keahlian: {t.specialty}</div>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 flex-1 bg-dark-border rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${loadPct >= 100 ? 'bg-ui-warning' : 'bg-gradient-to-r from-ui-success to-brand-primary'}`}
                            style={{ width: `${loadPct}%` }} 
                          />
                        </div>
                        <div className="text-[10px] font-mono text-ui-muted">{t.active_count}/{t.max_capacity} Aktif</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card p-5">
            <h2 className="text-[14px] font-bold text-ui-text mb-4">Sedang Dikerjakan ({assigned.length})</h2>
            <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto pr-2">
              {assigned.map(r => (
                <div key={r.id} className="p-3 bg-dark-bg border border-dark-border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-mono font-bold text-brand-primary">{r.report_number}</span>
                        <Badge label={r.priority} priority={r.priority} />
                      </div>
                      <div className="text-[12px] font-semibold text-ui-text truncate">{r.title}</div>
                    </div>
                    <Badge label={r.status} status={r.status} />
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-dark-border/50">
                    {r.active_technicians.map(tech => {
                      const assignment = assignments.find(a => a.report_id === r.id && a.technician_id === tech.id);
                      const initials = tech.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                      return (
                        <div key={tech.id} className="flex items-center gap-1.5 px-2 py-1 bg-dark-hover border border-dark-border rounded-md group hover:border-ui-danger/40 transition-colors">
                          <Avatar initials={initials} size={16} success />
                          <span className="text-[10px] text-ui-dim font-semibold">{tech.name.split(' ')[0]}</span>
                          {assignment && (
                            <button
                              onClick={() => setCancelConfirm({ assignmentId: assignment.id, techName: tech.name, reportTitle: r.title, reportNumber: r.report_number })}
                              className="ml-0.5 w-4 h-4 rounded-full bg-transparent hover:bg-ui-danger/20 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                              title="Batalkan penugasan"
                            >
                              <X size={10} className="text-ui-danger" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
              {assigned.length === 0 && <div className="text-[12px] text-ui-dim text-center p-4">Tidak ada laporan sedang dikerjakan.</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
