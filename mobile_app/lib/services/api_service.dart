import 'dart:convert';
import 'dart:io' show Platform, File;
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user_model.dart';
import '../models/report_model.dart';

/// Base URL backend Laravel — otomatis menyesuaikan platform:
/// - Web / Windows desktop → localhost:8000
/// - Android Emulator      → 10.0.2.2:8000
/// - Device fisik (iOS/Android) → ganti dengan IP lokal PC kamu
String get _baseUrl {
  // Alamat IP lokal laptop agar bisa diakses dari HP fisik (satu jaringan Wi-Fi)
  const String localIp = '10.33.187.26';

  if (kIsWeb) return 'http://localhost:8000/api';
  if (Platform.isAndroid || Platform.isIOS) return 'http://$localIp:8000/api';
  return 'http://localhost:8000/api';
}

class ApiService {
  // ── SharedPreferences Keys ──────────────────────────────
  static const _keyToken = 'auth_token';
  static const _keyUserId = 'auth_user_id';
  static const _keyUserName = 'auth_user_name';
  static const _keyUserEmail = 'auth_user_email';
  static const _keyUserNim = 'auth_user_nim';
  static const _keyUserRole = 'auth_user_role';

  // ── Singleton ────────────────────────────────────────────
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  ApiService._internal();

  String? _token;
  int _unreadCount = 0;

  int get unreadCount => _unreadCount;

  // ── Helpers ─────────────────────────────────────────────
  Map<String, String> get _headers => {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        if (_token != null) 'Authorization': 'Bearer $_token',
      };

  Uri _uri(String path) => Uri.parse('$_baseUrl$path');

  /// Throw exception dengan pesan yang readable
  void _handleError(http.Response res) {
    try {
      final body = jsonDecode(res.body) as Map<String, dynamic>;
      final message = body['message'] as String? ??
          body['error'] as String? ??
          'Terjadi kesalahan (${res.statusCode})';

      // Handle validation errors (422)
      if (res.statusCode == 422 && body['errors'] != null) {
        final errors = body['errors'] as Map<String, dynamic>;
        final firstError = errors.values.first;
        final errMsg = firstError is List ? firstError.first : firstError;
        throw Exception(errMsg.toString());
      }

      throw Exception(message);
    } catch (e) {
      if (e is Exception) rethrow;
      throw Exception('Terjadi kesalahan (${res.statusCode})');
    }
  }

