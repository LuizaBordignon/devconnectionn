<?php

use App\Console\Commands\CheckEntryDueDates;
use Illuminate\Support\Facades\Schedule;

Schedule::command(CheckEntryDueDates::class)->daily();