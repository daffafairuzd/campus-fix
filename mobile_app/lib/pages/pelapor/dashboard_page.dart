import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../models/user_model.dart';
import '../../models/report_model.dart';
import '../../services/mock_api_service.dart';
import '../../theme/app_theme.dart';
import '../../widgets/stat_card.dart';
import '../../widgets/report_card.dart';
import '../../widgets/campus_fix_logo.dart';
import '../../widgets/theme_toggle_button.dart';
import '../shared/notification_page.dart';
import 'report_detail_pelapor.dart';

class DashboardPage extends StatefulWidget {
  final UserSession session;
  const DashboardPage({super.key, required this.session});

  @override
  State<DashboardPage> createState() => _DashboardPageState();
}

class _DashboardPageState extends State<DashboardPage> {
  List<FacilityReport> _reports = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    final data = await api.getMyReports(widget.session.ssoId);
    if (mounted) setState(() { _reports = data; _isLoading = false; });
  }

  int get _activeCount => _reports.where((r) => r.status != ReportStatus.completed).length;
  int get _completedCount => _reports.where((r) => r.status == ReportStatus.completed).length;
  int get _pendingCount => _reports.where((r) => r.status == ReportStatus.submitted).length;

  @override
  Widget build(BuildContext context) {
    final recent = _reports.take(3).toList();

    return Scaffold(
      body: RefreshIndicator(
        onRefresh: _loadData,
        color: AppColors.primary,
        child: CustomScrollView(
          slivers: [
            // App bar
            SliverAppBar(
              expandedHeight: 160,
              floating: false,
              pinned: true,
              automaticallyImplyLeading: false,
              flexibleSpace: FlexibleSpaceBar(
                background: Container(
                  decoration: const BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: [Color(0xFF7F1D1D), AppColors.primary],
                    ),
                  ),
                  child: SafeArea(
                    child: Padding(
                      padding: const EdgeInsets.fromLTRB(20, 12, 20, 0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const CampusFixLogoLight(iconSize: 30, fontSize: 18),
                              Row(
                                children: [
                                  const ThemeToggleButton(),
                                  const SizedBox(width: 8),
                                  GestureDetector(
                                    onTap: () => Navigator.push(
                                      context,
                                      MaterialPageRoute(
                                        builder: (_) => NotificationPage(session: widget.session),
                                      ),
                                    ),
                                    child: Stack(
                                      children: [
                                        Container(
                                          padding: const EdgeInsets.all(7),
                                          decoration: BoxDecoration(
                                            color: Colors.white.withValues(alpha: 0.15),
                                            borderRadius: BorderRadius.circular(10),
                                          ),
                                          child: const Icon(Icons.notifications_outlined, color: Colors.white, size: 20),
                                        ),
                                        if (api.unreadCount > 0)
                                          Positioned(
                                            top: 0, right: 0,
                                            child: Container(
                                              width: 8, height: 8,
                                              decoration: const BoxDecoration(
                                                color: Colors.amber, shape: BoxShape.circle,
                                              ),
                                            ),
                                          ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                          const SizedBox(height: 14),
                          Text(
                            'Halo, ${widget.session.name.split(' ').first}! 👋',
                            style: GoogleFonts.spaceGrotesk(
                              color: Colors.white,
                              fontSize: 20,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                          Text(
                            widget.session.email,
                            style: GoogleFonts.spaceGrotesk(
                              color: Colors.white.withValues(alpha: 0.7),
                              fontSize: 12,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
              title: const CampusFixLogoLight(iconSize: 24, fontSize: 16),
              actions: [
                const ThemeToggleButton(),
                const SizedBox(width: 12),
              ],
            ),

            SliverToBoxAdapter(
              child: _isLoading
                  ? const Center(
                      child: Padding(
                        padding: EdgeInsets.all(60),
                        child: CircularProgressIndicator(color: AppColors.primary),
                      ),
                    )
                  : Padding(
                      padding: const EdgeInsets.all(20),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Stats row
                          Row(
                            children: [
                              Expanded(
                                child: StatCard(
                                  label: 'Aktif',
                                  value: _activeCount.toString(),
                                  subtitle: 'Dalam proses',
                                  icon: Icons.pending_actions_rounded,
                                  accentColor: AppColors.statusInProgress,
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: StatCard(
                                  label: 'Selesai',
                                  value: _completedCount.toString(),
                                  subtitle: 'Berhasil',
                                  icon: Icons.task_alt_rounded,
                                  accentColor: AppColors.statusCompleted,
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: StatCard(
                                  label: 'Menunggu',
                                  value: _pendingCount.toString(),
                                  subtitle: 'Antri Admin',
                                  icon: Icons.hourglass_top_rounded,
                                  accentColor: AppColors.statusAccepted,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 24),

                          // Quick Action banner
                          Container(
                            padding: const EdgeInsets.all(18),
                            decoration: BoxDecoration(
                              gradient: LinearGradient(
                                colors: [
                                  AppColors.primary,
                                  AppColors.primary.withValues(alpha: 0.7),
                                ],
                              ),
                              borderRadius: BorderRadius.circular(16),
                              boxShadow: [
                                BoxShadow(
                                  color: AppColors.primary.withValues(alpha: 0.3),
                                  blurRadius: 16,
                                  offset: const Offset(0, 6),
                                ),
                              ],
                            ),
                            child: Row(
                              children: [
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        'Ada yang rusak?',
                                        style: GoogleFonts.spaceGrotesk(
                                          color: Colors.white,
                                          fontSize: 16,
                                          fontWeight: FontWeight.w800,
                                        ),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        'Laporkan sekarang, kami akan tangani segera.',
                                        style: GoogleFonts.spaceGrotesk(
                                          color: Colors.white.withValues(alpha: 0.8),
                                          fontSize: 12,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Icon(
                                  Icons.campaign_rounded,
                                  color: Colors.white.withValues(alpha: 0.9),
                                  size: 40,
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 24),

                          // Recent Reports
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                'Laporan Terbaru',
                                style: GoogleFonts.spaceGrotesk(
                                  fontSize: 16,
                                  fontWeight: FontWeight.w800,
                                ),
                              ),
                              if (_reports.isNotEmpty)
                                Text(
                                  'Lihat semua →',
                                  style: GoogleFonts.spaceGrotesk(
                                    fontSize: 12,
                                    color: AppColors.primary,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                            ],
                          ),
                          const SizedBox(height: 12),

                          if (_reports.isEmpty)
                            _EmptyState()
                          else
                            ...recent.map((report) => ReportCard(
                                  report: report,
                                  onTap: () async {
                                    await Navigator.push(
                                      context,
                                      MaterialPageRoute(
                                        builder: (_) => ReportDetailPelapor(report: report),
                                      ),
                                    );
                                    _loadData();
                                  },
                                )),
                        ],
                      ),
                    ),
            ),
          ],
        ),
      ),
    );
  }
}

class _EmptyState extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 32),
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: 0.08),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.inbox_rounded, size: 40, color: AppColors.primary),
            ),
            const SizedBox(height: 16),
            Text(
              'Belum ada laporan',
              style: GoogleFonts.spaceGrotesk(
                fontSize: 15,
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              'Tekan "Lapor" untuk membuat laporan pertamamu',
              style: GoogleFonts.spaceGrotesk(
                fontSize: 12,
                color: AppColors.textMuted,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
