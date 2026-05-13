import 'dart:io';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:image_picker/image_picker.dart';
import '../../models/report_model.dart';
import '../../models/user_model.dart';
import '../../services/api_service.dart';
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
  File? _buktiFoto;
  bool _isSaving = false;
  final _picker = ImagePicker();

  /// Tentukan status berikutnya berdasarkan status saat ini
  ReportStatus? get _nextStatus {
    switch (widget.report.status) {
      case ReportStatus.menunggu:
        return ReportStatus.dalamProses;
      case ReportStatus.dalamProses:
        return ReportStatus.selesai;
      default:
        return null; // selesai atau eskalasi — tidak ada aksi lagi
    }
  }

  String get _actionLabel {
    switch (widget.report.status) {
      case ReportStatus.menunggu:
        return 'Mulai Kerjakan';
      case ReportStatus.dalamProses:
        return 'Selesaikan Perbaikan';
      default:
        return 'Sudah Selesai';
    }
  }

  IconData get _actionIcon {
    switch (widget.report.status) {
      case ReportStatus.menunggu:
        return Icons.play_circle_outline_rounded;
      case ReportStatus.dalamProses:
        return Icons.check_circle_outline_rounded;
      default:
        return Icons.done_all_rounded;
    }
  }

  Future<void> _takeBuktiFoto() async {
    try {
      final file = await _picker.pickImage(
        source: ImageSource.camera,
        imageQuality: 80,
      );
      if (file != null && mounted) {
        setState(() => _buktiFoto = File(file.path));
      }
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Gagal membuka kamera')),
        );
      }
    }
  }

  Future<void> _saveUpdate() async {
    if (_nextStatus == null) return;

    if (_buktiFoto == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: [
              const Icon(Icons.warning_amber_rounded, color: Colors.amber, size: 16),
              const SizedBox(width: 8),
              Text('Foto bukti wajib dilampirkan!',
                  style: GoogleFonts.spaceGrotesk(fontSize: 13)),
            ],
          ),
          backgroundColor: const Color(0xFF1C1917),
        ),
      );
      return;
    }

    setState(() => _isSaving = true);
    try {
      // Upload foto bukti dulu (base64)
      await api.uploadPhoto(widget.report.id, _buktiFoto!);
      // Update status laporan
      await api.updateStatus(widget.report.id, _nextStatus!);

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
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              e.toString().replaceAll('Exception: ', ''),
              style: GoogleFonts.spaceGrotesk(fontSize: 13),
            ),
            backgroundColor: AppColors.danger,
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isSaving = false);
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
                  if (_nextStatus != null) ...[
                    _SLabel('Aksi Selanjutnya'),
                    const SizedBox(height: 8),

                    // Next status indicator card
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withValues(alpha: 0.08),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: AppColors.primary.withValues(alpha: 0.3)),
                      ),
                      child: Row(
                        children: [
                          Icon(_actionIcon, color: AppColors.primary, size: 20),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('Status selanjutnya:',
                                    style: GoogleFonts.spaceGrotesk(
                                        fontSize: 11, color: AppColors.textMuted)),
                                Text(statusLabel(_nextStatus!),
                                    style: GoogleFonts.spaceGrotesk(
                                        fontSize: 13, fontWeight: FontWeight.w700,
                                        color: AppColors.primary)),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Upload bukti foto – kamera saja
                    _SLabel('FOTO BUKTI (WAJIB)'),
                    const SizedBox(height: 8),
                    if (_buktiFoto != null) ...[
                      ClipRRect(
                        borderRadius: BorderRadius.circular(12),
                        child: Stack(
                          children: [
                            Image.file(_buktiFoto!,
                                height: 160, width: double.infinity, fit: BoxFit.cover),
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
                      onPressed: _takeBuktiFoto,
                      icon: const Icon(Icons.camera_alt_rounded, size: 18),
                      label: Text(
                        _buktiFoto != null ? 'Ambil Ulang Foto' : 'Ambil Foto Bukti (Kamera)',
                        style: GoogleFonts.spaceGrotesk(fontWeight: FontWeight.w600),
                      ),
                      style: OutlinedButton.styleFrom(
                        minimumSize: const Size(double.infinity, 48),
                        side: BorderSide(
                          color: _buktiFoto == null ? AppColors.danger : AppColors.primary,
                        ),
                        foregroundColor: _buktiFoto == null ? AppColors.danger : AppColors.primary,
                      ),
                    ),
                    if (_buktiFoto == null) ...[
                      const SizedBox(height: 6),
                      Text(
                        '* Foto bukti wajib diambil dari kamera sebelum update status',
                        style: GoogleFonts.spaceGrotesk(
                            fontSize: 11, color: AppColors.danger),
                      ),
                    ],
                    const SizedBox(height: 20),

                    // Aksi tombol utama
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
                            onPressed: _buktiFoto != null ? _saveUpdate : null,
                            icon: Icon(_actionIcon, size: 18),
                            label: Text(_actionLabel),
                            style: FilledButton.styleFrom(
                              backgroundColor: AppColors.primary,
                              disabledBackgroundColor: AppColors.textDim.withValues(alpha: 0.3),
                            ),
                          ),
                    const SizedBox(height: 32),
                  ] else ...[
                    // Laporan sudah selesai
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: AppColors.success.withValues(alpha: 0.08),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: AppColors.success.withValues(alpha: 0.3)),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.check_circle_rounded,
                              color: AppColors.success, size: 24),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Text(
                              'Laporan ini telah selesai ditangani.',
                              style: GoogleFonts.spaceGrotesk(
                                  fontSize: 13, fontWeight: FontWeight.w600,
                                  color: AppColors.success),
                            ),
                          ),
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


class _SLabel extends StatelessWidget {
  final String text;
  const _SLabel(this.text);

  @override
  Widget build(BuildContext context) {
    return Text(text,
        style: GoogleFonts.spaceGrotesk(fontSize: 15, fontWeight: FontWeight.w800));
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
