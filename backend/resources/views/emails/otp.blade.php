<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>OTP Reset Password - CampusFix</title>
  <style>
    body { margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background: #0f1117; color: #e2e8f0; }
    .wrapper { max-width: 520px; margin: 40px auto; background: #1a1d27; border: 1px solid #2a2d3a; border-radius: 16px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #dc2626, #b91c1c); padding: 32px 40px; text-align: center; }
    .header .logo { font-size: 24px; font-weight: 800; color: #fff; letter-spacing: -0.5px; }
    .header .logo span { color: #fca5a5; }
    .header .subtitle { font-size: 12px; color: rgba(255,255,255,0.7); letter-spacing: 3px; margin-top: 4px; }
    .body { padding: 36px 40px; }
    .greeting { font-size: 16px; font-weight: 600; color: #f1f5f9; margin-bottom: 12px; }
    .text { font-size: 14px; color: #94a3b8; line-height: 1.7; margin-bottom: 24px; }
    .otp-box { background: #0f1117; border: 2px solid #dc2626; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0; }
    .otp-label { font-size: 11px; color: #64748b; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 12px; }
    .otp-code { font-size: 42px; font-weight: 900; letter-spacing: 12px; color: #dc2626; font-family: 'Courier New', monospace; }
    .otp-expire { font-size: 12px; color: #64748b; margin-top: 10px; }
    .warning { background: rgba(220,38,38,0.08); border: 1px solid rgba(220,38,38,0.2); border-radius: 8px; padding: 12px 16px; font-size: 12px; color: #fca5a5; margin-top: 24px; }
    .footer { border-top: 1px solid #2a2d3a; padding: 20px 40px; text-align: center; font-size: 11px; color: #475569; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="logo">Campus<span>Fix</span></div>
      <div class="subtitle">ADMIN PANEL</div>
    </div>
    <div class="body">
      <div class="greeting">Halo, {{ $userName }} 👋</div>
      <div class="text">
        Kami menerima permintaan untuk mereset password akun CampusFix Anda. 
        Gunakan kode OTP di bawah ini untuk melanjutkan proses reset password.
      </div>

      <div class="otp-box">
        <div class="otp-label">Kode Verifikasi OTP</div>
        <div class="otp-code">{{ $otp }}</div>
        <div class="otp-expire">⏱ Berlaku selama <strong>10 menit</strong></div>
      </div>

      <div class="text">
        Masukkan kode ini di halaman reset password. Jangan bagikan kode ini kepada siapapun, 
        termasuk tim CampusFix.
      </div>

      <div class="warning">
        ⚠️ Jika Anda tidak meminta reset password, abaikan email ini. Password Anda tidak akan berubah.
      </div>
    </div>
    <div class="footer">
      © {{ date('Y') }} CampusFix — Sistem Manajemen Fasilitas Kampus<br/>
      Email ini dikirim otomatis, mohon tidak membalas.
    </div>
  </div>
</body>
</html>
