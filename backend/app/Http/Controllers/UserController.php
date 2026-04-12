<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Technician;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::with('technician')
            ->when($request->role, fn($q) => $q->where('role', $request->role))
            ->when($request->search, fn($q) => $q->where(function($q2) use ($request) {
                $q2->where('name', 'ilike', "%{$request->search}%")
                   ->orWhere('email', 'ilike', "%{$request->search}%")
                   ->orWhere('nim', 'ilike', "%{$request->search}%");
            }));

        return response()->json($query->orderBy('name')->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'      => 'required|string|max:255',
            'email'     => 'required|email|unique:users,email',
            'role'      => 'required|in:admin,teknisi,pelapor',
            'nim'       => 'nullable|string',
            'phone'     => 'nullable|string',
            'specialty' => 'nullable|string', // untuk teknisi
        ]);

        // Generate password sementara
        $tempPassword = Str::random(10);

        $user = User::create([
            'name'                 => $request->name,
            'email'                => $request->email,
            'password'             => Hash::make($tempPassword),
            'role'                 => $request->role,
            'nim'                  => $request->nim,
            'phone'                => $request->phone,
            'status'               => 'aktif',
            'must_change_password' => true, // wajib ganti password saat first login
        ]);

        // Jika teknisi, buat entri di tabel technicians
        if ($user->role === 'teknisi') {
            Technician::create([
                'user_id'             => $user->id,
                'specialty'           => $request->specialty,
                'availability_status' => 'aktif',
                'max_capacity'        => 3,
            ]);
        }

        return response()->json([
            'user'          => $user->load('technician'),
            'temp_password' => $tempPassword, // hanya ditampilkan sekali ke admin
        ], 201);
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name'      => 'sometimes|string|max:255',
            'email'     => "sometimes|email|unique:users,email,{$user->id}",
            'nim'       => 'nullable|string',
            'phone'     => 'nullable|string',
            'status'    => 'sometimes|in:aktif,nonaktif',
            'availability_status' => 'sometimes|in:aktif,cuti',
        ]);

        // Safeguard: admin tidak bisa menonaktifkan diri sendiri
        if (isset($validated['status']) && $validated['status'] === 'nonaktif' && $user->id === $request->user()->id) {
            return response()->json(['message' => 'Anda tidak dapat menonaktifkan akun sendiri.'], 422);
        }

        $user->update($validated);

        // Update specialty/availability teknisi jika ada
        if ($user->technician) {
            $techData = [];
            if ($request->has('specialty')) $techData['specialty'] = $request->specialty;
            if ($request->has('availability_status')) $techData['availability_status'] = $request->availability_status;
            
            if (!empty($techData)) {
                $user->technician->update($techData);
            }
        }

        return response()->json($user->fresh()->load('technician'));
    }

    public function destroy(Request $request, User $user)
    {
        // Safeguard: tidak bisa hapus diri sendiri
        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'Anda tidak dapat menghapus akun sendiri.'], 422);
        }

        $user->delete();
        return response()->json(['message' => 'User berhasil dihapus.']);
    }
}
