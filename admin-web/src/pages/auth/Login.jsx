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
    <div className="min-h-screen bg-dark-bg flex flex-col justify-center items-center font-sans relative">
      <div className="w-full max-w-md p-8 card relative">

        <div className="flex items-center gap-2 mb-8 relative z-10">
          <div className="w-9 h-9 rounded-md flex items-center justify-center overflow-hidden bg-transparent">
            <img src="/logo.png" alt="CampusFix" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="font-display font-bold text-lg text-ui-text leading-tight tracking-tight">
              Campus<span className="text-brand-primary">Fix</span>
            </div>
            <div className="text-[10px] text-ui-muted tracking-[0.2em] mt-0.5 font-medium">ADMIN PANEL</div>
          </div>
        </div>

        <div className="mb-6 relative z-10">
          <h1 className="text-2xl font-bold text-ui-text mb-1.5 tracking-tight">Sign In</h1>
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
              <Link to="/forgot-password" className="text-[11px] text-brand-primary hover:text-brand-secondary transition-colors duration-300">Lupa Password?</Link>
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



      </div>
    </div>
  );
}
