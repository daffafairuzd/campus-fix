<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Report extends Model
{
    protected $fillable = [
        'report_number', 'title', 'description', 'category', 'location',
        'building', 'floor', 'status', 'priority',
        'latitude', 'longitude', 'reporter_id', 'sla_deadline',
        'escalated_at', 'closed_at', 'rating', 'feedback_text',
    ];

    protected function casts(): array
    {
        return [
            'sla_deadline'  => 'datetime',
            'escalated_at'  => 'datetime',
            'closed_at'     => 'datetime',
        ];
    }

    // --- Relationships ---
    public function reporter()
    {
        return $this->belongsTo(User::class, 'reporter_id');
    }

    public function assignments()
    {
        return $this->hasMany(ReportAssignment::class);
    }

    public function activeTechnicians()
    {
        return $this->belongsToMany(User::class, 'report_assignments', 'report_id', 'technician_id')
            ->wherePivot('is_active', true);
    }

    public function histories()
    {
        return $this->hasMany(ReportHistory::class)->orderBy('created_at', 'asc');
    }

    public function photos()
    {
        return $this->hasMany(ReportPhoto::class)->orderBy('created_at', 'asc');
    }

    public function slaConfig()
    {
        return $this->belongsTo(SlaConfig::class, 'priority', 'priority');
    }

    // --- SLA helpers ---
    public function isSlaExpired(): bool
    {
        return $this->sla_deadline && $this->sla_deadline->isPast() && $this->status !== 'selesai';
    }

    public function getSlaPercentageAttribute(): float
    {
        if (!$this->sla_deadline) return 0;
        $total = $this->sla_deadline->diffInSeconds($this->created_at);
        $passed = now()->diffInSeconds($this->created_at);
        return $total > 0 ? min(100, ($passed / $total) * 100) : 100;
    }

    protected static function booted(): void
    {
        static::creating(function (Report $report) {
            if (!$report->report_number) {
                $lastReport = static::orderBy('id', 'desc')->first();
                $nextId = $lastReport ? $lastReport->id + 1 : 1;
                $report->report_number = 'RPT-' . str_pad($nextId, 3, '0', STR_PAD_LEFT);
            }
        });
    }
}
