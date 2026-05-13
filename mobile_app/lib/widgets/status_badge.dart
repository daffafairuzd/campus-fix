import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_theme.dart';
import '../models/report_model.dart';

class StatusBadge extends StatelessWidget {
  final ReportStatus status;
  final bool compact;

  const StatusBadge({super.key, required this.status, this.compact = false});

  @override
  Widget build(BuildContext context) {
    final (label, color, _) = _resolve(status);

    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: compact ? 8 : 10,
        vertical: compact ? 3 : 5,
      ),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color.withValues(alpha: 0.35)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 6,
            height: 6,
            decoration: BoxDecoration(color: color, shape: BoxShape.circle),
          ),
          const SizedBox(width: 5),
          Text(
            label,
            style: GoogleFonts.spaceGrotesk(
              fontSize: compact ? 10 : 11,
              fontWeight: FontWeight.w700,
              color: color,
              letterSpacing: 0.3,
            ),
          ),
        ],
      ),
    );
  }

  static (String, Color, IconData) _resolve(ReportStatus s) {
    switch (s) {
      case ReportStatus.menunggu:
        return ('Menunggu', AppColors.statusSubmitted, Icons.hourglass_top_rounded);
      case ReportStatus.dalamProses:
        return ('Dalam Proses', AppColors.statusInProgress, Icons.build_outlined);
      case ReportStatus.selesai:
        return ('Selesai', AppColors.statusCompleted, Icons.task_alt);
      case ReportStatus.eskalasi:
        return ('Eskalasi', AppColors.danger, Icons.warning_amber_rounded);
    }
  }
}

class PriorityBadge extends StatelessWidget {
  final String priority;
  final bool compact;

  const PriorityBadge({super.key, required this.priority, this.compact = false});

  @override
  Widget build(BuildContext context) {
    final (color, icon) = _resolve(priority);

    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: compact ? 7 : 9,
        vertical: compact ? 3 : 5,
      ),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color.withValues(alpha: 0.35)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: compact ? 10 : 11, color: color),
          const SizedBox(width: 4),
          Text(
            _label(priority),
            style: GoogleFonts.spaceGrotesk(
              fontSize: compact ? 10 : 11,
              fontWeight: FontWeight.w700,
              color: color,
              letterSpacing: 0.3,
            ),
          ),
        ],
      ),
    );
  }

  static String _label(String p) {
    switch (p.toLowerCase()) {
      case 'kritis':
        return 'Kritis';
      case 'tinggi':
        return 'Tinggi';
      case 'sedang':
        return 'Sedang';
      default:
        return 'Rendah';
    }
  }

  static (Color, IconData) _resolve(String p) {
    switch (p.toLowerCase()) {
      case 'kritis':
        return (AppColors.danger, Icons.priority_high_rounded);
      case 'tinggi':
        return (AppColors.priorityHigh, Icons.keyboard_double_arrow_up_rounded);
      case 'sedang':
        return (AppColors.priorityMedium, Icons.remove_rounded);
      default:
        return (AppColors.priorityLow, Icons.keyboard_double_arrow_down_rounded);
    }
  }
}
