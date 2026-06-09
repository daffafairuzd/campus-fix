import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, Edit2, Trash2, MapPin, Upload, Search, Loader2, AlertTriangle, CheckCircle, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../../components/ui';
import api from '../../api';

const DEFAULT_CENTER = [-6.9718, 107.6301];

const fileToBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

export default function ReportDetail({ report, onBack, onEdit, onDeleted, onStatusUpdated }) {
  const [activeTab, setActiveTab] = useState('Detail');
  const [photos, setPhotos] = useState([]);
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [currentReport, setCurrentReport] = useState(report);
  const [selectedPriority, setSelectedPriority] = useState(
    (report.priority && report.priority !== 'belum_ditentukan') ? report.priority : 'sedang'
  );
  const [isVerifying, setIsVerifying] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const containerRef = useRef(null);
  const posRef = useRef({ isDragging: false, startX: 0, startY: 0, scrollLeft: 0, scrollTop: 0 });

  const handleMouseDown = (e) => {
    if (!containerRef.current) return;
    if (e.button !== 2) return; // Hanya proses jika klik kanan
    posRef.current = {
      isDragging: true,
      startX: e.pageX - containerRef.current.offsetLeft,
      startY: e.pageY - containerRef.current.offsetTop,
      scrollLeft: containerRef.current.scrollLeft,
      scrollTop: containerRef.current.scrollTop,
    };
  };

  const handleContextMenu = (e) => {
    e.preventDefault(); // Mencegah menu klik kanan bawaan browser muncul
  };

  const handleMouseMove = (e) => {
    if (!posRef.current.isDragging || !containerRef.current) return;
    e.preventDefault(); // Mencegah teks terpilih secara default
    const x = e.pageX - containerRef.current.offsetLeft;
    const y = e.pageY - containerRef.current.offsetTop;
    const walkX = (x - posRef.current.startX); 
    const walkY = (y - posRef.current.startY);
    containerRef.current.scrollLeft = posRef.current.scrollLeft - walkX;
    containerRef.current.scrollTop = posRef.current.scrollTop - walkY;
  };

  const handleMouseUpOrLeave = () => {
    posRef.current.isDragging = false;
  };

  const navigate = useNavigate();

  const showConfirm = ({ title, message, onConfirm, type = 'warning', icon }) => {
    setConfirmDialog({ title, message, onConfirm, type, icon });
  };

  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  // Sync prop report with currentReport state when prop changes
  useEffect(() => {
    setCurrentReport(report);
    if (report.priority && report.priority !== 'belum_ditentukan') {
      setSelectedPriority(report.priority);
    }
  }, [report]);

  // Fetch photos when tab changes
  useEffect(() => {
    if (activeTab === 'Foto Bukti') fetchPhotos();
  }, [activeTab]);

  // Detail map
  useEffect(() => {
    if (activeTab !== 'Detail' || !currentReport.latitude || !currentReport.longitude) {
      if (mapInstance.current) { mapInstance.current.remove(); mapInstance.current = null; }
      return;
    }
    const timer = setTimeout(() => {
      if (!mapRef.current || !window.L) return;
      if (mapInstance.current) { mapInstance.current.remove(); }
      const L = window.L;
      const map = L.map(mapRef.current).setView([parseFloat(currentReport.latitude), parseFloat(currentReport.longitude)], 17);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map);
      L.marker([parseFloat(currentReport.latitude), parseFloat(currentReport.longitude)])
        .addTo(map).bindPopup(currentReport.location || 'Lokasi Laporan').openPopup();
      mapInstance.current = map;
    }, 150);
    return () => { clearTimeout(timer); if (mapInstance.current) { mapInstance.current.remove(); mapInstance.current = null; } };
  }, [activeTab, currentReport.id]);

  const fetchPhotos = async () => {
    setIsLoadingPhotos(true);
    try { const res = await api.get(`/reports/${currentReport.id}/photos`); setPhotos(res.data || []); }
    catch (e) { console.error(e); }
    finally { setIsLoadingPhotos(false); }
  };

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files).slice(0, 5 - photos.length);
    if (!files.length) return;
    console.log('Uploading files:', files);
    setIsUploadingPhoto(true);
    try {
      for (const file of files) {
        const fullB64 = await fileToBase64(file);
        // Ambil hanya raw base64 setelah tanda koma
        const rawB64 = fullB64.split(',')[1];
        await api.post(`/reports/${currentReport.id}/photos`, {
          photo_data: rawB64,
          original_name: file.name,
          mime_type: file.type,
          type: 'bukti_laporan'
        });
      }
      await fetchPhotos();
    } catch (err) { alert('Gagal upload: ' + (err.response?.data?.message || err.message)); }
    finally { setIsUploadingPhoto(false); e.target.value = ''; }
  };

  const handleDeletePhoto = async (photoId) => {
    if (!window.confirm('Hapus foto ini?')) return;
    try { await api.delete(`/reports/${currentReport.id}/photos/${photoId}`); setPhotos(p => p.filter(ph => ph.id !== photoId)); }
    catch (err) { alert('Gagal hapus foto: ' + (err.response?.data?.message || err.message)); }
  };

  const handleUpdateStatus = async () => {
    const FLOW = { menunggu: 'ditugaskan', ditugaskan: 'assessment', assessment: 'dalam_proses', dalam_proses: 'selesai', selesai: 'menunggu', eskalasi: 'dalam_proses' };
    const next = FLOW[currentReport.status] || 'menunggu';

    let desc = `Status diupdate ke ${next}`;
    if (currentReport.status === 'assessment' && next === 'dalam_proses') {
      const note = window.prompt("Masukkan catatan asesmen / pengerjaan (Wajib):", "");
      if (!note) return; // User cancelled or left empty
      desc = note;
    }

    try {
      const res = await api.post(`/reports/${currentReport.id}/status`, { status: next, description: desc });
      setCurrentReport(res.data);
      if (onStatusUpdated) onStatusUpdated(res.data);
    } catch (err) { alert('Gagal update status: ' + (err.response?.data?.message || err.message)); }
  };

  const handleApproveEscalation = async () => {
    showConfirm({
      title: 'Setujui Eskalasi',
      message: 'Apakah Anda yakin ingin menyetujui pengajuan eskalasi ini?',
      type: 'success',
      icon: CheckCircle,
      onConfirm: async () => {
        try {
          const res = await api.post(`/reports/${currentReport.id}/status`, { status: 'eskalasi', description: 'Admin menyetujui pengajuan eskalasi.' });
          setCurrentReport(res.data);
          if (onStatusUpdated) onStatusUpdated(res.data);
        } catch (err) { alert('Gagal update status: ' + (err.response?.data?.message || err.message)); }
      }
    });
  };

  const handleRejectEscalation = async () => {
    showConfirm({
      title: 'Tolak Eskalasi',
      message: 'Apakah Anda yakin ingin menolak pengajuan eskalasi ini? Teknisi akan diminta melanjutkan pekerjaan.',
      type: 'danger',
      icon: AlertTriangle,
      onConfirm: async () => {
        try {
          const res = await api.post(`/reports/${currentReport.id}/reject-escalation`);
          setCurrentReport(res.data.report);
          if (onStatusUpdated) onStatusUpdated(res.data.report);
        } catch (err) { alert('Gagal tolak eskalasi: ' + (err.response?.data?.message || err.message)); }
      }
    });
  };

  const handleResolveEscalation = async () => {
    showConfirm({
      title: 'Selesaikan Eskalasi',
      message: 'Konfirmasi selesai eskalasi dan kembalikan laporan ke status Dalam Proses?',
      type: 'success',
      icon: CheckCircle,
      onConfirm: async () => {
        try {
          const res = await api.post(`/reports/${currentReport.id}/status`, {
            status: 'dalam_proses',
            description: 'Admin menyelesaikan eskalasi, laporan dikembalikan ke status Dalam Proses.'
          });
          setCurrentReport(res.data);
          if (onStatusUpdated) onStatusUpdated(res.data);
        } catch (err) {
          alert('Gagal menyelesaikan eskalasi: ' + (err.response?.data?.message || err.message));
        }
      }
    });
  };

  const handleDelete = async () => {
    showConfirm({
      title: 'Hapus Laporan',
      message: `Apakah Anda yakin ingin menghapus laporan ${currentReport.report_number}? Tindakan ini tidak dapat dibatalkan.`,
      type: 'danger',
      icon: Trash2,
      onConfirm: async () => {
        try { await api.delete(`/reports/${currentReport.id}`); onDeleted(); }
        catch (err) { alert('Gagal hapus: ' + (err.response?.data?.message || err.message)); }
      }
    });
  };

  const NEXT_LABEL = { menunggu: 'Tugaskan Teknisi', ditugaskan: 'Mulai Assessment', assessment: 'Mulai Pengerjaan', dalam_proses: 'Selesaikan Laporan', selesai: 'Menunggu', eskalasi: 'Dalam Proses' };

  const handleVerifyPriority = async () => {
    setIsVerifying(true);
    try {
      const res = await api.post(`/reports/${currentReport.id}/verify-priority`, { priority: selectedPriority });
      setCurrentReport(res.data.report);
      if (onStatusUpdated) onStatusUpdated(res.data.report);
    } catch (err) {
      alert('Gagal verifikasi prioritas: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="btn btn-ghost px-2.5 py-1.5 text-[12px] flex items-center gap-1.5">
            <ArrowLeft className="w-4 h-4" /> Kembali
          </button>
          <div className="w-px h-6 bg-dark-border" />
          <div>
            <div className="font-mono text-[12px] text-brand-primary font-bold">{currentReport.report_number}</div>
            <div className="font-bold text-ui-text text-[22px] leading-tight mt-0.5">{currentReport.title}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 mt-1">
          {currentReport.is_analyzed && currentReport.status !== 'selesai' && (
            <button className="btn btn-primary px-3 shadow-md" onClick={() => navigate('/assign')} title="Assign Teknisi">Assign Teknisi</button>
          )}
          <button className="btn btn-ghost px-3" onClick={() => onEdit(currentReport)} title="Edit"><Edit2 className="w-4 h-4" /></button>
          <button className="btn btn-danger px-3" onClick={handleDelete} title="Hapus"><Trash2 className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Verification Banner */}
      {!currentReport.is_analyzed && (
        <div className="bg-brand-primary/5 border border-brand-primary/30 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-fade-in shadow-sm">
          <div>
            <div className="text-brand-primary font-bold text-[14px] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" /> Analisis & Tentukan Prioritas
            </div>
            <div className="text-[12px] text-ui-text mt-1.5 leading-relaxed max-w-xl">
              Laporan baru ini <strong className="text-brand-primary">belum dianalisis</strong>. Anda wajib melakukan verifikasi lapangan (opsional) dan menentukan tingkat prioritas sebelum laporan dapat ditugaskan ke teknisi.
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0 mt-2 md:mt-0 items-center">
            <select 
              className="input w-[140px] font-semibold text-[13px] border-brand-primary/40 focus:border-brand-primary" 
              value={selectedPriority} 
              onChange={e => setSelectedPriority(e.target.value)}
              disabled={isVerifying}
            >
              <option value="kritis">Kritis</option>
              <option value="tinggi">Tinggi</option>
              <option value="sedang">Sedang</option>
              <option value="rendah">Rendah</option>
            </select>
            <button 
              className="btn btn-primary shadow-sm" 
              onClick={handleVerifyPriority}
              disabled={isVerifying}
            >
              {isVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />} Verifikasi
            </button>
          </div>
        </div>
      )}

      {/* Escalation Banner */}
      {currentReport.is_escalation_requested && (
        <div className="bg-ui-warning/10 border border-ui-warning/30 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="text-ui-warning font-bold text-[14px] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Pengajuan Eskalasi dari Teknisi
            </div>
            <div className="text-[13px] text-ui-text mt-1">
              Alasan: <span className="font-semibold">"{currentReport.escalation_reason}"</span>
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button className="btn bg-ui-success text-white hover:bg-ui-success/90 px-3 py-1.5 text-[12px]" onClick={handleApproveEscalation}>Setujui</button>
            <button className="btn bg-ui-danger text-white hover:bg-ui-danger/90 px-3 py-1.5 text-[12px]" onClick={handleRejectEscalation}>Tolak</button>
          </div>
        </div>
      )}

      {/* Active Escalation Banner */}
      {currentReport.status === 'eskalasi' && (
        <div className="bg-ui-warning/10 border border-ui-warning/30 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="text-ui-warning font-bold text-[14px] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Laporan Sedang dalam Eskalasi Vendor
            </div>
            <div className="text-[13px] text-ui-text mt-1">
              Pekerjaan ini sedang dieskalasikan ke pihak ketiga/vendor. Klik tombol konfirmasi di bawah jika eskalasi telah selesai untuk mengembalikan status laporan menjadi pengerjaan oleh teknisi.
            </div>
          </div>
          <div className="flex-shrink-0">
            <button className="btn bg-ui-success text-white hover:bg-ui-success/90 px-4 py-2 text-[13px]" onClick={handleResolveEscalation}>
              Konfirmasi Selesai Eskalasi
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-6 border-b border-dark-border">
        {['Detail', 'Foto Bukti', 'Riwayat'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`pb-3 text-[13px] font-bold transition-colors border-b-2 ${activeTab === tab ? 'border-brand-primary text-brand-primary' : 'border-transparent text-ui-muted hover:text-ui-text'}`}>
            {tab}{tab === 'Foto Bukti' && photos.length > 0 ? ` (${photos.length})` : ''}
          </button>
        ))}
      </div>

      {/* Tab: Detail */}
      {activeTab === 'Detail' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          {/* Left: info */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="card p-5">
              <div className="text-[10px] text-ui-muted font-bold tracking-wider mb-2">DESKRIPSI KELUHAN</div>
              <div className="text-[14px] text-ui-text leading-relaxed">
                {currentReport.description || <span className="text-ui-dim italic">Tidak ada deskripsi.</span>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                ['Kategori', currentReport.category],
                ['Lokasi', currentReport.location],
                ['Pelapor', currentReport.reporter?.name || '-'],
                ['Tanggal', new Date(currentReport.created_at).toLocaleString('id-ID')],
                ['Prioritas', <Badge key="p" label={currentReport.priority} priority={currentReport.priority} />],
                ['Status', <Badge key="s" label={currentReport.status} status={currentReport.status} />],
                ['Teknisi', (currentReport.active_technicians || []).map(t => t.name).join(', ') || 'Belum ditugaskan'],
                ['Deadline SLA', currentReport.sla_deadline
                  ? new Date(currentReport.sla_deadline).toLocaleString('id-ID')
                  : <span key="sla" className="text-ui-muted italic text-[12px]" title="SLA ditentukan setelah prioritas diverifikasi">— Belum ada</span>
                ],
              ].map(([k, v]) => (
                <div key={k} className="card p-4">
                  <div className="text-[10px] text-ui-muted font-bold tracking-wider mb-1.5">{k.toUpperCase()}</div>
                  <div className="text-[14px] text-ui-text font-semibold">{v}</div>
                </div>
              ))}
            </div>
            {currentReport.rating && (
              <div className="card p-4 flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <div className="text-[10px] text-ui-muted font-bold tracking-wider">RATING PENYELESAIAN</div>
                  <div className="text-ui-warning text-xl tracking-widest">{'★'.repeat(currentReport.rating)}{'☆'.repeat(5 - currentReport.rating)}</div>
                </div>
                <div className="pt-3 border-t border-dark-border">
                  <div className="text-[10px] text-ui-muted font-bold tracking-wider mb-2">FEEDBACK PELAPOR</div>
                  {currentReport.feedback_text ? (
                    <div className="text-[13px] text-ui-text italic leading-relaxed bg-dark-bg/60 px-3 py-2.5 rounded-lg border border-dark-border/50">
                      "{currentReport.feedback_text}"
                    </div>
                  ) : (
                    <div className="text-[12px] text-ui-dim italic">
                      Pelapor tidak memberikan ulasan teks.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          {/* Right: map */}
          <div className="lg:col-span-1">
            {currentReport.latitude && currentReport.longitude ? (
              <div className="card overflow-hidden h-full min-h-[400px] flex flex-col">
                <div className="px-4 pt-3 pb-2 flex items-center gap-2 border-b border-dark-border">
                  <MapPin className="w-3.5 h-3.5 text-brand-primary" />
                  <span className="text-[10px] text-ui-muted font-bold tracking-wider">LOKASI DI PETA</span>
                  <span className="ml-auto text-[10px] text-ui-dim font-mono">{parseFloat(currentReport.latitude).toFixed(5)}, {parseFloat(currentReport.longitude).toFixed(5)}</span>
                </div>
                <div ref={mapRef} className="flex-1" />
              </div>
            ) : (
              <div className="card p-6 flex flex-col items-center justify-center text-center min-h-[200px]">
                <MapPin className="w-8 h-8 text-ui-dim mb-3" />
                <div className="text-[13px] text-ui-muted font-medium">Koordinat tidak tersedia</div>
                <div className="text-[11px] text-ui-dim mt-1">Laporan ini tidak memiliki titik lokasi di peta</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Foto Bukti */}
      {activeTab === 'Foto Bukti' && (() => {
        const reportPhotos = photos.filter(p => p.type !== 'bukti_penyelesaian');
        const completionPhotos = photos.filter(p => p.type === 'bukti_penyelesaian');

        const renderPhotoGrid = (photoList) => (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {photoList.map(photo => (
              <div key={photo.id} className="relative group rounded-xl overflow-hidden border border-dark-border bg-dark-bg aspect-square">
                <img
                  src={photo.photo_data.startsWith('data:') ? photo.photo_data : `data:${photo.mime_type || 'image/jpeg'};base64,${photo.photo_data}`}
                  alt={photo.original_name || 'foto'}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => setPreviewImage(photo.photo_data.startsWith('data:') ? photo.photo_data : `data:${photo.mime_type || 'image/jpeg'};base64,${photo.photo_data}`)}
                    className="p-2 bg-dark-card/80 rounded-lg hover:bg-dark-card"
                  >
                    <Search className="w-4 h-4 text-white" />
                  </button>
                  <button onClick={() => handleDeletePhoto(photo.id)} className="p-2 bg-red-500/80 rounded-lg hover:bg-red-500">
                    <Trash2 className="w-4 h-4 text-white" />
                  </button>
                </div>
                {photo.original_name && (
                  <div className="absolute bottom-0 left-0 right-0 px-2 py-1 bg-black/60 text-[9px] text-white truncate">{photo.original_name}</div>
                )}
              </div>
            ))}
          </div>
        );

        return (
          <div className="animate-fade-in flex flex-col gap-8">
            {isLoadingPhotos ? (
              <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-brand-primary" /></div>
            ) : (
              <>
                {/* Seksi 1: Foto Kerusakan */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-dark-border">
                    <div className="w-1 h-4 rounded-full bg-brand-primary" />
                    <div className="text-[12px] text-ui-text font-bold uppercase tracking-wider">FOTO KERUSAKAN DARI PELAPOR ({reportPhotos.length})</div>
                  </div>
                  {reportPhotos.length > 0 ? renderPhotoGrid(reportPhotos) : (
                    <div className="p-8 border border-dashed border-dark-border/60 bg-dark-bg/20 rounded-xl text-center text-[13px] text-ui-dim">
                      Belum ada foto laporan kerusakan.
                    </div>
                  )}
                </div>

                {/* Seksi 2: Foto Hasil Perbaikan */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-dark-border">
                    <div className="w-1 h-4 rounded-full bg-emerald-500" />
                    <div className="text-[12px] text-ui-text font-bold uppercase tracking-wider">FOTO HASIL PERBAIKAN TEKNISI ({completionPhotos.length})</div>
                  </div>
                  {completionPhotos.length > 0 ? renderPhotoGrid(completionPhotos) : (
                    <div className="p-8 border border-dashed border-dark-border/60 bg-dark-bg/20 rounded-xl text-center text-[13px] text-ui-dim">
                      Belum ada foto bukti penyelesaian tugas dari teknisi.
                    </div>
                  )}
                </div>


              </>
            )}
          </div>
        );
      })()}

      {/* Tab: Riwayat */}
      {activeTab === 'Riwayat' && (
        <div className="animate-fade-in max-w-2xl">
          <div className="flex flex-col gap-0 pl-4">
            {(currentReport.histories || []).map((h, i) => (
              <div key={i} className="relative pb-6 pl-6 border-l-2 border-dark-border last:border-l-transparent last:pb-0">
                <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-brand-primary ring-4 ring-dark-bg" />
                <div className="text-[14px] font-bold text-ui-text leading-none mb-1.5">{h.title}</div>
                <div className="text-[12px] text-ui-muted mb-1">
                  {new Date(h.created_at).toLocaleString('id-ID')}
                  {h.user?.name ? ` · oleh ${h.user.name}` : ''}
                </div>
                {h.description && (
                  <div className="text-[12px] text-ui-dim bg-dark-bg/50 border border-dark-border/40 rounded-lg px-3 py-2 mt-1.5 leading-relaxed italic">
                    "{h.description}"
                  </div>
                )}
              </div>
            ))}
            {!(currentReport.histories?.length) && <div className="text-[13px] text-ui-muted py-4">Belum ada riwayat tercatat.</div>}
          </div>
        </div>
      )}

      {/* Premium Confirmation Dialog */}
      {confirmDialog && (
        <div 
          className="fixed inset-0 bg-zinc-950/45 backdrop-blur-sm z-[1000] flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setConfirmDialog(null)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl border border-zinc-100 max-w-sm w-full p-6 text-center animate-scale-in relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Icon */}
            {(() => {
              const IconComponent = confirmDialog.icon || AlertTriangle;
              const colorClasses = {
                danger: 'bg-red-50 text-red-600 border-red-100 shadow-sm',
                success: 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm',
                warning: 'bg-amber-50 text-amber-600 border-amber-100 shadow-sm',
              }[confirmDialog.type] || 'bg-zinc-50 text-zinc-600 border-zinc-100 shadow-sm';

              return (
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 mx-auto border ${colorClasses}`}>
                  <IconComponent className="w-5 h-5" />
                </div>
              );
            })()}
            
            <h3 className="font-display font-bold text-lg text-brand-secondary leading-snug mb-2">
              {confirmDialog.title}
            </h3>
            
            <p className="text-sm text-ui-muted mb-6">
              {confirmDialog.message}
            </p>
            
            <div className="flex gap-3">
              <button
                className="btn btn-ghost flex-1 py-2.5 text-xs font-semibold justify-center hover:bg-zinc-50"
                onClick={() => setConfirmDialog(null)}
              >
                Batal
              </button>
              {(() => {
                const btnClass = {
                  danger: 'bg-red-600 text-white hover:bg-red-700',
                  success: 'bg-emerald-600 text-white hover:bg-emerald-700',
                  warning: 'bg-amber-600 text-white hover:bg-amber-700',
                }[confirmDialog.type] || 'bg-brand-primary text-white hover:bg-brand-dim';

                return (
                  <button
                    className={`btn flex-1 py-2.5 text-xs font-semibold justify-center rounded-xl shadow-sm ${btnClass}`}
                    onClick={async () => {
                      const onConfirm = confirmDialog.onConfirm;
                      setConfirmDialog(null);
                      await onConfirm();
                    }}
                  >
                    Konfirmasi
                  </button>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewImage && createPortal(
        <div 
          className="fixed inset-0 bg-black/95 backdrop-blur-md z-[9999] flex items-center justify-center animate-fade-in"
          onClick={() => { setPreviewImage(null); setZoomLevel(1); }}
        >
          {/* Close Button */}
          <button 
            className="absolute top-6 right-6 z-[10000] p-3 bg-white/10 hover:bg-white/25 text-white rounded-full transition-all backdrop-blur-md"
            onClick={(e) => { e.stopPropagation(); setPreviewImage(null); setZoomLevel(1); }}
            title="Tutup Preview"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
          
          {/* Zoom Controls */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[10000] flex items-center gap-4 bg-zinc-900/90 backdrop-blur-md px-6 py-3 rounded-full border border-white/20 shadow-2xl" onClick={e => e.stopPropagation()}>
            <button className="text-white hover:text-brand-primary transition-colors p-1.5" onClick={() => setZoomLevel(z => Math.max(0.5, z - 0.25))} title="Zoom Out">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14"/></svg>
            </button>
            <span className="text-white text-[14px] font-mono font-bold w-14 text-center select-none">{Math.round(zoomLevel * 100)}%</span>
            <button className="text-white hover:text-brand-primary transition-colors p-1.5" onClick={() => setZoomLevel(z => Math.min(4, z + 0.25))} title="Zoom In">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
            </button>
          </div>

          <div 
            ref={containerRef}
            className={`relative w-full h-full overflow-auto custom-scrollbar p-4 md:p-12 select-none ${zoomLevel <= 1 ? 'flex items-center justify-center' : 'block text-center'}`}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
            onContextMenu={handleContextMenu}
          >
            <img 
              src={previewImage} 
              alt="Preview" 
              className={`max-w-none shadow-2xl transition-all duration-200 inline-block`}
              style={{ 
                width: `${Math.max(30, 100 * zoomLevel)}%`, 
                maxHeight: zoomLevel <= 1 ? '100%' : 'none',
                objectFit: 'contain',
                cursor: zoomLevel > 1 ? 'crosshair' : 'zoom-in',
                verticalAlign: 'middle'
              }}
              onClick={() => setZoomLevel(z => z >= 3 ? 1 : z + 0.5)}
              onContextMenu={(e) => e.preventDefault()}
              draggable="false"
            />
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
