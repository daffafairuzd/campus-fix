import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_theme.dart';
import '../models/report_model.dart';

class StatusStepper extends StatelessWidget {
  final ReportStatus currentStatus;
  final FacilityReport? report;

  const StatusStepper({super.key, required this.currentStatus, this.report});

  // Urutan status sesuai alur backend
  static const List<ReportStatus> _steps = [
    ReportStatus.menunggu,
    ReportStatus.ditugaskan,
    ReportStatus.assessment,
    ReportStatus.dalamProses,
    ReportStatus.selesai,
  ];

  static const List<ReportStatus> _stepsEskalasi = [
    ReportStatus.menunggu,
    ReportStatus.ditugaskan,
    ReportStatus.assessment,
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
        final statusTime = _getStatusTime(steps[i]);
        String? extraDesc;
        if (steps[i] == ReportStatus.ditugaskan) {
          String? techName = report?.assignedTechnician;
          if ((techName == null || techName.isEmpty) && report != null) {
            for (final h in report!.histories) {
              final titleLower = h.title.toLowerCase();
              if (titleLower.contains('teknisi ditugaskan:')) {
                final idx = titleLower.indexOf('teknisi ditugaskan:');
                var extracted = h.title.substring(idx + 'teknisi ditugaskan:'.length).trim();
                if (extracted.toLowerCase().contains('(override kapasitas)')) {
                  extracted = extracted.replaceAll(RegExp(r'\s*\(override kapasitas\)', caseSensitive: false), '').trim();
                }
                if (extracted.isNotEmpty) {
                  techName = extracted;
                  break;
                }
              }
            }
          }
          if (techName != null && techName.isNotEmpty) {
            extraDesc = 'Ditugaskan ke $techName';
          }
        }

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
                        color: isCompleted
                            ? completedColor
                            : isCurrent
                                ? activeColor
                                : (isDark
                                    ? AppColors.borderDark
                                    : AppColors.borderLight),
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
                    if (statusTime != null)
                      Padding(
                        padding: const EdgeInsets.only(top: 2),
                        child: Text(
                          extraDesc != null ? '$statusTime · $extraDesc' : statusTime,
                          style: GoogleFonts.spaceGrotesk(
                            fontSize: 10,
                            color: (isCurrent ? activeColor : completedColor).withValues(alpha: 0.7),
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      )
                    else if (isCurrent)
                      Padding(
                        padding: const EdgeInsets.only(top: 2),
                        child: Text(
                          extraDesc ?? 'Status saat ini',
                          style: GoogleFonts.spaceGrotesk(
                            fontSize: 10,
                            color: activeColor.withValues(alpha: 0.7),
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      )
                    else if (extraDesc != null)
                      Padding(
                        padding: const EdgeInsets.only(top: 2),
                        child: Text(
                          extraDesc,
                          style: GoogleFonts.spaceGrotesk(
                            fontSize: 10,
                            color: completedColor.withValues(alpha: 0.7),
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      )
                    else if (isCompleted)
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

  String? _getStatusTime(ReportStatus status) {
    if (report == null) return null;
    
    String keyword;
    switch (status) {
      case ReportStatus.menunggu:
        keyword = 'buat';
        break;
      case ReportStatus.ditugaskan:
        keyword = 'ditugaskan';
        break;
      case ReportStatus.assessment:
        keyword = 'assessment';
        break;
      case ReportStatus.dalamProses:
        keyword = 'dalam_proses';
        break;
      case ReportStatus.selesai:
        keyword = 'selesai';
        break;
      case ReportStatus.eskalasi:
        keyword = 'eskalasi';
        break;
    }

    for (final h in report!.histories.reversed) {
      final title = h.title.toLowerCase();
      if (title.contains(keyword) || (keyword == 'dalam_proses' && title.contains('dalam proses'))) {
        try {
          final dt = DateTime.parse(h.createdAt).toLocal();
          final hour = dt.hour.toString().padLeft(2, '0');
          final minute = dt.minute.toString().padLeft(2, '0');
          final second = dt.second.toString().padLeft(2, '0');
          return '${dt.day}/${dt.month}/${dt.year}, $hour.$minute.$second';
        } catch (_) {
          return h.createdAt;
        }
      }
    }
    return null;
  }
}
