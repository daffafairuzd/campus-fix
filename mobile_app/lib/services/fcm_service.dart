import 'dart:async';
import 'dart:convert';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../main.dart' show navigatorKey;
import '../models/user_model.dart';
import '../pages/pelapor/report_detail_pelapor.dart';
import '../pages/teknisi/report_detail_teknisi.dart';
import 'api_service.dart';

class FcmService {
  static final _messaging = FirebaseMessaging.instance;
  static final _localNotifications = FlutterLocalNotificationsPlugin();

  // Stream untuk teknisi: ada penugasan baru
  static final _newTaskController = StreamController<void>.broadcast();
  static Stream<void> get onNewTaskAssigned => _newTaskController.stream;

  // Stream untuk pelapor: ada perubahan status laporan
  static final _reportStatusController = StreamController<void>.broadcast();
  static Stream<void> get onReportStatusChanged => _reportStatusController.stream;

  static Future<void> init() async {
    // Setup local notifications for foreground push notifications
    const androidInit = AndroidInitializationSettings('@mipmap/ic_launcher');
    const iosInit = DarwinInitializationSettings();
    const initSettings = InitializationSettings(android: androidInit, iOS: iosInit);
    
    await _localNotifications.initialize(
      settings: initSettings,
      onDidReceiveNotificationResponse: (response) {
        if (response.payload != null) {
          try {
            final data = jsonDecode(response.payload!) as Map<String, dynamic>;
            _navigateToReport(data);
          } catch (_) {}
        }
      },
    );

    // Setup channel for Android Heads-up notifications
    const channel = AndroidNotificationChannel(
      'high_importance_channel', // id
      'High Importance Notifications', // title
      description: 'This channel is used for important notifications.', // description
      importance: Importance.max,
    );

    await _localNotifications
        .resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>()
        ?.createNotificationChannel(channel);

    await _messaging.setForegroundNotificationPresentationOptions(
      alert: true,
      badge: true,
      sound: true,
    );

    final settings = await _messaging.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );

    if (settings.authorizationStatus == AuthorizationStatus.denied) return;

    await _syncToken();

    _messaging.onTokenRefresh.listen((newToken) async {
      final prefs = await SharedPreferences.getInstance();
      if (prefs.getBool('notif_enabled') == false) return;
      await api.sendFcmToken(newToken);
    });

    // App terbuka — tampilkan push notification (heads-up)
    FirebaseMessaging.onMessage.listen((message) {
      final notification = message.notification;
      
      if (notification != null) {
        _localNotifications.show(
          id: notification.hashCode,
          title: notification.title,
          body: notification.body,
          notificationDetails: NotificationDetails(
            android: AndroidNotificationDetails(
              channel.id,
              channel.name,
              channelDescription: channel.description,
              icon: '@mipmap/ic_launcher',
              importance: Importance.max,
              priority: Priority.high,
            ),
            iOS: const DarwinNotificationDetails(
              presentAlert: true,
              presentBadge: true,
              presentSound: true,
            ),
          ),
          payload: jsonEncode(message.data),
        );

        // Broadcast event sesuai tipe notifikasi
        if (message.data['type'] == 'new_assignment' ||
            message.data['report_id'] != null) {
          // Untuk teknisi: penugasan baru
          _newTaskController.add(null);
          // Untuk pelapor: perubahan status
          _reportStatusController.add(null);
        }
      }
    });

    // App di-minimize lalu notif di-tap — refresh juga
    FirebaseMessaging.onMessageOpenedApp.listen((message) {
      if (message.data['report_id'] != null) {
        _newTaskController.add(null);
        _reportStatusController.add(null);
      }
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
    final prefs = await SharedPreferences.getInstance();
    if (prefs.getBool('notif_enabled') == false) {
      await api.sendFcmToken('');
      return;
    }
    final token = await _messaging.getToken();
    if (token != null) await api.sendFcmToken(token);
  }

  static Future<void> clearToken() async {
    await _messaging.deleteToken();
    await api.sendFcmToken('');
  }

  static Future<void> disableNotifications() async {
    await _messaging.deleteToken();
    await api.sendFcmToken(''); // Now backend will accept empty string and set it to null
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
