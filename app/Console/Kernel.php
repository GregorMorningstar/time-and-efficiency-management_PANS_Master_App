<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    protected $commands = [
        // \App\Console\Commands\MonthlySeniorityUpdate::class, // opcjonalnie
    ];

    protected function schedule(Schedule $schedule)
    {
        // uruchom pierwszy dzień miesiąca o 00:00
        $schedule->command('app:monthly-seniority-update')->monthlyOn(1, '00:00');
    }
}
