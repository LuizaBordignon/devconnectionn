<?php

namespace App\Traits;

use App\Models\EditHistory;
use Illuminate\Database\Eloquent\Relations\MorphMany;

trait HasEditHistory
{
    public static function bootHasEditHistory(): void
    {
        static::updating(function ($model) {
            EditHistory::create([
                'user_id' => $model->user_id,
                'historyable_type' => static::class,
                'historyable_id' => $model->id,
                'previous_data' => $model->getOriginal(),
                'created_at' => now(),
            ]);
        });
    }

    public function editHistories(): MorphMany
    {
        return $this->morphMany(EditHistory::class, 'historyable')->latest('created_at');
    }
}