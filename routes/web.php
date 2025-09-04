<?php

use Inertia\Inertia;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\EducationController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\ModeratorController;
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
   
   //career routes
    Route::get('/career', [EmployeeController::class, 'career'])->name('employee.career');

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

