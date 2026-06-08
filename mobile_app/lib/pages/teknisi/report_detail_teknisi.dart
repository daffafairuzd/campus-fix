import 'dart:io';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:image_picker/image_picker.dart';
import '../../models/report_model.dart';
import '../../models/user_model.dart';
import '../../services/api_service.dart';
import '../../theme/app_theme.dart';
import '../../widgets/photo_gallery.dart';
import '../../widgets/status_badge.dart';
import '../../widgets/status_stepper.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';

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
  late FacilityReport _report;
  List<XFile> _buktiFotos = [];
  bool _isSaving = false;
  final _picker = ImagePicker();

  @override
  void initState() {
    super.initState();
    _report = widget.report;
    _refreshReport();
  }

  Future<void> _refreshReport() async {
    try {
      final freshReport = await api.getReport(_report.id);
      if (mounted) {
        setState(() {
          _report = freshReport;
        });
      }
    } catch (_) {
      // Abaikan error refresh, pakai data lama
    }
  }

  /// Tentukan status berikutnya berdasarkan status saat ini
  ReportStatus? get _nextStatus {
    switch (_report.status) {
      case ReportStatus.menunggu:
        return ReportStatus.ditugaskan;
      case ReportStatus.ditugaskan:
        return ReportStatus.assessment;
      case ReportStatus.assessment:
        return ReportStatus.dalamProses;
      case ReportStatus.dalamProses:
        return ReportStatus.selesai;
      default:
        return null; // selesai atau eskalasi — tidak ada aksi lagi
    }
  }

  String get _actionLabel {
    switch (_report.status) {
      case ReportStatus.menunggu:
        return 'Mulai Kerjakan';
      case ReportStatus.ditugaskan:
        return 'Lakukan Assessment';
      case ReportStatus.assessment:
        return 'Mulai Kerjakan';
      case ReportStatus.dalamProses:
        return 'Selesaikan Perbaikan';
      default:
        return 'Sudah Selesai';
    }
  }

  IconData get _actionIcon {
    switch (_report.status) {
      case ReportStatus.menunggu:
      case ReportStatus.ditugaskan:
      case ReportStatus.assessment:
        return Icons.play_circle_outline_rounded;
      case ReportStatus.dalamProses:
        return Icons.check_circle_outline_rounded;
      default:
        return Icons.done_all_rounded;
    }
  }

  Future<void> _pickImage(ImageSource source) async {
    if (_buktiFotos.length >= 5) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Maksimal 5 foto per laporan')));
      return;
    }
    try {
      if (source == ImageSource.gallery) {
        final files = await _picker.pickMultiImage(imageQuality: 80);
        if (files.isNotEmpty && mounted) {
          setState(() {
            for (var f in files) {
              if (_buktiFotos.length < 5) _buktiFotos.add(f);
            }
          });
        }
      } else {
        final file = await _picker.pickImage(source: source, imageQuality: 80);
        if (file != null && mounted) {
          setState(() => _buktiFotos.add(file));
        }
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

    // Transition: ditugaskan -> assessment (simple update status)
    if (_nextStatus == ReportStatus.assessment) {
      setState(() => _isSaving = true);
      try {
        await api.updateStatus(_report.id, _nextStatus!);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Mulai melakukan assessment!')));
          _refreshReport();
        }
      } catch (e) {
        if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString()), backgroundColor: AppColors.danger));
      } finally {
        if (mounted) setState(() => _isSaving = false);
      }
      return;
    }

    // Transition: assessment -> dalamProses (require description, NO foto)
    if (_nextStatus == ReportStatus.dalamProses) {
      final noteController = TextEditingController();
      bool? confirm = await showDialog<bool>(
        context: context,
        barrierDismissible: false,
        builder: (context) => AlertDialog(
          backgroundColor: AppColors.bgDark,
          title: Text('Catatan Asesmen', style: GoogleFonts.spaceGrotesk(color: Colors.white, fontWeight: FontWeight.bold)),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Silakan berikan catatan asesmen awal (alat, kendala, dll). Wajib diisi.', 
                style: GoogleFonts.spaceGrotesk(fontSize: 13, color: AppColors.textMuted)),
              const SizedBox(height: 12),
              TextField(
                controller: noteController,
                maxLines: 3,
                style: GoogleFonts.spaceGrotesk(color: Colors.white),
                decoration: InputDecoration(
                  hintText: 'Ketik catatan di sini...',
                  hintStyle: GoogleFonts.spaceGrotesk(color: AppColors.textDim),
                  filled: true,
                  fillColor: AppColors.hoverDark,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide.none),
                ),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context, false),
              child: Text('Batal', style: GoogleFonts.spaceGrotesk(color: AppColors.textMuted)),
            ),
            FilledButton(
              style: FilledButton.styleFrom(backgroundColor: AppColors.primary),
              onPressed: () {
                if (noteController.text.trim().isEmpty) {
                  ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Catatan wajib diisi!')));
                  return;
                }
                Navigator.pop(context, true);
              },
              child: Text('Simpan & Mulai'),
            ),
          ],
        ),
      );

      if (confirm != true) return;

      setState(() => _isSaving = true);
      try {
        await api.updateStatus(_report.id, _nextStatus!, description: noteController.text.trim());
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Berhasil memulai pekerjaan!')));
          _refreshReport();
        }
      } catch (e) {
        if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString()), backgroundColor: AppColors.danger));
      } finally {
        if (mounted) setState(() => _isSaving = false);
      }
      return;
    }

    // Transition: dalamProses -> selesai (require foto)
    if (_nextStatus == ReportStatus.selesai) {
      if (_buktiFotos.isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Row(
              children: [
                const Icon(Icons.warning_amber_rounded, color: Colors.amber, size: 16),
                const SizedBox(width: 8),
                Text('Foto bukti perbaikan wajib dilampirkan!',
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
        for (final photo in _buktiFotos) {
          await api.uploadPhoto(_report.id, photo, type: 'bukti_penyelesaian');
        }
        await api.updateStatus(_report.id, _nextStatus!);

        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Laporan diselesaikan!')));
          Navigator.pop(context);
        }
      } catch (e) {
        if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString()), backgroundColor: AppColors.danger));
      } finally {
        if (mounted) setState(() => _isSaving = false);
      }
    }
  }

  Future<void> _requestEscalation() async {
    final noteController = TextEditingController();
    bool? confirm = await showDialog<bool>(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        backgroundColor: AppColors.bgDark,
        title: Text('Ajukan Eskalasi', style: GoogleFonts.spaceGrotesk(color: Colors.white, fontWeight: FontWeight.bold)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Silakan berikan alasan mengapa laporan ini perlu dieskalasi. Wajib diisi.', 
              style: GoogleFonts.spaceGrotesk(fontSize: 13, color: AppColors.textMuted)),
            const SizedBox(height: 12),
            TextField(
              controller: noteController,
              maxLines: 3,
              style: GoogleFonts.spaceGrotesk(color: Colors.white),
              decoration: InputDecoration(
                hintText: 'Ketik alasan kendala...',
                hintStyle: GoogleFonts.spaceGrotesk(color: AppColors.textDim),
                filled: true,
                fillColor: AppColors.hoverDark,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide.none),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: Text('Batal', style: GoogleFonts.spaceGrotesk(color: AppColors.textMuted)),
          ),
          FilledButton(
            style: FilledButton.styleFrom(backgroundColor: AppColors.danger),
            onPressed: () {
              if (noteController.text.trim().isEmpty) {
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Alasan wajib diisi!')));
                return;
              }
              Navigator.pop(context, true);
            },
            child: Text('Kirim Pengajuan'),
          ),
        ],
      ),
    );

    if (confirm != true) return;

    setState(() => _isSaving = true);
    try {
      await api.requestEscalation(_report.id, noteController.text.trim());
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Pengajuan eskalasi berhasil dikirim!')));
        _refreshReport();
      }
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString()), backgroundColor: AppColors.danger));
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final report = _report;

    return Scaffold(
      appBar: AppBar(
        title: Text('Detail Laporan — Teknisi',
            style: GoogleFonts.spaceGrotesk(fontSize: 16, fontWeight: FontWeight.w700)),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: RefreshIndicator(
        onRefresh: _refreshReport,
        color: AppColors.primary,
        backgroundColor: isDark ? AppColors.hoverDark : Colors.white,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          child: Column(
            children: [
            // Photo
            if (report.reportPhotos.isNotEmpty)
              Padding(
                padding: const EdgeInsets.only(top: 16, left: 20, right: 20),
                child: PhotoGallery(photoUrls: report.reportPhotos, title: 'laporan'),
              )
            else
              Container(
                height: 200,
                width: double.infinity,
                color: const Color(0xFF0A0F14),
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
                      borderRadius: BorderRadius.circular(8),
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
                  StatusStepper(currentStatus: report.status, report: report),
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
                        borderRadius: BorderRadius.circular(8),
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

                    if (_nextStatus == ReportStatus.selesai) ...[
                      // Upload bukti foto – kamera saja
                      _SLabel('FOTO BUKTI (WAJIB)'),
                      if (_buktiFotos.isNotEmpty) ...[
                        const SizedBox(height: 16),
                        SizedBox(
                          height: 120,
                          child: ListView.separated(
                            scrollDirection: Axis.horizontal,
                            itemCount: _buktiFotos.length,
                            separatorBuilder: (_, __) => const SizedBox(width: 12),
                            itemBuilder: (_, i) {
                              return Stack(
                                children: [
                                  ClipRRect(
                                    borderRadius: BorderRadius.circular(8),
                                    child: kIsWeb
                                        ? Image.network(_buktiFotos[i].path, width: 120, height: 120, fit: BoxFit.cover)
                                        : Image.file(File(_buktiFotos[i].path), width: 120, height: 120, fit: BoxFit.cover),
                                  ),
                                  Positioned(
                                    top: 4, right: 4,
                                    child: GestureDetector(
                                      onTap: () => setState(() => _buktiFotos.removeAt(i)),
                                      child: Container(
                                        padding: const EdgeInsets.all(4),
                                        decoration: BoxDecoration(color: Colors.black54, borderRadius: BorderRadius.circular(8)),
                                        child: const Icon(Icons.close, color: Colors.white, size: 16),
                                      ),
                                    ),
                                  ),
                                ],
                              );
                            },
                          ),
                        ),
                      ],
                      const SizedBox(height: 16),
                      OutlinedButton.icon(
                        icon: const Icon(Icons.camera_alt_outlined),
                        label: Text(
                          _buktiFotos.isNotEmpty ? 'Tambah Foto (${_buktiFotos.length}/5)' : 'Ambil Foto Bukti (Kamera)',
                          style: GoogleFonts.spaceGrotesk(fontSize: 13, fontWeight: FontWeight.w600),
                        ),
                        onPressed: () => _pickImage(ImageSource.camera),
                        style: OutlinedButton.styleFrom(
                          minimumSize: const Size(double.infinity, 48),
                          side: BorderSide(
                            color: _buktiFotos.isEmpty ? AppColors.danger : AppColors.primary,
                          ),
                          foregroundColor: _buktiFotos.isEmpty ? AppColors.danger : AppColors.primary,
                        ),
                      ),
                      if (_buktiFotos.isEmpty) ...[
                        const SizedBox(height: 6),
                        Text(
                          '* Foto bukti wajib diambil dari kamera sebelum update status',
                          style: GoogleFonts.spaceGrotesk(
                              fontSize: 11, color: AppColors.danger),
                        ),
                      ],
                      const SizedBox(height: 20),
                    ],

                    // Aksi tombol utama
                    _isSaving
                        ? Container(
                            height: 52,
                            decoration: BoxDecoration(
                              color: AppColors.primary, borderRadius: BorderRadius.circular(8),
                            ),
                            child: const Center(
                              child: SizedBox(
                                width: 22, height: 22,
                                child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5),
                              ),
                            ),
                          )
                        : FilledButton.icon(
                            onPressed: (_nextStatus != ReportStatus.selesai || _buktiFotos.isNotEmpty) && !_report.isEscalationRequested ? _saveUpdate : null,
                            icon: Icon(_actionIcon, size: 18),
                            label: Text(_actionLabel),
                            style: FilledButton.styleFrom(
                              backgroundColor: AppColors.primary,
                              disabledBackgroundColor: AppColors.textDim.withValues(alpha: 0.3),
                            ),
                          ),
                    const SizedBox(height: 16),
                    
                    if (_report.isEscalationRequested) ...[
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: AppColors.warning.withValues(alpha: 0.1),
                          border: Border.all(color: AppColors.warning.withValues(alpha: 0.3)),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.hourglass_empty_rounded, color: AppColors.warning, size: 18),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                'Menunggu verifikasi admin atas pengajuan eskalasi.',
                                style: GoogleFonts.spaceGrotesk(fontSize: 12, color: AppColors.warning),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ] else if (_report.status == ReportStatus.assessment || _report.status == ReportStatus.dalamProses) ...[
                      OutlinedButton.icon(
                        onPressed: _requestEscalation,
                        icon: const Icon(Icons.report_problem_outlined, size: 18),
                        label: Text('Ajukan Eskalasi (Kendala)'),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: AppColors.danger,
                          side: BorderSide(color: AppColors.danger.withValues(alpha: 0.5)),
                        ),
                      ),
                    ],
                    
                    const SizedBox(height: 32),
                  ] else ...[
                    // Laporan sudah selesai
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: AppColors.success.withValues(alpha: 0.08),
                        borderRadius: BorderRadius.circular(8),
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
                    if (_report.completionPhotos.isNotEmpty) ...[
                      const SizedBox(height: 24),
                      const _Divider(),
                      const SizedBox(height: 16),
                      const _SLabel('Foto Hasil Perbaikan'),
                      const SizedBox(height: 8),
                      PhotoGallery(photoUrls: _report.completionPhotos, title: 'penyelesaian'),
                    ],
                    const SizedBox(height: 32),
                  ],
                ],
              ),
            ),
          ],
        ),
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
        borderRadius: BorderRadius.circular(8),
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
          if (report.latitude != null && report.longitude != null) ...[
            const SizedBox(height: 12),
            Container(
              height: 180,
              width: double.infinity,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(8),
                border: Border.all(
                  color: isDark ? AppColors.borderDark : AppColors.borderLight,
                ),
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: FlutterMap(
                  options: MapOptions(
                    initialCenter: LatLng(report.latitude!, report.longitude!),
                    initialZoom: 16.0,
                    minZoom: 10.0,
                    maxZoom: 18.0,
                  ),
                  children: [
                    TileLayer(
                      urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                      userAgentPackageName: 'com.example.mobile_app',
                    ),
                    MarkerLayer(
                      markers: [
                        Marker(
                          point: LatLng(report.latitude!, report.longitude!),
                          width: 40,
                          height: 40,
                          child: const Icon(
                            Icons.location_on_rounded,
                            color: AppColors.primary,
                            size: 32,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
          const Divider(height: 14),
          _InfoRow(Icons.calendar_today_outlined, 'Tanggal', report.createdAt),
          const Divider(height: 14),
          _InfoRow(Icons.person_outline_rounded, 'Pelapor', report.reporterSsoId),
          if (report.rating != null) ...[
            const Divider(height: 14),
            _InfoRow(Icons.star_rounded, 'Rating', '${'⭐' * report.rating!} (${report.rating}/5)'),
          ],
          if (report.feedback != null && report.feedback!.isNotEmpty) ...[
            const Divider(height: 14),
            _InfoRow(Icons.chat_bubble_outline_rounded, 'Feedback', report.feedback!),
          ],
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
  const _Divider({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Container(
        height: 1,
        color: isDark ? AppColors.borderDark : AppColors.borderLight);
  }
}
