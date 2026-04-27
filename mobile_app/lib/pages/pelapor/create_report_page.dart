import 'dart:io';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:image_picker/image_picker.dart';
import '../../models/user_model.dart';
import '../../services/mock_api_service.dart';
import '../../theme/app_theme.dart';

class CreateReportPage extends StatefulWidget {
  final UserSession session;
  const CreateReportPage({super.key, required this.session});

  @override
  State<CreateReportPage> createState() => _CreateReportPageState();
}

class _CreateReportPageState extends State<CreateReportPage> {
  final _titleController = TextEditingController();
  final _locationController = TextEditingController();
  final _descController = TextEditingController();
  String _category = 'Listrik';
  File? _selectedImage;
  bool _isLoading = false;
  final _picker = ImagePicker();

  final List<Map<String, dynamic>> _categories = [
    {'value': 'Listrik', 'icon': Icons.bolt_rounded, 'color': Color(0xFFF59E0B)},
    {'value': 'HVAC', 'icon': Icons.ac_unit_rounded, 'color': Color(0xFF3B82F6)},
    {'value': 'Lab', 'icon': Icons.computer_rounded, 'color': Color(0xFF8B5CF6)},
    {'value': 'Jaringan', 'icon': Icons.wifi_rounded, 'color': Color(0xFF10B981)},
    {'value': 'Lainnya', 'icon': Icons.build_rounded, 'color': Color(0xFF64748B)},
  ];

  @override
  void dispose() {
    _titleController.dispose();
    _locationController.dispose();
    _descController.dispose();
    super.dispose();
  }

