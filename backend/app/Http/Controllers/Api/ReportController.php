<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function periodo(Request $request)
    {
        $data = $request->validate([
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
        ]);

        $entries = $request->user()
            ->entries()
            ->whereBetween('due_date', [$data['start_date'], $data['end_date']])
            ->get();

        $aPagar = 0;
        $aReceber = 0;
        $liquidado = 0;
        $vencido = 0;

        public function periodo(Request $request)
            {
                $data = $request->validate([
                    'start_date' => ['required', 'date'],
                    'end_date' => ['required', 'date', 'after_or_equal:start_date'],
                ]);

                $entries = $request->user()
                    ->entries()
                    ->whereBetween('due_date', [$data['start_date'], $data['end_date']])
                    ->get();

                return response()->json([
                    'periodo' => $data,
                    ...Entry::resumoDoPeriodo($entries),
                ]);
            }

        return response()->json([
            'periodo' => $data,
            'a_pagar' => round($aPagar, 2),
            'a_receber' => round($aReceber, 2),
            'liquidado' => round($liquidado, 2),
            'vencido' => round($vencido, 2),
        ]);
    }
}