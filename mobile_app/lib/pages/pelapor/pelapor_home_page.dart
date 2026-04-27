import 'package:flutter/material.dart';
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

class _PelaporHomePageState extends State<PelaporHomePage> {
  int _selectedIndex = 0;

  late final List<Widget> _pages;

  @override
  void initState() {
    super.initState();
    _pages = [
      DashboardPage(session: widget.session),
      CreateReportPage(session: widget.session),
      ReportHistoryPage(session: widget.session),
      ProfilePage(session: widget.session),
    ];
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(index: _selectedIndex, children: _pages),
      bottomNavigationBar: _BottomNav(
        selectedIndex: _selectedIndex,
        onTap: (i) => setState(() => _selectedIndex = i),
        onNotification: () => Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => NotificationPage(session: widget.session),
          ),
        ),
      ),
    );
  }
}

class _BottomNav extends StatelessWidget {
  final int selectedIndex;
  final ValueChanged<int> onTap;
  final VoidCallback onNotification;

  const _BottomNav({
    required this.selectedIndex,
    required this.onTap,
    required this.onNotification,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Container(
      decoration: BoxDecoration(
        color: isDark ? AppColors.cardDark : AppColors.cardLight,
        border: Border(
          top: BorderSide(
            color: isDark ? AppColors.borderDark : AppColors.borderLight,
          ),
        ),
      ),
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 6),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _NavItem(
                icon: Icons.dashboard_rounded,
                label: 'Beranda',
                selected: selectedIndex == 0,
                onTap: () => onTap(0),
              ),
              _NavItem(
                icon: Icons.add_circle_outline_rounded,
                label: 'Lapor',
                selected: selectedIndex == 1,
                onTap: () => onTap(1),
                isAction: true,
              ),
              _NavItem(
                icon: Icons.history_rounded,
                label: 'Riwayat',
                selected: selectedIndex == 2,
                onTap: () => onTap(2),
              ),
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

class _NavItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool selected;
  final VoidCallback onTap;
  final bool isAction;

  const _NavItem({
    required this.icon,
    required this.label,
    required this.selected,
    required this.onTap,
    this.isAction = false,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: SizedBox(
        width: 72,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: selected
                    ? AppColors.primary.withValues(alpha: 0.12)
                    : Colors.transparent,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(
                icon,
                size: isAction ? 28 : 22,
                color: selected ? AppColors.primary : AppColors.textMuted,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              label,
              style: TextStyle(
                fontSize: 10,
                fontWeight: selected ? FontWeight.w700 : FontWeight.w500,
                color: selected ? AppColors.primary : AppColors.textMuted,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
