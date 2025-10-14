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

