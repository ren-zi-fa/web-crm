<?php

use App\Http\Controllers\ActivityController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DealController;
use App\Http\Controllers\PipelineController;
use App\Http\Controllers\TaskController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::get('pipeline', [PipelineController::class, 'index'])->name('pipeline.index');

    Route::resource('contacts', ContactController::class);
    Route::resource('deals', DealController::class);
    Route::patch('deals/{deal}/stage', [PipelineController::class, 'updateStage'])->name('deals.stage.update');

    Route::resource('activities', ActivityController::class)->only(['index', 'store', 'update', 'destroy']);

    Route::resource('tasks', TaskController::class)->except(['show', 'create', 'edit']);
    Route::patch('tasks/{task}/complete', [TaskController::class, 'complete'])->name('tasks.complete');
});

require __DIR__.'/settings.php';
