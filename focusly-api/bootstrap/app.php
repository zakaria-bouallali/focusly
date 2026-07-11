<?php

use App\Http\Middleware\EnsureWorkspaceMember;
use App\Http\Middleware\EnsureSuperAdmin;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        channels: __DIR__.'/../routes/channels.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Allow Sanctum SPA cookies from the frontend
        $middleware->statefulApi();

        // CORS — allow the Vite dev server
        $middleware->append(\Illuminate\Http\Middleware\HandleCors::class);

        // Named aliases
        $middleware->alias([
            'workspace.member' => EnsureWorkspaceMember::class,
            'super.admin'      => EnsureSuperAdmin::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
