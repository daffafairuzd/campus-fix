<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Mail\OtpMail;
use App\Models\PasswordResetOtp;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Login — semua role
     */
    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Email atau password salah.'],
            ]);
        }

        if ($user->status === 'nonaktif') {
            return response()->json(['message' => 'Akun Anda telah dinonaktifkan.'], 403);
        }

        $token = $user->createToken('campusfix-token')->plainTextToken;

        return response()->json([
            'user'               => $this->formatUser($user),
            'token'              => $token,
            'must_change_password' => $user->must_change_password,
        ]);
    }

    /**
     * Register — hanya untuk pelapor, role di-hardcode
     */
    public function register(Request $request)
    {
        $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => ['required','email','unique:users,email',
                          // Validasi domain email kampus
                          function($attr, $val, $fail) {
                              $allowed = ['telkomuniversity.ac.id', 'student.telkomuniversity.ac.id'];
                              $domain  = substr(strrchr($val, '@'), 1);
                              if (!in_array($domain, $allowed)) {
                                  $fail('Email harus menggunakan domain Telkom University.');
                              }
                          }],
            'password' => 'required|string|min:8|confirmed',
            'nim'      => 'nullable|string',
        ]);

        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'role'     => 'pelapor', // hardcoded — tidak bisa diubah dari request
            'nim'      => $request->nim,
            'status'   => 'aktif',
        ]);

        $token = $user->createToken('campusfix-token')->plainTextToken;

        return response()->json([
            'user'  => $this->formatUser($user),
            'token' => $token,
        ], 201);
    }

    /**
     * Logout — hapus token saat ini
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully.']);
    }

    /**
     * Data user yang sedang login
     */
    public function me(Request $request)
    {
        $user = $request->user()->load('technician');
        return response()->json($this->formatUser($user));
    }

    /**
     * Change password — untuk first login teknisi/admin
     */
    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required|string',
            'password'         => 'required|string|min:8|confirmed',
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Password lama tidak sesuai.'],
            ]);
        }

        $user->update([
            'password'             => Hash::make($request->password),
            'must_change_password' => false,
        ]);

        return response()->json(['message' => 'Password berhasil diubah.']);
    }

    // ── Forgot Password (OTP Flow) ────────────────────────────────────────────

    /**
     * Step 1: Kirim OTP ke email
     */
    public function sendOtp(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $user = User::where('email', $request->email)->first();

        // Selalu kembalikan sukses agar tidak bocorkan info user mana yang terdaftar
        if (!$user) {
            return response()->json(['message' => 'Jika email terdaftar, kode OTP akan dikirim.']);
        }

        // Invalidate OTP lama
        PasswordResetOtp::where('email', $request->email)->update(['used' => true]);

        // Buat OTP 6 digit
        $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        PasswordResetOtp::create([
            'email'      => $request->email,
            'otp'        => $otp,
            'used'       => false,
            'expires_at' => Carbon::now()->addMinutes(10),
        ]);

        // Kirim email
        Mail::to($user->email)->send(new OtpMail($otp, $user->name));

        return response()->json(['message' => 'Kode OTP telah dikirim ke email Anda.']);
    }

    /**
     * Step 2: Verifikasi OTP
     */
    public function verifyOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'otp'   => 'required|string|size:6',
        ]);

        $record = PasswordResetOtp::where('email', $request->email)
            ->where('otp', $request->otp)
            ->where('used', false)
            ->latest()
            ->first();

        if (!$record || $record->isExpired()) {
            return response()->json(['message' => 'Kode OTP tidak valid atau sudah kadaluarsa.'], 422);
        }

        return response()->json(['message' => 'OTP valid.', 'verified' => true]);
    }

    /**
     * Step 3: Reset password setelah OTP terverifikasi
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'email'                 => 'required|email',
            'otp'                   => 'required|string|size:6',
            'password'              => 'required|string|min:8|confirmed',
        ]);

        $record = PasswordResetOtp::where('email', $request->email)
            ->where('otp', $request->otp)
            ->where('used', false)
            ->latest()
            ->first();

        if (!$record || $record->isExpired()) {
            return response()->json(['message' => 'Kode OTP tidak valid atau sudah kadaluarsa.'], 422);
        }

        $user = User::where('email', $request->email)->first();
        if (!$user) {
            return response()->json(['message' => 'User tidak ditemukan.'], 404);
        }

        $user->update([
            'password'             => Hash::make($request->password),
            'must_change_password' => false,
        ]);

        // Tandai OTP sudah dipakai
        $record->update(['used' => true]);

        return response()->json(['message' => 'Password berhasil direset. Silakan login dengan password baru.']);
    }

    private function formatUser(User $user): array
    {
        return [
            'id'                   => $user->id,
            'name'                 => $user->name,
            'email'                => $user->email,
            'role'                 => $user->role,
            'nim'                  => $user->nim,
            'phone'                => $user->phone,
            'status'               => $user->status,
            'must_change_password' => $user->must_change_password,
            'technician'           => $user->technician,
        ];
    }
}
