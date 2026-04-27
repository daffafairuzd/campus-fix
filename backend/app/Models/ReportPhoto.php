<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReportPhoto extends Model
{
    protected $fillable = [
        'report_id',
        'uploader_id',
        'photo_data',
        'original_name',
        'mime_type',
        'type',
    ];

    public function report()
    {
        return $this->belongsTo(Report::class);
    }

    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploader_id');
    }
}
