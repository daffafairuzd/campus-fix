import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Edit2, Trash2, MapPin, Upload, Search, Loader2 } from 'lucide-react';
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

  const mapRef = useRef(null);
  const mapInstance = useRef(null);

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
    setIsUploadingPhoto(true);
    try {
      for (const file of files) {
        const b64 = await fileToBase64(file);
        await api.post(`/reports/${currentReport.id}/photos`, { photo_data: b64, original_name: file.name, mime_type: file.type, type: 'bukti_laporan' });
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
    const FLOW = { menunggu:'dalam_proses', dalam_proses:'selesai', selesai:'menunggu', eskalasi:'dalam_proses' };
    const next = FLOW[currentReport.status] || 'menunggu';
    try {
      const res = await api.post(`/reports/${currentReport.id}/status`, { status: next, description: `Status diupdate ke ${next}` });
      setCurrentReport(res.data);
      if (onStatusUpdated) onStatusUpdated(res.data);
    } catch (err) { alert('Gagal update status: ' + (err.response?.data?.message || err.message)); }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Yakin hapus laporan ${currentReport.report_number}?`)) return;
    try { await api.delete(`/reports/${currentReport.id}`); onDeleted(); }
    catch (err) { alert('Gagal hapus: ' + (err.response?.data?.message || err.message)); }
  };

  const NEXT_LABEL = { menunggu:'Dalam Proses', dalam_proses:'Selesai', selesai:'Menunggu', eskalasi:'Dalam Proses' };

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
          <button className="btn btn-primary" onClick={handleUpdateStatus}>
            Update Status <span className="font-normal opacity-70 ml-1">→ {NEXT_LABEL[currentReport.status]}</span>
          </button>
          <button className="btn btn-ghost px-3" onClick={() => onEdit(currentReport)} title="Edit"><Edit2 className="w-4 h-4" /></button>
          <button className="btn btn-danger px-3" onClick={handleDelete} title="Hapus"><Trash2 className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-dark-border">
        {['Detail','Foto Bukti','Riwayat'].map(tab => (
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
                ['Teknisi', (currentReport.active_technicians||[]).map(t=>t.name).join(', ') || 'Belum ditugaskan'],
                ['Deadline SLA', new Date(currentReport.sla_deadline).toLocaleString('id-ID')],
              ].map(([k,v]) => (
                <div key={k} className="card p-4">
                  <div className="text-[10px] text-ui-muted font-bold tracking-wider mb-1.5">{k.toUpperCase()}</div>
                  <div className="text-[14px] text-ui-text font-semibold">{v}</div>
                </div>
              ))}
            </div>
            {currentReport.rating && (
              <div className="card p-4 flex justify-between items-center">
                <div className="text-[10px] text-ui-muted font-bold tracking-wider">RATING PENYELESAIAN</div>
                <div className="text-ui-warning text-xl tracking-widest">{'★'.repeat(currentReport.rating)}{'☆'.repeat(5-currentReport.rating)}</div>
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
      {activeTab === 'Foto Bukti' && (
        <div className="animate-fade-in">
          <div className="text-[11px] text-ui-muted font-bold uppercase tracking-wider mb-4">FOTO LAPORAN ({photos.length}/5)</div>
          {isLoadingPhotos ? (
            <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-brand-primary" /></div>
          ) : (
            <div className="flex flex-col gap-4">
              {photos.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {photos.map(photo => (
                    <div key={photo.id} className="relative group rounded-xl overflow-hidden border border-dark-border bg-dark-bg aspect-square">
                      <img src={photo.photo_data} alt={photo.original_name || 'foto'} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <a href={photo.photo_data} target="_blank" rel="noreferrer" className="p-2 bg-dark-card/80 rounded-lg hover:bg-dark-card">
                          <Search className="w-4 h-4 text-white" />
                        </a>
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
              )}
              {photos.length < 5 && (
                <label className={`flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-xl transition-colors cursor-pointer group ${isUploadingPhoto ? 'border-brand-primary/50 bg-brand-primary/5' : 'border-dark-border bg-dark-bg hover:bg-dark-hover hover:border-brand-primary/50'}`}>
                  {isUploadingPhoto ? <Loader2 className="w-10 h-10 animate-spin text-brand-primary mb-3" /> : <Upload className="w-10 h-10 text-ui-dim group-hover:text-brand-primary mb-3 transition-colors" />}
                  <div className="text-[14px] text-ui-text font-medium mb-1">{isUploadingPhoto ? 'Mengupload...' : 'Klik atau drag & drop foto'}</div>
                  <div className="text-[12px] text-ui-muted">PNG, JPG, WEBP — maks {5 - photos.length} foto lagi</div>
                  <input type="file" accept="image/*" multiple className="hidden" disabled={isUploadingPhoto} onChange={handlePhotoUpload} />
                </label>
              )}
              {photos.length === 0 && !isUploadingPhoto && (
                <p className="text-center text-[13px] text-ui-muted py-4">Belum ada foto bukti yang diupload.</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab: Riwayat */}
      {activeTab === 'Riwayat' && (
        <div className="animate-fade-in max-w-2xl">
          <div className="flex flex-col gap-0 pl-4">
            {(currentReport.histories || []).map((h, i) => (
              <div key={i} className="relative pb-6 pl-6 border-l-2 border-dark-border last:border-l-transparent last:pb-0">
                <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-brand-primary ring-4 ring-dark-bg" />
                <div className="text-[14px] font-bold text-ui-text leading-none mb-1.5">{h.title}</div>
                <div className="text-[12px] text-ui-muted">
                  {new Date(h.created_at).toLocaleString('id-ID')}
                  {h.description ? ` · ${h.description}` : ''}
                  {h.user?.name ? ` oleh ${h.user.name}` : ''}
                </div>
              </div>
            ))}
            {!(currentReport.histories?.length) && <div className="text-[13px] text-ui-muted py-4">Belum ada riwayat tercatat.</div>}
          </div>
        </div>
      )}
    </div>
  );
}
