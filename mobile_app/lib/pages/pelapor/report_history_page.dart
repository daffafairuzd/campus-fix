import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../models/user_model.dart';
import '../../models/report_model.dart';
import '../../services/mock_api_service.dart';
import '../../theme/app_theme.dart';
import '../../widgets/report_card.dart';
import 'report_detail_pelapor.dart';

class ReportHistoryPage extends StatefulWidget {
  final UserSession session;
  const ReportHistoryPage({super.key, required this.session});

  @override
  State<ReportHistoryPage> createState() => _ReportHistoryPageState();
}

class _ReportHistoryPageState extends State<ReportHistoryPage> {
  List<FacilityReport> _reports = [];
  bool _isLoading = true;
  ReportStatus? _filterStatus;

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

  List<FacilityReport> get _filtered {
    if (_filterStatus == null) return _reports;
    return _reports.where((r) => r.status == _filterStatus).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Riwayat Laporan',
            style: GoogleFonts.spaceGrotesk(fontSize: 18, fontWeight: FontWeight.w700)),
        automaticallyImplyLeading: false,
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(56),
          child: _FilterBar(
            selected: _filterStatus,
            onChanged: (s) => setState(() => _filterStatus = s),
          ),
        ),
      ),
      body: RefreshIndicator(
        onRefresh: _loadData,
        color: AppColors.primary,
        child: _isLoading
            ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
            : _filtered.isEmpty
                ? _EmptyState(hasFilter: _filterStatus != null)
                : ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: _filtered.length,
                    itemBuilder: (context, i) {
                      final report = _filtered[i];
                      return ReportCard(
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
                      );
                    },
                  ),
      ),
    );
  }
}

class _FilterBar extends StatelessWidget {
  final ReportStatus? selected;
  final ValueChanged<ReportStatus?> onChanged;

  const _FilterBar({required this.selected, required this.onChanged});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 52,
      child: ListView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        children: [
          _FilterChip(
            label: 'Semua',
            selected: selected == null,
            onTap: () => onChanged(null),
          ),
          const SizedBox(width: 8),
          ...ReportStatus.values.map((s) => Padding(
                padding: const EdgeInsets.only(right: 8),
                child: _FilterChip(
                  label: statusLabel(s).split(' ').first,
                  selected: selected == s,
                  onTap: () => onChanged(s),
                  status: s,
                ),
              )),
        ],
      ),
    );
  }
}

class _FilterChip extends StatelessWidget {
  final String label;
  final bool selected;
  final VoidCallback onTap;
  final ReportStatus? status;

  const _FilterChip({
    required this.label, required this.selected,
    required this.onTap, this.status,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
        decoration: BoxDecoration(
          color: selected
              ? AppColors.primary.withValues(alpha: 0.12)
              : (isDark ? AppColors.hoverDark : AppColors.bgLight),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: selected
                ? AppColors.primary
                : (isDark ? AppColors.borderDark : AppColors.borderLight),
            width: selected ? 1.5 : 1,
          ),
        ),
        child: Text(
          label,
          style: GoogleFonts.spaceGrotesk(
            fontSize: 12,
            fontWeight: selected ? FontWeight.w700 : FontWeight.w500,
            color: selected ? AppColors.primary : AppColors.textMuted,
          ),
        ),
      ),
    );
  }
}

class _EmptyState extends StatelessWidget {
  final bool hasFilter;
  const _EmptyState({required this.hasFilter});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(40),
        child: Column(
          mainAxisSize: MainAxisSize.min,
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
              hasFilter ? 'Tidak ada laporan dengan filter ini' : 'Belum ada laporan',
              style: GoogleFonts.spaceGrotesk(fontSize: 15, fontWeight: FontWeight.w700),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
