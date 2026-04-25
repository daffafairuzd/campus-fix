import '../models/user_model.dart';
import '../models/report_model.dart';

class _MockUser {
  final String ssoId;
  final String name;
  final String nim;
  final String password;
  final UserRole role;

  _MockUser({
    required this.ssoId,
    required this.name,
    required this.nim,
    required this.password,
    required this.role,
  });

  String get email => '$ssoId@student.telkomuniversity.ac.id';
}

class MockApiService {
  // ── Registered Users ──────────────────────────────────
  static final List<_MockUser> _users = [
    _MockUser(ssoId: 'asep321', name: 'Asep Mukti Ramadhan', nim: '103012300001', password: 'password', role: UserRole.pelapor),
    _MockUser(ssoId: 'budi123', name: 'Budi Santoso', nim: '103012300042', password: 'password', role: UserRole.pelapor),
    _MockUser(ssoId: 'teknisi01', name: 'Ahmad Teknisi', nim: '104012300001', password: 'password', role: UserRole.teknisi),
  ];

  // ── Reports ───────────────────────────────────────────
  static final List<FacilityReport> _reports = [
    FacilityReport(
      id: 1,
      reportNumber: 'RPT-2026-001',
      title: 'AC Lab Komputer Rusak',
      category: 'HVAC',
      location: 'Gedung TULT Lt. 7 — Lab IF',
      description:
          'AC tidak dingin sejak pagi dan ruangan terasa sangat panas. Sudah mengganggu kegiatan praktikum mahasiswa. Suhu ruangan mencapai 32°C.',
      photoUrl: '',
      status: ReportStatus.inProgress,
      priorityScore: 92,
      priority: 'Tinggi',
      createdAt: '2026-04-20',
      assignedTechnician: 'Ahmad Teknisi',
      reporterSsoId: 'asep321',
    ),
    FacilityReport(
      id: 2,
      reportNumber: 'RPT-2026-002',
      title: 'Lampu Koridor Mati',
      category: 'Listrik',
      location: 'Gedung F Lt. 2',
      description:
          'Beberapa lampu koridor mati sehingga kondisi gelap dan berbahaya bagi mahasiswa yang melintas di malam hari.',
      photoUrl: '',
      status: ReportStatus.assigned,
      priorityScore: 65,
      priority: 'Sedang',
      createdAt: '2026-04-21',
      assignedTechnician: 'Ahmad Teknisi',
      reporterSsoId: 'asep321',
    ),
    FacilityReport(
      id: 3,
      reportNumber: 'RPT-2026-003',
      title: 'Proyektor Kelas B-304 Tidak Menyala',
      category: 'Lab',
      location: 'Gedung B Lt. 3 — Kelas 304',
      description:
          'Proyektor tidak menyala sejak seminggu yang lalu. Dosen tidak bisa presentasi dan kegiatan perkuliahan terganggu.',
      photoUrl: '',
      status: ReportStatus.submitted,
      priorityScore: 78,
      priority: 'Tinggi',
      createdAt: '2026-04-22',
      reporterSsoId: 'asep321',
    ),
    FacilityReport(
      id: 4,
      reportNumber: 'RPT-2026-004',
      title: 'Jaringan WiFi Lemah di Perpustakaan',
      category: 'Jaringan',
      location: 'Perpustakaan Lt. 2',
      description:
          'Sinyal WiFi sangat lemah bahkan tidak ada di area pojok perpustakaan. Mahasiswa tidak bisa mengakses e-learning.',
      photoUrl: '',
      status: ReportStatus.accepted,
      priorityScore: 55,
      priority: 'Sedang',
      createdAt: '2026-04-23',
      reporterSsoId: 'budi123',
    ),
    FacilityReport(
      id: 5,
      reportNumber: 'RPT-2026-005',
      title: 'Toilet Lt. 3 Bocor',
      category: 'Lainnya',
      location: 'Gedung TULT Lt. 3 — Toilet Pria',
      description:
          'Pipa toilet bocor dan air menggenang di lantai menyebabkan area licin dan berbahaya.',
      photoUrl: '',
      status: ReportStatus.completed,
      priorityScore: 88,
      priority: 'Tinggi',
      createdAt: '2026-04-18',
      assignedTechnician: 'Ahmad Teknisi',
      reporterSsoId: 'asep321',
      completedAt: '2026-04-19',
      rating: 5,
      feedback: 'Penanganan cepat dan bersih. Teknisi sangat profesional!',
    ),
    FacilityReport(
      id: 6,
      reportNumber: 'RPT-2026-006',
      title: 'Pintu Kelas E-201 Rusak',
      category: 'Lainnya',
      location: 'Gedung E Lt. 2 — Kelas 201',
      description:
          'Engsel pintu rusak sehingga pintu tidak bisa menutup dengan benar. Mengganggu konsentrasi belajar.',
      photoUrl: '',
      status: ReportStatus.inProgress,
      priorityScore: 45,
      priority: 'Rendah',
      createdAt: '2026-04-24',
      assignedTechnician: 'Ahmad Teknisi',
      reporterSsoId: 'budi123',
    ),
  ];

