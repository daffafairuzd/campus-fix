import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:intl/date_symbol_data_local.dart';

import 'services/api_service.dart';
import 'models/user_model.dart';
import 'theme/app_theme.dart';
import 'pages/auth/login_page.dart';
import 'pages/pelapor/pelapor_home_page.dart';
import 'pages/teknisi/teknisi_home_page.dart';

/// Global theme notifier — accessible from any widget
final themeNotifier = ValueNotifier<ThemeMode>(ThemeMode.dark);

Future<void> _loadThemePreference() async {
  final prefs = await SharedPreferences.getInstance();
  final isDark = prefs.getBool('isDark') ?? true;
  themeNotifier.value = isDark ? ThemeMode.dark : ThemeMode.light;
}

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await _loadThemePreference();
  await initializeDateFormatting('id', null); // init locale Indonesia untuk intl
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
      backgroundColor: isDark ? const Color(0xFF0F0F0F) : const Color(0xFFF8F8F8),
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
