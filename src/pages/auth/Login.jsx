import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const [errMessage, setErrMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrMessage('');
    try {
      const response = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('isAuthenticated', 'true');
      
      // If user is not admin or teknisi, we can reject them, but for now we let App handle it.
      // But typically this dashboard is admin only.
      if (response.data.user.role === 'pelapor') {
        setErrMessage('Anda tidak memiliki akses ke panel admin.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('isAuthenticated');
        return;
      }
      
      window.location.href = '/'; 
    } catch (err) {
      setErrMessage(err.response?.data?.message || err.response?.data?.errors?.email?.[0] || 'Gagal login. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col justify-center items-center font-sans">
      <div className="w-full max-w-md p-8 card relative overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-primary opacity-20 rounded-full blur-[60px] pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-brand-secondary opacity-10 rounded-full blur-[60px] pointer-events-none"></div>

        <div className="flex items-center gap-2 mb-8 relative z-10">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center shadow-[0_0_16px_rgba(220,38,38,0.3)]">
             <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-white">
               <path d="M12 3L1 9l4 2.18V17h2v-4.82L12 15l11-6-11-6zm6.18 6L12 12.72 5.82 9 12 5.28 18.18 9zM17 16l-5 3-5-3v2l5 3 5-3v-2z" />
            </svg>
          </div>
          <div>
            <div className="font-bold text-lg text-ui-text leading-tight">
              Campus<span className="text-brand-primary">Fix</span>
            </div>
            <div className="text-[10px] text-ui-muted tracking-widest mt-0.5">ADMIN PANEL</div>
          </div>
        </div>

        <div className="mb-6 relative z-10">
          <h1 className="text-2xl font-bold text-ui-text mb-1.5">Sign In</h1>
          <p className="text-xs text-ui-muted">Gunakan akun administrator Anda untuk melanjutkan.</p>
        </div>

        {errMessage && (
          <div className="mb-4 p-3 rounded-lg bg-ui-danger/10 border border-ui-danger/30 text-[12px] text-ui-danger relative z-10">
            {errMessage}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 relative z-10">
          <div>
            <label className="block text-[11px] font-semibold tracking-wider text-ui-muted mb-1.5">EMAIL</label>
            <input 
              type="email" 
              className="input w-full" 
              placeholder="admin@telkomuniversity.ac.id" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-[11px] font-semibold tracking-wider text-ui-muted">PASSWORD</label>
              <a href="#" className="text-[11px] text-brand-primary hover:text-brand-secondary">Lupa Password?</a>
            </div>
            <input 
              type="password" 
              className="input w-full" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary w-full mt-2 justify-center"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Masuk ke Dashboard"}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-ui-muted relative z-10">
          Belum memilik akun? <Link to="/register" className="text-brand-primary hover:text-brand-secondary font-medium">Register Tim Baru</Link>
        </div>
      </div>
    </div>
  );
}
