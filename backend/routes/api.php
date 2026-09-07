<?php

use App\Http\Controllers\Api\PeriodClosureController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\EntryController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ContactController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);


Route::middleware('auth:sanctum')->group(function () { //middleware checa se o token que está vindo é valido. Se for valido, ele deixa passar, se não, ele bloqueia a requisição    
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/me', function (Request $request) {
        return $request->user();
    });

    Route::apiResource('contacts', ContactController::class);
    Route::apiResource('entries', EntryController::class);
    Route::post('/entries/{entry}/liquidar', [EntryController::class, 'liquidar']);
    Route::get('/relatorio/periodo', [ReportController::class, 'periodo']);
    Route::post('/relatorio/fechamento', [PeriodClosureController::class, 'store']);
    Route::get('/relatorio/fechamento/{periodClosure}', [PeriodClosureController::class, 'show']);

});