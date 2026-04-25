import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../models/user_model.dart';
import '../../theme/app_theme.dart';
import '../../widgets/campus_fix_logo.dart';
import '../../widgets/theme_toggle_button.dart';
import '../auth/login_page.dart';

class ProfilePage extends StatefulWidget {
  final UserSession session;
  const ProfilePage({super.key, required this.session});

  @override
  State<ProfilePage> createState() => _ProfilePageState();
}

class _ProfilePageState extends State<ProfilePage> {
  bool _notifEnabled = true;

  Future<void> _logout() async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text('Keluar dari CampusFix?',
            style: GoogleFonts.spaceGrotesk(fontSize: 16, fontWeight: FontWeight.w700)),
        content: Text('Kamu perlu login ulang setelah keluar.',
            style: GoogleFonts.spaceGrotesk(fontSize: 13, color: AppColors.textMuted)),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: Text('Batal',
                style: GoogleFonts.spaceGrotesk(color: AppColors.textMuted)),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context, true),
            style: FilledButton.styleFrom(
              backgroundColor: AppColors.danger,
              minimumSize: const Size(90, 40),
            ),
            child: Text('Keluar', style: GoogleFonts.spaceGrotesk(fontWeight: FontWeight.w700)),
          ),
        ],
      ),
    );

    if (confirm == true && mounted) {
      Navigator.pushAndRemoveUntil(
        context,
        PageRouteBuilder(
          pageBuilder: (_, __, ___) => const LoginPage(),
          transitionsBuilder: (_, animation, __, child) =>
              FadeTransition(opacity: animation, child: child),
          transitionDuration: const Duration(milliseconds: 400),
        ),
        (_) => false,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final session = widget.session;

    return Scaffold(
      appBar: AppBar(
        automaticallyImplyLeading: false,
        title: Text('Profil',
            style: GoogleFonts.spaceGrotesk(fontSize: 18, fontWeight: FontWeight.w800)),
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          // Profile Card
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [Color(0xFF7F1D1D), AppColors.primary],
              ),
              borderRadius: BorderRadius.circular(20),
              boxShadow: [
                BoxShadow(
                  color: AppColors.primary.withValues(alpha: 0.3),
                  blurRadius: 20,
                  offset: const Offset(0, 8),
                )
              ],
            ),
            child: Row(
              children: [
                Container(
                  width: 64, height: 64,
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.2),
                    shape: BoxShape.circle,
                    border: Border.all(color: Colors.white.withValues(alpha: 0.4), width: 2),
                  ),
                  child: Center(
                    child: Text(
                      session.initials,
                      style: GoogleFonts.spaceGrotesk(
                        fontSize: 24, fontWeight: FontWeight.w800, color: Colors.white,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        session.name,
                        style: GoogleFonts.spaceGrotesk(
                          fontSize: 16, fontWeight: FontWeight.w800, color: Colors.white,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        session.email,
                        style: GoogleFonts.spaceGrotesk(
                          fontSize: 11, color: Colors.white70,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.2),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          session.role == UserRole.pelapor ? '👤 Pelapor' : '🔧 Teknisi',
                          style: GoogleFonts.spaceGrotesk(
                            fontSize: 11, fontWeight: FontWeight.w700, color: Colors.white,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),

          // NIM/SSO info
          _InfoCard(
            isDark: isDark,
            children: [
              _InfoTile(Icons.badge_outlined, 'NIM / NIP', session.nim.isEmpty ? '-' : session.nim),
              _InfoTile(Icons.alternate_email_rounded, 'SSO ID', session.ssoId),
            ],
          ),
          const SizedBox(height: 20),

          // Settings
          _SectionHeader('Pengaturan'),
          _SettingsCard(isDark: isDark, children: [
            // Dark mode toggle
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
              child: Row(
                children: [
                  const Icon(Icons.dark_mode_rounded, size: 20, color: AppColors.textMuted),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Mode Gelap',
                            style: GoogleFonts.spaceGrotesk(
                                fontSize: 14, fontWeight: FontWeight.w600)),
                        Text('Matikan untuk mode terang',
                            style: GoogleFonts.spaceGrotesk(
                                fontSize: 11, color: AppColors.textMuted)),
                      ],
                    ),
                  ),
                  const ThemeToggleButton(),
                ],
              ),
            ),
            Divider(height: 1, color: isDark ? AppColors.borderDark : AppColors.borderLight),
            // Notifikasi
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
              child: Row(
                children: [
                  const Icon(Icons.notifications_outlined, size: 20, color: AppColors.textMuted),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Push Notification',
                            style: GoogleFonts.spaceGrotesk(
                                fontSize: 14, fontWeight: FontWeight.w600)),
                        Text('Update status laporan real-time',
                            style: GoogleFonts.spaceGrotesk(
                                fontSize: 11, color: AppColors.textMuted)),
                      ],
                    ),
                  ),
                  Switch.adaptive(
                    value: _notifEnabled,
                    onChanged: (v) => setState(() => _notifEnabled = v),
                    activeTrackColor: AppColors.primary,
                  ),
                ],
              ),
            ),
          ]),
          const SizedBox(height: 20),

          // About
          _SectionHeader('Tentang Aplikasi'),
          _SettingsCard(isDark: isDark, children: [
            _MenuTile(Icons.info_outline_rounded, 'Versi Aplikasi', '1.0.0 (Build 1)', isDark),
            Divider(height: 1, color: isDark ? AppColors.borderDark : AppColors.borderLight),
            _MenuTile(Icons.school_rounded, 'Telkom University', 'Fakultas Informatika', isDark),
            Divider(height: 1, color: isDark ? AppColors.borderDark : AppColors.borderLight),
            _MenuTile(Icons.code_rounded, 'Dibuat oleh', 'Tim Campus Fix ABP 2026', isDark),
          ]),
          const SizedBox(height: 24),

          // Logout Button
          GestureDetector(
            onTap: _logout,
            child: Container(
              padding: const EdgeInsets.symmetric(vertical: 16),
              decoration: BoxDecoration(
                color: AppColors.danger.withValues(alpha: 0.08),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: AppColors.danger.withValues(alpha: 0.25)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.logout_rounded, color: AppColors.danger, size: 20),
                  const SizedBox(width: 8),
                  Text('Keluar dari Akun',
                      style: GoogleFonts.spaceGrotesk(
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                          color: AppColors.danger)),
                ],
              ),
            ),
          ),
          const SizedBox(height: 32),

          // Campus Fix branding
          Center(child: CampusFixLogo(iconSize: 24, fontSize: 16)),
          const SizedBox(height: 6),
          Center(
            child: Text('Platform Pelaporan Fasilitas Kampus',
                style: GoogleFonts.spaceGrotesk(fontSize: 10, color: AppColors.textDim)),
          ),
          const SizedBox(height: 20),
        ],
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  final String text;
  const _SectionHeader(this.text);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Text(text.toUpperCase(),
          style: GoogleFonts.spaceGrotesk(
              fontSize: 11,
              fontWeight: FontWeight.w700,
              color: AppColors.textMuted,
              letterSpacing: 0.6)),
    );
  }
}

