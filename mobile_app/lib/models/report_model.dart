import 'package:intl/intl.dart';

/// Status laporan — sesuai dengan backend Laravel
/// Backend values: 'menunggu', 'dalam_proses', 'selesai', 'eskalasi'
enum ReportStatus { menunggu, dalamProses, selesai, eskalasi }

class FacilityReport {
  final int id;
  final String reportNumber;
  final String title;
  final String category;
  final String location;
  final String description;
  final String photoUrl; // URL/base64 dari foto pertama (jika ada)
  final ReportStatus status;
  final String priority; // 'kritis', 'tinggi', 'sedang', 'rendah'
  final String createdAt; // formatted string
  final String? assignedTechnician;
  final String reporterSsoId; // email pelapor
  final String? completedAt;
  final int? rating;
  final String? feedback;
  final String? slaDeadline;

  FacilityReport({
    required this.id,
    required this.reportNumber,
    required this.title,
    required this.category,
    required this.location,
    required this.description,
    required this.photoUrl,
    required this.status,
    required this.priority,
    required this.createdAt,
    required this.reporterSsoId,
    this.assignedTechnician,
    this.completedAt,
    this.rating,
    this.feedback,
    this.slaDeadline,
  });

  /// Membuat FacilityReport dari JSON response backend Laravel
  factory FacilityReport.fromJson(Map<String, dynamic> json) {
    // Parse status dari string backend
    final statusStr = json['status'] as String? ?? 'menunggu';
    final status = _parseStatus(statusStr);

    // Parse foto pertama jika ada
    String photoUrl = '';
    if (json['photos'] != null && (json['photos'] as List).isNotEmpty) {
      final firstPhoto = json['photos'][0];
      if (firstPhoto['photo_data'] != null) {
        photoUrl = firstPhoto['photo_data'] as String; // base64
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

    // Nama teknisi dari relasi assignment
    String? assignedTechnician;
    if (json['assignments'] != null && (json['assignments'] as List).isNotEmpty) {
      final assignment = json['assignments'][0];
      if (assignment['technician'] != null &&
          assignment['technician']['user'] != null) {
        assignedTechnician =
            assignment['technician']['user']['name'] as String?;
      }
    }

    // Pelapor
    final reporterEmail = json['user']?['email'] as String? ??
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
      status: status,
      priority: json['priority'] as String? ?? 'rendah',
      createdAt: createdAt,
      reporterSsoId: reporterEmail,
      assignedTechnician: assignedTechnician,
      completedAt: completedAt,
      rating: json['rating'] as int?,
      feedback: json['feedback'] as String?,
      slaDeadline: json['sla_deadline'] as String?,
    );
  }

  static ReportStatus _parseStatus(String s) {
    switch (s) {
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
    String? completedAt,
    int? rating,
    String? feedback,
  }) {
    return FacilityReport(
      id: id,
      reportNumber: reportNumber,
      title: title,
      category: category,
      location: location,
      description: description,
      photoUrl: photoUrl ?? this.photoUrl,
      status: status ?? this.status,
      priority: priority,
      createdAt: createdAt,
      reporterSsoId: reporterSsoId,
      assignedTechnician: assignedTechnician ?? this.assignedTechnician,
      completedAt: completedAt ?? this.completedAt,
      rating: rating ?? this.rating,
      feedback: feedback ?? this.feedback,
      slaDeadline: slaDeadline,
    );
  }
}

class AppNotification {
  final int id;
  final String title;
  final String body;
  final String time;
  bool isRead;
  final String type;

  AppNotification({
    required this.id,
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
    case ReportStatus.dalamProses:
      return 'Dalam Proses';
    case ReportStatus.selesai:
      return 'Selesai';
    case ReportStatus.eskalasi:
      return 'Eskalasi';
  }
}
