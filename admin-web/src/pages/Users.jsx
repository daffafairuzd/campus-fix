import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, Plus, X, Edit, Trash2, AlertTriangle, UserCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { Avatar, Badge } from '../components/ui';
import api from '../api';

const SPECIALTY_OPTIONS = [
  'Listrik', 'HVAC', 'Plumbing', 'Jaringan & IT',
  'Lab & Komputer', 'Lift & Mekanikal', 'Umum',
];

export default function Users() {
  const [filters, setFilters] = useState({ search: "", role: "Semua", page: 1, per_page: 10 });
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [usersData, setUsersData] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userSummary, setUserSummary] = useState({ admin: 0, teknisi: 0, pelapor: 0 });
  const [tempPassword, setTempPassword] = useState(null); // for new accounts

  const [userForm, setUserForm] = useState({ id: '', name: '', email: '', nim: '', role: 'teknisi', status: 'aktif', specialty: [], availability_status: 'aktif' });

  // Toggle satu keahlian di/off dalam array
  const toggleSpecialty = (opt) => {
    setUserForm(prev => ({
      ...prev,
      specialty: prev.specialty.includes(opt)
        ? prev.specialty.filter(s => s !== opt)
        : [...prev.specialty, opt],
    }));
  };

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const CURRENT_USER_ID = currentUser.id;

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      params.append('page', filters.page);
      params.append('per_page', filters.per_page);
      if (filters.search) params.append('search', filters.search);
      if (filters.role && filters.role !== 'Semua') params.append('role', filters.role.toLowerCase());

      const res = await api.get('/users?' + params.toString());
      setUsersData(res.data.data || []);
      if (res.data.summary) setUserSummary(res.data.summary);
      setPagination({
        current_page: res.data.current_page || 1,
        last_page: res.data.last_page || 1,
        total: res.data.total || 0
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const summary = ["admin", "teknisi", "pelapor"].map(r => ({
    role: r.charAt(0).toUpperCase() + r.slice(1),
    count: userSummary[r] || 0
  }));

  const handleSaveUser = async (e) => {
    e.preventDefault();
    if (!userForm.name || !userForm.email) return;

    try {
      if (isEditMode) {
        await api.put(`/users/${userForm.id}`, { ...userForm, specialty: userForm.specialty.join(', ') });
        closeModal();
        fetchUsers();
      } else {
        const res = await api.post('/users', { ...userForm, specialty: userForm.specialty.join(', ') });
        setTempPassword(res.data.temp_password);
        fetchUsers();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Terjadi kesalahan');
    }
  };

  const handleEditClick = (u) => {
    setUserForm({
      id: u.id,
      name: u.name,
      email: u.email,
      nim: u.nim || '',
      role: u.role,
      status: u.status,
      specialty: u.technician?.specialty ? u.technician.specialty.split(',').map(s => s.trim()).filter(Boolean) : [],
      availability_status: u.technician?.availability_status || 'aktif'
    });
    setIsEditMode(true);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setIsEditMode(false);
    setTempPassword(null);
    setUserForm({ id: '', name: '', email: '', nim: '', role: 'teknisi', status: 'aktif', specialty: [], availability_status: 'aktif' });
  };

  const handleDeleteClick = (u) => {
    if (u.id === CURRENT_USER_ID) {
      alert("Anda tidak dapat menghapus akun Anda sendiri.");
      return;
    }
    setDeleteConfirm(u);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await api.delete(`/users/${deleteConfirm.id}`);
      setUsersData(prev => prev.filter(u => u.id !== deleteConfirm.id));
    } catch (err) {
      alert('Gagal menghapus user');
    }
    setDeleteConfirm(null);
  };

  return (
    <div className="p-6 md:p-7 flex flex-col gap-6 relative">

      {/* Confirm Delete Dialog */}
      {deleteConfirm && createPortal(
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-dark-bg/80 animate-fade-in">
          <div className="bg-dark-card border border-ui-danger/40 rounded-lg w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-5 h-5 text-ui-danger flex-shrink-0" />
              <div className="font-bold text-ui-text text-[15px]">Hapus User</div>
            </div>
            <p className="text-[13px] text-ui-dim mb-5 leading-relaxed">
              Yakin ingin menghapus <strong className="text-ui-text">{deleteConfirm.name}</strong>? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-3">
              <button className="btn btn-ghost flex-1" onClick={() => setDeleteConfirm(null)}>Batal</button>
              <button className="btn btn-danger flex-1" onClick={confirmDelete}>Ya, Hapus</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {summary.map(s => (
          <div key={s.role} className="card p-5 flex justify-between items-center group">
            <div>
              <div className="text-[11px] text-ui-muted font-bold tracking-widest uppercase mb-1">{s.role}</div>
              <div className="text-[28px] font-bold text-ui-text">{s.count}</div>
            </div>
            <Badge label={s.role} role={s.role} />
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-ui-muted" />
          <input
            className="input pl-9"
            placeholder="Cari nama, email, atau NIM/NIP..."
            value={filters.search}
            onChange={e => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
          />
        </div>
        <select className="input w-[160px]" value={filters.role} onChange={e => setFilters(prev => ({ ...prev, role: e.target.value, page: 1 }))}>
          {["Semua", "Admin", "Teknisi", "Pelapor"].map(s => <option key={s} value={s} className="bg-dark-bg">{s}</option>)}
        </select>
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-ui-muted font-semibold">Tampilkan:</span>
          <select
            className="input w-[75px]"
            value={filters.per_page}
            onChange={e => setFilters(prev => ({ ...prev, per_page: parseInt(e.target.value), page: 1 }))}
          >
            {[10, 20, 50].map(val => (
              <option key={val} value={val} className="bg-dark-bg">{val}</option>
            ))}
          </select>
        </div>
        <button className="btn btn-primary" onClick={() => { setIsEditMode(false); setShowModal(true); }}>
          <Plus className="w-3.5 h-3.5" /> Tambah User
        </button>
      </div>

      {/* Table */}
      <div className="card overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-dark-bg border-b border-dark-border">
              {["User", "NIM/NIP", "Role", "Status", "Aksi"].map(h => (
                <th key={h} className="py-3 px-4 text-[10px] text-ui-muted font-bold tracking-wider uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {usersData.map(u => {
              const isSelf = u.id === CURRENT_USER_ID;
              return (
                <tr key={u.id} className="table-row border-b border-dark-border/40 last:border-0 hover:bg-dark-hover transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <Avatar initials={u.name.split(" ").map(w => w[0]).join("").slice(0, 2)} size={32} />
                      <div>
                        <div className="text-[13px] font-bold text-ui-text flex items-center gap-2">
                          {u.name}
                          {isSelf && <span className="text-[9px] bg-brand-primary/20 text-brand-primary border border-brand-primary/30 px-1.5 py-0.5 rounded-full font-bold">Anda</span>}
                        </div>
                        <div className="text-[11px] text-ui-muted mt-0.5">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-ui-muted">{u.nim}</td>
                  <td className="py-3 px-4"><Badge label={u.role} role={u.role} /></td>
                  <td className="py-3 px-4">
                    <Badge label={u.status} status={u.status} />
                    {u.role === 'teknisi' && u.technician?.availability_status === 'cuti' && (
                      <span className="ml-1.5 text-[9px] bg-ui-muted/20 text-ui-muted px-1.5 py-0.5 rounded-sm font-semibold">Cuti</span>
                    )}
                  </td>
                  <td className="py-3 px-4 flex gap-2">
                    <button className="btn btn-ghost py-1 px-2 text-[11px]" onClick={() => handleEditClick(u)}><Edit className="w-3.5 h-3.5" /></button>
                    <button
                      className={`btn py-1 px-2 text-[11px] ${isSelf ? 'opacity-30 cursor-not-allowed bg-dark-hover border-dark-border text-ui-muted' : 'btn-danger'}`}
                      onClick={() => handleDeleteClick(u)}
                      title={isSelf ? 'Tidak dapat menghapus akun sendiri' : 'Hapus user'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {usersData.length === 0 && <div className="p-10 text-center text-ui-muted text-[13px]">User tidak ditemukan.</div>}
      </div>

      {/* Pagination Controls */}
      {pagination && pagination.last_page > 1 && (
        <div className="flex items-center justify-between px-2 mt-2">
          <div className="text-[12px] text-ui-muted">
            Menampilkan halaman <span className="font-bold text-ui-text">{pagination.current_page}</span> dari <span className="font-bold text-ui-text">{pagination.last_page}</span>
            <span className="ml-2">({pagination.total} total user)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              className={`p-1.5 rounded-md border ${pagination.current_page === 1 ? 'border-transparent text-ui-muted opacity-50 cursor-not-allowed' : 'border-dark-border text-ui-text hover:bg-dark-hover'}`}
              onClick={() => setFilters(prev => ({ ...prev, page: pagination.current_page - 1 }))}
              disabled={pagination.current_page === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex gap-1">
              {[...Array(pagination.last_page)].map((_, i) => {
                const pageNum = i + 1;
                if (pageNum === 1 || pageNum === pagination.last_page || (pageNum >= pagination.current_page - 1 && pageNum <= pagination.current_page + 1)) {
                  return (
                    <button
                      key={pageNum}
                      className={`w-7 h-7 flex items-center justify-center rounded-md text-[11px] font-bold transition-colors ${pageNum === pagination.current_page ? 'bg-brand-primary text-white border-none' : 'border border-dark-border text-ui-text hover:bg-dark-hover'}`}
                      onClick={() => setFilters(prev => ({ ...prev, page: pageNum }))}
                    >
                      {pageNum}
                    </button>
                  );
                } else if (pageNum === pagination.current_page - 2 || pageNum === pagination.current_page + 2) {
                  return <span key={pageNum} className="text-ui-muted px-1">...</span>;
                }
                return null;
              })}
            </div>
            <button
              className={`p-1.5 rounded-md border ${pagination.current_page === pagination.last_page ? 'border-transparent text-ui-muted opacity-50 cursor-not-allowed' : 'border-dark-border text-ui-text hover:bg-dark-hover'}`}
              onClick={() => setFilters(prev => ({ ...prev, page: pagination.current_page + 1 }))}
              disabled={pagination.current_page === pagination.last_page}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Add/Edit User Modal */}
      {showModal && createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-dark-bg/80 animate-fade-in" onClick={closeModal}>
          <div className="bg-dark-card border border-dark-border rounded-lg w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-dark-border flex justify-between items-center bg-dark-hover">
              <div className="font-bold text-ui-text text-[15px]">{isEditMode ? `Edit User: ${userForm.id}` : 'Tambah User Baru'}</div>
              <button className="text-ui-dim hover:text-ui-text" onClick={closeModal}><X className="w-4 h-4" /></button>
            </div>
            {tempPassword ? (
              <div className="px-8 py-10 flex flex-col items-center text-center animate-fade-in">
                <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mb-6">
                  <UserCheck className="w-8 h-8 text-brand-primary" />
                </div>
                <h3 className="text-xl font-bold text-ui-text mb-2">Akun Berhasil Dibuat!</h3>
                <p className="text-sm text-ui-dim mb-8 max-w-[280px]">
                  Berikan password sementara di bawah ini kepada user tersebut.
                </p>

                <div className="w-full bg-dark-bg border border-dark-border rounded-xl p-5 mb-8 flex flex-col gap-2 group relative">
                  <span className="text-[10px] font-bold text-ui-muted tracking-widest uppercase">Password Sementara</span>
                  <div className="text-2xl font-mono font-bold text-brand-primary tracking-wider select-all cursor-pointer">
                    {tempPassword}
                  </div>
                </div>

                <button className="btn btn-primary w-full py-3" onClick={closeModal}>
                  Selesai & Tutup
                </button>
              </div>
            ) : (
              <form onSubmit={handleSaveUser}>
                <div className="px-6 py-5 flex flex-col gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold tracking-wider text-ui-muted mb-1.5">NAMA LENGKAP</label>
                    <input type="text" className="input text-[12px]" placeholder="Masukkan nama..." value={userForm.name} onChange={e => setUserForm({ ...userForm, name: e.target.value })} required />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold tracking-wider text-ui-muted mb-1.5">EMAIL AKADEMIK</label>
                    <input type="email" className="input text-[12px]" placeholder="email@telkomuniversity.ac.id" value={userForm.email} onChange={e => setUserForm({ ...userForm, email: e.target.value })} required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold tracking-wider text-ui-muted mb-1.5">NIP / NIM</label>
                      <input type="text" className="input text-[12px] font-mono" placeholder="Kosongkan jika tidak ada" value={userForm.nim} onChange={e => setUserForm({ ...userForm, nim: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold tracking-wider text-ui-muted mb-1.5">ROLE AKSES</label>
                      <select className="input text-[12px]" value={userForm.role} onChange={e => setUserForm({ ...userForm, role: e.target.value })}>
                        {["Teknisi", "Admin", "Pelapor"].map(r => <option key={r} value={r.toLowerCase()} className="bg-dark-bg">{r}</option>)}
                      </select>
                    </div>
                  </div>
                  {/* Keahlian — tampil jika role = teknisi (create & edit) */}
                  {userForm.role === 'teknisi' && (
                    <div>
                      <label className="block text-[11px] font-semibold tracking-wider text-ui-muted mb-2">KEAHLIAN (pilih satu atau lebih)</label>
                      <div className="grid grid-cols-2 gap-2">
                        {SPECIALTY_OPTIONS.map(opt => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => toggleSpecialty(opt)}
                            className={`text-left text-[11px] px-3 py-2 rounded-lg border transition-colors ${userForm.specialty.includes(opt)
                                ? 'bg-brand-primary/15 border-brand-primary text-brand-primary font-semibold'
                                : 'bg-dark-bg border-dark-border text-ui-dim hover:border-dark-border/80'
                              }`}
                          >
                            {userForm.specialty.includes(opt) ? '✓ ' : ''}{opt}
                          </button>
                        ))}
                      </div>
                      {userForm.specialty.length === 0 && (
                        <p className="text-[10px] text-ui-danger mt-1.5">Pilih minimal 1 keahlian untuk teknisi.</p>
                      )}
                    </div>
                  )}

                  {!isEditMode && (
                    <div className="bg-dark-bg border border-brand-primary/20 rounded-lg p-3">
                      <div className="text-[10px] text-brand-primary font-bold mb-1">📌 INFO PEMBUATAN AKUN</div>
                      <div className="text-[11px] text-ui-dim leading-relaxed">
                        Password sementara akan digenerate otomatis. Minta user untuk mengganti password saat login pertama kali.
                      </div>
                    </div>
                  )}
                  {isEditMode && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-semibold tracking-wider text-ui-muted mb-1.5">STATUS AKUN (LOGIN)</label>
                        <select className="input text-[12px]" value={userForm.status} onChange={e => setUserForm({ ...userForm, status: e.target.value })}>
                          {["Aktif", "Nonaktif"].map(s => <option key={s} value={s.toLowerCase()} className="bg-dark-bg">{s}</option>)}
                        </select>
                      </div>
                      {userForm.role === 'teknisi' && (
                        <div>
                          <label className="block text-[11px] font-semibold tracking-wider text-ui-muted mb-1.5">KETERSEDIAAN TEKNISI</label>
                          <select className="input text-[12px]" value={userForm.availability_status} onChange={e => setUserForm({ ...userForm, availability_status: e.target.value })}>
                            <option value="aktif" className="bg-dark-bg">Tersedia (Aktif)</option>
                            <option value="cuti" className="bg-dark-bg">Sedang Cuti / Libur</option>
                          </select>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="px-6 py-4 bg-dark-hover flex justify-end gap-3 border-t border-dark-border">
                  <button type="button" className="btn btn-ghost" onClick={closeModal}>Batal</button>
                  <button type="submit" className="btn btn-primary">{isEditMode ? 'Simpan Perubahan' : 'Buat Akun'}</button>
                </div>
              </form>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
