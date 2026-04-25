import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_rating_bar/flutter_rating_bar.dart';
import '../../models/report_model.dart';
import '../../services/mock_api_service.dart';
import '../../theme/app_theme.dart';
import '../../widgets/status_badge.dart';
import '../../widgets/status_stepper.dart';

class ReportDetailPelapor extends StatefulWidget {
  final FacilityReport report;
  const ReportDetailPelapor({super.key, required this.report});

  @override
  State<ReportDetailPelapor> createState() => _ReportDetailPelaporState();
}

class _ReportDetailPelaporState extends State<ReportDetailPelapor> {
  late FacilityReport _report;
  int _rating = 5;
  final _feedbackController = TextEditingController();
  bool _isSubmittingRating = false;
  bool _feedbackSubmitted = false;

  @override
  void initState() {
    super.initState();
    _report = widget.report;
    if (_report.rating != null) {
      _rating = _report.rating!;
      _feedbackController.text = _report.feedback ?? '';
      _feedbackSubmitted = true;
    }
  }

  @override
  void dispose() {
    _feedbackController.dispose();
    super.dispose();
  }

  Future<void> _submitRating() async {
    setState(() => _isSubmittingRating = true);
    await api.submitRating(_report.id, _rating, _feedbackController.text.trim());
    setState(() { _isSubmittingRating = false; _feedbackSubmitted = true; });
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: [
              const Icon(Icons.star, color: Colors.amber, size: 16),
              const SizedBox(width: 8),
              Text('Rating berhasil dikirim!',
                  style: GoogleFonts.spaceGrotesk(fontSize: 13)),
            ],
          ),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final report = _report;

