import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../services/api_service.dart';
import '../../theme/app_theme.dart';

// ══════════════════════════════════════════════════════════════
//  Forgot Password Page — 3 step OTP flow
// ══════════════════════════════════════════════════════════════
class ForgotPasswordPage extends StatefulWidget {
  const ForgotPasswordPage({super.key});

  @override
  State<ForgotPasswordPage> createState() => _ForgotPasswordPageState();
}

class _ForgotPasswordPageState extends State<ForgotPasswordPage>
    with SingleTickerProviderStateMixin {
  // Step 1 = email, 2 = OTP, 3 = password baru
  int _step = 1;

  final _emailController    = TextEditingController();
  final _otpControllers     = List.generate(6, (_) => TextEditingController());
  final _otpFocusNodes      = List.generate(6, (_) => FocusNode());
  final _newPasswordCtrl    = TextEditingController();
  final _confirmPasswordCtrl = TextEditingController();

  bool _isLoading        = false;
  bool _obscureNew       = true;
  bool _obscureConfirm   = true;
  String _errorMessage   = '';
  String _successMessage = '';

  // Countdown kirim ulang OTP
  int _countdown = 0;
  Timer? _countdownTimer;

  late AnimationController _animController;
  late Animation<double> _fadeAnim;

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 400),
    );
    _fadeAnim = CurvedAnimation(parent: _animController, curve: Curves.easeOut);
    _animController.forward();
  }

  @override
  void dispose() {
    _emailController.dispose();
    for (final c in _otpControllers) c.dispose();
    for (final f in _otpFocusNodes) f.dispose();
    _newPasswordCtrl.dispose();
    _confirmPasswordCtrl.dispose();
    _countdownTimer?.cancel();
    _animController.dispose();
    super.dispose();
  }

  // ── Helpers ────────────────────────────────────────────────
  void _clearMessages() => setState(() { _errorMessage = ''; _successMessage = ''; });

  void _startCountdown() {
    setState(() => _countdown = 60);
    _countdownTimer?.cancel();
    _countdownTimer = Timer.periodic(const Duration(seconds: 1), (t) {
      if (_countdown <= 0) { t.cancel(); return; }
      setState(() => _countdown--);
    });
  }

  String get _otpValue => _otpControllers.map((c) => c.text).join();

  void _goToStep(int step) {
    _clearMessages();
    setState(() => _step = step);
    _animController.forward(from: 0);
  }

  // ── Step 1 : Kirim OTP ─────────────────────────────────────
  Future<void> _sendOtp() async {
    final email = _emailController.text.trim();
    if (email.isEmpty) {
      setState(() => _errorMessage = 'Masukkan alamat email terlebih dahulu.');
      return;
    }
    _clearMessages();
    setState(() => _isLoading = true);
    try {
      await api.sendForgotPasswordOtp(email: email);
      setState(() => _successMessage = 'Kode OTP dikirim ke $email. Periksa inbox / folder spam.');
      _startCountdown();
      _goToStep(2);
    } catch (e) {
      setState(() => _errorMessage = e.toString().replaceFirst('Exception: ', ''));
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _resendOtp() async {
    if (_countdown > 0) return;
    _clearMessages();
    setState(() => _isLoading = true);
    // Reset kotak OTP
    for (final c in _otpControllers) c.clear();
    _otpFocusNodes[0].requestFocus();
    try {
      await api.sendForgotPasswordOtp(email: _emailController.text.trim());
      setState(() => _successMessage = 'Kode OTP baru telah dikirim.');
      _startCountdown();
    } catch (e) {
      setState(() => _errorMessage = e.toString().replaceFirst('Exception: ', ''));
    } finally {
      setState(() => _isLoading = false);
    }
  }

  // ── Step 2 : Verifikasi OTP ────────────────────────────────
  Future<void> _verifyOtp() async {
    final otp = _otpValue;
    if (otp.length < 6) {
      setState(() => _errorMessage = 'Masukkan 6 digit kode OTP.');
      return;
    }
    _clearMessages();
    setState(() => _isLoading = true);
    try {
      await api.verifyForgotPasswordOtp(
        email: _emailController.text.trim(),
        otp: otp,
      );
      _goToStep(3);
    } catch (e) {
      setState(() => _errorMessage = e.toString().replaceFirst('Exception: ', ''));
    } finally {
      setState(() => _isLoading = false);
    }
  }

  // ── Step 3 : Reset Password ────────────────────────────────
  Future<void> _resetPassword() async {
    final password = _newPasswordCtrl.text;
    final confirm  = _confirmPasswordCtrl.text;

    if (password.length < 8) {
      setState(() => _errorMessage = 'Password minimal 8 karakter.');
      return;
    }
    if (password != confirm) {
      setState(() => _errorMessage = 'Konfirmasi password tidak cocok.');
      return;
    }
    _clearMessages();
    setState(() => _isLoading = true);
    try {
      await api.resetPassword(
        email: _emailController.text.trim(),
        otp: _otpValue,
        password: password,
        passwordConfirmation: confirm,
      );
      if (!mounted) return;
      // Tampilkan sukses lalu kembali ke login
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            'Password berhasil direset! Silakan login.',
            style: GoogleFonts.spaceGrotesk(),
          ),
          backgroundColor: AppColors.success,
        ),
      );
      Navigator.pop(context);
    } catch (e) {
      setState(() => _errorMessage = e.toString().replaceFirst('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  // ══════════════════════════════════════════════════════════
  //  BUILD
  // ══════════════════════════════════════════════════════════
  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? AppColors.bgDark : AppColors.bgLight,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 18),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'Lupa Password',
          style: GoogleFonts.spaceGrotesk(
            fontSize: 16,
            fontWeight: FontWeight.w700,
          ),
        ),
      ),
      body: SafeArea(
        child: FadeTransition(
          opacity: _fadeAnim,
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // ── Step Indicator ──────────────────────────
                _StepIndicator(currentStep: _step),
                const SizedBox(height: 24),

                // ── Title ───────────────────────────────────
                _buildTitle(),
                const SizedBox(height: 20),

                // ── Alert messages ──────────────────────────
                if (_errorMessage.isNotEmpty) ...[
                  _AlertBox(message: _errorMessage, isError: true),
                  const SizedBox(height: 12),
                ],
                if (_successMessage.isNotEmpty) ...[
                  _AlertBox(message: _successMessage, isError: false),
                  const SizedBox(height: 12),
                ],

                // ── Step content ────────────────────────────
                if (_step == 1) _buildStep1(),
                if (_step == 2) _buildStep2(),
                if (_step == 3) _buildStep3(),
              ],
            ),
          ),
        ),
      ),
    );
  }

  // ── Title per step ─────────────────────────────────────────
  Widget _buildTitle() {
    final titles = [
      ('Lupa Password?',
       'Masukkan email akun Anda. Kami akan mengirimkan kode OTP untuk verifikasi.'),
      ('Masukkan Kode OTP',
       'Kode 6 digit telah dikirim ke ${_emailController.text.trim()}. Berlaku selama 10 menit.'),
      ('Buat Password Baru',
       'Buat password baru yang kuat untuk akun Anda.'),
    ];
    final (title, subtitle) = titles[_step - 1];
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title,
          style: GoogleFonts.spaceGrotesk(
            fontSize: 22, fontWeight: FontWeight.w800,
          )),
        const SizedBox(height: 6),
        Text(subtitle,
          style: GoogleFonts.spaceGrotesk(
            fontSize: 13, color: AppColors.textMuted, height: 1.5,
          )),
      ],
    );
  }

  // ══════════════════════════════════════════════════════════
  //  STEP 1 — Email
  // ══════════════════════════════════════════════════════════
  Widget _buildStep1() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text('ALAMAT EMAIL',
          style: GoogleFonts.spaceGrotesk(
            fontSize: 11, fontWeight: FontWeight.w700,
            color: AppColors.textMuted, letterSpacing: 0.5,
          )),
        const SizedBox(height: 6),
        TextField(
          controller: _emailController,
          keyboardType: TextInputType.emailAddress,
          onChanged: (_) => _clearMessages(),
          decoration: const InputDecoration(
            hintText: 'contoh: nama@student.telkomuniversity.ac.id',
            prefixIcon: Icon(Icons.mail_outline_rounded),
          ),
        ),
        const SizedBox(height: 24),
        _ActionButton(
          label: 'Kirim Kode OTP',
          icon: Icons.send_rounded,
          isLoading: _isLoading,
          onPressed: _sendOtp,
        ),
      ],
    );
  }

  // ══════════════════════════════════════════════════════════
  //  STEP 2 — OTP
  // ══════════════════════════════════════════════════════════
  Widget _buildStep2() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text('KODE OTP (6 DIGIT)',
          textAlign: TextAlign.center,
          style: GoogleFonts.spaceGrotesk(
            fontSize: 11, fontWeight: FontWeight.w700,
            color: AppColors.textMuted, letterSpacing: 0.5,
          )),
        const SizedBox(height: 16),

        // 6 kotak OTP
        _OtpBoxes(
          controllers: _otpControllers,
          focusNodes: _otpFocusNodes,
        ),
        const SizedBox(height: 28),

        _ActionButton(
          label: 'Verifikasi OTP',
          icon: Icons.key_rounded,
          isLoading: _isLoading,
          onPressed: _verifyOtp,
        ),
        const SizedBox(height: 16),

        // Kirim ulang & ganti email
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            TextButton.icon(
              onPressed: () => _goToStep(1),
              icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 13),
              label: Text('Ganti email',
                style: GoogleFonts.spaceGrotesk(fontSize: 12)),
            ),
            TextButton(
              onPressed: _countdown > 0 ? null : _resendOtp,
              child: Text(
                _countdown > 0
                    ? 'Kirim ulang (${_countdown}s)'
                    : 'Kirim ulang OTP',
                style: GoogleFonts.spaceGrotesk(
                  fontSize: 12, fontWeight: FontWeight.w600,
                  color: _countdown > 0 ? AppColors.textMuted : AppColors.primary,
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }

  // ══════════════════════════════════════════════════════════
  //  STEP 3 — Password Baru
  // ══════════════════════════════════════════════════════════
  Widget _buildStep3() {
    final pw = _newPasswordCtrl.text;
    final cf = _confirmPasswordCtrl.text;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // Password baru
        Text('PASSWORD BARU',
          style: GoogleFonts.spaceGrotesk(
            fontSize: 11, fontWeight: FontWeight.w700,
            color: AppColors.textMuted, letterSpacing: 0.5,
          )),
        const SizedBox(height: 6),
        TextField(
          controller: _newPasswordCtrl,
          obscureText: _obscureNew,
          onChanged: (_) { _clearMessages(); setState(() {}); },
          decoration: InputDecoration(
            hintText: 'Minimal 8 karakter',
            prefixIcon: const Icon(Icons.lock_outline_rounded),
            suffixIcon: IconButton(
              icon: Icon(_obscureNew
                  ? Icons.visibility_off_outlined
                  : Icons.visibility_outlined, size: 18),
              onPressed: () => setState(() => _obscureNew = !_obscureNew),
            ),
          ),
        ),

        // Password strength bar
        if (pw.isNotEmpty) ...[
          const SizedBox(height: 8),
          _PasswordStrengthBar(password: pw),
        ],

        const SizedBox(height: 16),

        // Konfirmasi password
        Text('KONFIRMASI PASSWORD',
          style: GoogleFonts.spaceGrotesk(
            fontSize: 11, fontWeight: FontWeight.w700,
            color: AppColors.textMuted, letterSpacing: 0.5,
          )),
        const SizedBox(height: 6),
        TextField(
          controller: _confirmPasswordCtrl,
          obscureText: _obscureConfirm,
          onChanged: (_) { _clearMessages(); setState(() {}); },
          decoration: InputDecoration(
            hintText: 'Ulangi password baru',
            prefixIcon: const Icon(Icons.lock_outline_rounded),
            suffixIcon: IconButton(
              icon: Icon(_obscureConfirm
                  ? Icons.visibility_off_outlined
                  : Icons.visibility_outlined, size: 18),
              onPressed: () => setState(() => _obscureConfirm = !_obscureConfirm),
            ),
          ),
        ),

        // Match indicator
        if (cf.isNotEmpty && pw.isNotEmpty) ...[
          const SizedBox(height: 6),
          Row(
            children: [
              Icon(
                cf == pw ? Icons.check_circle_outline : Icons.cancel_outlined,
                size: 14,
                color: cf == pw ? AppColors.success : AppColors.danger,
              ),
              const SizedBox(width: 5),
              Text(
                cf == pw ? 'Password cocok' : 'Password tidak cocok',
                style: GoogleFonts.spaceGrotesk(
                  fontSize: 11,
                  color: cf == pw ? AppColors.success : AppColors.danger,
                ),
              ),
            ],
          ),
        ],

        const SizedBox(height: 28),
        _ActionButton(
          label: 'Reset Password',
          icon: Icons.lock_reset_rounded,
          isLoading: _isLoading,
          onPressed: _resetPassword,
        ),
      ],
    );
  }
}

