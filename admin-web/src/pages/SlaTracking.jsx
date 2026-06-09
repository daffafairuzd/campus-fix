import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import { Badge } from '../components/ui';
import api from '../api';

export default function SlaTracking() {
  const [slas, setSlas] = useState([]);
  const [slaConfigs, setSlaConfigs] = useState([]);
  const [summary, setSummary] = useState({ safe: 0, warning: 0, expired: 0, compliance: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // Filter, Sort, Search states
  const [filterType, setFilterType] = useState('all'); // 'all', 'respon', 'penyelesaian'
  const [sortType, setSortType] = useState('percentage_desc'); // 'percentage_desc', 'percentage_asc', 'deadline_asc'
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchSlaData();
  }, []);

  const fetchSlaData = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/sla');
      setSlas(res.data.sla_tracking);
      setSlaConfigs(res.data.sla_configs);
      setSummary(res.data.summary);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-7 flex flex-col gap-6">
      <div className="flex justify-between items-end mb-2">
        <div>
          <h1 className="text-xl font-bold text-ui-text flex items-center gap-2">
            <Clock className="text-brand-primary" /> Service Level Agreement (SLA)
          </h1>
          <p className="text-xs text-ui-muted mt-1">Pantau sisa waktu perbaikan sesuai prioritas layanan fasilitas</p>
        </div>
      </div>

      {isLoading ? <div className="p-10 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand-primary" /></div> : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="card p-5 bg-dark-hover border-ui-success/20">
              <div className="text-[11px] text-ui-muted font-bold tracking-widest mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-ui-success" /> AMAN (DALAM BATAS)
              </div>
              <div className="text-3xl font-bold text-ui-text">{summary.safe}</div>
              <div className="text-[11px] text-ui-muted mt-1">laporan aktif</div>
            </div>
            <div className="card p-5 bg-dark-hover border-ui-warning/20">
              <div className="text-[11px] text-ui-muted font-bold tracking-widest mb-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-ui-warning" /> MENDEKATI BATAS (&gt;75%)
              </div>
              <div className="text-3xl font-bold text-ui-text">{summary.warning}</div>
              <div className="text-[11px] text-ui-muted mt-1">perlu segera ditangani</div>
            </div>
            <div className="card p-5 bg-dark-hover border-ui-danger/20">
              <div className="text-[11px] text-ui-muted font-bold tracking-widest mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-ui-danger" /> MELEWATI BATAS (EXPIRED)
              </div>
              <div className="text-3xl font-bold text-ui-danger">{summary.expired}</div>
              {/* <div className="text-[11px] text-ui-muted mt-1">segera eskalasi</div> */}
            </div>
          </div>

          {/* Konfigurasi SLA per Priority */}
          <div className="card p-5">
            <h2 className="text-[13px] font-bold text-ui-text mb-3">Batas Waktu Penanganan per Prioritas</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {slaConfigs.map(cfg => (
                <div key={cfg.id} className="bg-dark-bg rounded-xl border border-dark-border p-3 text-center">
                  <Badge label={cfg.priority} priority={cfg.priority} />
                  <div className="mt-2 text-[11px] text-ui-muted">Respon: <span className="font-bold text-ui-dim">{cfg.response_hours} jam</span></div>
                  <div className="text-[11px] text-ui-muted">Selesai: <span className="font-bold text-ui-dim">{cfg.resolution_hours < 48 ? `${cfg.resolution_hours} jam` : `${cfg.resolution_hours / 24} hari`}</span></div>
                </div>
              ))}
            </div>
          </div>

          {/* Tracking Aktif */}
          <div className="card p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
              <h2 className="text-[14px] font-bold text-ui-text">Tracking Aktif Berjalan ({slas.length})</h2>
              
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <input 
                  type="text" 
                  placeholder="Cari laporan atau teknisi..." 
                  className="bg-dark-bg border border-dark-border text-ui-text text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-brand-primary w-full sm:w-48"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <select 
                  className="bg-dark-bg border border-dark-border text-ui-text text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-brand-primary"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="all">Semua Tipe SLA</option>
                  <option value="respon">SLA Respon</option>
                  <option value="penyelesaian">SLA Penyelesaian</option>
                </select>
                <select 
                  className="bg-dark-bg border border-dark-border text-ui-text text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-brand-primary"
                  value={sortType}
                  onChange={(e) => setSortType(e.target.value)}
                >
                  <option value="percentage_desc">Paling Kritis (Persentase %)</option>
                  <option value="percentage_asc">Paling Aman (Persentase %)</option>
                  <option value="deadline_asc">Deadline Terdekat</option>
                </select>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              {slas
                .filter(sla => {
                  // Filter by Type
                  if (filterType !== 'all' && sla.sla_type !== filterType) return false;
                  
                  // Filter by Search
                  if (searchQuery) {
                    const query = searchQuery.toLowerCase();
                    const matchTitle = sla.title.toLowerCase().includes(query);
                    const matchNumber = sla.report_number.toLowerCase().includes(query);
                    const matchTech = (sla.technicians || []).some(t => t.toLowerCase().includes(query));
                    if (!matchTitle && !matchNumber && !matchTech) return false;
                  }
                  
                  return true;
                })
                .sort((a, b) => {
                  if (sortType === 'percentage_desc') return b.percentage - a.percentage;
                  if (sortType === 'percentage_asc') return a.percentage - b.percentage;
                  if (sortType === 'deadline_asc') {
                    if (!a.active_deadline) return 1;
                    if (!b.active_deadline) return -1;
                    return new Date(a.active_deadline).getTime() - new Date(b.active_deadline).getTime();
                  }
                  return 0;
                })
                .map(sla => (
                <div key={sla.id} className="p-4 bg-dark-bg border border-dark-border rounded-xl">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-[11px] text-brand-primary">{sla.report_number}</span>
                        <Badge label={sla.priority} priority={sla.priority} />
                        <Badge label={sla.status} status={sla.status} />
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${sla.sla_type === 'respon' ? 'bg-ui-warning/20 text-ui-warning' : 'bg-brand-primary/20 text-brand-primary'}`}>
                          SLA {sla.sla_type === 'respon' ? 'Respon' : 'Selesai'}
                        </span>
                      </div>
                      <div className="text-[13px] font-bold text-ui-text">{sla.title}</div>
                      <div className="text-[11px] text-ui-dim mt-0.5">Teknisi: <span className="text-ui-muted">{(sla.technicians || []).join(', ') || 'Belum assign'}</span></div>
                    </div>
                    <div className="text-right">
                      <div className={`text-[13px] font-bold ${sla.warning_level === 'expired' ? 'text-ui-danger animate-pulse' : sla.warning_level === 'danger' ? 'text-ui-danger' : sla.warning_level === 'warning' ? 'text-ui-warning' : 'text-ui-success'}`}>
                        {sla.time_text}
                      </div>
                      <div className="text-[10px] text-ui-muted font-mono mt-0.5">
                        Deadline: {sla.active_deadline ? new Date(sla.active_deadline).toLocaleString('id-ID') : 'Belum diatur'}
                      </div>
                    </div>
                  </div>
                  <div className="h-2.5 w-full bg-dark-border rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 relative ${sla.warning_level === 'expired' ? 'bg-ui-danger' : sla.warning_level === 'danger' ? 'bg-ui-danger' : sla.warning_level === 'warning' ? 'bg-ui-warning' : 'bg-ui-success'}`}
                      style={{ width: `${sla.percentage}%` }}
                    >

                    </div>
                  </div>
                  <div className="flex justify-between mt-1.5 text-[10px] font-mono text-ui-muted">
                    <span>0%</span>
                    <span>SLA Capacity: {Math.round(sla.percentage)}%</span>
                    <span>100%</span>
                  </div>
                </div>
              ))}
              {slas.length === 0 && (
                <div className="text-center p-8 text-ui-muted text-[13px]">🎉 Semua laporan sudah diselesaikan!</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
