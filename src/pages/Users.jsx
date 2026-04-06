import React, { useState } from 'react';
import { Search, Plus, X, Edit, Trash2 } from 'lucide-react';
import { USERS } from '../data';
import { Avatar, Badge } from '../components/ui';

export default function Users() {
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("Semua");
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [usersData, setUsersData] = useState(USERS);

  // Form state
  const [userForm, setUserForm] = useState({ id:'', name:'', email:'', nim:'', role:'Admin', status:'Aktif' });

  const summary = ["Admin", "Teknisi", "Pelapor"].map(r => ({
    role: r, 
    count: usersData.filter(u => u.role === r).length
  }));

  const filtered = usersData.filter(u => {
    const q = search.toLowerCase();
    const matchSearch = u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.nim.toLowerCase().includes(q);
    const matchRole = filterRole === "Semua" || u.role === filterRole;
    return matchSearch && matchRole;
  });

  const handleSaveUser = (e) => {
    e.preventDefault();
    if(!userForm.name || !userForm.email) return;
    
    if (isEditMode) {
      setUsersData(prev => prev.map(u => u.id === userForm.id ? { ...userForm } : u));
    } else {
      const addedUser = { ...userForm, id: `USR-${usersData.length + 1}`.padStart(6, '0') };
      setUsersData(prev => [addedUser, ...prev]);
    }
    closeModal();
  };

  const handleEditClick = (u) => {
    setUserForm(u);
    setIsEditMode(true);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setIsEditMode(false);
    setUserForm({ id:'', name:'', email:'', nim:'', role:'Admin', status:'Aktif' });
  };

  const handleDeleteUser = (id) => {
    if(window.confirm("Apakah Anda yakin ingin menghapus user ini?")) {
      setUsersData(prev => prev.filter(u => u.id !== id));
    }
  }

  return (
    <div className="p-6 md:p-7 flex flex-col gap-6 relative">
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {summary.map(s => (
          <div key={s.role} className="card p-5 flex justify-between items-center group">
             <div>
                <div className="text-[11px] text-ui-muted font-bold tracking-widest uppercase mb-1">{s.role}</div>
                <div className="text-[28px] font-bold text-ui-text transition-transform group-hover:-translate-y-1">{s.count}</div>
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
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
        </div>
        <select className="input w-[160px]" value={filterRole} onChange={e => setFilterRole(e.target.value)}>
          {["Semua", "Admin", "Teknisi", "Pelapor"].map(s => <option key={s} className="bg-dark-bg">{s}</option>)}
        </select>
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
                <th key={h} className="py-3 px-4 text-[10px] text-ui-muted font-bold tracking-wider uppercase">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id} className="table-row border-b border-dark-border/40 last:border-0 hover:bg-dark-hover transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <Avatar initials={u.name.split(" ").map(w=>w[0]).join("").slice(0,2)} size={32} />
                    <div>
                      <div className="text-[13px] font-bold text-ui-text">{u.name}</div>
                      <div className="text-[11px] text-ui-muted mt-0.5">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 font-mono text-[11px] text-ui-muted">{u.nim}</td>
                <td className="py-3 px-4"><Badge label={u.role} role={u.role} /></td>
                <td className="py-3 px-4">
                  <Badge label={u.status} status={u.status === "Aktif" ? "Selesai" : "Pelapor"} />
                </td>
                <td className="py-3 px-4 flex gap-2">
                  <button className="btn btn-ghost py-1 px-2 text-[11px]" onClick={() => handleEditClick(u)}><Edit className="w-3.5 h-3.5" /></button>
                  <button className="btn btn-danger py-1 px-2 text-[11px]" onClick={() => handleDeleteUser(u.id)}><Trash2 className="w-3.5 h-3.5" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="p-10 text-center text-ui-muted text-[13px]">User tidak ditemukan.</div>
        )}
      </div>

      {/* Add/Edit User Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-dark-bg/80 backdrop-blur-sm animate-fade-in" onClick={closeModal}>
          <div className="bg-dark-card border border-dark-border rounded-xl w-full max-w-md shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-dark-border flex justify-between items-center bg-dark-hover">
              <div className="font-bold text-ui-text text-[15px]">{isEditMode ? `Detail / Edit: ${userForm.id}` : 'Tambah User Baru'}</div>
              <button className="text-ui-dim hover:text-ui-text" onClick={closeModal}><X className="w-4 h-4" /></button>
            </div>
            
            <form onSubmit={handleSaveUser}>
              <div className="px-6 py-5 flex flex-col gap-4">
                <div>
                  <label className="block text-[11px] font-semibold tracking-wider text-ui-muted mb-1.5">NAMA LENGKAP</label>
                  <input type="text" className="input text-[12px]" placeholder="Masukkan nama..." value={userForm.name} onChange={e=>setUserForm({...userForm, name:e.target.value})} required/>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold tracking-wider text-ui-muted mb-1.5">EMAIL AKADEMIK</label>
                  <input type="email" className="input text-[12px]" placeholder="email@telkomuniversity.ac.id" value={userForm.email} onChange={e=>setUserForm({...userForm, email:e.target.value})} required/>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold tracking-wider text-ui-muted mb-1.5">NIP / NIM</label>
                    <input type="text" className="input text-[12px] font-mono" placeholder="Kosongkan jika bukan staf/mhs" value={userForm.nim} onChange={e=>setUserForm({...userForm, nim:e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold tracking-wider text-ui-muted mb-1.5">ROLE AKSES</label>
                    <select className="input text-[12px]" value={userForm.role} onChange={e=>setUserForm({...userForm, role:e.target.value})}>
                      {["Admin", "Teknisi", "Pelapor"].map(r => <option key={r} className="bg-dark-bg">{r}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 bg-dark-hover flex justify-end gap-3 border-t border-dark-border">
                <button type="button" className="btn btn-ghost" onClick={closeModal}>Batal</button>
                <button type="submit" className="btn btn-primary">{isEditMode ? 'Simpan Perubahan' : 'Simpan User'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
