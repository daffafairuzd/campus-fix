import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, KeyRound, Lock, Eye, EyeOff, ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import api from '../../api';

// ── Step indicator ─────────────────────────────────────────────────────────────
function StepIndicator({ current }) {
  const steps = ['Email', 'Kode OTP', 'Password Baru'];
  return (
    <div className="flex items-center gap-0 mb-8 relative z-10">
      {steps.map((label, i) => {
        const idx   = i + 1;
        const done  = idx < current;
        const active = idx === current;
        return (
          <React.Fragment key={idx}>
            <div className="flex flex-col items-center gap-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold border-2 transition-all duration-300 ${
                done   ? 'bg-brand-primary border-brand-primary text-white' :
                active ? 'bg-dark-bg border-brand-primary text-brand-primary' :
                         'bg-dark-bg border-dark-border text-ui-dim'
              }`}>
                {done ? <CheckCircle2 className="w-4 h-4" /> : idx}
              </div>
              <span className={`text-[10px] font-semibold tracking-wide ${active ? 'text-brand-primary' : done ? 'text-ui-dim' : 'text-ui-dim'}`}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-[2px] mx-1 mb-5 transition-all duration-500 ${done ? 'bg-brand-primary' : 'bg-dark-border'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ── OTP Input (6 kotak) ────────────────────────────────────────────────────────
function OtpInput({ value, onChange }) {
  const inputs = useRef([]);
  const digits  = value.split('');

  const handleKey = (i, e) => {
    if (e.key === 'Backspace') {
      const next = [...digits];
      if (next[i]) { next[i] = ''; onChange(next.join('')); }
      else if (i > 0) { inputs.current[i - 1]?.focus(); }
      return;
    }
    if (e.key === 'ArrowLeft' && i > 0) { inputs.current[i - 1]?.focus(); return; }
    if (e.key === 'ArrowRight' && i < 5) { inputs.current[i + 1]?.focus(); return; }
    if (!/^\d$/.test(e.key)) return;
    const next = [...digits];
    next[i] = e.key;
    onChange(next.join(''));
    if (i < 5) inputs.current[i + 1]?.focus();
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted) { onChange(pasted.padEnd(6, '').slice(0, 6)); inputs.current[Math.min(pasted.length, 5)]?.focus(); }
    e.preventDefault();
  };

  return (
    <div className="flex gap-3 justify-center">
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={el => inputs.current[i] = el}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i] || ''}
          readOnly
          onKeyDown={e => handleKey(i, e)}
          onPaste={handlePaste}
          onClick={() => inputs.current[i]?.focus()}
          className={`w-11 h-14 text-center text-[22px] font-bold rounded-xl border-2 bg-dark-bg outline-none transition-all duration-200 cursor-text
            ${digits[i] ? 'border-brand-primary text-brand-primary' : 'border-dark-border text-ui-text'}
            focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20`}
        />
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
export default function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep]         = useState(1); // 1=email, 2=otp, 3=password
  const [email, setEmail]       = useState('');
  const [otp, setOtp]           = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [showCf, setShowCf]     = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');

  // Countdown resend OTP
  const [countdown, setCountdown] = useState(0);
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const clearMessages = () => { setError(''); setSuccess(''); };

  // ── Step 1: Kirim OTP ──
  const handleSendOtp = async (e) => {
    e.preventDefault();
    clearMessages();
    setIsLoading(true);
    try {
      await api.post('/auth/forgot-password/send-otp', { email });
      setSuccess('Kode OTP telah dikirim ke email Anda. Periksa inbox atau folder spam.');
      setStep(2);
      setCountdown(60);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengirim OTP. Coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    clearMessages();
    setIsLoading(true);
    setOtp('');
    try {
      await api.post('/auth/forgot-password/send-otp', { email });
      setSuccess('Kode OTP baru telah dikirim.');
      setCountdown(60);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengirim ulang OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Step 2: Verifikasi OTP ──
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length < 6) { setError('Masukkan 6 digit kode OTP.'); return; }
    clearMessages();
    setIsLoading(true);
    try {
      await api.post('/auth/forgot-password/verify-otp', { email, otp });
      setStep(3);
      clearMessages();
    } catch (err) {
      setError(err.response?.data?.message || 'Kode OTP tidak valid.');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Step 3: Reset Password ──
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (password !== confirm) { setError('Konfirmasi password tidak cocok.'); return; }
    if (password.length < 8) { setError('Password minimal 8 karakter.'); return; }
    clearMessages();
    setIsLoading(true);
    try {
      await api.post('/auth/forgot-password/reset', {
        email,
        otp,
        password,
        password_confirmation: confirm,
      });
      setSuccess('Password berhasil direset!');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mereset password.');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-dark-bg flex flex-col justify-center items-center font-sans px-4">
      <div className="w-full max-w-md p-8 card relative overflow-hidden">
        {/* Glow decorations */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-primary opacity-20 rounded-full blur-[60px] pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-brand-secondary opacity-10 rounded-full blur-[60px] pointer-events-none" />

        {/* Logo */}
        <div className="flex items-center gap-2 mb-8 relative z-10">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center shadow-[0_0_16px_rgba(220,38,38,0.3)]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-white">
              <path d="M12 3L1 9l4 2.18V17h2v-4.82L12 15l11-6-11-6zm6.18 6L12 12.72 5.82 9 12 5.28 18.18 9zM17 16l-5 3-5-3v2l5 3 5-3v-2z" />
            </svg>
          </div>
          <div>
            <div className="font-bold text-lg text-ui-text leading-tight">Campus<span className="text-brand-primary">Fix</span></div>
            <div className="text-[10px] text-ui-muted tracking-widest mt-0.5">ADMIN PANEL</div>
          </div>
        </div>

        {/* Step Indicator */}
        <StepIndicator current={step} />

        {/* Title */}
        <div className="mb-6 relative z-10">
          {step === 1 && <>
            <h1 className="text-2xl font-bold text-ui-text mb-1.5">Lupa Password?</h1>
            <p className="text-xs text-ui-muted">Masukkan email Anda dan kami akan mengirim kode OTP untuk verifikasi.</p>
          </>}
          {step === 2 && <>
            <h1 className="text-2xl font-bold text-ui-text mb-1.5">Masukkan Kode OTP</h1>
            <p className="text-xs text-ui-muted">Kode 6 digit dikirim ke <span className="text-brand-primary font-semibold">{email}</span>. Berlaku selama 10 menit.</p>
          </>}
          {step === 3 && <>
            <h1 className="text-2xl font-bold text-ui-text mb-1.5">Password Baru</h1>
            <p className="text-xs text-ui-muted">Buat password baru yang kuat untuk akun Anda.</p>
          </>}
        </div>

        {/* Error / Success Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-ui-danger/10 border border-ui-danger/30 text-[12px] text-ui-danger relative z-10 animate-fade-in">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-[12px] text-green-400 relative z-10 animate-fade-in flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            {success}
          </div>
        )}

        {/* ── Step 1: Email Form ── */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-5 relative z-10">
            <div>
              <label className="block text-[11px] font-semibold tracking-wider text-ui-muted mb-1.5">ALAMAT EMAIL</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ui-muted" />
                <input
                  type="email"
                  className="input w-full pl-9"
                  placeholder="admin@telkomuniversity.ac.id"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary w-full justify-center mt-1" disabled={isLoading}>
              {isLoading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Mengirim OTP...</> : <>
                <Mail className="w-4 h-4 mr-2" />Kirim Kode OTP
              </>}
            </button>
          </form>
        )}

        {/* ── Step 2: OTP Form ── */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-6 relative z-10">
            <div>
              <label className="block text-[11px] font-semibold tracking-wider text-ui-muted mb-4 text-center">KODE OTP (6 DIGIT)</label>
              <OtpInput value={otp} onChange={setOtp} />
            </div>

            <button type="submit" className="btn btn-primary w-full justify-center" disabled={isLoading || otp.length < 6}>
              {isLoading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Memverifikasi...</> : <>
                <KeyRound className="w-4 h-4 mr-2" />Verifikasi OTP
              </>}
            </button>

            {/* Resend / back */}
            <div className="flex items-center justify-between text-[12px]">
              <button type="button" className="text-ui-muted hover:text-ui-text flex items-center gap-1 transition-colors"
                onClick={() => { setStep(1); clearMessages(); setOtp(''); }}>
                <ArrowLeft className="w-3.5 h-3.5" /> Ganti email
              </button>
              <button type="button"
                className={`font-semibold transition-colors ${countdown > 0 ? 'text-ui-dim cursor-not-allowed' : 'text-brand-primary hover:text-brand-secondary cursor-pointer'}`}
                onClick={handleResendOtp} disabled={countdown > 0 || isLoading}>
                {countdown > 0 ? `Kirim ulang (${countdown}s)` : 'Kirim ulang OTP'}
              </button>
            </div>
          </form>
        )}

        {/* ── Step 3: New Password Form ── */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-4 relative z-10">
            <div>
              <label className="block text-[11px] font-semibold tracking-wider text-ui-muted mb-1.5">PASSWORD BARU</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ui-muted" />
                <input
                  type={showPw ? 'text' : 'password'}
                  className="input w-full pl-9 pr-10"
                  placeholder="Minimal 8 karakter"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-ui-dim hover:text-ui-text"
                  onClick={() => setShowPw(v => !v)}>
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Password strength */}
              {password && (
                <div className="mt-2 flex gap-1">
                  {[8, 12, 16].map((len, i) => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-all ${password.length >= len ? ['bg-ui-danger','bg-ui-warning','bg-green-500'][i] : 'bg-dark-border'}`} />
                  ))}
                  <span className="text-[10px] text-ui-muted ml-1">
                    {password.length < 8 ? 'Terlalu pendek' : password.length < 12 ? 'Lemah' : password.length < 16 ? 'Sedang' : 'Kuat'}
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-semibold tracking-wider text-ui-muted mb-1.5">KONFIRMASI PASSWORD</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ui-muted" />
                <input
                  type={showCf ? 'text' : 'password'}
                  className="input w-full pl-9 pr-10"
                  placeholder="Ulangi password baru"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  required
                />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-ui-dim hover:text-ui-text"
                  onClick={() => setShowCf(v => !v)}>
                  {showCf ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirm && password && (
                <div className={`text-[11px] mt-1.5 flex items-center gap-1 ${confirm === password ? 'text-green-400' : 'text-ui-danger'}`}>
                  {confirm === password ? <CheckCircle2 className="w-3 h-3" /> : '✕'} {confirm === password ? 'Password cocok' : 'Password tidak cocok'}
                </div>
              )}
            </div>

            <button type="submit" className="btn btn-primary w-full justify-center mt-2" disabled={isLoading}>
              {isLoading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Menyimpan...</> : <>
                <KeyRound className="w-4 h-4 mr-2" />Reset Password
              </>}
            </button>
          </form>
        )}

        {/* Back to login */}
        <div className="mt-6 text-center relative z-10">
          <Link to="/login" className="text-[12px] text-ui-muted hover:text-brand-primary transition-colors flex items-center justify-center gap-1.5">
            <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke halaman Login
          </Link>
        </div>
      </div>
    </div>
  );
}
