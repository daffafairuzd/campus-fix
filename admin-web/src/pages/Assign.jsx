import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, AlertTriangle, Plus, Loader2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Avatar, Badge } from '../components/ui';
import api from '../api';

export default function Assign() {
  const [search, setSearch] = useState("");
  const [techSearch, setTechSearch] = useState("");
  const [assignedSearch, setAssignedSearch] = useState("");
  const [assignedPage, setAssignedPage] = useState(1);
  const [assignedPerPage, setAssignedPerPage] = useState(10);
  const [reportsData, setReportsData] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [selectedTechs, setSelectedTechs] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  
  // State untuk force override konfirmasi
  const [overrideConfirm, setOverrideConfirm] = useState(null); // { reportId, tech }
  const [assignments, setAssignments] = useState([]);
  const [cancelConfirm, setCancelConfirm] = useState(null); // { assignmentId, techName, reportNumber }
  const [assignConfirm, setAssignConfirm] = useState(null); // { reportId, reportNumber, techs }

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [resReports, resTechs, resAssignments] = await Promise.all([
        api.get('/reports?sort_by=created_at&sort_dir=desc&per_page=1000'),
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

  const unassigned = reportsData.filter(r => (!r.active_technicians || r.active_technicians.length === 0) && r.status !== 'selesai' && r.status !== 'eskalasi' && r.is_analyzed === true);
  const assigned   = reportsData.filter(r => r.active_technicians && r.active_technicians.length > 0 && r.status !== "selesai");

  const filteredUnassigned = unassigned.filter(r =>
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    r.report_number.toLowerCase().includes(search.toLowerCase())
  );

  const filteredAssigned = assigned.filter(r =>
    r.title.toLowerCase().includes(assignedSearch.toLowerCase()) ||
    r.report_number.toLowerCase().includes(assignedSearch.toLowerCase())
  );

  const assignedTotalPages = Math.max(1, Math.ceil(filteredAssigned.length / assignedPerPage));
  const paginatedAssigned = filteredAssigned.slice((assignedPage - 1) * assignedPerPage, assignedPage * assignedPerPage);

  // Cek apakah semua teknisi (aktif) sedang sibuk
  const allBusy = technicians
    .filter(t => t.availability_status === 'aktif')
    .every(t => t.workload_status === 'Sibuk');

  const filteredTechs = technicians.filter(t => 
    t.name.toLowerCase().includes(techSearch.toLowerCase()) || 
    t.specialty.toLowerCase().includes(techSearch.toLowerCase())
  );

  const toggleTech = (reportId, tech) => {
    setSelectedTechs(prev => {
      const current = prev[reportId] || [];
      const isSelected = current.find(t => t.id === tech.id);
      
      if (isSelected) {
         return { ...prev, [reportId]: current.filter(t => t.id !== tech.id) };
      }
      return { ...prev, [reportId]: [...current, tech] };
    });
  };

  const handleAssignClick = (reportId, reportNumber, techs) => {
    const hasBusy = techs.some(t => t.workload_status === 'Sibuk');
    if (hasBusy) {
      setOverrideConfirm({ reportId, reportNumber, techs });
    } else {
      setAssignConfirm({ reportId, reportNumber, techs });
    }
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
          <span className="text-[13px] text-ui-warning">
            <strong className="font-bold">Semua teknisi aktif sedang sibuk.</strong> Anda masih dapat force-assign dengan mengklik teknisi yang sibuk dan mengkonfirmasi override.
          </span>
        </div>
      )}

      {/* Override Konfirmasi Dialog */}
      {overrideConfirm && createPortal(
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-dark-bg/80 animate-fade-in">
          <div className="bg-dark-card border border-ui-warning/40 rounded-lg w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-5 h-5 text-ui-warning flex-shrink-0" />
              <div className="font-bold text-ui-text text-[15px]">Override Kapasitas Teknisi</div>
            </div>
            <p className="text-[13px] text-ui-dim mb-5 leading-relaxed">
              Beberapa teknisi yang Anda pilih sudah mencapai batas kapasitas penugasan. Yakin ingin tetap melakukan <strong>Override</strong> untuk laporan <strong className="text-brand-primary">{overrideConfirm.reportNumber}</strong>?
            </p>
            <div className="flex gap-3">
              <button className="btn btn-ghost flex-1" onClick={() => setOverrideConfirm(null)}>Batal</button>
              <button 
                className="btn btn-primary flex-1 bg-ui-warning hover:bg-ui-warning/80 border-ui-warning"
                onClick={() => {
                  submitAssign(overrideConfirm.reportId, true);
                  setOverrideConfirm(null);
                }}
              >
                Ya, Override
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Cancel Assignment Konfirmasi Dialog */}
      {cancelConfirm && createPortal(
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-dark-bg/80 animate-fade-in">
          <div className="bg-dark-card border border-ui-danger/40 rounded-lg w-full max-w-sm p-6">
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
        </div>,
        document.body
      )}

      {/* Assign Konfirmasi Dialog */}
      {assignConfirm && createPortal(
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-dark-bg/80 animate-fade-in">
          <div className="bg-dark-card border border-brand-primary/40 rounded-lg w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-brand-primary/15 flex items-center justify-center border border-brand-primary/30">
                <Plus className="w-5 h-5 text-brand-primary" />
              </div>
              <div className="font-bold text-ui-text text-[15px]">Konfirmasi Penugasan</div>
            </div>
            <p className="text-[13px] text-ui-dim mb-5 leading-relaxed">
              Yakin ingin menugaskan <strong className="text-ui-text">{assignConfirm.techs.map(t => t.name.split(' ')[0]).join(', ')}</strong> untuk laporan <strong className="text-brand-primary">{assignConfirm.reportNumber}</strong>?
            </p>
            <div className="flex gap-3">
              <button className="btn btn-ghost flex-1" onClick={() => setAssignConfirm(null)}>Batal</button>
              <button
                className="btn btn-primary flex-1"
                onClick={() => {
                  submitAssign(assignConfirm.reportId);
                  setAssignConfirm(null);
                }}
              >
                Ya, Tugaskan
              </button>
            </div>
          </div>
        </div>,
        document.body
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
          
          <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto pr-2">
            {filteredUnassigned.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-dark-border rounded-xl">
                <div className="text-ui-muted mb-2">🎉</div>
                <div className="text-[12px] text-ui-dim">Semua laporan telah ditugaskan!</div>
              </div>
            ) : filteredUnassigned.map(r => (
              <div key={r.id} className="p-4 bg-dark-card border border-dark-border rounded-lg hover:border-brand-primary/50 transition-colors">
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
                      className={`btn py-1 px-3 text-[10px] ${(selectedTechs[r.id] || []).length > 0 ? 'btn-primary' : 'bg-dark-hover text-ui-muted border-dark-border cursor-not-allowed'}`}
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        handleAssignClick(r.id, r.report_number, selectedTechs[r.id] || []);
                      }}
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
        <div className="card p-5 h-fit relative">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-[14px] font-bold text-ui-text">Status Tim Teknisi</h2>
            <div className="relative w-48">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-ui-muted" />
              <input 
                className="input pl-9 h-8 text-[11px]" 
                placeholder="Cari teknisi atau keahlian..." 
                value={techSearch}
                onChange={e => setTechSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto pr-2">
            {filteredTechs.map(t => {
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
                          className={`h-full rounded-full ${loadPct >= 100 ? 'bg-ui-warning' : 'bg-brand-primary'}`}
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
      </div>

      {/* Baris Bawah: Sedang Dikerjakan */}
      <div className="card p-5 w-full mt-2">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-5">
          <h2 className="text-[14px] font-bold text-ui-text">Sedang Dikerjakan ({assigned.length})</h2>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-ui-muted font-semibold">Tampilkan:</span>
              <select 
                className="input w-[75px] h-8 text-[12px] px-2 py-0" 
                style={{ paddingTop: '2px', paddingBottom: '2px' }}
                value={assignedPerPage} 
                onChange={e => {
                  setAssignedPerPage(parseInt(e.target.value));
                  setAssignedPage(1);
                }}
              >
                {[5, 10, 20, 50].map(val => (
                  <option key={val} value={val} className="bg-dark-bg">{val}</option>
                ))}
              </select>
            </div>
            <div className="relative w-full md:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-ui-muted" />
              <input 
                className="input pl-9 h-8 text-[11px] w-full" 
                placeholder="Cari ID atau judul..." 
                value={assignedSearch}
                onChange={e => {
                  setAssignedSearch(e.target.value);
                  setAssignedPage(1);
                }}
              />
            </div>
          </div>
        </div>
        <div className="card overflow-x-auto border border-dark-border/60">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-dark-bg border-b border-dark-border">
                <th className="py-3 px-4 text-[11px] text-ui-muted font-bold tracking-wider uppercase">ID</th>
                <th className="py-3 px-4 text-[11px] text-ui-muted font-bold tracking-wider uppercase">Judul & Lokasi</th>
                <th className="py-3 px-4 text-[11px] text-ui-muted font-bold tracking-wider uppercase">Kategori</th>
                <th className="py-3 px-4 text-[11px] text-ui-muted font-bold tracking-wider uppercase">Prioritas</th>
                <th className="py-3 px-4 text-[11px] text-ui-muted font-bold tracking-wider uppercase">Status</th>
                <th className="py-3 px-4 text-[11px] text-ui-muted font-bold tracking-wider uppercase">SLA</th>
                <th className="py-3 px-4 text-[11px] text-ui-muted font-bold tracking-wider uppercase">Teknisi Bertugas</th>
              </tr>
            </thead>
            <tbody>
              {paginatedAssigned.map(r => (
                <tr key={r.id} className="border-b border-dark-border/40 last:border-0 hover:bg-dark-hover transition-colors">
                  <td className="py-4 px-4 font-mono text-[11px] font-bold text-brand-primary">{r.report_number}</td>
                  <td className="py-4 px-4">
                    <div className="text-[13px] text-ui-text font-semibold mb-0.5">{r.title}</div>
                    <div className="text-[11px] text-ui-muted">📍 {r.location}</div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold bg-dark-bg border border-dark-border text-ui-dim">{r.category}</span>
                  </td>
                  <td className="py-4 px-4"><Badge label={r.priority} priority={r.priority} /></td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <Badge label={r.status} status={r.status} />
                    </div>
                  </td>
                  <td className="py-4 px-4 text-[11px] font-mono text-ui-muted">
                    {new Date(r.sla_deadline).toLocaleDateString('id-ID')}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex flex-wrap gap-2">
                      {r.active_technicians.map(tech => {
                        const assignment = assignments.find(a => a.report_id === r.id && a.technician_id === tech.id);
                        const initials = tech.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                        return (
                          <div key={tech.id} className="flex items-center gap-1.5 px-2 py-1 bg-dark-bg border border-dark-border rounded-md group hover:border-ui-danger/40 transition-colors">
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredAssigned.length === 0 && (
            <div className="text-[12px] text-ui-dim p-8 text-center border-t border-dark-border/40">
              Tidak ada laporan yang sesuai pencarian.
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {assignedTotalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 px-2">
            <div className="text-[12px] text-ui-muted">
              Menampilkan halaman <span className="font-bold text-ui-text">{assignedPage}</span> dari <span className="font-bold text-ui-text">{assignedTotalPages}</span> 
              <span className="ml-2">({filteredAssigned.length} total laporan)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button 
                className={`p-1.5 rounded-md border ${assignedPage === 1 ? 'border-transparent text-ui-muted opacity-50 cursor-not-allowed' : 'border-dark-border text-ui-text hover:bg-dark-hover'}`}
                onClick={() => setAssignedPage(prev => Math.max(1, prev - 1))}
                disabled={assignedPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <div className="flex gap-1">
                {[...Array(assignedTotalPages)].map((_, i) => {
                  const pageNum = i + 1;
                  if (
                    pageNum === 1 || 
                    pageNum === assignedTotalPages || 
                    (pageNum >= assignedPage - 1 && pageNum <= assignedPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNum}
                        className={`w-7 h-7 flex items-center justify-center rounded-md text-[11px] font-bold transition-colors ${
                          pageNum === assignedPage 
                            ? 'bg-brand-primary text-white border-none' 
                            : 'border border-dark-border text-ui-text hover:bg-dark-hover'
                        }`}
                        onClick={() => setAssignedPage(pageNum)}
                      >
                        {pageNum}
                      </button>
                    );
                  } else if (
                    pageNum === assignedPage - 2 ||
                    pageNum === assignedPage + 2
                  ) {
                    return <span key={pageNum} className="text-ui-muted px-1">...</span>;
                  }
                  return null;
                })}
              </div>

              <button 
                className={`p-1.5 rounded-md border ${assignedPage === assignedTotalPages ? 'border-transparent text-ui-muted opacity-50 cursor-not-allowed' : 'border-dark-border text-ui-text hover:bg-dark-hover'}`}
                onClick={() => setAssignedPage(prev => Math.min(assignedTotalPages, prev + 1))}
                disabled={assignedPage === assignedTotalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
