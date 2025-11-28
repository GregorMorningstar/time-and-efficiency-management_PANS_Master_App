<?php

use Inertia\Inertia;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\EducationController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\ModeratorController;
use App\Http\Controllers\CompanyLookupController;
use App\Http\Controllers\CareerController;
use App\Http\Controllers\VacationCalendarController;
use App\Http\Controllers\MachinesController;
use App\Http\Controllers\ProducionController;
use App\Http\Controllers\PlanningController;
use Illuminate\Support\Facades\Auth;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});





//role routes

//admin
Route::middleware(['auth','verified','role:admin'])->prefix('/admin')->group(function () {
   Route::get('/dashboard', [AdminController::class, 'index'])->name('admin.dashboard');
});

//moderator (role check temporarily disabled in revert state)
Route::middleware(['auth','verified','role:moderator'])->prefix('/moderator')->group(function () {
    Route::get('/dashboard', [ModeratorController::class, 'index'])->name('moderator.dashboard');


    //maszyny routes
    Route::get('/machines', [MachinesController::class, 'machineModeratorDashboard'])->name('moderator.machines.dashboard');
    Route::post('/machines', [MachinesController::class, 'store'])->name('moderator.machines.store');
    Route::get('/machines/add', [MachinesController::class, 'addMachine'])->name('moderator.machines.add');
//production routes
    Route::get('/production', [ProducionController::class, 'index'])->name('moderator.production.dashboard');

    //planning routes
    Route::get('/planning', [PlanningController::class, 'index'])->name('moderator.planning.dashboard');

    //employee routes
Route::get('/employee', [ModeratorController::class, 'employeeIndex'])->name('moderator.employee.index');

//employee education verification
Route::get('/employee/check-education', [ModeratorController::class, 'checkEducation'])->name('moderator.employee.check-education');
Route::get('/employee/check-experience/{id}', [ModeratorController::class, 'lookExperienceById'])->name('moderator.employee.check-experience');
Route::post('/education/{id}/verify', [ModeratorController::class, 'verifyEducation'])->name('moderator.education.verify');
//career experience verification
Route::get('/employee/check-all-career', [ModeratorController::class, 'checkCareer'])->name('moderator.employee.check-career');
Route::post('/experience/{id}/verify', [ModeratorController::class, 'verifyExperience'])->name('moderator.experience.verify');
});



//employee (role check temporarily disabled in revert state)
Route::middleware(['auth','verified','role:employee','flags'])->prefix('/employee')->group(function () {

    Route::get('/dashboard', [EmployeeController::class, 'index'])->name('employee.dashboard');
    //education routes
    Route::get('/education', [EducationController::class, 'index'])->name('employee.education');
    Route::get('/education/add', [EducationController::class, 'addEducation'])->name('employee.education.add');
    Route::post('/education', [EducationController::class, 'store'])->name('employee.education.store');
    Route::get('/education/{id}/edit', [EducationController::class, 'edit'])->name('employee.education.edit');
    Route::put('/education/{id}', [EducationController::class, 'update'])->name('employee.education.update');

   //career routes

    Route::get('/api/company/lookup', [CareerController::class, 'lookup'])->name('api.company.lookup');
    Route::get('/career', [CareerController::class, 'index'])->name('employee.career');
    Route::post('/career', [CareerController::class, 'store'])->name('employee.career.store');
    Route::get('/career/add', [CareerController::class, 'create'])->name('employee.career.add');
    Route::get('/career/my-experiences', [CareerController::class, 'listExperiences'])->name('employee.experiences');
    Route::post('/career/delete', [CareerController::class, 'destroy'])->name('employee.career.delete');
    Route::get('/career/{id}', [CareerController::class, 'show'])->name('employee.career.show');
    Route::get('/career/{id}/edit', [CareerController::class, 'edit'])->name('employee.career.edit');
    Route::put('/career/{id}', [CareerController::class, 'update'])->name('employee.career.update');
    //address routes
    Route::get('/address', [EmployeeController::class, 'address'])->name('employee.address');


    //calendar routes
    Route::get('/calendar', [VacationCalendarController::class, 'index'])->name('employee.calendar');
    Route::post('/calendar', [VacationCalendarController::class, 'store'])->name('employee.calendar.store');
    Route::get('/calendar/{id}', [VacationCalendarController::class, 'show'])->name('employee.calendar.show'); // <- NEW

    //maszyny routes
    Route::get('/machines', [MachinesController::class, 'index'])->name('employee.machines.index');


});


//all role
Route::middleware('auth')->group(function () {
    Route::get('/chat', [ChatController::class, 'index'])->name('chat.index');
    Route::post('/chat', [ChatController::class, 'store'])->name('chat.store');
});

Route::fallback(function () {
    $user = Auth::user();

    $routeName = $user
        ? match ($user->role) {
            'admin'     => 'admin.dashboard',
            'moderator' => 'moderator.dashboard',
            'employee'  => 'employee.dashboard',
            default     => 'dashboard',
        }
        : 'home';

    $targetUrl = route($routeName);

    return response()->view('errors.404-redirect', [
        'targetUrl' => $targetUrl,
        'seconds'   => 5,
        'role'      => $user?->role,
    ], 404);
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';

