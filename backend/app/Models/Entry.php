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

    protected $appends = ['status']; 

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

    public function liquidar(float $valorPago): void
{
    if ($this->paid_at !== null) {
        throw new \DomainException('Este lançamento já foi liquidado.');
    }

    $this->update([
        'paid_at' => now(),
        'paid_amount' => $valorPago,
    ]);
}

public static function resumoDoPeriodo($entries): array
{
    $aPagar = 0; $aReceber = 0; $liquidado = 0; $vencido = 0;

    foreach ($entries as $entry) {
        if ($entry->status === 'quitada') {
            $liquidado += $entry->paid_amount;
            continue;
        }

        if ($entry->type === 'pagar') {
            $aPagar += $entry->amount;
        } else {
            $aReceber += $entry->amount;
        }

        if ($entry->status === 'atrasada') {
            $vencido += $entry->amount;
        }
    }

    return [
        'a_pagar' => round($aPagar, 2),
        'a_receber' => round($aReceber, 2),
        'liquidado' => round($liquidado, 2),
        'vencido' => round($vencido, 2),
    ];
}


}