    return Scaffold(
      appBar: AppBar(
        title: Text('Detail Laporan',
            style: GoogleFonts.spaceGrotesk(fontSize: 18, fontWeight: FontWeight.w700)),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            // Photo / placeholder
            _PhotoSection(report: report),

            Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Title + badges
                  Text(
                    report.title,
                    style: GoogleFonts.spaceGrotesk(
                      fontSize: 22,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  const SizedBox(height: 10),
                  Wrap(
                    spacing: 8,
                    runSpacing: 6,
                    children: [
                      StatusBadge(status: report.status),
                      PriorityBadge(priority: report.priority),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                        decoration: BoxDecoration(
                          color: AppColors.primary.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: AppColors.primary.withValues(alpha: 0.3)),
                        ),
                        child: Text(
                          'AI Score: ${report.priorityScore}',
                          style: GoogleFonts.spaceGrotesk(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            color: AppColors.primary,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  const _Divider(),
                  const SizedBox(height: 16),

                  // Info rows
                  _InfoCard(children: [
                    _InfoRow(icon: Icons.tag_rounded, label: 'No. Laporan', value: report.reportNumber),
                    _InfoRow(icon: Icons.category_outlined, label: 'Kategori', value: report.category),
                    _InfoRow(icon: Icons.location_on_outlined, label: 'Lokasi', value: report.location),
                    _InfoRow(icon: Icons.calendar_today_outlined, label: 'Tanggal', value: report.createdAt),
                    if (report.assignedTechnician != null)
                      _InfoRow(icon: Icons.engineering_rounded, label: 'Teknisi', value: report.assignedTechnician!),
                    if (report.completedAt != null)
                      _InfoRow(icon: Icons.check_circle_outline, label: 'Selesai', value: report.completedAt!),
                  ]),
                  const SizedBox(height: 16),

                  // Description
                  _SectionTitle('Deskripsi Kerusakan'),
                  const SizedBox(height: 8),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: isDark ? AppColors.hoverDark : AppColors.bgLight,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                          color: isDark ? AppColors.borderDark : AppColors.borderLight),
                    ),
                    child: Text(
                      report.description,
                      style: GoogleFonts.spaceGrotesk(
                        fontSize: 13,
                        color: isDark ? AppColors.textMainDark : AppColors.textMainLight,
                        height: 1.6,
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),
                  const _Divider(),
                  const SizedBox(height: 16),

                  // Status Tracker
                  _SectionTitle('Tracking Status (5 Tahap)'),
                  const SizedBox(height: 16),
                  StatusStepper(currentStatus: report.status),

                  // Rating & Feedback (hanya jika selesai)
                  if (report.status == ReportStatus.completed) ...[
                    const _Divider(),
                    const SizedBox(height: 16),
                    _SectionTitle('Rating & Feedback'),
                    const SizedBox(height: 4),
                    Text(
                      _feedbackSubmitted
                          ? 'Terima kasih atas feedbackmu!'
                          : 'Bagaimana penanganan laporan ini?',
                      style: GoogleFonts.spaceGrotesk(
                        fontSize: 13, color: AppColors.textMuted,
                      ),
                    ),
                    const SizedBox(height: 16),
                    Center(
                      child: RatingBar.builder(
                        initialRating: _rating.toDouble(),
                        minRating: 1,
                        itemCount: 5,
                        itemSize: 40,
                        unratedColor: isDark ? AppColors.borderDark : AppColors.borderLight,
                        itemBuilder: (_, __) =>
                            const Icon(Icons.star_rounded, color: Colors.amber),
                        onRatingUpdate: _feedbackSubmitted
                            ? (_) {}
                            : (r) => setState(() => _rating = r.toInt()),
                      ),
                    ),
                    const SizedBox(height: 12),
                    Center(
                      child: Text(
                        ['', 'Sangat Buruk', 'Buruk', 'Cukup', 'Baik', 'Sangat Baik'][_rating],
                        style: GoogleFonts.spaceGrotesk(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: Colors.amber,
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    TextField(
                      controller: _feedbackController,
                      minLines: 3,
                      maxLines: 5,
                      readOnly: _feedbackSubmitted,
                      decoration: InputDecoration(
                        hintText: 'Ceritakan pengalaman penanganannya...',
                        prefixIcon: const Padding(
                          padding: EdgeInsets.only(bottom: 48),
                          child: Icon(Icons.chat_outlined),
                        ),
                        filled: true,
                        fillColor: _feedbackSubmitted
                            ? (isDark ? AppColors.hoverDark : AppColors.bgLight)
                            : null,
                      ),
                    ),
                    const SizedBox(height: 16),
                    if (!_feedbackSubmitted)
                      _isSubmittingRating
                          ? const Center(
                              child: CircularProgressIndicator(color: AppColors.primary))
                          : FilledButton.icon(
                              onPressed: _submitRating,
                              icon: const Icon(Icons.star_rounded, size: 18),
                              label: const Text('Kirim Rating & Feedback'),
                            ),
                    if (_feedbackSubmitted)
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: AppColors.success.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                              color: AppColors.success.withValues(alpha: 0.3)),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.check_circle, color: AppColors.success, size: 18),
                            const SizedBox(width: 8),
                            Text('Rating sudah dikirim. Terima kasih!',
                                style: GoogleFonts.spaceGrotesk(
                                    fontSize: 13, color: AppColors.success,
                                    fontWeight: FontWeight.w600)),
                          ],
                        ),
                      ),
                    const SizedBox(height: 32),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _PhotoSection extends StatelessWidget {
  final FacilityReport report;
  const _PhotoSection({required this.report});

  @override
  Widget build(BuildContext context) {
    if (report.photoUrl.isNotEmpty) {
      return SizedBox(
        height: 220,
        width: double.infinity,
        child: Image.network(report.photoUrl, fit: BoxFit.cover,
            errorBuilder: (_, __, ___) => _placeholder()),
      );
    }
    return _placeholder();
  }

  Widget _placeholder() {
    return Container(
      height: 220,
      color: const Color(0xFF1A2535),
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.image_not_supported_outlined,
                size: 48, color: AppColors.textMuted),
            const SizedBox(height: 8),
            Text('Belum ada foto',
                style: GoogleFonts.spaceGrotesk(
                    fontSize: 13, color: AppColors.textMuted)),
          ],
        ),
      ),
    );
  }
}

class _InfoCard extends StatelessWidget {
  final List<Widget> children;
  const _InfoCard({required this.children});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: isDark ? AppColors.hoverDark : AppColors.bgLight,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
            color: isDark ? AppColors.borderDark : AppColors.borderLight),
      ),
      child: Column(
        children: children
            .expand((w) => [w, const Divider(height: 16)])
            .toList()
          ..removeLast(),
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  const _InfoRow({required this.icon, required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 15, color: AppColors.textMuted),
        const SizedBox(width: 8),
        SizedBox(
          width: 80,
          child: Text(label,
              style: GoogleFonts.spaceGrotesk(
                  fontSize: 12, color: AppColors.textMuted)),
        ),
        Expanded(
          child: Text(value,
              style: GoogleFonts.spaceGrotesk(
                  fontSize: 12, fontWeight: FontWeight.w600)),
        ),
      ],
    );
  }
}

class _SectionTitle extends StatelessWidget {
  final String text;
  const _SectionTitle(this.text);

  @override
  Widget build(BuildContext context) {
    return Text(text,
        style: GoogleFonts.spaceGrotesk(
            fontSize: 15, fontWeight: FontWeight.w800));
  }
}

class _Divider extends StatelessWidget {
  const _Divider();

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Container(
      height: 1,
      color: isDark ? AppColors.borderDark : AppColors.borderLight,
    );
  }
}
