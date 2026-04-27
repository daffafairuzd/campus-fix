import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../services/mock_api_service.dart';
import '../../models/user_model.dart';
import '../../theme/app_theme.dart';
import '../../widgets/campus_fix_logo.dart';

class RegisterPage extends StatefulWidget {
  const RegisterPage({super.key});

  @override
  State<RegisterPage> createState() => _RegisterPageState();
}

class _RegisterPageState extends State<RegisterPage> {
  final _ssoController = TextEditingController();
  final _nameController = TextEditingController();
  final _nimController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmController = TextEditingController();
  UserRole _selectedRole = UserRole.pelapor;
  bool _isLoading = false;
  bool _obscurePass = true;
  bool _obscureConfirm = true;
  String _errorMessage = '';

  @override
  void dispose() {
    _ssoController.dispose();
    _nameController.dispose();
    _nimController.dispose();
    _passwordController.dispose();
    _confirmController.dispose();
    super.dispose();
  }

  Future<void> _handleRegister() async {
    final ssoId = _ssoController.text.trim();
    final name = _nameController.text.trim();
    final nim = _nimController.text.trim();
    final password = _passwordController.text;
    final confirm = _confirmController.text;

    if (ssoId.isEmpty || name.isEmpty || password.isEmpty) {
      setState(() => _errorMessage = 'Semua field wajib diisi.');
      return;
    }
    if (password.length < 8) {
      setState(() => _errorMessage = 'Password minimal 8 karakter.');
      return;
    }
    if (password != confirm) {
      setState(() => _errorMessage = 'Konfirmasi password tidak cocok.');
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = '';
    });

