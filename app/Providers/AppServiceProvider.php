<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Repositories\EducationRepository;
use App\Interfaces\EducationRepositoryInterface;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Binding the EducationRepositoryInterface to EducationRepository
        $this->app->bind(
            EducationRepositoryInterface::class,
           EducationRepository::class
        );
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
