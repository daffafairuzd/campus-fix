import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [nim, setNim] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    setIsLoading(true);
    // Mock register delay
    setTimeout(() => {
      setIsLoading(false);
      navigate('/login');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col justify-center items-center font-sans">
      <div className="w-full max-w-md p-8 card relative overflow-hidden my-8">


        <div className="flex items-center gap-2 mb-8 relative z-10">
          <div className="w-8 h-8 rounded flex items-center justify-center overflow-hidden bg-brand-primary">
            <img src="/logo.png" alt="CampusFix" className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="font-display font-bold text-lg text-ui-text leading-tight">
              Campus<span className="text-brand-primary">Fix</span>
            </div>
            <div className="text-[10px] text-ui-muted tracking-widest mt-0.5">ADMIN REGISTRATION</div>
          </div>
        </div>

        <div className="mb-6 relative z-10">
          <h1 className="text-2xl font-bold text-ui-text mb-1.5">Buat Akun</h1>
          <p className="text-xs text-ui-muted">Daftarkan akun Admin atau Teknisi baru.</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4 relative z-10">
          <div>
            <label className="block text-[11px] font-semibold tracking-wider text-ui-muted mb-1.5">NAMA LENGKAP</label>
            <input 
              type="text" 
              className="input w-full" 
              placeholder="e.g. Budi Santoso" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold tracking-wider text-ui-muted mb-1.5">NIP / NIM</label>
            <input 
              type="text" 
              className="input w-full font-mono" 
              placeholder="103012xxxx" 
              value={nim}
              onChange={(e) => setNim(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold tracking-wider text-ui-muted mb-1.5">EMAIL</label>
            <input 
              type="email" 
              className="input w-full" 
              placeholder="email@telkomuniversity.ac.id" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold tracking-wider text-ui-muted mb-1.5">PASSWORD</label>
            <input 
              type="password" 
              className="input w-full" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary w-full mt-2 justify-center"
            disabled={isLoading}
          >
            {isLoading ? "Memproses..." : "Daftar Akun"}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-ui-muted relative z-10">
          Sudah memiliki akun? <Link to="/login" className="text-brand-primary hover:text-brand-secondary font-medium">Masuk Sekarang</Link>
        </div>
      </div>
    </div>
  );
}
