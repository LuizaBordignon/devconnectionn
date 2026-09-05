<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Entry extends Model
{
    protected $fillable = [
        'user_id',
        'contact_id',
        'type',
        'description',
        'amount',
        'due_date',
        'paid_at',
        'paid_amount',
    ];

    protected $casts = [
        'due_date'    => 'date',
        'paid_at'     => 'datetime',
        'amount'      => 'decimal:2',
        'paid_amount' => 'decimal:2',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function contact(): BelongsTo
    {
        return $this->belongsTo(Contact::class);
    }

    public function getStatusAttribute(): string
    {
        if ($this->paid_at !== null) {
            return 'quitada';
        }

        if ($this->due_date->isPast()) {
            return 'atrasada';
        }

        return 'aberta';
    }
}