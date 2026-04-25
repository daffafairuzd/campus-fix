enum ReportStatus { submitted, accepted, assigned, inProgress, completed }

class FacilityReport {
  final int id;
  final String reportNumber;
  final String title;
  final String category;
  final String location;
  final String description;
  final String photoUrl;
  final ReportStatus status;
  final int priorityScore;
  final String priority; // 'Tinggi', 'Sedang', 'Rendah'
  final String createdAt;
  final String? assignedTechnician;
  final String reporterSsoId;
  final String? completedAt;
  final int? rating;
  final String? feedback;

  FacilityReport({
    required this.id,
    required this.reportNumber,
    required this.title,
    required this.category,
    required this.location,
    required this.description,
    required this.photoUrl,
    required this.status,
    required this.priorityScore,
    required this.priority,
    required this.createdAt,
    required this.reporterSsoId,
    this.assignedTechnician,
    this.completedAt,
    this.rating,
    this.feedback,
  });

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
      priorityScore: priorityScore,
      priority: priority,
      createdAt: createdAt,
      reporterSsoId: reporterSsoId,
      assignedTechnician: assignedTechnician ?? this.assignedTechnician,
      completedAt: completedAt ?? this.completedAt,
      rating: rating ?? this.rating,
      feedback: feedback ?? this.feedback,
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

String statusLabel(ReportStatus status) {
  switch (status) {
    case ReportStatus.submitted:
      return 'Laporan Dikirim';
    case ReportStatus.accepted:
      return 'Diterima Admin';
    case ReportStatus.assigned:
      return 'Ditugaskan ke Teknisi';
    case ReportStatus.inProgress:
      return 'Sedang Ditangani';
    case ReportStatus.completed:
      return 'Selesai';
  }
}
