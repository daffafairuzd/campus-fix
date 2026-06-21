import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../models/user_model.dart';
import '../../models/report_model.dart';
import '../../services/api_service.dart';
import '../../theme/app_theme.dart';
import 'report_detail_teknisi.dart';

class PerformancePage extends StatefulWidget {
  final UserSession session;
  const PerformancePage({super.key, required this.session});

  @override
  State<PerformancePage> createState() => _PerformancePageState();
}

class _PerformancePageState extends State<PerformancePage> {
  List<FacilityReport> _history = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    final all = await api.getMyReports();
    final done = all.where((r) => r.status == ReportStatus.selesai).toList();
    if (mounted) {
      setState(() {
        _history = done;
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        automaticallyImplyLeading: false,
        title: Text('Riwayat Penyelesaian',
            style: GoogleFonts.spaceGrotesk(fontSize: 18, fontWeight: FontWeight.w800)),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
          : RefreshIndicator(
              onRefresh: _loadData,
              color: AppColors.primary,
              child: ListView(
                padding: const EdgeInsets.all(20),
                children: [
                  if (_history.isEmpty)
                    Center(
                      child: Padding(
                        padding: const EdgeInsets.all(24),
                        child: Text('Belum ada riwayat',
                            style: GoogleFonts.spaceGrotesk(
                                fontSize: 13, color: AppColors.textMuted)),
                      ),
                    )
                  else
                    ..._history.map((r) => _HistoryCard(
                          report: r,
                          isDark: isDark,
                          onTap: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => ReportDetailTeknisi(
                                  report: r,
                                  session: widget.session,
                                ),
                              ),
                            ).then((_) => _loadData());
                          },
                        )),
                ],
              ),
            ),
    );
  }
}

class _HistoryCard extends StatelessWidget {
  final FacilityReport report;
  final bool isDark;
  final VoidCallback onTap;
  
  const _HistoryCard({
    required this.report,
    required this.isDark,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: isDark ? AppColors.cardDark : AppColors.cardLight,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: isDark ? AppColors.borderDark : AppColors.borderLight),
          boxShadow: [
            if (!isDark)
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.03),
                blurRadius: 8,
                offset: const Offset(0, 3),
              )
          ],
        ),
        child: Row(
          children: [
            Container(
              width: 40, height: 40,
              decoration: BoxDecoration(
                color: AppColors.statusCompleted.withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(Icons.task_alt_rounded,
                  size: 20, color: AppColors.statusCompleted),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(report.title,
                      style: GoogleFonts.spaceGrotesk(
                          fontSize: 13, fontWeight: FontWeight.w700),
                      maxLines: 1, overflow: TextOverflow.ellipsis),
                  const SizedBox(height: 3),
                  Text('${report.category} • ${report.completedAt ?? '-'}',
                      style: GoogleFonts.spaceGrotesk(
                          fontSize: 11, color: AppColors.textMuted)),
                ],
              ),
            ),
            if (report.rating != null)
              Row(
                children: [
                  const Icon(Icons.star_rounded, size: 14, color: Colors.amber),
                  const SizedBox(width: 3),
                  Text('${report.rating}',
                      style: GoogleFonts.spaceGrotesk(
                          fontSize: 12, fontWeight: FontWeight.w700)),
                ],
              ),
          ],
        ),
      ),
    );
  }
}
