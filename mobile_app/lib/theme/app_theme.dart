import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppColors {
  // Primary Red — sesuai web admin (#dc2626)
  static const primary = Color(0xFFDC2626);
  static const primaryDark = Color(0xFFB91C1C);
  static const primaryGlow = Color(0x1ADC2626);

  // Light Mode
  static const bgLight = Color(0xFFF5F6FA);
  static const cardLight = Color(0xFFFFFFFF);
  static const borderLight = Color(0xFFE2E8F0);
  static const textMainLight = Color(0xFF1E293B);

  // Dark Mode
  static const bgDark = Color(0xFF0A0F14);
  static const cardDark = Color(0xFF111827);
  static const hoverDark = Color(0xFF1A2535);
  static const borderDark = Color(0xFF1E2D3D);
  static const textMainDark = Color(0xFFE2E8F0);

  // Shared
  static const textMuted = Color(0xFF64748B);
  static const textDim = Color(0xFF94A3B8);

  // Status Colors
  static const statusSubmitted = Color(0xFF64748B);
  static const statusAccepted = Color(0xFF3B82F6);
  static const statusAssigned = Color(0xFF8B5CF6);
  static const statusInProgress = Color(0xFFF59E0B);
  static const statusCompleted = Color(0xFF10B981);

  // Priority Colors
  static const priorityHigh = Color(0xFFDC2626);
  static const priorityMedium = Color(0xFFF59E0B);
  static const priorityLow = Color(0xFF10B981);

  // Semantic
  static const success = Color(0xFF10B981);
  static const warning = Color(0xFFF59E0B);
  static const danger = Color(0xFFEF4444);
  static const info = Color(0xFF3B82F6);
}

class AppTheme {
  static TextTheme _buildTextTheme(TextTheme base) {
    return GoogleFonts.spaceGroteskTextTheme(base);
  }

