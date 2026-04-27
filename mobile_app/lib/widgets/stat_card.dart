import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_theme.dart';

/// Stat card bergradient — konsisten dengan web admin Dashboard
class StatCard extends StatelessWidget {
  final String label;
  final String value;
  final String? subtitle;
  final IconData icon;
  final Color accentColor;

  const StatCard({
    super.key,
    required this.label,
    required this.value,
    required this.icon,
    required this.accentColor,
    this.subtitle,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardColor = isDark ? AppColors.cardDark : AppColors.cardLight;
    final borderColor = isDark ? AppColors.borderDark : AppColors.borderLight;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: cardColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: borderColor),
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [cardColor, accentColor.withValues(alpha: 0.06)],
        ),
        boxShadow: [
          BoxShadow(
            color: accentColor.withValues(alpha: 0.08),
            blurRadius: 16,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  label.toUpperCase(),
                  style: GoogleFonts.spaceGrotesk(
                    fontSize: 10,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textMuted,
                    letterSpacing: 0.8,
                  ),
                ),
              ),
              Container(
                width: 38,
                height: 38,
                decoration: BoxDecoration(
                  color: accentColor.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: accentColor.withValues(alpha: 0.25)),
                ),
                child: Icon(icon, size: 18, color: accentColor),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            value,
            style: GoogleFonts.spaceGrotesk(
              fontSize: 28,
              fontWeight: FontWeight.w800,
              color: isDark ? AppColors.textMainDark : AppColors.textMainLight,
              height: 1,
            ),
          ),
          if (subtitle != null) ...[
            const SizedBox(height: 4),
            Text(
              subtitle!,
              style: GoogleFonts.spaceGrotesk(
                fontSize: 11,
                color: AppColors.textMuted,
              ),
            ),
          ],
          const SizedBox(height: 8),
          Container(
            height: 2,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(2),
              gradient: LinearGradient(
                colors: [accentColor, accentColor.withValues(alpha: 0.0)],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
