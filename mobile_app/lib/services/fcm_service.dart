import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import '../main.dart' show navigatorKey;
import '../models/user_model.dart';
import '../pages/pelapor/report_detail_pelapor.dart';
import '../pages/teknisi/report_detail_teknisi.dart';
import 'api_service.dart';

class FcmService {
  static final _messaging = FirebaseMessaging.instance;

  static Future<void> init() async {
    final settings = await _messaging.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );

    if (settings.authorizationStatus == AuthorizationStatus.denied) return;

    await _syncToken();

    _messaging.onTokenRefresh.listen((newToken) async {
      await api.sendFcmToken(newToken);
    });

    // App terbuka — tampilkan snackbar
    FirebaseMessaging.onMessage.listen((message) {
      final title = message.notification?.title ?? '';
      final body = message.notification?.body ?? '';
      _showSnackbar(title, body, message.data);
    });

    // App di-minimize lalu notif di-tap
    FirebaseMessaging.onMessageOpenedApp.listen((message) {
      _navigateToReport(message.data);
    });

    // App tertutup lalu notif di-tap
    final initialMessage = await _messaging.getInitialMessage();
    if (initialMessage != null) {
      // Tunggu sampai home page sudah ter-render
      await Future.delayed(const Duration(milliseconds: 1500));
      _navigateToReport(initialMessage.data);
    }
  }

  static Future<void> _syncToken() async {
    final token = await _messaging.getToken();
    if (token != null) await api.sendFcmToken(token);
  }

  static Future<void> clearToken() async {
    await _messaging.deleteToken();
  }

  static Future<void> disableNotifications() async {
    await _messaging.deleteToken();
    await api.sendFcmToken('');
  }

  static Future<void> enableNotifications() async {
    await _syncToken();
  }

  static void _showSnackbar(String title, String body, Map<String, dynamic> data) {
    final context = navigatorKey.currentContext;
    if (context == null) return;

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
            Text(body, style: const TextStyle(fontSize: 12)),
          ],
        ),
        duration: const Duration(seconds: 4),
        action: data['report_id'] != null
            ? SnackBarAction(
                label: 'Lihat',
                onPressed: () => _navigateToReport(data),
              )
            : null,
      ),
    );
  }

  static Future<void> _navigateToReport(Map<String, dynamic> data) async {
    final reportIdStr = data['report_id'] as String?;
    if (reportIdStr == null) return;

    final reportId = int.tryParse(reportIdStr);
    if (reportId == null) return;

    try {
      final report = await api.getReport(reportId);
      final session = await api.getSavedSession();
      if (session == null) return;

      if (session.role == UserRole.teknisi &&
          !report.activeTechnicianIds.contains(session.id)) {
        final messenger = navigatorKey.currentContext != null
            ? ScaffoldMessenger.of(navigatorKey.currentContext!)
            : null;
        messenger?.showSnackBar(
          const SnackBar(
            content: Text('Anda sudah tidak lagi ditugaskan ke laporan ini.'),
            duration: Duration(seconds: 3),
          ),
        );
        return;
      }

      final page = session.role == UserRole.teknisi
          ? ReportDetailTeknisi(report: report, session: session)
          : ReportDetailPelapor(report: report);

      navigatorKey.currentState?.push(
        MaterialPageRoute(builder: (_) => page),
      );
    } catch (_) {}
  }
}
