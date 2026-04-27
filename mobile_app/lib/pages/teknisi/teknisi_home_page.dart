import 'package:flutter/material.dart';
import '../../models/user_model.dart';
import '../../theme/app_theme.dart';
import 'task_list_page.dart';
import 'performance_page.dart';
import '../shared/profile_page.dart';
import '../shared/notification_page.dart';

class TeknisiHomePage extends StatefulWidget {
  final UserSession session;
  const TeknisiHomePage({super.key, required this.session});

  @override
  State<TeknisiHomePage> createState() => _TeknisiHomePageState();
}

class _TeknisiHomePageState extends State<TeknisiHomePage> {
  int _selectedIndex = 0;

  late final List<Widget> _pages;

  @override
  void initState() {
    super.initState();
    _pages = [
      TaskListPage(session: widget.session),
      PerformancePage(session: widget.session),
      ProfilePage(session: widget.session),
    ];
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      body: IndexedStack(index: _selectedIndex, children: _pages),
      bottomNavigationBar: Container(
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
                  icon: Icons.task_alt_rounded,
                  label: 'Tugas',
                  selected: _selectedIndex == 0,
                  onTap: () => setState(() => _selectedIndex = 0),
                ),
                _NavItem(
                  icon: Icons.bar_chart_rounded,
                  label: 'Kinerja',
                  selected: _selectedIndex == 1,
                  onTap: () => setState(() => _selectedIndex = 1),
                ),
                _NavItem(
                  icon: Icons.notifications_outlined,
                  label: 'Notif',
                  selected: false,
                  onTap: () => Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => NotificationPage(session: widget.session),
                    ),
                  ),
                  badge: true,
                ),
                _NavItem(
                  icon: Icons.person_outline_rounded,
                  label: 'Profil',
                  selected: _selectedIndex == 2,
                  onTap: () => setState(() => _selectedIndex = 2),
                ),
              ],
            ),
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
  final bool badge;

  const _NavItem({
    required this.icon,
    required this.label,
    required this.selected,
    required this.onTap,
    this.badge = false,
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
              child: Stack(
                clipBehavior: Clip.none,
                children: [
                  Icon(icon,
                      size: 22,
                      color: selected ? AppColors.primary : AppColors.textMuted),
                  if (badge)
                    Positioned(
                      top: -2, right: -2,
                      child: Container(
                        width: 8, height: 8,
                        decoration: const BoxDecoration(
                          color: Colors.amber, shape: BoxShape.circle,
                        ),
                      ),
                    ),
                ],
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