class _InfoCard extends StatelessWidget {
  final bool isDark;
  final List<Widget> children;
  const _InfoCard({required this.isDark, required this.children});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: isDark ? AppColors.cardDark : AppColors.cardLight,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: isDark ? AppColors.borderDark : AppColors.borderLight),
      ),
      child: Column(
        children: children
            .expand((w) => [
                  w,
                  Divider(height: 1, color: isDark ? AppColors.borderDark : AppColors.borderLight)
                ])
            .toList()
          ..removeLast(),
      ),
    );
  }
}

class _InfoTile extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  const _InfoTile(this.icon, this.label, this.value);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        children: [
          Icon(icon, size: 18, color: AppColors.textMuted),
          const SizedBox(width: 12),
          Text(label,
              style: GoogleFonts.spaceGrotesk(fontSize: 13, color: AppColors.textMuted)),
          const Spacer(),
          Text(value,
              style: GoogleFonts.spaceGrotesk(fontSize: 13, fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }
}

class _SettingsCard extends StatelessWidget {
  final bool isDark;
  final List<Widget> children;
  const _SettingsCard({required this.isDark, required this.children});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: isDark ? AppColors.cardDark : AppColors.cardLight,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: isDark ? AppColors.borderDark : AppColors.borderLight),
      ),
      child: Column(children: children),
    );
  }
}

class _MenuTile extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final bool isDark;
  const _MenuTile(this.icon, this.title, this.subtitle, this.isDark);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        children: [
          Icon(icon, size: 18, color: AppColors.textMuted),
          const SizedBox(width: 12),
          Expanded(
            child: Text(title,
                style: GoogleFonts.spaceGrotesk(fontSize: 13, fontWeight: FontWeight.w600)),
          ),
          Text(subtitle,
              style: GoogleFonts.spaceGrotesk(fontSize: 11, color: AppColors.textMuted)),
        ],
      ),
    );
  }
}