  // ── Notifications ──────────────────────────────────────
  static final List<AppNotification> _notifications = [
    AppNotification(
      id: 1,
      title: 'Status Laporan Diperbarui',
      body: 'Laporan "AC Lab Komputer Rusak" sedang dalam penanganan teknisi.',
      time: '2 menit lalu',
      isRead: false,
      type: 'status_update',
    ),
    AppNotification(
      id: 2,
      title: 'Teknisi Ditugaskan',
      body: 'Ahmad Teknisi telah ditugaskan untuk laporan "Lampu Koridor Mati".',
      time: '1 jam lalu',
      isRead: false,
      type: 'assignment',
    ),
    AppNotification(
      id: 3,
      title: 'Laporan Diterima Admin',
      body: 'Laporan "Proyektor Kelas B-304" telah diterima dan akan segera diproses.',
      time: '3 jam lalu',
      isRead: true,
      type: 'accepted',
    ),
    AppNotification(
      id: 4,
      title: 'Penugasan Baru! 🔔',
      body: 'Kamu mendapat tugas baru: "AC Lab Komputer Rusak" — Prioritas Tinggi (Skor: 92).',
      time: '2 jam lalu',
      isRead: false,
      type: 'new_task',
    ),
    AppNotification(
      id: 5,
      title: 'Laporan Selesai',
      body: 'Laporan "Toilet Lt. 3 Bocor" telah ditandai selesai oleh teknisi.',
      time: '1 hari lalu',
      isRead: true,
      type: 'completed',
    ),
  ];

  // ── Auth ──────────────────────────────────────────────
  Future<UserSession> login({
    required String ssoId,
    required String password,
    required UserRole role,
  }) async {
    await Future.delayed(const Duration(milliseconds: 800));
    final matches = _users.where(
      (u) => u.ssoId == ssoId && u.password == password,
    );
    if (matches.isEmpty) {
      throw Exception('SSO ID atau password salah.');
    }
    final user = matches.first;
    return UserSession(
      name: user.name,
      ssoId: user.ssoId,
      nim: user.nim,
      email: user.email,
      role: role,
      token: 'mock-token-${DateTime.now().millisecondsSinceEpoch}',
    );
  }

  Future<void> register({
    required String ssoId,
    required String name,
    required String nim,
    required String password,
    required UserRole role,
  }) async {
    await Future.delayed(const Duration(milliseconds: 800));
    if (_users.any((u) => u.ssoId == ssoId)) {
      throw Exception('SSO ID "$ssoId" sudah terdaftar.');
    }
    _users.add(_MockUser(
      ssoId: ssoId,
      name: name,
      nim: nim,
      password: password,
      role: role,
    ));
  }

  // ── Reports ───────────────────────────────────────────
  Future<List<FacilityReport>> getMyReports(String ssoId) async {
    await Future.delayed(const Duration(milliseconds: 400));
    return _reports.where((r) => r.reporterSsoId == ssoId).toList()
      ..sort((a, b) => b.createdAt.compareTo(a.createdAt));
  }

