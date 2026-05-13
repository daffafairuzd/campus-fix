import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_theme.dart';
import '../models/report_model.dart';

class StatusStepper extends StatelessWidget {
  final ReportStatus currentStatus;

  const StatusStepper({super.key, required this.currentStatus});

  // Urutan status sesuai alur backend
  static const List<ReportStatus> _steps = [
    ReportStatus.menunggu,
    ReportStatus.dalamProses,
    ReportStatus.selesai,
  ];

  static const List<ReportStatus> _stepsEskalasi = [
    ReportStatus.menunggu,
    ReportStatus.dalamProses,
    ReportStatus.eskalasi,
  ];

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    // Gunakan alur eskalasi jika status saat ini eskalasi
    final steps = currentStatus == ReportStatus.eskalasi
        ? _stepsEskalasi
        : _steps;
    final currentIndex = steps.indexOf(currentStatus);

    return Column(
      children: List.generate(steps.length, (i) {
        final isCompleted = i < currentIndex;
        final isCurrent = i == currentIndex;
        final isLast = i == steps.length - 1;
        final isEskalasi = steps[i] == ReportStatus.eskalasi;

        final activeColor = isEskalasi ? AppColors.danger : AppColors.primary;
        final completedColor =
            isEskalasi ? AppColors.danger : AppColors.statusCompleted;

        return Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Left: dot + connector
            SizedBox(
              width: 28,
              child: Column(
                children: [
                  Container(
                    width: 26,
                    height: 26,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: isCompleted
                          ? completedColor
                          : isCurrent
                              ? activeColor
                              : (isDark
                                  ? AppColors.hoverDark
                                  : AppColors.bgLight),
                      border: Border.all(
                        color: isCompleted
                            ? completedColor
                            : isCurrent
                                ? activeColor
                                : (isDark
                                    ? AppColors.borderDark
                                    : AppColors.borderLight),
                        width: 2,
                      ),
                      boxShadow: isCurrent
                          ? [
                              BoxShadow(
                                color: activeColor.withValues(alpha: 0.35),
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
                              ? (isEskalasi
                                  ? Icons.warning_amber_rounded
                                  : Icons.radio_button_checked_rounded)
                              : Icons.circle_outlined,
                      size: 14,
                      color: isCompleted
                          ? Colors.white
                          : isCurrent
                              ? Colors.white
                              : (isDark
                                  ? AppColors.borderDark
                                  : AppColors.borderLight),
                    ),
                  ),
                  if (!isLast)
                    Container(
                      width: 2,
                      height: 32,
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                          colors: isCompleted
                              ? [completedColor, completedColor]
                              : isCurrent
                                  ? [
                                      activeColor,
                                      activeColor.withValues(alpha: 0.2)
                                    ]
                                  : [
                                      isDark
                                          ? AppColors.borderDark
                                          : AppColors.borderLight,
                                      isDark
                                          ? AppColors.borderDark
                                          : AppColors.borderLight,
                                    ],
                        ),
                        borderRadius: BorderRadius.circular(1),
                      ),
                    ),
                ],
              ),
            ),
            const SizedBox(width: 12),
            // Right: label
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
                        fontWeight:
                            isCurrent ? FontWeight.w700 : FontWeight.w500,
                        color: isCompleted
                            ? completedColor
                            : isCurrent
                                ? activeColor
                                : (isDark
                                    ? AppColors.textDim
                                    : AppColors.textDim),
                      ),
                    ),
                    if (isCurrent)
                      Padding(
                        padding: const EdgeInsets.only(top: 2),
                        child: Text(
                          'Status saat ini',
                          style: GoogleFonts.spaceGrotesk(
                            fontSize: 10,
                            color: activeColor.withValues(alpha: 0.7),
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
                            color: completedColor.withValues(alpha: 0.7),
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
