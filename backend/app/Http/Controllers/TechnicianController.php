<?php

namespace App\Http\Controllers;

use App\Models\Technician;
use App\Models\User;
use Illuminate\Http\Request;

class TechnicianController extends Controller
{
    public function index()
    {
        $technicians = Technician::with('user')->get()->map(function ($t) {
            $activeCount   = $t->active_count;
            $workloadStatus = $t->workload_status;

            return [
                'id'                  => $t->id,
                'user_id'             => $t->user_id,
                'name'                => $t->user->name,
                'email'               => $t->user->email,
                'avatar'              => strtoupper(substr($t->user->name, 0, 1) . (str_contains($t->user->name, ' ') ? substr(strrchr($t->user->name, ' '), 1, 1) : '')),
                'specialty'           => $t->specialty,
                'availability_status' => $t->availability_status,
                'workload_status'     => $workloadStatus,
                'active_count'        => $activeCount,
                'max_capacity'        => $t->max_capacity,
                'completed_count'     => $t->completed_count,
                'rating_avg'          => $t->rating_avg,
                'load_percentage'     => $t->max_capacity > 0 ? min(100, ($activeCount / $t->max_capacity) * 100) : 0,
            ];
        });

        return response()->json($technicians);
    }

    public function update(Request $request, Technician $technician)
    {
        $validated = $request->validate([
            'specialty'           => 'sometimes|string',
            'availability_status' => 'sometimes|in:aktif,cuti',
            'max_capacity'        => 'sometimes|integer|min:1|max:20',
        ]);

        $technician->update($validated);
        return response()->json($technician->fresh()->load('user'));
    }
}
