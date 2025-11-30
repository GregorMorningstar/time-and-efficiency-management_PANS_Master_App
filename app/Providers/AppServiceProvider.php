<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Repositories\EducationRepository;
use App\Interfaces\EducationRepositoryInterface;
use App\Repositories\ExperienceRepository;
use App\Interfaces\ExperienceRepositoryInterface;
use App\Repositories\FlagsRepository;
use App\Interfaces\FlagsRepositoryInterface;
use App\Repositories\VacationRepository;
use App\Interfaces\VacationRepositoryInterface;
use App\Repositories\MachinesRepository;
use App\Interfaces\MachinesRepositoryInterface;
use App\Repositories\UserRepository;
use App\Interfaces\UserRepositoryInterface;
use App\Repositories\AddressEmployeeRepository;
use App\Interfaces\AddressEmployeeRepositoryInterface;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Education
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

        // Calendar Repository Binding
        $this->app->bind(
            VacationRepositoryInterface::class,
            VacationRepository::class
        );
        //machines
        $this->app->bind(
            MachinesRepositoryInterface::class,
            MachinesRepository::class
        );
        //user repository binding
        $this->app->bind(
           UserRepositoryInterface::class,
            UserRepository::class
        );
        //adress employee repository binding
        $this->app->bind(
            AddressEmployeeRepositoryInterface::class,
            AddressEmployeeRepository::class
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
