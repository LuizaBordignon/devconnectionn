<?php

use App\Console\Commands\CheckEntryDueDates;
use Illuminate\Support\Facades\Schedule;

Schedule::command(CheckEntryDueDates::class)->daily(); //checa diariamente se há entradas com vencimento hoje e envia um email para o usuário responsável.