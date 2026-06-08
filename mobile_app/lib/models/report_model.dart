import 'package:intl/intl.dart';

/// Status laporan — sesuai dengan backend Laravel
/// Backend values: 'menunggu', 'assessment', 'dalam_proses', 'selesai', 'eskalasi'
enum ReportStatus { menunggu, ditugaskan, assessment, dalamProses, selesai, eskalasi }

class FacilityReport {
  final int id;
  final String reportNumber;
  final String title;
  final String category;
  final String location;
  final String description;
  final String photoUrl; // URL/base64 dari foto pertama (jika ada)
  final String completionPhotoUrl; // Foto bukti perbaikan teknisi
  final List<String> reportPhotos;
  final List<String> completionPhotos;
  final ReportStatus status;
  final String priority; // 'kritis', 'tinggi', 'sedang', 'rendah'
  final String createdAt; // formatted string
  final String? assignedTechnician;
  final String reporterSsoId; // email pelapor
  final String? completedAt;
  final int? rating;
  final String? feedback;
  final String? slaDeadline;
  final bool isEscalationRequested;
  final String? escalationReason;
  final double? latitude;
  final double? longitude;
  final List<ReportHistory> histories;

  FacilityReport({
    required this.id,
    required this.reportNumber,
    required this.title,
    required this.category,
    required this.location,
    required this.description,
    required this.photoUrl,
    required this.completionPhotoUrl,
    required this.reportPhotos,
    required this.completionPhotos,
    required this.status,
    required this.priority,
    required this.createdAt,
    required this.reporterSsoId,
    this.assignedTechnician,
    this.completedAt,
    this.rating,
    this.feedback,
    this.slaDeadline,
    this.isEscalationRequested = false,
    this.escalationReason,
    this.latitude,
    this.longitude,
    this.histories = const [],
  });

  /// Membuat FacilityReport dari JSON response backend Laravel
  factory FacilityReport.fromJson(Map<String, dynamic> json) {
    // Parse status dari string backend
    final statusStr = json['status'] as String? ?? 'menunggu';
    final status = _parseStatus(statusStr);

    // Parse foto berdasarkan tipe (bukti_laporan vs bukti_penyelesaian)
    String photoUrl = '';
    String completionPhotoUrl = '';
    List<String> reportPhotos = [];
    List<String> completionPhotos = [];

    if (json['photos'] != null && (json['photos'] as List).isNotEmpty) {
      final photos = json['photos'] as List;

      // Kumpulkan foto pelapor
      for (final p in photos) {
        if (p['type'] == 'bukti_laporan' && p['photo_data'] != null) {
          reportPhotos.add(p['photo_data'] as String);
        }
      }
      if (reportPhotos.isNotEmpty) {
        photoUrl = reportPhotos.first;
      }

      // Kumpulkan foto teknisi
      for (final p in photos) {
        if (p['type'] == 'bukti_penyelesaian' && p['photo_data'] != null) {
          completionPhotos.add(p['photo_data'] as String);
        }
      }
      if (completionPhotos.isNotEmpty) {
        completionPhotoUrl = completionPhotos.first;
      }

      // Fallback: jika photoUrl kosong tapi ada foto pertama, set ke yang pertama
      if (photoUrl.isEmpty && photos.isNotEmpty && photos[0]['photo_data'] != null) {
        photoUrl = photos[0]['photo_data'] as String;
      }
    }

    // Format tanggal
    String createdAt = '';
    if (json['created_at'] != null) {
      try {
        final dt = DateTime.parse(json['created_at'] as String);
        createdAt = DateFormat('dd MMM yyyy', 'id').format(dt);
      } catch (_) {
        createdAt = json['created_at'] as String;
      }
    }

    String? completedAt;
    if (json['closed_at'] != null) {
      try {
        final dt = DateTime.parse(json['closed_at'] as String);
        completedAt = DateFormat('dd MMM yyyy', 'id').format(dt);
      } catch (_) {
        completedAt = json['closed_at'] as String;
      }
    }

    // Nama teknisi dari relasi activeTechnicians
    String? assignedTechnician;
    try {
      if (json['active_technicians'] != null && (json['active_technicians'] as List).isNotEmpty) {
        assignedTechnician = json['active_technicians'][0]['name'] as String?;
      } else if (json['assignments'] != null && (json['assignments'] as List).isNotEmpty) {
        final assignment = json['assignments'][0];
        if (assignment['technician'] != null) {
          assignedTechnician = assignment['technician']['name'] as String?;
        }
      }
    } catch (e) {
      print('Error parsing technician: $e');
    }

    // Pelapor
    final reporterEmail = json['reporter']?['email'] as String? ??
        json['user']?['email'] as String? ??
        json['reporter_email'] as String? ??
        '';

    return FacilityReport(
      id: json['id'] as int,
      reportNumber: json['report_number'] as String? ?? '-',
      title: json['title'] as String? ?? '',
      category: json['category'] as String? ?? '',
      location: json['location'] as String? ?? '',
      description: json['description'] as String? ?? '',
      photoUrl: photoUrl,
      completionPhotoUrl: completionPhotoUrl,
      reportPhotos: reportPhotos,
      completionPhotos: completionPhotos,
      status: status,
      priority: json['priority'] as String? ?? 'belum_ditentukan',
      createdAt: createdAt,
      reporterSsoId: reporterEmail,
      assignedTechnician: assignedTechnician,
      completedAt: completedAt,
      rating: json['rating'] as int?,
      feedback: (json['feedback_text'] ?? json['feedback']) as String?,
      slaDeadline: json['sla_deadline'] as String?,
      isEscalationRequested: json['is_escalation_requested'] == true || json['is_escalation_requested'] == 1,
      escalationReason: json['escalation_reason'] as String?,
      latitude: json['latitude'] != null ? double.tryParse(json['latitude'].toString()) : null,
      longitude: json['longitude'] != null ? double.tryParse(json['longitude'].toString()) : null,
      histories: json['histories'] != null
          ? (json['histories'] as List)
              .map((h) => ReportHistory.fromJson(h as Map<String, dynamic>))
              .toList()
          : [],
    );
  }