  static ThemeData light() {
    final base = ThemeData.light(useMaterial3: true);
    return base.copyWith(
      colorScheme: const ColorScheme.light(
        primary: AppColors.primary,
        onPrimary: Colors.white,
        secondary: AppColors.primaryDark,
        surface: AppColors.cardLight,
        onSurface: AppColors.textMainLight,
        outline: AppColors.borderLight,
        error: AppColors.danger,
      ),
      scaffoldBackgroundColor: AppColors.bgLight,
      textTheme: _buildTextTheme(base.textTheme),
      appBarTheme: AppBarTheme(
        backgroundColor: AppColors.cardLight,
        foregroundColor: AppColors.textMainLight,
        elevation: 0,
        scrolledUnderElevation: 1,
        shadowColor: AppColors.borderLight,
        centerTitle: false,
        titleTextStyle: GoogleFonts.spaceGrotesk(
          fontSize: 18,
          fontWeight: FontWeight.w700,
          color: AppColors.textMainLight,
        ),
        iconTheme: const IconThemeData(color: AppColors.textMainLight),
      ),
      cardTheme: CardThemeData(
        color: AppColors.cardLight,
        elevation: 0,
        margin: EdgeInsets.zero,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: AppColors.borderLight),
        ),
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: AppColors.cardLight,
      ),
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: AppColors.cardLight,
        indicatorColor: AppColors.primaryGlow,
        surfaceTintColor: Colors.transparent,
        iconTheme: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return const IconThemeData(color: AppColors.primary, size: 22);
          }
          return const IconThemeData(color: AppColors.textMuted, size: 22);
        }),
        labelTextStyle: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return GoogleFonts.spaceGrotesk(
              fontSize: 11,
              fontWeight: FontWeight.w700,
              color: AppColors.primary,
            );
          }
          return GoogleFonts.spaceGrotesk(
            fontSize: 11,
            color: AppColors.textMuted,
          );
        }),
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          minimumSize: const Size(double.infinity, 52),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
          textStyle: GoogleFonts.spaceGrotesk(
            fontSize: 15,
            fontWeight: FontWeight.w700,
          ),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: AppColors.primary,
          side: const BorderSide(color: AppColors.primary),
          minimumSize: const Size(double.infinity, 52),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
          textStyle: GoogleFonts.spaceGrotesk(
            fontSize: 15,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.bgLight,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: AppColors.borderLight),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: AppColors.borderLight),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: AppColors.primary, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: AppColors.danger),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        labelStyle: GoogleFonts.spaceGrotesk(color: AppColors.textMuted, fontSize: 14),
        hintStyle: GoogleFonts.spaceGrotesk(color: AppColors.textDim, fontSize: 14),
        prefixIconColor: AppColors.textMuted,
        suffixIconColor: AppColors.textMuted,
      ),
      chipTheme: ChipThemeData(
        backgroundColor: AppColors.bgLight,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        side: const BorderSide(color: AppColors.borderLight),
        labelStyle: GoogleFonts.spaceGrotesk(fontSize: 12, fontWeight: FontWeight.w600),
      ),
      dividerTheme: const DividerThemeData(
        color: AppColors.borderLight,
        thickness: 1,
        space: 1,
      ),
      snackBarTheme: SnackBarThemeData(
        backgroundColor: AppColors.cardLight,
        contentTextStyle: GoogleFonts.spaceGrotesk(color: AppColors.textMainLight),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  static ThemeData dark() {
    final base = ThemeData.dark(useMaterial3: true);
    return base.copyWith(
      colorScheme: const ColorScheme.dark(
        primary: AppColors.primary,
        onPrimary: Colors.white,
        secondary: AppColors.primaryDark,
        surface: AppColors.cardDark,
        onSurface: AppColors.textMainDark,
        outline: AppColors.borderDark,
        error: AppColors.danger,
      ),
      scaffoldBackgroundColor: AppColors.bgDark,
      textTheme: _buildTextTheme(base.textTheme).apply(
        bodyColor: AppColors.textMainDark,
        displayColor: AppColors.textMainDark,
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: AppColors.cardDark,
        foregroundColor: AppColors.textMainDark,
        elevation: 0,
        scrolledUnderElevation: 1,
        shadowColor: AppColors.borderDark,
        centerTitle: false,
        titleTextStyle: GoogleFonts.spaceGrotesk(
          fontSize: 18,
          fontWeight: FontWeight.w700,
          color: AppColors.textMainDark,
        ),
        iconTheme: const IconThemeData(color: AppColors.textMainDark),
      ),
      cardTheme: CardThemeData(
        color: AppColors.cardDark,
        elevation: 0,
        margin: EdgeInsets.zero,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: AppColors.borderDark),
        ),
      ),
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: AppColors.cardDark,
        indicatorColor: AppColors.primary.withValues(alpha: 0.15),
        surfaceTintColor: Colors.transparent,
        iconTheme: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return const IconThemeData(color: AppColors.primary, size: 22);
          }
          return const IconThemeData(color: AppColors.textMuted, size: 22);
        }),
        labelTextStyle: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return GoogleFonts.spaceGrotesk(
              fontSize: 11,
              fontWeight: FontWeight.w700,
              color: AppColors.primary,
            );
          }
          return GoogleFonts.spaceGrotesk(
            fontSize: 11,
            color: AppColors.textMuted,
          );
        }),
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          minimumSize: const Size(double.infinity, 52),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
          textStyle: GoogleFonts.spaceGrotesk(
            fontSize: 15,
            fontWeight: FontWeight.w700,
          ),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: AppColors.primary,
          side: const BorderSide(color: AppColors.primary),
          minimumSize: const Size(double.infinity, 52),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
          textStyle: GoogleFonts.spaceGrotesk(
            fontSize: 15,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.hoverDark,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: AppColors.borderDark),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: AppColors.borderDark),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: AppColors.primary, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: AppColors.danger),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        labelStyle: GoogleFonts.spaceGrotesk(color: AppColors.textMuted, fontSize: 14),
        hintStyle: GoogleFonts.spaceGrotesk(color: AppColors.textMuted, fontSize: 14),
        prefixIconColor: AppColors.textMuted,
        suffixIconColor: AppColors.textMuted,
      ),
      chipTheme: ChipThemeData(
        backgroundColor: AppColors.hoverDark,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        side: const BorderSide(color: AppColors.borderDark),
        labelStyle: GoogleFonts.spaceGrotesk(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textMainDark),
      ),
      dividerTheme: const DividerThemeData(
        color: AppColors.borderDark,
        thickness: 1,
        space: 1,
      ),
      snackBarTheme: SnackBarThemeData(
        backgroundColor: AppColors.cardDark,
        contentTextStyle: GoogleFonts.spaceGrotesk(color: AppColors.textMainDark),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }
}
