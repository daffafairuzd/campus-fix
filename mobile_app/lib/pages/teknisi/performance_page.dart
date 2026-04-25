import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:fl_chart/fl_chart.dart';
import '../../models/user_model.dart';
import '../../models/report_model.dart';
import '../../services/mock_api_service.dart';
import '../../theme/app_theme.dart';
import '../../widgets/stat_card.dart';

class PerformancePage extends StatefulWidget {
  final UserSession session;
  const PerformancePage({super.key, required this.session});

  @override
  State<PerformancePage> createState() => _PerformancePageState();
}

class _PerformancePageState extends State<PerformancePage> {
  TechnicianPerformance? _perf;
  List<FacilityReport> _history = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    final perf = await api.getPerformance();
    final all = await api.getAllReports();
    final done = all.where((r) => r.status == ReportStatus.completed).toList();
    if (mounted) {
      setState(() {
        _perf = perf;
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
        title: Text('Kinerja Individu',
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
                  // Stat cards
                  Row(
                    children: [
                      Expanded(
                        child: StatCard(
                          label: 'Selesai',
                          value: '${_perf!.completedTasks}',
                          subtitle: 'Total tugas',
                          icon: Icons.task_alt_rounded,
                          accentColor: AppColors.statusCompleted,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: StatCard(
                          label: 'Rating',
                          value: '${_perf!.rating}',
                          subtitle: 'Dari pelapor',
                          icon: Icons.star_rounded,
                          accentColor: Colors.amber,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: StatCard(
                          label: 'Avg. Waktu',
                          value: _perf!.avgResolutionTime,
                          subtitle: 'Per laporan',
                          icon: Icons.timer_rounded,
                          accentColor: AppColors.info,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: StatCard(
                          label: 'Tepat Waktu',
                          value: '${_perf!.onTimeCount}/${_perf!.onTimeCount + _perf!.lateCount}',
                          subtitle: 'SLA compliance',
                          icon: Icons.verified_rounded,
                          accentColor: AppColors.statusCompleted,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),

                  // Bar chart
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: isDark ? AppColors.cardDark : AppColors.cardLight,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                          color: isDark ? AppColors.borderDark : AppColors.borderLight),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Penyelesaian Minggu Ini',
                            style: GoogleFonts.spaceGrotesk(
                                fontSize: 14, fontWeight: FontWeight.w700)),
                        Text('7 hari terakhir',
                            style: GoogleFonts.spaceGrotesk(
                                fontSize: 11, color: AppColors.textMuted)),
                        const SizedBox(height: 16),
                        SizedBox(
                          height: 160,
                          child: BarChart(
                            BarChartData(
                              maxY: 10,
                              alignment: BarChartAlignment.spaceAround,
                              barGroups: _perf!.weeklyData.asMap().entries.map((e) {
                                final val = (e.value['selesai'] as int).toDouble();
                                return BarChartGroupData(
                                  x: e.key,
                                  barRods: [
                                    BarChartRodData(
                                      toY: val,
                                      color: AppColors.primary,
                                      width: 22,
                                      borderRadius: const BorderRadius.vertical(
                                          top: Radius.circular(6)),
                                      backDrawRodData: BackgroundBarChartRodData(
                                        show: true,
                                        toY: 10,
                                        color: AppColors.primary.withValues(alpha: 0.08),
                                      ),
                                    ),
                                  ],
                                );
                              }).toList(),
                              titlesData: FlTitlesData(
                                leftTitles: const AxisTitles(
                                    sideTitles: SideTitles(showTitles: false)),
                                rightTitles: const AxisTitles(
                                    sideTitles: SideTitles(showTitles: false)),
                                topTitles: const AxisTitles(
                                    sideTitles: SideTitles(showTitles: false)),
                                bottomTitles: AxisTitles(
                                  sideTitles: SideTitles(
                                    showTitles: true,
                                    reservedSize: 28,
                                    getTitlesWidget: (val, meta) {
                                      final days = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
                                      final i = val.toInt();
                                      if (i < 0 || i >= days.length) return const SizedBox();
                                      return Text(days[i],
                                          style: GoogleFonts.spaceGrotesk(
                                              fontSize: 10, color: AppColors.textMuted));
                                    },
                                  ),
                                ),
                              ),
                              gridData: const FlGridData(show: false),
                              borderData: FlBorderData(show: false),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),

                  // SLA compliance bar
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: isDark ? AppColors.cardDark : AppColors.cardLight,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                          color: isDark ? AppColors.borderDark : AppColors.borderLight),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('SLA Compliance',
                            style: GoogleFonts.spaceGrotesk(
                                fontSize: 14, fontWeight: FontWeight.w700)),
                        const SizedBox(height: 12),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text('Tepat Waktu',
                                style: GoogleFonts.spaceGrotesk(
                                    fontSize: 12, color: AppColors.textMuted)),
                            Text(
                              '${((_perf!.onTimeCount / (_perf!.onTimeCount + _perf!.lateCount)) * 100).toStringAsFixed(0)}%',
                              style: GoogleFonts.spaceGrotesk(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w700,
                                  color: AppColors.statusCompleted),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        ClipRRect(
                          borderRadius: BorderRadius.circular(4),
                          child: LinearProgressIndicator(
                            value: _perf!.onTimeCount /
                                (_perf!.onTimeCount + _perf!.lateCount),
                            minHeight: 10,
                            backgroundColor:
                                isDark ? AppColors.borderDark : AppColors.borderLight,
                            valueColor: const AlwaysStoppedAnimation(AppColors.statusCompleted),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Recent completed
                  Text('Riwayat Penyelesaian',
                      style: GoogleFonts.spaceGrotesk(
                          fontSize: 16, fontWeight: FontWeight.w800)),
                  const SizedBox(height: 12),
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
                    ..._history.map((r) => _HistoryCard(report: r, isDark: isDark)),
                ],
              ),
            ),
    );
  }
}

class _HistoryCard extends StatelessWidget {
  final FacilityReport report;
  final bool isDark;
  const _HistoryCard({required this.report, required this.isDark});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: isDark ? AppColors.cardDark : AppColors.cardLight,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: isDark ? AppColors.borderDark : AppColors.borderLight),
      ),
      child: Row(
        children: [
          Container(
            width: 40, height: 40,
            decoration: BoxDecoration(
              color: AppColors.statusCompleted.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(10),
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
    );
  }
}