  static ReportStatus _parseStatus(String s) {
    switch (s) {
      case 'ditugaskan':
        return ReportStatus.ditugaskan;
      case 'assessment':
        return ReportStatus.assessment;
      case 'dalam_proses':
        return ReportStatus.dalamProses;
      case 'selesai':
        return ReportStatus.selesai;
      case 'eskalasi':
        return ReportStatus.eskalasi;
      default:
        return ReportStatus.menunggu;
    }
  }

  /// Konversi enum ke string untuk dikirim ke backend
  String get statusString {
    switch (status) {
      case ReportStatus.menunggu:
        return 'menunggu';
      case ReportStatus.ditugaskan:
        return 'ditugaskan';
      case ReportStatus.assessment:
        return 'assessment';
      case ReportStatus.dalamProses:
        return 'dalam_proses';
      case ReportStatus.selesai:
        return 'selesai';
      case ReportStatus.eskalasi:
        return 'eskalasi';
    }
  }

  FacilityReport copyWith({
    ReportStatus? status,
    String? assignedTechnician,
    String? photoUrl,
    String? completionPhotoUrl,
    List<String>? reportPhotos,
    List<String>? completionPhotos,
    String? completedAt,
    int? rating,
    String? feedback,
    List<ReportHistory>? histories,
  }) {
    return FacilityReport(
      id: id,
      reportNumber: reportNumber,
      title: title,
      category: category,
      location: location,
      description: description,
      photoUrl: photoUrl ?? this.photoUrl,
      completionPhotoUrl: completionPhotoUrl ?? this.completionPhotoUrl,
      reportPhotos: reportPhotos ?? this.reportPhotos,
      completionPhotos: completionPhotos ?? this.completionPhotos,
      status: status ?? this.status,
      priority: priority,
      createdAt: createdAt,
      reporterSsoId: reporterSsoId,
      assignedTechnician: assignedTechnician ?? this.assignedTechnician,
      completedAt: completedAt ?? this.completedAt,
      rating: rating ?? this.rating,
      feedback: feedback ?? this.feedback,
      slaDeadline: slaDeadline,
      isEscalationRequested: isEscalationRequested,
      escalationReason: escalationReason,
      latitude: latitude,
      longitude: longitude,
      histories: histories ?? this.histories,
    );
  }
}

class AppNotification {
  final int id;
  final int? reportId;
  final String title;
  final String body;
  final String time;
  bool isRead;
  final String type;

  AppNotification({
    required this.id,
    this.reportId,
    required this.title,
    required this.body,
    required this.time,
    required this.isRead,
    required this.type,
  });

  factory AppNotification.fromJson(Map<String, dynamic> json) {
    String time = '';
    if (json['created_at'] != null) {
      try {
        final dt = DateTime.parse(json['created_at'] as String).toLocal();
        final diff = DateTime.now().difference(dt);
        if (diff.inMinutes < 60) {
          time = '${diff.inMinutes} menit lalu';
        } else if (diff.inHours < 24) {
          time = '${diff.inHours} jam lalu';
        } else {
          time = '${diff.inDays} hari lalu';
        }
      } catch (_) {
        time = json['created_at'] as String;
      }
    }

    return AppNotification(
      id: json['id'] as int,
      reportId: json['report_id'] as int?,
      title: json['title'] as String? ?? '',
      body: json['message'] as String? ?? '', // backend pakai 'message'
      time: time,
      isRead: json['is_read'] as bool? ?? false, // backend pakai 'is_read'
      type: json['type'] as String? ?? 'info',
    );
  }
}

class TechnicianPerformance {
  final int completedTasks;
  final String avgResolutionTime;
  final double rating;
  final List<Map<String, dynamic>> weeklyData;
  final int onTimeCount;
  final int lateCount;

  TechnicianPerformance({
    required this.completedTasks,
    required this.avgResolutionTime,
    required this.rating,
    required this.weeklyData,
    required this.onTimeCount,
    required this.lateCount,
  });
}

/// Label tampilan untuk setiap status laporan
String statusLabel(ReportStatus status) {
  switch (status) {
    case ReportStatus.menunggu:
      return 'Menunggu';
    case ReportStatus.ditugaskan:
      return 'Ditugaskan';
    case ReportStatus.assessment:
      return 'Assessment';
    case ReportStatus.dalamProses:
      return 'Dalam Proses';
    case ReportStatus.selesai:
      return 'Selesai';
    case ReportStatus.eskalasi:
      return 'Eskalasi';
  }
}

class ReportHistory {
  final int id;
  final String title;
  final String? description;
  final String createdAt;

  ReportHistory({
    required this.id,
    required this.title,
    this.description,
    required this.createdAt,
  });

  factory ReportHistory.fromJson(Map<String, dynamic> json) {
    return ReportHistory(
      id: json['id'] as int,
      title: json['title'] as String? ?? '',
      description: json['description'] as String?,
      createdAt: json['created_at'] as String? ?? '',
    );
  }
}
