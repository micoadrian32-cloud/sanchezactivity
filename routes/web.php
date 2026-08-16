<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\StudentController;


Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    //Route::inertia('dashboard', 'dashboard')->name('dashboard');
    Route::get('dashboard', [StudentController::class, 'index'])->name('dashboard');
    Route::post('students', [StudentController::class, 'store'])->name('student.store');
    Route::put('students/{student}', [StudentController::class, 'update'])->name('student.update');
    Route::delete('students/{student}', [StudentController::class, 'destroy'])->name('student.delete');
});

require __DIR__.'/settings.php';
