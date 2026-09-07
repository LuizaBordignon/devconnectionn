<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class EditHistory extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'user_id', 'historyable_type', 'historyable_id', 'previous_data', 'created_at',
    ];

    protected $casts = [
        'previous_data' => 'array',
        'created_at' => 'datetime',
    ];

    public function historyable(): MorphTo
    {
        return $this->morphTo();
    }
}