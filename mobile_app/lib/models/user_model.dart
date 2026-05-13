enum UserRole { pelapor, teknisi }

class UserSession {
  final int id; // ID dari backend (integer)
  final String name;
  final String ssoId; // prefix email (sebelum @)
  final String nim;
  final String email;
  final UserRole role;
  final String token;

  UserSession({
    required this.id,
    required this.name,
    required this.ssoId,
    required this.nim,
    required this.email,
    required this.role,
    required this.token,
  });

  /// Membuat UserSession dari response JSON login backend
  factory UserSession.fromJson(Map<String, dynamic> json, String token) {
    final email = json['email'] as String? ?? '';
    // Derive ssoId dari email (ambil bagian sebelum @)
    final ssoId = email.contains('@') ? email.split('@').first : email;

    // Parse role dari string backend
    final roleStr = json['role'] as String? ?? 'pelapor';
    final role = roleStr == 'teknisi' ? UserRole.teknisi : UserRole.pelapor;

    return UserSession(
      id: json['id'] as int? ?? 0,
      name: json['name'] as String? ?? '',
      ssoId: ssoId,
      nim: json['nim'] as String? ?? '',
      email: email,
      role: role,
      token: token,
    );
  }

  String get initials {
    final parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    }
    return name.isNotEmpty ? name[0].toUpperCase() : 'U';
  }
}
