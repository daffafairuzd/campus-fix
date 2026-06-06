import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../models/user_model.dart';
import '../../theme/app_theme.dart';
import 'dashboard_page.dart';
import 'create_report_page.dart';
import 'report_history_page.dart';
import '../shared/profile_page.dart';
import '../shared/notification_page.dart';

class PelaporHomePage extends StatefulWidget {
  final UserSession session;
  const PelaporHomePage({super.key, required this.session});

  @override
  State<PelaporHomePage> createState() => _PelaporHomePageState();
}

class _PelaporHomePageState extends State<PelaporHomePage>
    with SingleTickerProviderStateMixin {
  // Index mapping (skip index 2 = tombol Lapor tengah):
  // 0=Beranda, 1=Riwayat, [2=Lapor action], 3=Notifikasi, 4=Profil
  int _selectedIndex = 0;

  final ScrollController _scrollController = ScrollController();
  late final AnimationController _navAnim;
  late final Animation<double> _navSlide;

  @override
  void initState() {
    super.initState();

    _navAnim = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 250),
      value: 1.0, // mulai visible
    );
    _navSlide = CurvedAnimation(parent: _navAnim, curve: Curves.easeInOut);
  }

  @override
  void dispose() {
    _scrollController.dispose();
    _navAnim.dispose();
    super.dispose();
  }

  Future<void> _openCreateReport() async {
    final result = await Navigator.push(
      context,
      PageRouteBuilder(
        pageBuilder: (_, __, ___) => CreateReportPage(session: widget.session),
        transitionsBuilder: (_, animation, __, child) {
          final slide = Tween<Offset>(
            begin: const Offset(0, 1),
            end: Offset.zero,
          ).animate(CurvedAnimation(parent: animation, curve: Curves.easeOutCubic));
          return SlideTransition(position: slide, child: child);
        },
        transitionDuration: const Duration(milliseconds: 350),
      ),
    );

    if (result == true && mounted) {
      setState(() => _selectedIndex = 1); // Pindah ke tab Riwayat
    }
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, result) async {
        if (didPop) return;
        final shouldPop = await showDialog<bool>(
          context: context,
          builder: (context) => AlertDialog(
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            title: Text('Keluar Aplikasi?', style: GoogleFonts.spaceGrotesk(fontSize: 16, fontWeight: FontWeight.w700)),
            content: Text('Apakah kamu yakin ingin keluar dari aplikasi CampusFix?', style: GoogleFonts.spaceGrotesk(fontSize: 13, color: AppColors.textMuted)),
            actions: [
              TextButton(
                onPressed: () => Navigator.of(context).pop(false),
                child: Text('Batal', style: GoogleFonts.spaceGrotesk(color: AppColors.textMuted)),
              ),
              FilledButton(
                onPressed: () => Navigator.of(context).pop(true),
                style: FilledButton.styleFrom(backgroundColor: AppColors.danger),
                child: Text('Keluar', style: GoogleFonts.spaceGrotesk(fontWeight: FontWeight.w700)),
              ),
            ],
          ),
        ) ?? false;

        if (shouldPop && context.mounted) {
          SystemNavigator.pop();
        }
      },
      child: Scaffold(
        // Extend body behind navbar agar konten bisa scroll full
        extendBody: true,
        body: _selectedIndex == 0
            ? DashboardPage(session: widget.session)
            : _selectedIndex == 1
                ? ReportHistoryPage(session: widget.session)
                : _selectedIndex == 2
                    ? NotificationPage(session: widget.session)
                    : ProfilePage(session: widget.session),
        bottomNavigationBar: SizeTransition(
          sizeFactor: _navSlide,
          axisAlignment: 1.0, // slide dari bawah
          child: _BottomNav(
            selectedIndex: _selectedIndex,
            onTap: (i) => setState(() => _selectedIndex = i),
            onLapor: _openCreateReport,
          ),
        ),
      ),
    );
  }
}

