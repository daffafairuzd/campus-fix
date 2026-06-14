import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';

import 'services/api_service.dart';
import 'services/fcm_service.dart';
import 'models/user_model.dart';
import 'theme/app_theme.dart';
import 'pages/auth/login_page.dart';
import 'pages/pelapor/pelapor_home_page.dart';
import 'pages/teknisi/teknisi_home_page.dart';

@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp();
}

/// Global navigator key — untuk navigate dari luar widget tree (FCM tap)
final navigatorKey = GlobalKey<NavigatorState>();

/// Global theme notifier — accessible from any widget
final themeNotifier = ValueNotifier<ThemeMode>(ThemeMode.light);

Future<void> _loadThemePreference() async {
  final prefs = await SharedPreferences.getInstance();
  final isDark = prefs.getBool('isDark') ?? false;
  themeNotifier.value = isDark ? ThemeMode.dark : ThemeMode.light;
}

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();
  FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);
  await _loadThemePreference();
  await initializeDateFormatting('id', null);
  runApp(const CampusFixApp());
}

class CampusFixApp extends StatelessWidget {
  const CampusFixApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<ThemeMode>(
      valueListenable: themeNotifier,
      builder: (context, mode, _) {
        return MaterialApp(
          navigatorKey: navigatorKey,
          debugShowCheckedModeBanner: false,
          title: 'Campus Fix',
          theme: AppTheme.light(),
          darkTheme: AppTheme.dark(),
          themeMode: mode,
          home: const _SplashRouter(),
        );
      },
    );
  }
}

/// Cek sesi tersimpan — auto-login jika token valid
class _SplashRouter extends StatefulWidget {
  const _SplashRouter();

  @override
  State<_SplashRouter> createState() => _SplashRouterState();
}

class _SplashRouterState extends State<_SplashRouter> {
  @override
  void initState() {
    super.initState();
    _checkSession();
  }

  Future<void> _checkSession() async {
    // Coba restore sesi dari SharedPreferences
    final session = await api.getSavedSession();

    if (!mounted) return;

    if (session != null) {
      // Init FCM untuk user yang sudah login (auto-login)
      await FcmService.init();

      if (!mounted) return;

      // Ada sesi tersimpan — langsung ke home page yang sesuai
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
    } else {
      // Tidak ada sesi — ke login
      Navigator.pushReplacement(
        context,
        PageRouteBuilder(
          pageBuilder: (_, __, ___) => const LoginPage(),
          transitionsBuilder: (_, animation, __, child) =>
              FadeTransition(opacity: animation, child: child),
          transitionDuration: const Duration(milliseconds: 300),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    // Splash screen sementara
    final isDark = themeNotifier.value == ThemeMode.dark;
    return Scaffold(
      backgroundColor: isDark ? AppColors.bgDark : AppColors.bgLight,
      body: const Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            CircularProgressIndicator(
              color: AppColors.primary,
              strokeWidth: 2.5,
            ),
          ],
        ),
      ),
    );
  }
}