  Future<void> _pickImage(ImageSource source) async {
    try {
      final file = await _picker.pickImage(source: source, imageQuality: 80);
      if (file != null && mounted) {
        setState(() => _selectedImage = File(file.path));
      }
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
          content: Text('Gagal mengakses kamera/galeri'),
        ));
      }
    }
  }

  void _showImageSourceBottomSheet() {
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
                  color: AppColors.textDim, borderRadius: BorderRadius.circular(2),
                ),
              ),
              const SizedBox(height: 20),
              Text('Tambah Foto Kerusakan',
                  style: GoogleFonts.spaceGrotesk(fontSize: 16, fontWeight: FontWeight.w700)),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: _ImageSourceButton(
                      icon: Icons.camera_alt_rounded,
                      label: 'Kamera',
                      color: AppColors.primary,
                      onTap: () {
                        Navigator.pop(context);
                        _pickImage(ImageSource.camera);
                      },
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _ImageSourceButton(
                      icon: Icons.photo_library_rounded,
                      label: 'Galeri',
                      color: AppColors.info,
                      onTap: () {
                        Navigator.pop(context);
                        _pickImage(ImageSource.gallery);
                      },
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

  Future<void> _submitReport() async {
    if (_titleController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Judul laporan tidak boleh kosong')),
      );
      return;
    }
    if (_descController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Deskripsi tidak boleh kosong')),
      );
      return;
    }

    setState(() => _isLoading = true);
    await api.createReport(
      reporterSsoId: widget.session.ssoId,
      title: _titleController.text.trim(),
      category: _category,
      location: _locationController.text.trim().isEmpty
          ? 'Lokasi belum ditentukan'
          : _locationController.text.trim(),
      description: _descController.text.trim(),
      photoUrl: _selectedImage?.path ?? '',
    );
    setState(() => _isLoading = false);

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: [
              const Icon(Icons.check_circle, color: AppColors.success, size: 16),
              const SizedBox(width: 8),
              Text('Laporan berhasil dikirim!',
                  style: GoogleFonts.spaceGrotesk(fontSize: 13)),
            ],
          ),
        ),
      );
      _titleController.clear();
      _locationController.clear();
      _descController.clear();
      setState(() { _selectedImage = null; _category = 'Listrik'; });
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: Text('Buat Laporan Baru',
            style: GoogleFonts.spaceGrotesk(fontSize: 18, fontWeight: FontWeight.w700)),
        automaticallyImplyLeading: false,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Foto kerusakan
            _SectionLabel('FOTO KERUSAKAN'),
            GestureDetector(
              onTap: _showImageSourceBottomSheet,
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                height: 160,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(16),
                  color: isDark ? AppColors.hoverDark : AppColors.bgLight,
                  border: Border.all(
                    color: _selectedImage != null
                        ? AppColors.primary
                        : (isDark ? AppColors.borderDark : AppColors.borderLight),
                    width: _selectedImage != null ? 2 : 1,
                    style: _selectedImage != null ? BorderStyle.solid : BorderStyle.solid,
                  ),
                ),
                child: _selectedImage != null
                    ? ClipRRect(
                        borderRadius: BorderRadius.circular(15),
                        child: Stack(
                          fit: StackFit.expand,
                          children: [
                            Image.file(_selectedImage!, fit: BoxFit.cover),
                            Positioned(
                              top: 8, right: 8,
                              child: GestureDetector(
                                onTap: () => setState(() => _selectedImage = null),
                                child: Container(
                                  padding: const EdgeInsets.all(4),
                                  decoration: const BoxDecoration(
                                    color: Colors.black54, shape: BoxShape.circle,
                                  ),
                                  child: const Icon(Icons.close, color: Colors.white, size: 16),
                                ),
                              ),
                            ),
                          ],
                        ),
                      )
                    : Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Container(
                            padding: const EdgeInsets.all(14),
                            decoration: BoxDecoration(
                              color: AppColors.primary.withValues(alpha: 0.1),
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(Icons.add_a_photo_rounded,
                                size: 28, color: AppColors.primary),
                          ),
                          const SizedBox(height: 10),
                          Text('Tap untuk tambah foto',
                              style: GoogleFonts.spaceGrotesk(
                                  fontSize: 13, fontWeight: FontWeight.w600,
                                  color: AppColors.primary)),
                          const SizedBox(height: 4),
                          Text('Kamera atau pilih dari galeri',
                              style: GoogleFonts.spaceGrotesk(
                                  fontSize: 11, color: AppColors.textMuted)),
                        ],
                      ),
              ),
            ),
            const SizedBox(height: 20),

            // Judul
            _SectionLabel('JUDUL LAPORAN'),
            TextField(
              controller: _titleController,
              decoration: const InputDecoration(
                hintText: 'Deskripsikan kerusakan singkat',
                prefixIcon: Icon(Icons.title_rounded),
              ),
            ),
            const SizedBox(height: 16),

            // Kategori
            _SectionLabel('KATEGORI KERUSAKAN'),
            SizedBox(
              height: 52,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                itemCount: _categories.length,
                separatorBuilder: (_, __) => const SizedBox(width: 8),
                itemBuilder: (_, i) {
                  final cat = _categories[i];
                  final selected = _category == cat['value'];
                  final color = cat['color'] as Color;
                  return GestureDetector(
                    onTap: () => setState(() => _category = cat['value']),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 180),
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                      decoration: BoxDecoration(
                        color: selected
                            ? color.withValues(alpha: 0.15)
                            : (isDark ? AppColors.hoverDark : AppColors.bgLight),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: selected ? color : (isDark ? AppColors.borderDark : AppColors.borderLight),
                          width: selected ? 2 : 1,
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(cat['icon'] as IconData, size: 16, color: selected ? color : AppColors.textMuted),
                          const SizedBox(width: 6),
                          Text(
                            cat['value'],
                            style: GoogleFonts.spaceGrotesk(
                              fontSize: 13,
                              fontWeight: selected ? FontWeight.w700 : FontWeight.w500,
                              color: selected ? color : AppColors.textMuted,
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
            const SizedBox(height: 16),

            // Lokasi
            _SectionLabel('LOKASI'),
            TextField(
              controller: _locationController,
              decoration: const InputDecoration(
                hintText: 'Gedung / lantai / ruangan',
                prefixIcon: Icon(Icons.location_on_outlined),
                suffixIcon: Icon(Icons.gps_fixed_rounded, color: AppColors.primary),
              ),
            ),
            const SizedBox(height: 16),

            // Deskripsi
            _SectionLabel('DESKRIPSI KERUSAKAN'),
            TextField(
              controller: _descController,
              minLines: 4,
              maxLines: 7,
              decoration: const InputDecoration(
                hintText: 'Jelaskan kerusakan secara detail: kondisi, kapan terjadi, dampak, dll.',
                alignLabelWithHint: true,
                prefixIcon: Padding(
                  padding: EdgeInsets.only(bottom: 80),
                  child: Icon(Icons.description_outlined),
                ),
              ),
            ),
            const SizedBox(height: 28),

            // Submit
            _isLoading
                ? Container(
                    height: 52,
                    decoration: BoxDecoration(
                      color: AppColors.primary,
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: const Center(
                      child: SizedBox(
                        width: 22, height: 22,
                        child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5),
                      ),
                    ),
                  )
                : FilledButton.icon(
                    onPressed: _submitReport,
                    icon: const Icon(Icons.send_rounded, size: 18),
                    label: const Text('Kirim Laporan'),
                  ),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }
}

class _SectionLabel extends StatelessWidget {
  final String text;
  const _SectionLabel(this.text);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Text(
        text,
        style: GoogleFonts.spaceGrotesk(
          fontSize: 11,
          fontWeight: FontWeight.w700,
          color: AppColors.textMuted,
          letterSpacing: 0.6,
        ),
      ),
    );
  }
}

class _ImageSourceButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;

  const _ImageSourceButton({
    required this.icon, required this.label,
    required this.color, required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 18),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: color.withValues(alpha: 0.3)),
        ),
        child: Column(
          children: [
            Icon(icon, color: color, size: 28),
            const SizedBox(height: 8),
            Text(label, style: GoogleFonts.spaceGrotesk(
                fontSize: 13, fontWeight: FontWeight.w600, color: color)),
          ],
        ),
      ),
    );
  }
}
