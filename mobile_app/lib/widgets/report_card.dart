import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_theme.dart';
import '../models/report_model.dart';
import 'status_badge.dart';

class ReportCard extends StatelessWidget {
  final FacilityReport report;
  final VoidCallback onTap;
  final bool showPriority;

  const ReportCard({
    super.key,
    required this.report,
    required this.onTap,
    this.showPriority = false,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardColor = isDark ? AppColors.cardDark : AppColors.cardLight;
    final borderColor = isDark ? AppColors.borderDark : AppColors.borderLight;
    final textMain = isDark ? AppColors.textMainDark : AppColors.textMainLight;

    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        decoration: BoxDecoration(
          color: cardColor,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: borderColor),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.04),
              blurRadius: 12,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.all(14),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Priority Score Avatar
                  Container(
                    width: 46,
                    height: 46,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(12),
                      gradient: LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: _scoreColors(report.priorityScore),
                      ),
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          report.priorityScore.toString(),
                          style: GoogleFonts.spaceGrotesk(
                            fontSize: 16,
                            fontWeight: FontWeight.w800,
                            color: Colors.white,
                            height: 1,
                          ),
                        ),
                        Text(
                          'skor',
                          style: GoogleFonts.spaceGrotesk(
                            fontSize: 8,
                            color: Colors.white.withValues(alpha: 0.8),
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 12),
                  // Content
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Expanded(
                              child: Text(
                                report.title,
                                style: GoogleFonts.spaceGrotesk(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w700,
                                  color: textMain,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 5),
                        Row(
                          children: [
                            Icon(Icons.location_on_outlined,
                                size: 12, color: AppColors.textMuted),
                            const SizedBox(width: 3),
                            Expanded(
                              child: Text(
                                report.location,
                                style: GoogleFonts.spaceGrotesk(
                                  fontSize: 11,
                                  color: AppColors.textMuted,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            _CategoryChip(report.category),
                            const SizedBox(width: 6),
                            StatusBadge(status: report.status, compact: true),
                            if (showPriority) ...[
                              const SizedBox(width: 6),
                              PriorityBadge(priority: report.priority, compact: true),
                            ],
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  Icon(Icons.chevron_right_rounded,
                      color: AppColors.textDim, size: 20),
                ],
              ),
            ),
            // Bottom bar: date + report number
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              decoration: BoxDecoration(
                color: isDark
                    ? AppColors.hoverDark
                    : AppColors.bgLight,
                borderRadius: const BorderRadius.only(
                  bottomLeft: Radius.circular(16),
                  bottomRight: Radius.circular(16),
                ),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    report.reportNumber,
                    style: GoogleFonts.spaceGrotesk(
                      fontSize: 10,
                      fontWeight: FontWeight.w600,
                      color: AppColors.primary,
                      letterSpacing: 0.5,
                    ),
                  ),
                  Row(
                    children: [
                      Icon(Icons.calendar_today_outlined,
                          size: 10, color: AppColors.textDim),
                      const SizedBox(width: 4),
                      Text(
                        report.createdAt,
                        style: GoogleFonts.spaceGrotesk(
                          fontSize: 10,
                          color: AppColors.textDim,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  List<Color> _scoreColors(int score) {
    if (score >= 80) {
      return [const Color(0xFFEF4444), const Color(0xFFDC2626)];
    } else if (score >= 50) {
      return [const Color(0xFFF59E0B), const Color(0xFFD97706)];
    }
    return [const Color(0xFF10B981), const Color(0xFF059669)];
  }
}

class _CategoryChip extends StatelessWidget {
  final String category;
  const _CategoryChip(this.category);

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: isDark ? AppColors.hoverDark : AppColors.bgLight,
        borderRadius: BorderRadius.circular(6),
        border: Border.all(
          color: isDark ? AppColors.borderDark : AppColors.borderLight,
        ),
      ),
      child: Text(
        category,
        style: GoogleFonts.spaceGrotesk(
          fontSize: 10,
          fontWeight: FontWeight.w600,
          color: AppColors.textMuted,
        ),
      ),
    );
  }
}
