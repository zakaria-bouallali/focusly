<?php

use App\Http\Controllers\AiController;
use App\Http\Controllers\AttachmentController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\SuperAdminController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\WorkspaceController;
use App\Http\Middleware\EnsureWorkspaceMember;
use Illuminate\Support\Facades\Route;

// Public auth routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Authenticated routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'me']);

    // Workspaces
    Route::get('/workspaces', [WorkspaceController::class, 'index']);
    Route::post('/workspaces', [WorkspaceController::class, 'store']);

    Route::middleware(EnsureWorkspaceMember::class)->group(function () {
        Route::get('/workspaces/{workspace}', [WorkspaceController::class, 'show']);
        Route::match(['put', 'patch'], '/workspaces/{workspace}', [WorkspaceController::class, 'update']);
        Route::delete('/workspaces/{workspace}', [WorkspaceController::class, 'destroy']);
        Route::get('/workspaces/{workspace}/members', [WorkspaceController::class, 'members']);
        Route::delete('/workspaces/{workspace}/members/{member}', [WorkspaceController::class, 'removeMember']);
        Route::post('/workspaces/{workspace}/invite', [WorkspaceController::class, 'invite']);

        // Projects within workspace
        Route::get('/workspaces/{workspace}/projects', [ProjectController::class, 'index']);
        Route::post('/workspaces/{workspace}/projects', [ProjectController::class, 'store']);
    });

    // Projects (no workspace middleware — access checked via policy)
    Route::get('/projects/{project}', [ProjectController::class, 'show']);
    Route::match(['put', 'patch'], '/projects/{project}', [ProjectController::class, 'update']);
    Route::delete('/projects/{project}', [ProjectController::class, 'destroy']);

    // Tasks
    Route::get('/projects/{project}/tasks', [TaskController::class, 'index']);
    Route::post('/projects/{project}/tasks', [TaskController::class, 'store']);
    Route::get('/tasks/{task}', [TaskController::class, 'show']);
    Route::match(['put', 'patch'], '/tasks/{task}', [TaskController::class, 'update']);
    Route::delete('/tasks/{task}', [TaskController::class, 'destroy']);

    // Comments & Attachments
    Route::post('/tasks/{task}/comments', [CommentController::class, 'store']);
    Route::post('/tasks/{task}/attachments', [AttachmentController::class, 'store']);
    Route::delete('/attachments/{attachment}', [AttachmentController::class, 'destroy']);

    // AI endpoints
    Route::post('/ai/parse-notes', [AiController::class, 'parseNotes']);
    Route::post('/ai/summarize-thread', [AiController::class, 'summarizeThread']);

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::patch('/notifications/read-all', [NotificationController::class, 'markAllRead']);
    Route::patch('/notifications/{notification}/read', [NotificationController::class, 'markRead']);

    // Super Admin
    Route::middleware('super.admin')->group(function () {
        Route::get('/admin/stats', [SuperAdminController::class, 'stats']);
        Route::get('/admin/telemetry', [SuperAdminController::class, 'stats']);
    });
});
