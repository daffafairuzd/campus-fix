enum UserRole { pelapor, teknisi }

class UserSession {
  final String name;
  final String ssoId;
  final String nim;
  final String email;
  final UserRole role;
  final String token;

  UserSession({
    required this.name,
    required this.ssoId,
    required this.nim,
    required this.email,
    required this.role,
    required this.token,
  });

  String get initials {
    final parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    }
    return name.isNotEmpty ? name[0].toUpperCase() : 'U';
  }
}