// ══════════════════════════════════════════════════════════════
//  Reusable Widgets
// ══════════════════════════════════════════════════════════════

/// Indikator 3 langkah di atas
class _StepIndicator extends StatelessWidget {
  final int currentStep;
  const _StepIndicator({required this.currentStep});

  @override
  Widget build(BuildContext context) {
    const labels = ['Email', 'Kode OTP', 'Password Baru'];
    return Row(
      children: List.generate(labels.length * 2 - 1, (i) {
        if (i.isOdd) {
          // Garis penghubung
          final stepIdx = (i ~/ 2) + 1;
          final done = stepIdx < currentStep;
          return Expanded(
            child: Container(
              height: 2,
              margin: const EdgeInsets.only(bottom: 18),
              color: done ? AppColors.primary : AppColors.borderLight,
            ),
          );
        }
        final idx   = i ~/ 2 + 1;
        final done  = idx < currentStep;
        final active = idx == currentStep;
        return Column(
          children: [
            Container(
              width: 32, height: 32,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: done
                    ? AppColors.primary
                    : active
                        ? AppColors.primary.withValues(alpha: 0.15)
                        : Colors.transparent,
                border: Border.all(
                  color: (done || active) ? AppColors.primary : AppColors.borderLight,
                  width: 2,
                ),
              ),
              child: Center(
                child: done
                    ? const Icon(Icons.check_rounded, size: 16, color: Colors.white)
                    : Text('$idx',
                        style: GoogleFonts.spaceGrotesk(
                          fontSize: 12, fontWeight: FontWeight.w700,
                          color: active ? AppColors.primary : AppColors.textMuted,
                        )),
              ),
            ),
            const SizedBox(height: 4),
            Text(labels[idx - 1],
              style: GoogleFonts.spaceGrotesk(
                fontSize: 10, fontWeight: FontWeight.w600,
                color: active ? AppColors.primary : AppColors.textMuted,
              )),
          ],
        );
      }),
    );
  }
}

