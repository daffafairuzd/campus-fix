import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_theme.dart';

/// Logo konsisten dengan web admin — ikon graduation cap + "Campus" + "Fix" merah
class CampusFixLogo extends StatelessWidget {
  final double iconSize;
  final double fontSize;
  final Color? iconColor;

  const CampusFixLogo({
    super.key,
    this.iconSize = 32,
    this.fontSize = 22,
    this.iconColor,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final textColor = isDark ? AppColors.textMainDark : AppColors.textMainLight;

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: iconSize,
          height: iconSize,
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [AppColors.primary, AppColors.primaryDark],
            ),
            borderRadius: BorderRadius.circular(iconSize * 0.28),
            boxShadow: [
              BoxShadow(
                color: AppColors.primary.withValues(alpha: 0.35),
                blurRadius: 12,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Icon(
            Icons.school_rounded,
            color: iconColor ?? Colors.white,
            size: iconSize * 0.6,
          ),
        ),
        const SizedBox(width: 10),
        RichText(
          text: TextSpan(
            children: [
              TextSpan(
                text: 'Campus',
                style: GoogleFonts.spaceGrotesk(
                  fontSize: fontSize,
                  fontWeight: FontWeight.w700,
                  color: textColor,
                ),
              ),
              TextSpan(
                text: 'Fix',
                style: GoogleFonts.spaceGrotesk(
                  fontSize: fontSize,
                  fontWeight: FontWeight.w700,
                  color: AppColors.primary,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

/// Logo versi putih untuk dipakai di atas background merah/gelap
class CampusFixLogoLight extends StatelessWidget {
  final double iconSize;
  final double fontSize;

  const CampusFixLogoLight({
    super.key,
    this.iconSize = 36,
    this.fontSize = 24,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: iconSize,
          height: iconSize,
          decoration: BoxDecoration(
            color: Colors.white.withValues(alpha: 0.18),
            borderRadius: BorderRadius.circular(iconSize * 0.28),
            border: Border.all(
              color: Colors.white.withValues(alpha: 0.35),
              width: 1.5,
            ),
          ),
          child: Icon(
            Icons.school_rounded,
            color: Colors.white,
            size: iconSize * 0.58,
          ),
        ),
        const SizedBox(width: 10),
        RichText(
          text: TextSpan(
            children: [
              TextSpan(
                text: 'Campus',
                style: GoogleFonts.spaceGrotesk(
                  fontSize: fontSize,
                  fontWeight: FontWeight.w700,
                  color: Colors.white,
                ),
              ),
              TextSpan(
                text: 'Fix',
                style: GoogleFonts.spaceGrotesk(
                  fontSize: fontSize,
                  fontWeight: FontWeight.w700,
                  color: Colors.white.withValues(alpha: 0.75),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