    try {
      await api.register(
        ssoId: ssoId,
        name: name,
        nim: nim,
        password: password,
        role: _selectedRole,
      );

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: [
              const Icon(Icons.check_circle, color: AppColors.success, size: 16),
              const SizedBox(width: 8),
              Text(
                'Akun berhasil dibuat! Silakan login.',
                style: GoogleFonts.spaceGrotesk(fontSize: 13),
              ),
            ],
          ),
        ),
      );
      Navigator.pop(context);
    } catch (e) {
      setState(() => _errorMessage = e.toString().replaceAll('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          Container(
            height: 220,
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [Color(0xFF7F1D1D), AppColors.primary, Color(0xFFB91C1C)],
              ),
            ),
          ),
          Column(
            children: [
              SizedBox(
                height: 220,
                child: SafeArea(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 24),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        IconButton(
                          icon: const Icon(Icons.arrow_back_ios_new_rounded,
                              color: Colors.white, size: 20),
                          onPressed: () => Navigator.pop(context),
                          padding: EdgeInsets.zero,
                        ),
                        const SizedBox(height: 12),
                        const CampusFixLogoLight(iconSize: 38, fontSize: 22),
                        const SizedBox(height: 8),
                        Text(
                          'Buat Akun SSO Baru',
                          style: GoogleFonts.spaceGrotesk(
                            color: Colors.white.withValues(alpha: 0.85),
                            fontSize: 13,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              Expanded(
                child: Container(
                  decoration: BoxDecoration(
                    color: Theme.of(context).scaffoldBackgroundColor,
                    borderRadius: const BorderRadius.only(
                      topLeft: Radius.circular(28),
                      topRight: Radius.circular(28),
                    ),
                  ),
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.fromLTRB(24, 28, 24, 32),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Daftar Akun',
                          style: GoogleFonts.spaceGrotesk(
                            fontSize: 22,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'SSO ID adalah prefix email Telkom-mu',
                          style: GoogleFonts.spaceGrotesk(
                              fontSize: 13, color: AppColors.textMuted),
                        ),
                        const SizedBox(height: 22),

                        // Error
                        if (_errorMessage.isNotEmpty) ...[
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: AppColors.danger.withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(
                                  color: AppColors.danger.withValues(alpha: 0.3)),
                            ),
                            child: Row(
                              children: [
                                const Icon(Icons.error_outline,
                                    color: AppColors.danger, size: 16),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: Text(_errorMessage,
                                      style: GoogleFonts.spaceGrotesk(
                                          fontSize: 12, color: AppColors.danger)),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 16),
                        ],

                        // SSO ID
                        _FieldLabel('SSO ID'),
                        TextField(
                          controller: _ssoController,
                          decoration: const InputDecoration(
                            hintText: 'contoh: asep321',
                            prefixIcon: Icon(Icons.alternate_email_rounded),
                          ),
                        ),
                        ValueListenableBuilder(
                          valueListenable: _ssoController,
                          builder: (_, __, ___) {
                            final sso = _ssoController.text.trim();
                            if (sso.isEmpty) return const SizedBox(height: 14);
                            return Padding(
                              padding: const EdgeInsets.only(top: 6, bottom: 8),
                              child: Row(
                                children: [
                                  const Icon(Icons.mail_outline_rounded,
                                      size: 12, color: AppColors.primary),
                                  const SizedBox(width: 5),
                                  Flexible(
                                    child: Text(
                                      '$sso@student.telkomuniversity.ac.id',
                                      style: GoogleFonts.spaceGrotesk(
                                        fontSize: 11,
                                        color: AppColors.primary,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            );
                          },
                        ),

                        // Nama
                        _FieldLabel('NAMA LENGKAP'),
                        TextField(
                          controller: _nameController,
                          textCapitalization: TextCapitalization.words,
                          decoration: const InputDecoration(
                            hintText: 'contoh: Asep Mukti Ramadhan',
                            prefixIcon: Icon(Icons.badge_outlined),
                          ),
                        ),
                        const SizedBox(height: 14),

                        // NIM
                        _FieldLabel('NIM / NIP'),
                        TextField(
                          controller: _nimController,
                          keyboardType: TextInputType.number,
                          decoration: const InputDecoration(
                            hintText: '103012XXXXXX',
                            prefixIcon: Icon(Icons.numbers_rounded),
                          ),
                        ),
                        const SizedBox(height: 14),

                        // Role
                        _FieldLabel('DAFTAR SEBAGAI'),
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            _RoleChip(
                              label: 'Pelapor',
                              icon: Icons.person_rounded,
                              description: 'Mahasiswa / Staf',
                              selected: _selectedRole == UserRole.pelapor,
                              onTap: () =>
                                  setState(() => _selectedRole = UserRole.pelapor),
                            ),
                            const SizedBox(width: 10),
                            _RoleChip(
                              label: 'Teknisi',
                              icon: Icons.build_circle_rounded,
                              description: 'Tim Sarana & Pra.',
                              selected: _selectedRole == UserRole.teknisi,
                              onTap: () =>
                                  setState(() => _selectedRole = UserRole.teknisi),
                            ),
                          ],
                        ),
                        const SizedBox(height: 14),

                        // Password
                        _FieldLabel('PASSWORD'),
                        TextField(
                          controller: _passwordController,
                          obscureText: _obscurePass,
                          decoration: InputDecoration(
                            hintText: 'Min. 8 karakter',
                            prefixIcon: const Icon(Icons.lock_outline_rounded),
                            suffixIcon: IconButton(
                              icon: Icon(
                                _obscurePass
                                    ? Icons.visibility_off_outlined
                                    : Icons.visibility_outlined,
                                size: 18,
                              ),
                              onPressed: () =>
                                  setState(() => _obscurePass = !_obscurePass),
                            ),
                          ),
                        ),
                        const SizedBox(height: 14),

                        // Confirm Password
                        _FieldLabel('KONFIRMASI PASSWORD'),
                        TextField(
                          controller: _confirmController,
                          obscureText: _obscureConfirm,
                          decoration: InputDecoration(
                            hintText: 'Ulangi password',
                            prefixIcon: const Icon(Icons.lock_outline_rounded),
                            suffixIcon: IconButton(
                              icon: Icon(
                                _obscureConfirm
                                    ? Icons.visibility_off_outlined
                                    : Icons.visibility_outlined,
                                size: 18,
                              ),
                              onPressed: () => setState(
                                  () => _obscureConfirm = !_obscureConfirm),
                            ),
                          ),
                        ),
                        const SizedBox(height: 28),

                        // Register Button
                        _isLoading
                            ? Container(
                                height: 52,
                                decoration: BoxDecoration(
                                  color: AppColors.primary,
                                  borderRadius: BorderRadius.circular(14),
                                ),
                                child: const Center(
                                  child: SizedBox(
                                    width: 22,
                                    height: 22,
                                    child: CircularProgressIndicator(
                                        color: Colors.white, strokeWidth: 2.5),
                                  ),
                                ),
                              )
                            : FilledButton.icon(
                                onPressed: _handleRegister,
                                icon: const Icon(Icons.how_to_reg_rounded, size: 18),
                                label: const Text('Buat Akun'),
                              ),
                        const SizedBox(height: 16),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              'Sudah punya akun? ',
                              style: GoogleFonts.spaceGrotesk(
                                  fontSize: 13, color: AppColors.textMuted),
                            ),
                            GestureDetector(
                              onTap: () => Navigator.pop(context),
                              child: Text(
                                'Masuk',
                                style: GoogleFonts.spaceGrotesk(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w700,
                                  color: AppColors.primary,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _FieldLabel extends StatelessWidget {
  final String text;
  const _FieldLabel(this.text);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Text(
        text,
        style: GoogleFonts.spaceGrotesk(
          fontSize: 11,
          fontWeight: FontWeight.w700,
          color: AppColors.textMuted,
          letterSpacing: 0.5,
        ),
      ),
    );
  }
}

class _RoleChip extends StatelessWidget {
  final String label;
  final String description;
  final IconData icon;
  final bool selected;
  final VoidCallback onTap;

  const _RoleChip({
    required this.label,
    required this.description,
    required this.icon,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: selected
                ? AppColors.primary.withValues(alpha: 0.1)
                : (isDark ? AppColors.hoverDark : AppColors.bgLight),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: selected
                  ? AppColors.primary
                  : (isDark ? AppColors.borderDark : AppColors.borderLight),
              width: selected ? 2 : 1,
            ),
          ),
          child: Row(
            children: [
              Icon(icon,
                  size: 20,
                  color: selected ? AppColors.primary : AppColors.textMuted),
              const SizedBox(width: 8),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      label,
                      style: GoogleFonts.spaceGrotesk(
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: selected ? AppColors.primary : AppColors.textMuted,
                      ),
                    ),
                    Text(
                      description,
                      style: GoogleFonts.spaceGrotesk(
                        fontSize: 10,
                        color: AppColors.textDim,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
