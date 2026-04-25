import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_theme.dart';
import '../models/report_model.dart';

class StatusStepper extends StatelessWidget {
  final ReportStatus currentStatus;

  const StatusStepper({super.key, required this.currentStatus});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final steps = ReportStatus.values;
    final currentIndex = steps.indexOf(currentStatus);

    return Column(
      children: List.generate(steps.length, (i) {
        final isCompleted = i < currentIndex;
        final isCurrent = i == currentIndex;
        final isLast = i == steps.length - 1;

        return Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Left column: connector + dot
            SizedBox(
              width: 28,
              child: Column(
                children: [
                  // Dot
                  Container(
                    width: 26,
                    height: 26,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: isCompleted
                          ? AppColors.statusCompleted
                          : isCurrent
                              ? AppColors.primary
                              : (isDark ? AppColors.hoverDark : AppColors.bgLight),
                      border: Border.all(
                        color: isCompleted
                            ? AppColors.statusCompleted
                            : isCurrent
                                ? AppColors.primary
                                : (isDark ? AppColors.borderDark : AppColors.borderLight),
                        width: 2,
                      ),
                      boxShadow: isCurrent
                          ? [
                              BoxShadow(
                                color: AppColors.primary.withValues(alpha: 0.35),
                                blurRadius: 8,
                                spreadRadius: 1,
                              ),
                            ]
                          : null,
                    ),
                    child: Icon(
                      isCompleted
                          ? Icons.check_rounded
                          : isCurrent
                              ? Icons.radio_button_checked_rounded
                              : Icons.circle_outlined,
                      size: 14,
                      color: isCompleted
                          ? Colors.white
                          : isCurrent
                              ? Colors.white
                              : (isDark ? AppColors.borderDark : AppColors.borderLight),
                    ),
                  ),
                  // Connector line
                  if (!isLast)
                    Container(
                      width: 2,
                      height: 32,
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                          colors: isCompleted
                              ? [AppColors.statusCompleted, AppColors.statusCompleted]
                              : isCurrent
                                  ? [AppColors.primary, AppColors.primary.withValues(alpha: 0.2)]
                                  : [
                                      isDark ? AppColors.borderDark : AppColors.borderLight,
                                      isDark ? AppColors.borderDark : AppColors.borderLight,
                                    ],
                        ),
                        borderRadius: BorderRadius.circular(1),
                      ),
                    ),
                ],
              ),
            ),
            const SizedBox(width: 12),
            // Right column: label + sublabel
            Expanded(
              child: Padding(
                padding: const EdgeInsets.only(top: 2, bottom: 32),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      statusLabel(steps[i]),
                      style: GoogleFonts.spaceGrotesk(
                        fontSize: 13,
                        fontWeight: isCurrent ? FontWeight.w700 : FontWeight.w500,
                        color: isCompleted
                            ? AppColors.statusCompleted
                            : isCurrent
                                ? AppColors.primary
                                : (isDark ? AppColors.textDim : AppColors.textDim),
                      ),
                    ),
                    if (isCurrent)
                      Padding(
                        padding: const EdgeInsets.only(top: 2),
                        child: Text(
                          'Status saat ini',
                          style: GoogleFonts.spaceGrotesk(
                            fontSize: 10,
                            color: AppColors.primary.withValues(alpha: 0.7),
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    if (isCompleted)
                      Padding(
                        padding: const EdgeInsets.only(top: 2),
                        child: Text(
                          'Selesai',
                          style: GoogleFonts.spaceGrotesk(
                            fontSize: 10,
                            color: AppColors.statusCompleted.withValues(alpha: 0.7),
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                  ],
                ),
              ),
            ),
          ],
        );
      }),
    );
  }
}