  // ── Token Persistence ───────────────────────────────────
  Future<void> _saveSession(UserSession session) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_keyToken, session.token);
    await prefs.setInt(_keyUserId, session.id);
    await prefs.setString(_keyUserName, session.name);
    await prefs.setString(_keyUserEmail, session.email);
    await prefs.setString(_keyUserNim, session.nim);
    await prefs.setString(_keyUserRole, session.role.name);
    _token = session.token;
  }

  Future<UserSession?> getSavedSession() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString(_keyToken);
    if (token == null || token.isEmpty) return null;
    _token = token;

    final roleStr = prefs.getString(_keyUserRole) ?? 'pelapor';
    final email = prefs.getString(_keyUserEmail) ?? '';
    final ssoId = email.contains('@') ? email.split('@').first : email;

    return UserSession(
      id: prefs.getInt(_keyUserId) ?? 0,
      name: prefs.getString(_keyUserName) ?? '',
      ssoId: ssoId,
      nim: prefs.getString(_keyUserNim) ?? '',
      email: email,
      role: roleStr == 'teknisi' ? UserRole.teknisi : UserRole.pelapor,
      token: token,
    );
  }

  Future<void> clearSession() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();
    _token = null;
  }

  // ── AUTH ─────────────────────────────────────────────────

  /// Login menggunakan SSO ID (akan dikonversi ke email @student.telkomuniversity.ac.id)
  Future<UserSession> login({
    required String ssoId,
    required String password,
  }) async {
    // Konversi SSO ID ke format email
    final email = ssoId.contains('@')
        ? ssoId
        : '$ssoId@student.telkomuniversity.ac.id';

    final res = await http.post(
      _uri('/auth/login'),
      headers: _headers,
      body: jsonEncode({'email': email, 'password': password}),
    );

    if (res.statusCode == 200) {
      final body = jsonDecode(res.body) as Map<String, dynamic>;
      final token = body['token'] as String;
      final userJson = body['user'] as Map<String, dynamic>;
      final session = UserSession.fromJson(userJson, token);
      await _saveSession(session);
      return session;
    }
    _handleError(res);
    throw Exception('Login gagal');
  }

  Future<void> changePassword({
    required String currentPassword,
    required String newPassword,
    required String confirmPassword,
  }) async {
    final res = await http.post(
      _uri('/auth/change-password'),
      headers: _headers,
      body: jsonEncode({
        'current_password': currentPassword,
        'password': newPassword,
        'password_confirmation': confirmPassword,
      }),
    );

    if (res.statusCode != 200) {
      _handleError(res);
    }
  }

  /// Register — hanya untuk pelapor (backend hardcode role 'pelapor')
  Future<void> register({
    required String ssoId,
    required String name,
    required String nim,
    required String password,
    required String passwordConfirmation,
  }) async {
    final email = ssoId.contains('@')
        ? ssoId
        : '$ssoId@student.telkomuniversity.ac.id';

    final res = await http.post(
      _uri('/auth/register'),
      headers: _headers,
      body: jsonEncode({
        'name': name,
        'email': email,
        'nim': nim,
        'password': password,
        'password_confirmation': passwordConfirmation,
      }),
    );

    if (res.statusCode == 201 || res.statusCode == 200) return;
    _handleError(res);
  }

  /// Logout — hapus token dari backend & local
  Future<void> logout() async {
    try {
      await http.post(_uri('/auth/logout'), headers: _headers);
    } catch (_) {
      // Ignore network errors saat logout
    }
    await clearSession();
  }



  // ── FORGOT PASSWORD (OTP Flow) ────────────────────────────

  /// Step 1: Kirim OTP ke email
  Future<void> sendForgotPasswordOtp({required String email}) async {
    final res = await http.post(
      _uri('/auth/forgot-password/send-otp'),
      headers: _headers,
      body: jsonEncode({'email': email}),
    );
    if (res.statusCode == 200) return;
    _handleError(res);
  }

  /// Step 2: Verifikasi OTP
  Future<void> verifyForgotPasswordOtp({
    required String email,
    required String otp,
  }) async {
    final res = await http.post(
      _uri('/auth/forgot-password/verify-otp'),
      headers: _headers,
      body: jsonEncode({'email': email, 'otp': otp}),
    );
    if (res.statusCode == 200) return;
    _handleError(res);
  }

  /// Step 3: Reset password dengan OTP yang sudah terverifikasi
  Future<void> resetPassword({
    required String email,
    required String otp,
    required String password,
    required String passwordConfirmation,
  }) async {
    final res = await http.post(
      _uri('/auth/forgot-password/reset'),
      headers: _headers,
      body: jsonEncode({
        'email': email,
        'otp': otp,
        'password': password,
        'password_confirmation': passwordConfirmation,
      }),
    );
    if (res.statusCode == 200) return;
    _handleError(res);
  }

  // ── REPORTS ──────────────────────────────────────────────

  /// Laporan milik user yang sedang login (pelapor)
  Future<List<FacilityReport>> getMyReports() async {
    final res = await http.get(_uri('/reports'), headers: _headers);

    if (res.statusCode == 200) {
      final body = jsonDecode(res.body);
      List<dynamic> data;
      if (body is List) {
        data = body;
      } else if (body is Map && body['data'] != null) {
        data = body['data'] as List<dynamic>;
      } else {
        return [];
      }
      return data
          .map((e) => FacilityReport.fromJson(e as Map<String, dynamic>))
          .toList();
    }
    _handleError(res);
    return [];
  }

  /// Ambil detail lengkap satu laporan (termasuk foto & history detail)
  Future<FacilityReport> getReport(int id) async {
    final res = await http.get(_uri('/reports/$id'), headers: _headers);

    if (res.statusCode == 200) {
      return FacilityReport.fromJson(jsonDecode(res.body));
    }
    _handleError(res);
    throw Exception('Gagal memuat detail laporan');
  }

  /// Laporan yang di-assign ke teknisi yang sedang login
  Future<List<FacilityReport>> getTeknisiTasks() async {
    final res = await http.get(
      _uri('/reports?assigned_to_me=1'),
      headers: _headers,
    );

    if (res.statusCode == 200) {
      final body = jsonDecode(res.body);
      List<dynamic> data;
      if (body is List) {
        data = body;
      } else if (body is Map && body['data'] != null) {
        data = body['data'] as List<dynamic>;
      } else {
        return [];
      }
      final reports = data
          .map((e) => FacilityReport.fromJson(e as Map<String, dynamic>))
          .toList();
      // Filter hanya yang masih aktif (bukan selesai)
      return reports
          .where((r) => r.status != ReportStatus.selesai)
          .toList();
    }
    _handleError(res);
    return [];
  }

  /// Buat laporan baru (tanpa foto — foto diupload terpisah)
  Future<int> createReport({
    required String title,
    required String category,
    required String location,
    required String description,
    double? latitude,
    double? longitude,
  }) async {
    final res = await http.post(
      _uri('/reports'),
      headers: _headers,
      body: jsonEncode({
        'title': title,
        'description': description,
        'category': category,
        'location': location,

        'latitude': latitude,
        'longitude': longitude,
      }),
    );

    if (res.statusCode == 201 || res.statusCode == 200) {
      final body = jsonDecode(res.body) as Map<String, dynamic>;
      // Return report id untuk upload foto
      final rawId = body['id'] ?? body['report']?['id'];
      return int.tryParse(rawId?.toString() ?? '0') ?? 0;
    }
    _handleError(res);
    return 0;
  }

  /// Upload foto laporan dalam format base64
  Future<void> uploadPhoto(int reportId, File imageFile, {String type = 'bukti_laporan'}) async {
    final bytes = await imageFile.readAsBytes();
    final base64Str = base64Encode(bytes);
    // Tentukan mime type berdasarkan ekstensi
    final ext = imageFile.path.split('.').last.toLowerCase();
    final mime = ext == 'png' ? 'image/png' : 'image/jpeg';

    final res = await http.post(
      _uri('/reports/$reportId/photos'),
      headers: _headers,
      body: jsonEncode({
        'photo_data': base64Str,
        'mime_type': mime,
        'original_name': imageFile.path.split('/').last,
        'type': type,
      }),
    );

    if (res.statusCode == 201 || res.statusCode == 200) return;
    _handleError(res);
  }

  /// Update status laporan (oleh teknisi)
  Future<void> updateStatus(int reportId, ReportStatus newStatus, {String? description}) async {
    String statusStr;
    switch (newStatus) {
      case ReportStatus.assessment:
        statusStr = 'assessment';
        break;
      case ReportStatus.dalamProses:
        statusStr = 'dalam_proses';
        break;
      case ReportStatus.selesai:
        statusStr = 'selesai';
        break;
      case ReportStatus.eskalasi:
        statusStr = 'eskalasi';
        break;
      default:
        statusStr = 'menunggu';
    }

    final body = {'status': statusStr};
    if (description != null && description.isNotEmpty) {
      body['description'] = description;
    }

    final res = await http.post(
      _uri('/reports/$reportId/status'),
      headers: _headers,
      body: jsonEncode(body),
    );

    if (res.statusCode == 200) return;
    _handleError(res);
  }

  /// Request escalation
  Future<void> requestEscalation(int reportId, String reason) async {
    final res = await http.post(
      _uri('/reports/$reportId/request-escalation'),
      headers: _headers,
      body: jsonEncode({'reason': reason}),
    );

    if (res.statusCode == 200) return;
    _handleError(res);
  }

  /// Submit rating & feedback (oleh pelapor setelah laporan selesai)
  Future<void> submitRating(int reportId, int rating, String feedback) async {
    final res = await http.post(
      _uri('/reports/$reportId/rate'),
      headers: _headers,
      body: jsonEncode({'rating': rating, 'feedback': feedback}),
    );

    if (res.statusCode == 200) return;
    _handleError(res);
  }

  // ── NOTIFICATIONS ────────────────────────────────────────

  Future<List<AppNotification>> getNotifications() async {
    final res = await http.get(_uri('/notifications'), headers: _headers);

    if (res.statusCode == 200) {
      final body = jsonDecode(res.body) as Map<String, dynamic>;
      final notifList = body['notifications'] as List<dynamic>? ?? [];
      _unreadCount = body['unread_count'] as int? ?? 0;
      return notifList
          .map((e) => AppNotification.fromJson(e as Map<String, dynamic>))
          .toList();
    }
    _handleError(res);
    return [];
  }

  Future<void> markAllRead() async {
    final res = await http.post(_uri('/notifications/read-all'), headers: _headers);
    if (res.statusCode == 200) {
      _unreadCount = 0;
      return;
    }
    _handleError(res);
  }

  Future<void> markRead(int notificationId) async {
    final res = await http.patch(_uri('/notifications/$notificationId/read'), headers: _headers);
    if (res.statusCode == 200) {
      if (_unreadCount > 0) _unreadCount--;
      return;
    }
    _handleError(res);
  }

  // ── PERFORMANCE (Teknisi) ────────────────────────────────

  Future<TechnicianPerformance> getPerformance() async {
    final res = await http.get(_uri('/technicians/my-performance'), headers: _headers);
    
    if (res.statusCode == 200) {
      final data = jsonDecode(res.body);
      
      final weeklyDataRaw = data['weekly_data'] as List<dynamic>? ?? [];
      final weeklyData = weeklyDataRaw.map((e) => {
        'day': e['day'] as String? ?? '',
        'selesai': e['selesai'] as int? ?? 0,
      }).toList();

      return TechnicianPerformance(
        completedTasks: data['completed_count'] as int? ?? 0,
        avgResolutionTime: data['avg_resolution'] as String? ?? '-',
        rating: (data['rating_avg'] as num?)?.toDouble() ?? 0.0,
        onTimeCount: data['on_time_count'] as int? ?? 0,
        lateCount: data['late_count'] as int? ?? 0,
        weeklyData: weeklyData,
      );
    }
    
    _handleError(res);
    return TechnicianPerformance(
      completedTasks: 0,
      avgResolutionTime: '-',
      rating: 0.0,
      onTimeCount: 0,
      lateCount: 0,
      weeklyData: [],
    );
  }
}
/// Global singleton instance — menggantikan `api` dari mock
final api = ApiService();
