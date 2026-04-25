import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../services/mock_api_service.dart';
import '../../models/user_model.dart';
import '../../theme/app_theme.dart';
import '../../widgets/campus_fix_logo.dart';
import '../pelapor/pelapor_home_page.dart';
import '../teknisi/teknisi_home_page.dart';
import 'register_page.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage>
    with SingleTickerProviderStateMixin {
  final _ssoController = TextEditingController();
  final _passwordController = TextEditingController();
  UserRole _selectedRole = UserRole.pelapor;
  bool _isLoading = false;
  bool _obscurePassword = true;
  String _errorMessage = '';
  late AnimationController _animController;
  late Animation<double> _fadeAnim;

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    );
    _fadeAnim = CurvedAnimation(parent: _animController, curve: Curves.easeOut);
    _animController.forward();
  }

  @override
  void dispose() {
    _ssoController.dispose();
    _passwordController.dispose();
    _animController.dispose();
    super.dispose();
  }

  Future<void> _handleLogin() async {
    final ssoId = _ssoController.text.trim();
    final password = _passwordController.text;

    if (ssoId.isEmpty || password.isEmpty) {
      setState(() => _errorMessage = 'SSO ID dan password tidak boleh kosong.');
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = '';
    });

    try {
      final session = await api.login(
        ssoId: ssoId,
        password: password,
        role: _selectedRole,
      );

      if (!mounted) return;

      final page = session.role == UserRole.pelapor
          ? PelaporHomePage(session: session)
          : TeknisiHomePage(session: session);

      Navigator.pushReplacement(
        context,
        PageRouteBuilder(
          pageBuilder: (_, __, ___) => page,
          transitionsBuilder: (_, animation, __, child) =>
              FadeTransition(opacity: animation, child: child),
          transitionDuration: const Duration(milliseconds: 400),
        ),
      );
    } catch (e) {
      setState(() => _errorMessage = e.toString().replaceAll('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final h = MediaQuery.of(context).size.height;

    return Scaffold(
      body: Stack(
        children: [
          // Hero gradient background
          Container(
            height: h * 0.42,
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [Color(0xFF7F1D1D), AppColors.primary, Color(0xFFB91C1C)],
              ),
            ),
          ),
          // Decorative circles
          Positioned(
            top: -40,
            right: -40,
            child: Container(
              width: 200,
              height: 200,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: Colors.white.withValues(alpha: 0.05),
              ),
            ),
          ),
          Positioned(
            top: 60,
            left: -30,
            child: Container(
              width: 120,
              height: 120,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: Colors.white.withValues(alpha: 0.04),
              ),
            ),
          ),
          // Content
          FadeTransition(
            opacity: _fadeAnim,
            child: Column(
              children: [
                // Top hero content
                SizedBox(
                  height: h * 0.42,
                  child: SafeArea(
                    child: Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const SizedBox(height: 16),
                          const CampusFixLogoLight(iconSize: 52, fontSize: 28),
                          const SizedBox(height: 12),
                          Text(
                            'Platform Pelaporan Fasilitas Kampus',
                            style: GoogleFonts.spaceGrotesk(
                              color: Colors.white.withValues(alpha: 0.75),
                              fontSize: 13,
                              letterSpacing: 0.2,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                // Form card rounded top
                Expanded(
                  child: Container(
                    width: double.infinity,
                    decoration: BoxDecoration(
                      color: Theme.of(context).scaffoldBackgroundColor,
                      borderRadius: const BorderRadius.only(
                        topLeft: Radius.circular(28),
                        topRight: Radius.circular(28),
                      ),
                    ),
                    child: SingleChildScrollView(
                      padding: const EdgeInsets.fromLTRB(24, 30, 24, 32),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Masuk ke Akun',
                            style: GoogleFonts.spaceGrotesk(
                              fontSize: 22,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Gunakan SSO Telkom University kamu',
                            style: GoogleFonts.spaceGrotesk(
                              fontSize: 13,
                              color: AppColors.textMuted,
                            ),
                          ),
                          const SizedBox(height: 24),

                          // Error message
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
                                    child: Text(
                                      _errorMessage,
                                      style: GoogleFonts.spaceGrotesk(
                                        fontSize: 12,
                                        color: AppColors.danger,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(height: 16),
                          ],

                          // SSO ID Field
                          Text(
                            'SSO ID',
                            style: GoogleFonts.spaceGrotesk(
                              fontSize: 12,
                              fontWeight: FontWeight.w700,
                              color: AppColors.textMuted,
                              letterSpacing: 0.5,
                            ),
                          ),
                          const SizedBox(height: 6),
                          TextField(
                            controller: _ssoController,
                            keyboardType: TextInputType.text,
                            onChanged: (_) {
                              if (_errorMessage.isNotEmpty) {
                                setState(() => _errorMessage = '');
                              }
                            },
                            decoration: InputDecoration(
                              hintText: 'contoh: asep321',
                              prefixIcon: const Icon(Icons.person_outline_rounded),
                              suffixIcon: _ssoController.text.isNotEmpty
                                  ? IconButton(
                                      icon: const Icon(Icons.clear, size: 18),
                                      onPressed: () => _ssoController.clear(),
                                    )
                                  : null,
                            ),
                          ),
                          // Auto-display email
                          ValueListenableBuilder(
                            valueListenable: _ssoController,
                            builder: (_, __, ___) {
                              final sso = _ssoController.text.trim();
                              if (sso.isEmpty) return const SizedBox(height: 10);
                              return Padding(
                                padding: const EdgeInsets.only(top: 6),
                                child: Row(
                                  children: [
                                    const Icon(Icons.mail_outline_rounded,
                                        size: 12, color: AppColors.primary),
                                    const SizedBox(width: 5),
                                    Text(
                                      '$sso@student.telkomuniversity.ac.id',
                                      style: GoogleFonts.spaceGrotesk(
                                        fontSize: 11,
                                        color: AppColors.primary,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                  ],
                                ),
                              );
                            },
                          ),
                          const SizedBox(height: 16),

                          // Password Field
                          Text(
                            'PASSWORD',
                            style: GoogleFonts.spaceGrotesk(
                              fontSize: 12,
                              fontWeight: FontWeight.w700,
                              color: AppColors.textMuted,
                              letterSpacing: 0.5,
                            ),
                          ),
                          const SizedBox(height: 6),
                          TextField(
                            controller: _passwordController,
                            obscureText: _obscurePassword,
                            decoration: InputDecoration(
                              hintText: '••••••••',
                              prefixIcon: const Icon(Icons.lock_outline_rounded),
                              suffixIcon: IconButton(
                                icon: Icon(
                                  _obscurePassword
                                      ? Icons.visibility_off_outlined
                                      : Icons.visibility_outlined,
                                  size: 18,
                                ),
                                onPressed: () => setState(
                                    () => _obscurePassword = !_obscurePassword),
                              ),
                            ),
                          ),
                          const SizedBox(height: 20),

                          // Role Selector
                          Text(
                            'LOGIN SEBAGAI',
                            style: GoogleFonts.spaceGrotesk(
                              fontSize: 12,
                              fontWeight: FontWeight.w700,
                              color: AppColors.textMuted,
                              letterSpacing: 0.5,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Row(
                            children: [
                              _RoleButton(
                                label: 'Pelapor',
                                icon: Icons.person_rounded,
                                selected: _selectedRole == UserRole.pelapor,
                                onTap: () => setState(
                                    () => _selectedRole = UserRole.pelapor),
                              ),
                              const SizedBox(width: 12),
                              _RoleButton(
                                label: 'Teknisi',
                                icon: Icons.build_circle_rounded,
                                selected: _selectedRole == UserRole.teknisi,
                                onTap: () => setState(
                                    () => _selectedRole = UserRole.teknisi),
                              ),
                            ],
                          ),
                          const SizedBox(height: 28),

                          // Login Button
                          AnimatedSwitcher(
                            duration: const Duration(milliseconds: 200),
                            child: _isLoading
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
                                          color: Colors.white,
                                          strokeWidth: 2.5,
                                        ),
                                      ),
                                    ),
                                  )
                                : FilledButton.icon(
                                    onPressed: _handleLogin,
                                    icon: const Icon(Icons.login_rounded, size: 18),
                                    label: const Text('Masuk'),
                                    style: FilledButton.styleFrom(
                                      backgroundColor: AppColors.primary,
                                      shadowColor:
                                          AppColors.primary.withValues(alpha: 0.4),
                                      elevation: 4,
                                    ),
                                  ),
                          ),
                          const SizedBox(height: 20),

                          // Register Link
                          Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                'Belum punya akun? ',
                                style: GoogleFonts.spaceGrotesk(
                                  fontSize: 13,
                                  color: AppColors.textMuted,
                                ),
                              ),
                              GestureDetector(
                                onTap: () => Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (_) => const RegisterPage(),
                                  ),
                                ),
                                child: Text(
                                  'Daftar Sekarang',
                                  style: GoogleFonts.spaceGrotesk(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w700,
                                    color: AppColors.primary,
                                  ),
                                ),
                              ),
                            ],
                          ),

                          const SizedBox(height: 16),
                          // Demo hint
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: AppColors.info.withValues(alpha: 0.08),
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(
                                  color: AppColors.info.withValues(alpha: 0.2)),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    const Icon(Icons.info_outline,
                                        size: 13, color: AppColors.info),
                                    const SizedBox(width: 5),
                                    Text(
                                      'Demo Credentials',
                                      style: GoogleFonts.spaceGrotesk(
                                        fontSize: 11,
                                        fontWeight: FontWeight.w700,
                                        color: AppColors.info,
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 6),
                                Text(
                                  'Pelapor → SSO: asep321 / PW: password\nTeknisi  → SSO: teknisi01 / PW: password',
                                  style: GoogleFonts.spaceGrotesk(
                                    fontSize: 11,
                                    color: AppColors.textMuted,
                                    height: 1.6,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _RoleButton extends StatelessWidget {
  final String label;
  final IconData icon;
  final bool selected;
  final VoidCallback onTap;

  const _RoleButton({
    required this.label,
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
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: BoxDecoration(
            color: selected
                ? AppColors.primary.withValues(alpha: 0.1)
                : (isDark ? AppColors.hoverDark : AppColors.bgLight),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: selected ? AppColors.primary : (isDark ? AppColors.borderDark : AppColors.borderLight),
              width: selected ? 2 : 1,
            ),
          ),
          child: Column(
            children: [
              Icon(
                icon,
                size: 22,
                color: selected ? AppColors.primary : AppColors.textMuted,
              ),
              const SizedBox(height: 4),
              Text(
                label,
                style: GoogleFonts.spaceGrotesk(
                  fontSize: 13,
                  fontWeight: selected ? FontWeight.w700 : FontWeight.w500,
                  color: selected ? AppColors.primary : AppColors.textMuted,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