  Future<List<FacilityReport>> getTeknisiTasks() async {
    await Future.delayed(const Duration(milliseconds: 400));
    return _reports
        .where((r) =>
            r.assignedTechnician != null && r.status != ReportStatus.completed)
        .toList()
      ..sort((a, b) => b.priorityScore.compareTo(a.priorityScore));
  }

  Future<List<FacilityReport>> getAllReports() async {
    await Future.delayed(const Duration(milliseconds: 400));
    return List.from(_reports)
      ..sort((a, b) => b.priorityScore.compareTo(a.priorityScore));
  }

  Future<void> createReport({
    required String reporterSsoId,
    required String title,
    required String category,
    required String location,
    required String description,
    String photoUrl = '',
  }) async {
    await Future.delayed(const Duration(milliseconds: 600));
    final id = _reports.length + 1;
    final number = 'RPT-2026-${id.toString().padLeft(3, '0')}';
    int score = 50;
    if (category == 'HVAC' || category == 'Listrik') score = 75;
    if (category == 'Lab') score = 70;
    final priority = score >= 80
        ? 'Tinggi'
        : score >= 50
            ? 'Sedang'
            : 'Rendah';
    _reports.insert(
      0,
      FacilityReport(
        id: id,
        reportNumber: number,
        title: title,
        category: category,
        location: location,
        description: description,
        photoUrl: photoUrl,
        status: ReportStatus.submitted,
        priorityScore: score,
        priority: priority,
        createdAt: DateTime.now().toString().substring(0, 10),
        reporterSsoId: reporterSsoId,
      ),
    );
  }

  Future<void> updateStatus(int reportId, ReportStatus newStatus) async {
    await Future.delayed(const Duration(milliseconds: 400));
    final i = _reports.indexWhere((r) => r.id == reportId);
    if (i != -1) {
      _reports[i] = _reports[i].copyWith(
        status: newStatus,
        completedAt: newStatus == ReportStatus.completed
            ? DateTime.now().toString().substring(0, 10)
            : null,
      );
    }
  }

  Future<void> updateBuktiFoto(int reportId, String photoUrl) async {
    await Future.delayed(const Duration(milliseconds: 300));
    final i = _reports.indexWhere((r) => r.id == reportId);
    if (i != -1) {
      _reports[i] = _reports[i].copyWith(photoUrl: photoUrl);
    }
  }

  Future<void> submitRating(int reportId, int rating, String feedback) async {
    await Future.delayed(const Duration(milliseconds: 400));
    final i = _reports.indexWhere((r) => r.id == reportId);
    if (i != -1) {
      _reports[i] = _reports[i].copyWith(rating: rating, feedback: feedback);
    }
  }

  // ── Notifications ──────────────────────────────────────
  Future<List<AppNotification>> getNotifications() async {
    await Future.delayed(const Duration(milliseconds: 300));
    return List.from(_notifications);
  }

  Future<void> markAllRead() async {
    await Future.delayed(const Duration(milliseconds: 200));
    for (final n in _notifications) {
      n.isRead = true;
    }
  }

  int get unreadCount => _notifications.where((n) => !n.isRead).length;

  // ── Performance ────────────────────────────────────────
  Future<TechnicianPerformance> getPerformance() async {
    await Future.delayed(const Duration(milliseconds: 400));
    return TechnicianPerformance(
      completedTasks: 23,
      avgResolutionTime: '2.8 jam',
      rating: 4.8,
      onTimeCount: 20,
      lateCount: 3,
      weeklyData: [
        {'day': 'Sen', 'selesai': 3},
        {'day': 'Sel', 'selesai': 5},
        {'day': 'Rab', 'selesai': 2},
        {'day': 'Kam', 'selesai': 6},
        {'day': 'Jum', 'selesai': 4},
        {'day': 'Sab', 'selesai': 3},
        {'day': 'Min', 'selesai': 0},
      ],
    );
  }
}

final api = MockApiService();
