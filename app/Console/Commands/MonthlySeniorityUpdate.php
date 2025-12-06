<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Http\Controllers\ModeratorController;


class MonthlySeniorityUpdate extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:monthly-seniority-update';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Aktualizuje urlopy pierwszego dnia miesiąca';

    /**
     * Execute the console command.
     */
    public function handle()
    {

        app()->call([ModeratorController::class, 'updateUrlaub']);

        $this->info('updateUrlaub executed');
    }
}
