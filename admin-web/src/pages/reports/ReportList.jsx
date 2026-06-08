import React from 'react';
import { Search, Plus, Loader2, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '../../components/ui';


const STATUS_OPTIONS = [
  { value: 'Semua', label: 'Semua Status' },
  { value: 'Menunggu', label: 'Menunggu' },
  { value: 'Assessment', label: 'Assessment' },
  { value: 'Dalam Proses', label: 'Dalam Proses' },
  { value: 'Selesai', label: 'Selesai' },
  { value: 'Eskalasi', label: 'Eskalasi' },
];

const PRIORITY_OPTIONS = [
  { value: 'Semua', label: 'Semua Prioritas' },
  { value: 'Kritis', label: 'Kritis' },
  { value: 'Tinggi', label: 'Tinggi' },
  { value: 'Sedang', label: 'Sedang' },
  { value: 'Rendah', label: 'Rendah' },
];

const CATEGORY_OPTIONS = [
  { value: 'Semua', label: 'Semua Kategori' },
  { value: 'Listrik & AC', label: 'Listrik & AC' },
  { value: 'Air & Pipa', label: 'Air & Pipa' },
  { value: 'Gedung & Fasilitas', label: 'Gedung & Fasilitas' },
  { value: 'IT & Jaringan', label: 'IT & Jaringan' },
  { value: 'Kebersihan', label: 'Kebersihan' },
  { value: 'Lainnya', label: 'Lainnya' },
];

const SORT_OPTIONS = [
  { value: 'created_at|desc', label: 'Waktu Terbaru' },
  { value: 'created_at|asc',  label: 'Waktu Terlama' },
  { value: 'sla_deadline|asc', label: 'Deadline Mendekat' },
  { value: 'priority|desc',   label: 'Prioritas Tertinggi' },
];

export default function ReportList({ reportsData, isLoading, onAdd, onDetail, filters, setFilters, pagination }) {
  const [searchInput, setSearchInput] = React.useState(filters.search || '');

  // Derive current sort value from filters untuk select dropdown
  const currentSort = `${filters.sort_by || 'created_at'}|${filters.sort_dir || 'desc'}`;

  // Handle sort change — kirim ke server via setFilters
  const handleSortChange = (value) => {
    const [sort_by, sort_dir] = value.split('|');
    setFilters(prev => ({ ...prev, sort_by, sort_dir, page: 1 }));
  };

  // Handle debounce for search manually or just on Enter
  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter') {
      setFilters(prev => ({ ...prev, search: searchInput, page: 1 }));
    }
  };

  const handleSearchBlur = () => {
    setFilters(prev => ({ ...prev, search: searchInput, page: 1 }));
  };

  // Data sudah diurutkan oleh server — tidak perlu client-side sort
  const sorted = reportsData;

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.last_page) {
      setFilters(prev => ({ ...prev, page: newPage }));
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-ui-muted" />
          <input 
            className="input pl-9" 
            placeholder="Cari laporan, ID, atau lokasi... (Tekan Enter)" 
            value={searchInput} 
            onChange={handleSearchChange}
            onKeyDown={handleSearchSubmit}
            onBlur={handleSearchBlur}
          />
        </div>

        {/* Filter Kategori */}
        <select 
          className="input w-[160px]" 
          value={filters.category} 
          onChange={e => setFilters(prev => ({ ...prev, category: e.target.value, page: 1 }))}
        >
          {CATEGORY_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value} className="bg-dark-bg">{label}</option>
          ))}
        </select>

        {/* Filter Status */}
        <select 
          className="input w-[160px]" 
          value={filters.status} 
          onChange={e => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
        >
          {STATUS_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value} className="bg-dark-bg">{label}</option>
          ))}
        </select>

        {/* Filter Prioritas */}
        <select 
          className="input w-[160px]" 
          value={filters.priority} 
          onChange={e => setFilters(prev => ({ ...prev, priority: e.target.value, page: 1 }))}
        >
          {PRIORITY_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value} className="bg-dark-bg">{label}</option>
          ))}
        </select>

        {/* Urutkan */}
        <select className="input w-[180px]" value={currentSort} onChange={e => handleSortChange(e.target.value)}>
          {SORT_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value} className="bg-dark-bg">{label}</option>
          ))}
        </select>

        {/* Tampilkan (Rows per page) */}
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-[12px] text-ui-muted font-semibold">Tampilkan:</span>
          <select 
            className="input w-[75px]" 
            value={filters.per_page || 10} 
            onChange={e => setFilters(prev => ({ ...prev, per_page: parseInt(e.target.value), page: 1 }))}
          >
            {[10, 20, 50].map(val => (
              <option key={val} value={val} className="bg-dark-bg">{val}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-dark-bg border-b border-dark-border">
              {['ID', 'Judul & Lokasi', 'Kategori', 'Prioritas', 'Status', 'Pelapor', 'SLA', 'Teknisi', 'Aksi'].map(h => (
                <th key={h} className="py-3 px-4 text-[11px] text-ui-muted font-bold tracking-wider uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan="9" className="text-center py-10"><Loader2 className="w-6 h-6 animate-spin mx-auto text-brand-primary" /></td></tr>
            ) : sorted.map(r => {
              const hasSla = r.sla_deadline != null && r.sla_deadline !== '';
              const slaDate = hasSla ? new Date(r.sla_deadline) : null;
              const now = new Date();
              const slaExpired = hasSla && slaDate < now && r.status !== 'selesai';
              const slaNear = hasSla && !slaExpired && (slaDate - now) < 86400000 * 2 && r.status !== 'selesai';
              const activeTechs = (r.active_technicians || []).map(t => t.name).join(', ');
              return (
                <tr key={r.id} className="border-b border-dark-border/40 last:border-0 hover:bg-dark-hover transition-colors">
                  <td className="py-4 px-4 font-mono text-[11px] font-bold text-brand-primary">{r.report_number}</td>
                  <td className="py-4 px-4">
                    <div className="text-[13px] text-ui-text font-semibold mb-0.5">{r.title}</div>
                    <div className="text-[11px] text-ui-muted">📍 {r.location}{r.latitude && r.longitude && ' 🗺️'}</div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold bg-dark-bg border border-dark-border text-ui-dim">{r.category}</span>
                  </td>
                  <td className="py-4 px-4"><Badge label={r.priority} priority={r.priority} /></td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <Badge label={r.status} status={r.status} />
                      {r.is_escalation_requested && (
                        <div className="text-ui-warning animate-pulse" title="Menunggu persetujuan eskalasi">
                          <AlertTriangle className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-[12px] text-ui-dim font-medium">{r.reporter?.name || 'Pelapor'}</td>
                  <td className="py-4 px-4">
                    {!hasSla ? (
                      <span
                        className="inline-flex items-center gap-1 text-[10px] text-ui-muted italic"
                        title="SLA akan ditentukan setelah prioritas diverifikasi oleh admin"
                      >
                        — Belum ada
                      </span>
                    ) : (
                      <div className={`text-[11px] font-mono font-medium ${slaExpired ? 'text-ui-danger font-bold' : slaNear ? 'text-ui-warning' : 'text-ui-muted'}`}>
                        {slaExpired ? '⚠ ' : slaNear ? '⏰ ' : ''}{slaDate.toLocaleDateString('id-ID')}
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-4 text-[12px] text-ui-dim font-medium">
                    {activeTechs || <span className="text-ui-warning italic text-[11px]">Belum assign</span>}
                  </td>
                  <td className="py-4 px-4">
                    <button className="btn btn-ghost py-1.5 px-3 text-[11px] font-semibold" onClick={() => onDetail(r)}>Detail</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!isLoading && sorted.length === 0 && (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-12 h-12 bg-dark-bg rounded-full flex items-center justify-center mb-3">
              <Search className="w-5 h-5 text-ui-muted" />
            </div>
            <div className="text-ui-text font-bold text-[14px]">Tidak ada laporan ditemukan</div>
            <div className="text-ui-muted text-[12px] mt-1">Coba sesuaikan filter atau kata kunci pencarian Anda.</div>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {pagination && pagination.last_page > 1 && (
        <div className="flex items-center justify-between px-2">
          <div className="text-[12px] text-ui-muted">
            Menampilkan halaman <span className="font-bold text-ui-text">{pagination.current_page}</span> dari <span className="font-bold text-ui-text">{pagination.last_page}</span> 
            <span className="ml-2">({pagination.total} total laporan)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button 
              className={`p-1.5 rounded-md border ${pagination.current_page === 1 ? 'border-transparent text-ui-muted opacity-50 cursor-not-allowed' : 'border-dark-border text-ui-text hover:bg-dark-hover'}`}
              onClick={() => handlePageChange(pagination.current_page - 1)}
              disabled={pagination.current_page === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <div className="flex gap-1">
              {[...Array(pagination.last_page)].map((_, i) => {
                const pageNum = i + 1;
                // Simple logic to show current, first, last, and neighbors
                if (
                  pageNum === 1 || 
                  pageNum === pagination.last_page || 
                  (pageNum >= pagination.current_page - 1 && pageNum <= pagination.current_page + 1)
                ) {
                  return (
                    <button
                      key={pageNum}
                      className={`w-7 h-7 flex items-center justify-center rounded-md text-[11px] font-bold transition-colors ${
                        pageNum === pagination.current_page 
                          ? 'bg-brand-primary text-white border-none' 
                          : 'border border-dark-border text-ui-text hover:bg-dark-hover'
                      }`}
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                } else if (
                  pageNum === pagination.current_page - 2 ||
                  pageNum === pagination.current_page + 2
                ) {
                  return <span key={pageNum} className="text-ui-muted px-1">...</span>;
                }
                return null;
              })}
            </div>

            <button 
              className={`p-1.5 rounded-md border ${pagination.current_page === pagination.last_page ? 'border-transparent text-ui-muted opacity-50 cursor-not-allowed' : 'border-dark-border text-ui-text hover:bg-dark-hover'}`}
              onClick={() => handlePageChange(pagination.current_page + 1)}
              disabled={pagination.current_page === pagination.last_page}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}