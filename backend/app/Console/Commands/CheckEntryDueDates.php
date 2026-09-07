<?php

namespace App\Console\Commands;

use App\Jobs\SendEntryReminderJob;
use App\Models\Entry;
use Illuminate\Console\Command;

class CheckEntryDueDates extends Command
{
    protected $signature = 'entries:check-due-dates';
    protected $description = 'Varre os lançamentos e dispara avisos de vencimento próximo e conta vencida';

    private const DIAS_ANTECEDENCIA = 3;

    public function handle(): void
    {
        $hoje = now()->startOfDay();
        $limiteProximo = $hoje->copy()->addDays(self::DIAS_ANTECEDENCIA);

        $proximas = Entry::whereNull('paid_at')
            ->whereNull('due_soon_notified_at')
            ->whereBetween('due_date', [$hoje, $limiteProximo])
            ->get();

        foreach ($proximas as $entry) {
            SendEntryReminderJob::dispatch($entry->id, 'due_soon');
        }

        $vencidas = Entry::whereNull('paid_at')
            ->whereNull('overdue_notified_at')
            ->where('due_date', '<', $hoje)
            ->get();

        foreach ($vencidas as $entry) {
            SendEntryReminderJob::dispatch($entry->id, 'overdue');
        }

        $this->info("Disparados: {$proximas->count()} próximas, {$vencidas->count()} vencidas.");
    }
}