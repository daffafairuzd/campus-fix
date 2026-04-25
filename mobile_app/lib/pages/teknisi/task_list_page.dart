import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../models/user_model.dart';
import '../../models/report_model.dart';
import '../../services/mock_api_service.dart';
import '../../theme/app_theme.dart';
import '../../widgets/report_card.dart';
import '../../widgets/campus_fix_logo.dart';
import '../../widgets/theme_toggle_button.dart';
import 'report_detail_teknisi.dart';

class TaskListPage extends StatefulWidget {
  final UserSession session;
  const TaskListPage({super.key, required this.session});

  @override
  State<TaskListPage> createState() => _TaskListPageState();
}

class _TaskListPageState extends State<TaskListPage> {
  List<FacilityReport> _tasks = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadTasks();
  }

  Future<void> _loadTasks() async {
    setState(() => _isLoading = true);
    final data = await api.getTeknisiTasks();
    if (mounted) setState(() { _tasks = data; _isLoading = false; });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: RefreshIndicator(
        onRefresh: _loadTasks,
        color: AppColors.primary,
        child: CustomScrollView(
          slivers: [
            SliverAppBar(
              expandedHeight: 140,
              pinned: true,
              floating: false,
              automaticallyImplyLeading: false,
              flexibleSpace: FlexibleSpaceBar(
                background: Container(
                  decoration: const BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: [Color(0xFF1C1917), Color(0xFF292524), AppColors.primaryDark],
                    ),
                  ),
                  child: SafeArea(
                    child: Padding(
                      padding: const EdgeInsets.fromLTRB(20, 10, 20, 0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const CampusFixLogoLight(iconSize: 30, fontSize: 18),
                              Row(children: [
                                const ThemeToggleButton(),
                                const SizedBox(width: 8),
                              ]),
                            ],
                          ),
                          const SizedBox(height: 14),
                          Text(
                            'Daftar Tugas — ${widget.session.name.split(' ').first}',
                            style: GoogleFonts.spaceGrotesk(
                              color: Colors.white, fontSize: 17, fontWeight: FontWeight.w800,
                            ),
                          ),
                          Text(
                            'Diurutkan berdasarkan Prioritas AI',
                            style: GoogleFonts.spaceGrotesk(
                              color: Colors.white60, fontSize: 11,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
              title: const CampusFixLogoLight(iconSize: 22, fontSize: 15),
              actions: const [ThemeToggleButton(), SizedBox(width: 12)],
            ),

            _isLoading
                ? const SliverFillRemaining(
                    child: Center(child: CircularProgressIndicator(color: AppColors.primary)),
                  )
                : _tasks.isEmpty
                    ? const SliverFillRemaining(
                        child: Center(
                          child: Text('Tidak ada tugas aktif',
                              style: TextStyle(color: AppColors.textMuted)),
                        ),
                      )
                    : SliverPadding(
                        padding: const EdgeInsets.all(16),
                        sliver: SliverList(
                          delegate: SliverChildBuilderDelegate(
                            (context, i) {
                              if (i == 0) {
                                return Padding(
                                  padding: const EdgeInsets.only(bottom: 12),
                                  child: _PriorityLegend(),
                                );
                              }
                              final task = _tasks[i - 1];
                              return ReportCard(
                                report: task,
                                showPriority: true,
                                onTap: () async {
                                  await Navigator.push(
                                    context,
                                    MaterialPageRoute(
                                      builder: (_) => ReportDetailTeknisi(
                                          report: task, session: widget.session),
                                    ),
                                  );
                                  _loadTasks();
                                },
                              );
                            },
                            childCount: _tasks.length + 1,
                          ),
                        ),
                      ),
          ],
        ),
      ),
    );
  }
}

class _PriorityLegend extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: isDark ? AppColors.hoverDark : AppColors.bgLight,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
            color: isDark ? AppColors.borderDark : AppColors.borderLight),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: [
          _LegendItem('Tinggi', AppColors.priorityHigh, Icons.keyboard_double_arrow_up_rounded),
          _LegendDivider(),
          _LegendItem('Sedang', AppColors.priorityMedium, Icons.remove_rounded),
          _LegendDivider(),
          _LegendItem('Rendah', AppColors.priorityLow, Icons.keyboard_double_arrow_down_rounded),
        ],
      ),
    );
  }
}

class _LegendItem extends StatelessWidget {
  final String label;
  final Color color;
  final IconData icon;
  const _LegendItem(this.label, this.color, this.icon);

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 13, color: color),
        const SizedBox(width: 4),
        Text(label, style: GoogleFonts.spaceGrotesk(fontSize: 11, fontWeight: FontWeight.w600, color: color)),
      ],
    );
  }
}

class _LegendDivider extends StatelessWidget {
  @override
  Widget build(BuildContext context) =>
      Container(width: 1, height: 16, color: AppColors.textDim.withValues(alpha: 0.3));
}
