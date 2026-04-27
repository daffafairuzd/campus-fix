import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../main.dart' show themeNotifier;
import '../theme/app_theme.dart';

class ThemeToggleButton extends StatelessWidget {
  const ThemeToggleButton({super.key});

  Future<void> _toggleTheme() async {
    final isDark = themeNotifier.value == ThemeMode.dark;
    themeNotifier.value = isDark ? ThemeMode.light : ThemeMode.dark;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('isDark', !isDark);
  }

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<ThemeMode>(
      valueListenable: themeNotifier,
      builder: (context, mode, _) {
        final isDark = mode == ThemeMode.dark;
        return GestureDetector(
          onTap: _toggleTheme,
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 250),
            curve: Curves.easeInOut,
            width: 52,
            height: 28,
            padding: const EdgeInsets.all(3),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(14),
              color: isDark ? AppColors.primary : AppColors.borderLight,
              border: Border.all(
                color: isDark
                    ? AppColors.primary.withValues(alpha: 0.5)
                    : AppColors.textDim.withValues(alpha: 0.3),
              ),
            ),
            child: AnimatedAlign(
              duration: const Duration(milliseconds: 250),
              alignment: isDark ? Alignment.centerRight : Alignment.centerLeft,
              child: Container(
                width: 20,
                height: 20,
                decoration: BoxDecoration(
                  color: Colors.white,
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.15),
                      blurRadius: 4,
                      offset: const Offset(0, 1),
                    ),
                  ],
                ),
                child: Icon(
                  isDark ? Icons.dark_mode_rounded : Icons.light_mode_rounded,
                  size: 12,
                  color: isDark ? AppColors.bgDark : AppColors.warning,
                ),
              ),
            ),
          ),
        );
      },
    );
  }
}