/// 6 kotak input OTP
class _OtpBoxes extends StatelessWidget {
  final List<TextEditingController> controllers;
  final List<FocusNode> focusNodes;
  const _OtpBoxes({required this.controllers, required this.focusNodes});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
      children: List.generate(6, (i) {
        return SizedBox(
          width: 46, height: 56,
          child: TextField(
            controller: controllers[i],
            focusNode: focusNodes[i],
            textAlign: TextAlign.center,
            keyboardType: TextInputType.number,
            inputFormatters: [
              FilteringTextInputFormatter.digitsOnly,
              LengthLimitingTextInputFormatter(1),
            ],
            style: GoogleFonts.spaceGrotesk(
              fontSize: 22, fontWeight: FontWeight.w800,
              color: AppColors.primary,
            ),
            decoration: InputDecoration(
              counterText: '',
              contentPadding: EdgeInsets.zero,
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(color: AppColors.borderLight, width: 2),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(color: AppColors.primary, width: 2),
              ),
            ),
            onChanged: (val) {
              if (val.isNotEmpty && i < 5) {
                focusNodes[i + 1].requestFocus();
              } else if (val.isEmpty && i > 0) {
                focusNodes[i - 1].requestFocus();
              }
            },
          ),
        );
      }),
    );
  }
}

