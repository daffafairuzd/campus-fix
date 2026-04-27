import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, MapPin, Loader2 } from 'lucide-react';
import api from '../../api';

const DEFAULT_CENTER = [-6.9718, 107.6301];

// Bounding box Telkom University Bandung (dengan sedikit padding)
const CAMPUS_BOUNDS = [
  [-6.9775, 107.6240], // Southwest corner
  [-6.9655, 107.6365], // Northeast corner
];
const CAMPUS_MIN_ZOOM = 15;
const CATEGORIES = ['Listrik','HVAC','Plumbing','Lab','Jaringan','Lift','Bangunan','Umum'];

const fileToBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

export default function ReportForm({ mode = 'add', initialData = null, onBack, onSaved }) {
  const isEdit = mode === 'edit';
  const [form, setForm] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    category: initialData?.category || CATEGORIES[0],
    location: initialData?.location || '',
    priority: initialData?.priority || 'sedang',
    latitude: initialData?.latitude || '',
    longitude: initialData?.longitude || '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerRef = useRef(null);

  // Toast warning state untuk klik di luar kampus
  const [outOfBoundsWarning, setOutOfBoundsWarning] = useState(false);
  const warningTimerRef = useRef(null);

  const showOutOfBoundsWarning = () => {
    setOutOfBoundsWarning(true);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    warningTimerRef.current = setTimeout(() => setOutOfBoundsWarning(false), 3000);
  };

  // Init map
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!mapRef.current || !window.L) return;
      if (mapInstance.current) { mapInstance.current.remove(); }
      const L = window.L;
      const lat = parseFloat(form.latitude) || DEFAULT_CENTER[0];
      const lng = parseFloat(form.longitude) || DEFAULT_CENTER[1];

      const bounds = L.latLngBounds(CAMPUS_BOUNDS);

      const map = L.map(mapRef.current, {
        maxBounds: bounds,
        maxBoundsViscosity: 1.0, // Tidak bisa keluar sama sekali
        minZoom: CAMPUS_MIN_ZOOM,
      }).setView([lat, lng], form.latitude ? 17 : 16);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map);

      // Tambahkan overlay batas kampus (polygon transparan)
      L.rectangle(bounds, {
        color: '#dc2626',
        weight: 2,
        fillOpacity: 0.04,
        dashArray: '6,4',
      }).addTo(map).bindTooltip('Area Kampus Telkom University', { permanent: false, direction: 'top' });

      if (form.latitude && form.longitude) {
        markerRef.current = L.marker([parseFloat(form.latitude), parseFloat(form.longitude)]).addTo(map);
      }

      map.on('click', (e) => {
        // Validasi: klik harus di dalam bounding box kampus
        if (!bounds.contains(e.latlng)) {
          showOutOfBoundsWarning();
          return;
        }
        if (markerRef.current) markerRef.current.remove();
        markerRef.current = L.marker([e.latlng.lat, e.latlng.lng]).addTo(map);
        setForm(p => ({ ...p, latitude: e.latlng.lat.toFixed(7), longitude: e.latlng.lng.toFixed(7) }));
      });

      mapInstance.current = map;
    }, 150);
    return () => {
      clearTimeout(timer);
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
      if (mapInstance.current) { mapInstance.current.remove(); mapInstance.current = null; markerRef.current = null; }
    };
  }, []);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSaving(true);
    try {
      const payload = { ...form, latitude: form.latitude || null, longitude: form.longitude || null };
      let reportId;
      if (isEdit) {
        await api.put(`/reports/${initialData.id}`, payload);
        reportId = initialData.id;
      } else {
        const res = await api.post('/reports', payload);
        reportId = res.data.id;
        // Upload photos if any
        const fileInput = e.target.querySelector('input[name="photos"]');
        if (fileInput?.files.length) {
          for (const file of Array.from(fileInput.files).slice(0, 5)) {
            const b64 = await fileToBase64(file);
            await api.post(`/reports/${reportId}/photos`, { photo_data: b64, original_name: file.name, mime_type: file.type, type: 'bukti_laporan' });
          }
        }
      }
      onSaved(reportId);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan laporan.');
    } finally {
      setIsSaving(false);
    }
  };

  const set = (key) => (e) => setForm(p => ({ ...p, [key]: e.target.value }));

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button type="button" onClick={onBack} className="btn btn-ghost px-2.5 py-1.5 text-[12px] flex items-center gap-1.5">
          <ArrowLeft className="w-4 h-4" /> Kembali
        </button>
        <div className="w-px h-6 bg-dark-border" />
        <h2 className="font-bold text-ui-text text-[20px]">{isEdit ? `Edit Laporan — ${initialData?.report_number}` : 'Buat Laporan Baru'}</h2>
      </div>

      {error && <div className="p-3 rounded-lg bg-ui-danger/10 border border-ui-danger/30 text-[12px] text-ui-danger">{error}</div>}

      {/* Body: 2 col */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: fields */}
        <div className="flex flex-col gap-4">
          <div className="card p-5 flex flex-col gap-4">
            <div>
              <label className="block text-[11px] font-semibold tracking-wider text-ui-muted mb-1.5">JUDUL MASALAH</label>
              <input type="text" className="input w-full" placeholder="Misal: AC mati total" value={form.title} onChange={set('title')} required />
            </div>
            <div>
              <label className="block text-[11px] font-semibold tracking-wider text-ui-muted mb-1.5">DESKRIPSI LENGKAP</label>
              <textarea className="input w-full h-28 py-2 resize-none" placeholder="Jelaskan detail masalah..." value={form.description} onChange={set('description')} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold tracking-wider text-ui-muted mb-1.5">KATEGORI</label>
                <select className="input w-full" value={form.category} onChange={set('category')} required>
                  {CATEGORIES.map(c => <option key={c} value={c} className="bg-dark-bg">{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold tracking-wider text-ui-muted mb-1.5">PRIORITAS</label>
                <select className="input w-full" value={form.priority} onChange={set('priority')} required>
                  <option value="rendah" className="bg-dark-bg">🟢 Rendah</option>
                  <option value="sedang" className="bg-dark-bg">🔵 Sedang</option>
                  <option value="tinggi" className="bg-dark-bg">🟡 Tinggi</option>
                  <option value="kritis" className="bg-dark-bg">🔴 Kritis</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-semibold tracking-wider text-ui-muted mb-1.5">LOKASI RUANGAN/GEDUNG</label>
              <input type="text" className="input w-full" placeholder="Misal: Gedung A Lt. 2" value={form.location} onChange={set('location')} required />
            </div>
            {!isEdit && (
              <div>
                <label className="block text-[11px] font-semibold tracking-wider text-ui-muted mb-1.5">FOTO BUKTI (OPSIONAL)</label>
                <input name="photos" type="file" accept="image/*" multiple
                  className="input w-full p-1.5 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-[11px] file:font-semibold file:bg-dark-hover file:text-brand-primary" />
              </div>
            )}
          </div>
          {/* Coordinates display */}
          {form.latitude && form.longitude && (
            <div className="card p-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand-primary flex-shrink-0" />
              <div>
                <div className="text-[10px] text-ui-muted font-bold tracking-wider mb-0.5">KOORDINAT DIPILIH</div>
                <div className="text-[12px] text-brand-primary font-mono">{parseFloat(form.latitude).toFixed(5)}, {parseFloat(form.longitude).toFixed(5)}</div>
              </div>
              <button type="button" className="ml-auto text-[11px] text-ui-muted hover:text-ui-danger transition-colors"
                onClick={() => { setForm(p => ({ ...p, latitude: '', longitude: '' })); if (markerRef.current) { markerRef.current.remove(); markerRef.current = null; } }}>
                × Hapus titik
              </button>
            </div>
          )}
        </div>

        {/* Right: Map */}
        <div className="card overflow-hidden flex flex-col min-h-[500px] relative">
          <div className="px-4 pt-3 pb-2 border-b border-dark-border flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-brand-primary" />
            <span className="text-[10px] text-ui-muted font-bold tracking-wider">TITIK LOKASI DI PETA</span>
            <span className="ml-auto text-[10px] text-ui-dim">(klik dalam area kampus untuk menandai)</span>
          </div>
          <div ref={mapRef} className="flex-1" />

          {/* Toast: klik di luar kampus */}
          {outOfBoundsWarning && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[9999] bg-ui-danger/90 text-white text-[12px] font-semibold px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-fade-in pointer-events-none">
              <MapPin className="w-3.5 h-3.5" />
              Titik di luar area Kampus Telkom University
            </div>
          )}
        </div>
      </div>

      {/* Footer actions */}
      <div className="flex justify-end gap-3 pb-4">
        <button type="button" className="btn btn-ghost" onClick={onBack}>Batal</button>
        <button type="submit" className="btn btn-primary flex items-center gap-2 min-w-[160px] justify-center" disabled={isSaving}>
          {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          {isSaving ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Simpan Laporan'}
        </button>
      </div>
    </form>
  );
}
