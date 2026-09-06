<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Contact extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'type',
        'email',
        'phone',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function entries(): HasMany // o método entries() define um relacionamento de um para muitos entre o modelo Contact e o modelo Entry. Isso significa que um contato pode ter várias entradas associadas a ele. O método retorna uma instância de HasMany, que é usada pelo Eloquent para recuperar as entradas relacionadas a um contato específico.
    {
        return $this->hasMany(Entry::class);
    }
}