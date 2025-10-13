<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Repositories\EducationRepository;
use App\Interfaces\EducationRepositoryInterface;
use App\Repositories\ExperienceRepository;
use App\Interfaces\ExperienceRepositoryInterface;
use App\Repositories\FlagsRepository;
use App\Interfaces\FlagsRepositoryInterface;
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

        // bind experience repo
        $this->app->bind(
            ExperienceRepositoryInterface::class,
            ExperienceRepository::class
        );

        //flags
        $this->app->bind(
           FlagsRepositoryInterface::class,
            FlagsRepository::class
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
