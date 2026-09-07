<?php

namespace App\Jobs;

use App\Mail\PeriodClosureMail;
use App\Models\Entry;
use App\Models\PeriodClosure;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Throwable;

class ProcessPeriodClosureJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public function __construct(public int $closureId) {}

    public function handle(): void
    {
        $closure = PeriodClosure::find($this->closureId);

        if (!$closure || $closure->status === 'concluido') {
            return;
        }

        $closure->update(['status' => 'processando']);

        $entries = $closure->user
            ->entries()
            ->whereBetween('due_date', [$closure->start_date, $closure->end_date])
            ->get();

        $resumo = Entry::resumoDoPeriodo($entries);
        $csv = $this->gerarCsv($entries, $resumo);

        $path = "fechamentos/{$closure->id}.csv";
        Storage::put($path, $csv);

        $closure->update(['file_path' => $path]);

        Mail::to($closure->user->email)->send(new PeriodClosureMail($closure));

        $closure->update([
            'status' => 'concluido',
            'completed_at' => now(),
        ]);
    }

    public function failed(Throwable $exception): void
    {
        PeriodClosure::where('id', $this->closureId)->update([
            'status' => 'falhou',
            'error_message' => $exception->getMessage(),
        ]);
    }

    private function gerarCsv($entries, array $resumo): string
    {
        $linhas = [
            "Resumo do período",
            "A pagar;{$resumo['a_pagar']}",
            "A receber;{$resumo['a_receber']}",
            "Liquidado;{$resumo['liquidado']}",
            "Vencido;{$resumo['vencido']}",
            "",
            "Descrição;Tipo;Valor;Vencimento;Status",
        ];

        foreach ($entries as $entry) {
            $linhas[] = "{$entry->description};{$entry->type};{$entry->amount};{$entry->due_date->format('d/m/Y')};{$entry->status}";
        }

        return implode("\n", $linhas);
    }
}