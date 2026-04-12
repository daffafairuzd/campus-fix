<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Technician extends Model
{
    protected $fillable = [
        'user_id', 'specialty', 'availability_status', 'max_capacity',
        'completed_count', 'rating_avg',
    ];

    protected function casts(): array
    {
        return ['rating_avg' => 'float'];
    }

    // --- Relationships ---
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function activeAssignments()
    {
        return $this->hasMany(ReportAssignment::class, 'technician_id', 'user_id')
            ->where('is_active', true)
            ->whereHas('report', fn($q) => $q->whereNotIn('status', ['selesai']));
    }

    // --- Computed workload status ---
    public function getWorkloadStatusAttribute(): string
    {
        if ($this->availability_status === 'cuti') return 'Cuti';
        $activeCount = $this->activeAssignments()->count();
        return $activeCount >= $this->max_capacity ? 'Sibuk' : 'Tersedia';
    }

    public function getActiveCountAttribute(): int
    {
        return $this->activeAssignments()->count();
    }
}