/// Tombol aksi utama dengan loading state
class _ActionButton extends StatelessWidget {
  final String label;
  final IconData icon;
  final bool isLoading;
  final VoidCallback onPressed;
  const _ActionButton({
    required this.label,
    required this.icon,
    required this.isLoading,
    required this.onPressed,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 50,
      child: FilledButton.icon(
        onPressed: isLoading ? null : onPressed,
        icon: isLoading
            ? const SizedBox(
                width: 16, height: 16,
                child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
              )
            : Icon(icon, size: 18),
        label: Text(
          isLoading ? 'Memproses...' : label,
          style: GoogleFonts.spaceGrotesk(fontWeight: FontWeight.w700),
        ),
        style: FilledButton.styleFrom(
          backgroundColor: AppColors.primary,
          disabledBackgroundColor: AppColors.primary.withValues(alpha: 0.5),
        ),
      ),
    );
  }
}

/// Alert box error / success
class _AlertBox extends StatelessWidget {
  final String message;
  final bool isError;
  const _AlertBox({required this.message, required this.isError});

  @override
  Widget build(BuildContext context) {
    final color = isError ? AppColors.danger : AppColors.success;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Row(
        children: [
          Icon(
            isError ? Icons.error_outline_rounded : Icons.check_circle_outline_rounded,
            size: 16, color: color,
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(message,
              style: GoogleFonts.spaceGrotesk(fontSize: 12, color: color, height: 1.4)),
          ),
        ],
      ),
    );
  }
}

/// Password strength bar (merah → kuning → hijau)
class _PasswordStrengthBar extends StatelessWidget {
  final String password;
  const _PasswordStrengthBar({required this.password});

  @override
  Widget build(BuildContext context) {
    final len = password.length;
    final levels = [
      (len >= 8,  AppColors.danger,  'Lemah'),
      (len >= 12, AppColors.warning, 'Sedang'),
      (len >= 16, AppColors.success, 'Kuat'),
    ];
    final active = levels.lastWhere((l) => l.$1, orElse: () => (false, AppColors.textMuted, 'Terlalu pendek'));

    return Row(
      children: [
        ...levels.map((l) => Expanded(
          child: Container(
            height: 4,
            margin: const EdgeInsets.only(right: 4),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(2),
              color: l.$1 ? active.$2 : AppColors.borderLight,
            ),
          ),
        )),
        const SizedBox(width: 4),
        Text(active.$3,
          style: GoogleFonts.spaceGrotesk(
            fontSize: 10, color: active.$2, fontWeight: FontWeight.w600,
          )),
      ],
    );
  }
}
