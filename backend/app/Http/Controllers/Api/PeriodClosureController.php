<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\ProcessPeriodClosureJob;
use App\Models\PeriodClosure;
use Illuminate\Http\Request;

class PeriodClosureController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
        ]);

        $closure = PeriodClosure::firstOrNew([
            'user_id' => $request->user()->id,
            'start_date' => $data['start_date'],
            'end_date' => $data['end_date'],
        ]);

        // Só bloqueia se já tem um pedido EM ANDAMENTO pra esse período 
        // um fechamento já concluído ou que falhou pode ser refeito.
        if ($closure->exists && in_array($closure->status, ['pendente', 'processando'])) {
            return response()->json($closure, 202);
        }

        $closure->status = 'pendente';
        $closure->error_message = null;
        $closure->completed_at = null;
        $closure->save();

        ProcessPeriodClosureJob::dispatch($closure->id);

        return response()->json($closure, 202);
    }

    public function show(Request $request, PeriodClosure $periodClosure)
    {
        abort_if($periodClosure->user_id !== $request->user()->id, 403);

        return $periodClosure;
    }
}