// ──────────────────────────────────────────────
// Bottom Navigation Bar
// ──────────────────────────────────────────────
class _BottomNav extends StatelessWidget {
  final int selectedIndex;
  final ValueChanged<int> onTap;
  final VoidCallback onLapor;

  const _BottomNav({
    required this.selectedIndex,
    required this.onTap,
    required this.onLapor,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      decoration: BoxDecoration(
        color: isDark ? AppColors.cardDark : Colors.white,
        border: const Border(top: BorderSide(color: Color(0xFFE5E7EB))),
      ),
      child: SafeArea(
        top: false,
        child: SizedBox(
          height: 80,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              // 0: Beranda
              _NavItem(
                icon: Icons.dashboard_rounded,
                label: 'Beranda',
                selected: selectedIndex == 0,
                onTap: () => onTap(0),
              ),
              // 1: Riwayat
              _NavItem(
                icon: Icons.history_rounded,
                label: 'Riwayat',
                selected: selectedIndex == 1,
                onTap: () => onTap(1),
              ),
              // 2: FAB Lapor (tengah — elevated)
              _LaporFab(onTap: onLapor),
              // 3: Notifikasi
              _NavItem(
                icon: Icons.notifications_outlined,
                label: 'Notifikasi',
                selected: selectedIndex == 2,
                onTap: () => onTap(2),
              ),
              // 4: Profil
              _NavItem(
                icon: Icons.person_outline_rounded,
                label: 'Profil',
                selected: selectedIndex == 3,
                onTap: () => onTap(3),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ──────────────────────────────────────────────
// Tombol Lapor — FAB melayang di tengah
// ──────────────────────────────────────────────
class _LaporFab extends StatefulWidget {
  final VoidCallback onTap;
  const _LaporFab({required this.onTap});

  @override
  State<_LaporFab> createState() => _LaporFabState();
}

class _LaporFabState extends State<_LaporFab>
    with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;
  late Animation<double> _scale;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 120),
      lowerBound: 0.0,
      upperBound: 0.1,
    );
    _scale = Tween<double>(begin: 1.0, end: 0.88).animate(
      CurvedAnimation(parent: _ctrl, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: (_) => _ctrl.forward(),
      onTapUp: (_) {
        _ctrl.reverse();
        widget.onTap();
      },
      onTapCancel: () => _ctrl.reverse(),
      child: ScaleTransition(
        scale: _scale,
        child: SizedBox(
          width: 72,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Lingkaran melayang
              Container(
                width: 58,
                height: 58,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(8),
                  color: AppColors.primary,
                ),
                child: const Icon(
                  Icons.campaign_rounded,
                  size: 28,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                'Lapor',
                style: GoogleFonts.inter(
                  fontSize: 10,
                  fontWeight: FontWeight.w800,
                  color: AppColors.primary,
                  letterSpacing: 0.2,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ──────────────────────────────────────────────
// Item navigasi biasa
// ──────────────────────────────────────────────
class _NavItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool selected;
  final VoidCallback onTap;

  const _NavItem({
    required this.icon,
    required this.label,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: SizedBox(
        width: 64,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          mainAxisSize: MainAxisSize.min,
          children: [
            AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              curve: Curves.easeOutCubic,
              padding: const EdgeInsets.all(7),
              decoration: BoxDecoration(
                color: selected
                    ? AppColors.primary.withValues(alpha: 0.12)
                    : Colors.transparent,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(
                icon,
                size: 22,
                color: selected ? AppColors.primary : AppColors.textMuted,
              ),
            ),
            const SizedBox(height: 2),
            AnimatedDefaultTextStyle(
              duration: const Duration(milliseconds: 200),
              style: GoogleFonts.inter(
                fontSize: 10,
                fontWeight: selected ? FontWeight.w700 : FontWeight.w500,
                color: selected ? AppColors.primary : AppColors.textMuted,
              ),
              child: Text(label),
            ),
          ],
        ),
      ),
    );
  }
}
