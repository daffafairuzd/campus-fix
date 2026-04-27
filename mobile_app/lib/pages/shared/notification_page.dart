import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../models/user_model.dart';
import '../../models/report_model.dart';
import '../../services/mock_api_service.dart';
import '../../theme/app_theme.dart';

class NotificationPage extends StatefulWidget {
  final UserSession session;
  const NotificationPage({super.key, required this.session});

  @override
  State<NotificationPage> createState() => _NotificationPageState();
}

class _NotificationPageState extends State<NotificationPage> {
  List<AppNotification> _notifications = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadNotifications();
  }

  Future<void> _loadNotifications() async {
    setState(() => _isLoading = true);
    final data = await api.getNotifications();
    if (mounted) setState(() { _notifications = data; _isLoading = false; });
  }

  Future<void> _markAllRead() async {
    await api.markAllRead();
    setState(() {
      for (final n in _notifications) {
        n.isRead = true;
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final unread = _notifications.where((n) => !n.isRead).length;

    return Scaffold(
      appBar: AppBar(
        title: Text('Notifikasi',
            style: GoogleFonts.spaceGrotesk(fontSize: 18, fontWeight: FontWeight.w800)),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          if (unread > 0)
            TextButton(
              onPressed: _markAllRead,
              child: Text('Tandai dibaca',
                  style: GoogleFonts.spaceGrotesk(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: AppColors.primary)),
            ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
          : _notifications.isEmpty
              ? _EmptyState()
              : RefreshIndicator(
                  onRefresh: _loadNotifications,
                  color: AppColors.primary,
                  child: ListView(
                    padding: const EdgeInsets.all(16),
                    children: [
                      if (unread > 0) ...[
                        Container(
                          margin: const EdgeInsets.only(bottom: 12),
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                          decoration: BoxDecoration(
                            color: AppColors.primary.withValues(alpha: 0.08),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: AppColors.primary.withValues(alpha: 0.2)),
                          ),
                          child: Row(
                            children: [
                              const Icon(Icons.notifications_active_rounded,
                                  size: 16, color: AppColors.primary),
                              const SizedBox(width: 8),
                              Text(
                                '$unread notifikasi belum dibaca',
                                style: GoogleFonts.spaceGrotesk(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w600,
                                    color: AppColors.primary),
                              ),
                            ],
                          ),
                        ),
                      ],
                      ..._notifications.map((n) => _NotifCard(
                            notification: n,
                            isDark: isDark,
                            onTap: () {
                              setState(() => n.isRead = true);
                            },
                          )),
                    ],
                  ),
                ),
    );
  }
}

class _NotifCard extends StatelessWidget {
  final AppNotification notification;
  final bool isDark;
  final VoidCallback onTap;

  const _NotifCard({
    required this.notification,
    required this.isDark,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final (icon, color) = _resolveType(notification.type);
    final isUnread = !notification.isRead;

    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: isUnread
              ? (isDark
                  ? AppColors.primary.withValues(alpha: 0.05)
                  : AppColors.primary.withValues(alpha: 0.03))
              : (isDark ? AppColors.cardDark : AppColors.cardLight),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: isUnread
                ? AppColors.primary.withValues(alpha: 0.2)
                : (isDark ? AppColors.borderDark : AppColors.borderLight),
            width: isUnread ? 1.5 : 1,
          ),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 40, height: 40,
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.12),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, size: 20, color: color),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          notification.title,
                          style: GoogleFonts.spaceGrotesk(
                            fontSize: 13,
                            fontWeight: isUnread ? FontWeight.w700 : FontWeight.w600,
                          ),
                        ),
                      ),
                      if (isUnread)
                        Container(
                          width: 8, height: 8,
                          decoration: const BoxDecoration(
                            color: AppColors.primary, shape: BoxShape.circle,
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    notification.body,
                    style: GoogleFonts.spaceGrotesk(
                        fontSize: 12,
                        color: AppColors.textMuted,
                        height: 1.4),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    notification.time,
                    style: GoogleFonts.spaceGrotesk(
                        fontSize: 10,
                        color: AppColors.textDim,
                        fontWeight: FontWeight.w500),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  static (IconData, Color) _resolveType(String type) {
    switch (type) {
      case 'status_update':
        return (Icons.update_rounded, AppColors.statusInProgress);
      case 'assignment':
        return (Icons.assignment_ind_rounded, AppColors.statusAssigned);
      case 'accepted':
        return (Icons.check_circle_outline_rounded, AppColors.statusAccepted);
      case 'new_task':
        return (Icons.notifications_active_rounded, AppColors.primary);
      case 'completed':
        return (Icons.task_alt_rounded, AppColors.statusCompleted);
      default:
        return (Icons.info_outline_rounded, AppColors.info);
    }
  }
}

class _EmptyState extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: AppColors.primary.withValues(alpha: 0.08),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.notifications_off_outlined,
                size: 44, color: AppColors.primary),
          ),
          const SizedBox(height: 16),
          Text('Tidak ada notifikasi',
              style: GoogleFonts.spaceGrotesk(
                  fontSize: 16, fontWeight: FontWeight.w700)),
          const SizedBox(height: 6),
          Text('Kamu akan mendapat notifikasi saat ada update laporan',
              style: GoogleFonts.spaceGrotesk(
                  fontSize: 12, color: AppColors.textMuted),
              textAlign: TextAlign.center),
        ],
      ),
    );
  }
}
