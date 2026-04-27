import 'dart:io';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:image_picker/image_picker.dart';
import '../../models/report_model.dart';
import '../../models/user_model.dart';
import '../../services/mock_api_service.dart';
import '../../theme/app_theme.dart';
import '../../widgets/status_badge.dart';
import '../../widgets/status_stepper.dart';

class ReportDetailTeknisi extends StatefulWidget {
  final FacilityReport report;
  final UserSession session;

  const ReportDetailTeknisi({
    super.key,
    required this.report,
    required this.session,
  });

  @override
  State<ReportDetailTeknisi> createState() => _ReportDetailTeknisiState();
}

class _ReportDetailTeknisiState extends State<ReportDetailTeknisi> {
  late ReportStatus _selectedStatus;
  File? _buktiFoto;
  bool _isSaving = false;
  final _picker = ImagePicker();

  @override
  void initState() {
    super.initState();
    _selectedStatus = widget.report.status;
  }

  Future<void> _pickBuktiFoto(ImageSource source) async {
    try {
      final file = await _picker.pickImage(source: source, imageQuality: 80);
      if (file != null && mounted) {
        setState(() => _buktiFoto = File(file.path));
      }
    } catch (_) {}
  }

  void _showPhotoSource() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (_) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 38, height: 4,
                decoration: BoxDecoration(
                    color: AppColors.textDim, borderRadius: BorderRadius.circular(2)),
              ),
              const SizedBox(height: 20),
              Text('Upload Foto Bukti',
                  style: GoogleFonts.spaceGrotesk(fontSize: 16, fontWeight: FontWeight.w700)),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: _SourceBtn(
                      icon: Icons.camera_alt_rounded, label: 'Kamera',
                      color: AppColors.primary,
                      onTap: () { Navigator.pop(context); _pickBuktiFoto(ImageSource.camera); },
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _SourceBtn(
                      icon: Icons.photo_library_rounded, label: 'Galeri',
                      color: AppColors.info,
                      onTap: () { Navigator.pop(context); _pickBuktiFoto(ImageSource.gallery); },
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _saveUpdate() async {
    setState(() => _isSaving = true);
    await api.updateStatus(widget.report.id, _selectedStatus);
    if (_buktiFoto != null) {
      await api.updateBuktiFoto(widget.report.id, _buktiFoto!.path);
    }
    setState(() { _isSaving = false; });
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: [
              const Icon(Icons.check_circle, color: AppColors.success, size: 16),
              const SizedBox(width: 8),
              Text('Update berhasil disimpan!',
                  style: GoogleFonts.spaceGrotesk(fontSize: 13)),
            ],
          ),
        ),
      );
      Navigator.pop(context);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final report = widget.report;

    return Scaffold(
      appBar: AppBar(
        title: Text('Detail Laporan — Teknisi',
            style: GoogleFonts.spaceGrotesk(fontSize: 16, fontWeight: FontWeight.w700)),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            // Photo
            Container(
              height: 200,
              color: const Color(0xFF0A0F14),
              child: report.photoUrl.isNotEmpty
                  ? Image.file(File(report.photoUrl), fit: BoxFit.cover, width: double.infinity)
                  : Center(
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.image_outlined, size: 40, color: AppColors.textMuted),
                          const SizedBox(height: 8),
                          Text('Foto dari pelapor belum tersedia',
                              style: GoogleFonts.spaceGrotesk(
                                  fontSize: 12, color: AppColors.textMuted)),
                        ],
                      ),
                    ),
            ),

            Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Header
                  Text(report.title,
                      style: GoogleFonts.spaceGrotesk(
                          fontSize: 20, fontWeight: FontWeight.w800)),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 8, runSpacing: 6,
                    children: [
                      StatusBadge(status: report.status),
                      PriorityBadge(priority: report.priority),
                      _ScoreChip(report.priorityScore),
                    ],
                  ),
                  const SizedBox(height: 16),
                  _Divider(),
                  const SizedBox(height: 12),

                  // Detail info
                  _InfoGrid(report: report),
                  const SizedBox(height: 12),

                  // Description
                  _SLabel('Deskripsi'),
                  const SizedBox(height: 6),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: isDark ? AppColors.hoverDark : AppColors.bgLight,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                          color: isDark ? AppColors.borderDark : AppColors.borderLight),
                    ),
                    child: Text(report.description,
                        style: GoogleFonts.spaceGrotesk(
                            fontSize: 13, height: 1.6)),
                  ),
                  const SizedBox(height: 16),
                  _Divider(),
                  const SizedBox(height: 12),

                  // Status Tracker
                  _SLabel('Status Laporan'),
                  const SizedBox(height: 12),
                  StatusStepper(currentStatus: report.status),
                  _Divider(),
                  const SizedBox(height: 16),

                  // ─── UPDATE SECTION ───
                  _SLabel('Update Status'),
                  const SizedBox(height: 8),
                  // Status dropdown
                  DropdownButtonFormField<ReportStatus>(
                    initialValue: _selectedStatus,
                    decoration: InputDecoration(
                      prefixIcon: const Icon(Icons.update_rounded),
                      labelText: 'Pilih Status Baru',
                      filled: true,
                      fillColor: isDark ? AppColors.hoverDark : AppColors.bgLight,
                    ),
                    dropdownColor: isDark ? AppColors.cardDark : AppColors.cardLight,
                    items: ReportStatus.values
                        .map((s) => DropdownMenuItem(
                              value: s,
                              child: Text(statusLabel(s),
                                  style: GoogleFonts.spaceGrotesk(fontSize: 13)),
                            ))
                        .toList(),
                    onChanged: (v) => setState(() => _selectedStatus = v ?? _selectedStatus),
                  ),
                  const SizedBox(height: 14),

                  // Upload bukti foto
                  _SLabel('Foto Bukti Penyelesaian'),
                  const SizedBox(height: 8),
                  if (_buktiFoto != null) ...[
                    ClipRRect(
                      borderRadius: BorderRadius.circular(12),
                      child: Stack(
                        children: [
                          Image.file(_buktiFoto!,
                              height: 140, width: double.infinity, fit: BoxFit.cover),
                          Positioned(
                            top: 8, right: 8,
                            child: GestureDetector(
                              onTap: () => setState(() => _buktiFoto = null),
                              child: Container(
                                padding: const EdgeInsets.all(4),
                                decoration: const BoxDecoration(
                                    color: Colors.black54, shape: BoxShape.circle),
                                child: const Icon(Icons.close, color: Colors.white, size: 16),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 8),
                  ],
                  OutlinedButton.icon(
                    onPressed: _showPhotoSource,
                    icon: const Icon(Icons.camera_alt_rounded, size: 18),
                    label: Text(
                      _buktiFoto != null ? 'Ganti Foto Bukti' : 'Upload Foto Bukti',
                      style: GoogleFonts.spaceGrotesk(fontWeight: FontWeight.w600),
                    ),
                    style: OutlinedButton.styleFrom(
                      minimumSize: const Size(double.infinity, 48),
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Save button
                  _isSaving
                      ? Container(
                          height: 52,
                          decoration: BoxDecoration(
                            color: AppColors.primary, borderRadius: BorderRadius.circular(14),
                          ),
                          child: const Center(
                            child: SizedBox(
                              width: 22, height: 22,
                              child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5),
                            ),
                          ),
                        )
                      : FilledButton.icon(
                          onPressed: _saveUpdate,
                          icon: const Icon(Icons.save_rounded, size: 18),
                          label: const Text('Simpan Update'),
                        ),
                  const SizedBox(height: 32),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _InfoGrid extends StatelessWidget {
  final FacilityReport report;
  const _InfoGrid({required this.report});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: isDark ? AppColors.hoverDark : AppColors.bgLight,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
            color: isDark ? AppColors.borderDark : AppColors.borderLight),
      ),
      child: Column(
        children: [
          _InfoRow(Icons.tag_rounded, 'No. Laporan', report.reportNumber),
          const Divider(height: 14),
          _InfoRow(Icons.category_outlined, 'Kategori', report.category),
          const Divider(height: 14),
          _InfoRow(Icons.location_on_outlined, 'Lokasi', report.location),
          const Divider(height: 14),
          _InfoRow(Icons.calendar_today_outlined, 'Tanggal', report.createdAt),
          const Divider(height: 14),
          _InfoRow(Icons.person_outline_rounded, 'Pelapor', report.reporterSsoId),
        ],
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  const _InfoRow(this.icon, this.label, this.value);

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 14, color: AppColors.textMuted),
        const SizedBox(width: 8),
        SizedBox(width: 88, child: Text(label,
            style: GoogleFonts.spaceGrotesk(fontSize: 12, color: AppColors.textMuted))),
        Expanded(child: Text(value,
            style: GoogleFonts.spaceGrotesk(fontSize: 12, fontWeight: FontWeight.w600))),
      ],
    );
  }
}

class _ScoreChip extends StatelessWidget {
  final int score;
  const _ScoreChip(this.score);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: AppColors.primary.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppColors.primary.withValues(alpha: 0.3)),
      ),
      child: Text('AI Score: $score',
          style: GoogleFonts.spaceGrotesk(
              fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.primary)),
    );
  }
}

class _SLabel extends StatelessWidget {
  final String text;
  const _SLabel(this.text);

  @override
  Widget build(BuildContext context) {
    return Text(text,
        style: GoogleFonts.spaceGrotesk(fontSize: 15, fontWeight: FontWeight.w800));
  }
}

class _SourceBtn extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;
  const _SourceBtn({required this.icon, required this.label, required this.color, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 16),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: color.withValues(alpha: 0.3)),
        ),
        child: Column(
          children: [
            Icon(icon, color: color, size: 26),
            const SizedBox(height: 6),
            Text(label,
                style: GoogleFonts.spaceGrotesk(
                    fontSize: 13, fontWeight: FontWeight.w600, color: color)),
          ],
        ),
      ),
    );
  }
}

class _Divider extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Container(
        height: 1,
        color: isDark ? AppColors.borderDark : AppColors.borderLight);
  }
}
