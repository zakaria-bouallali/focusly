<?php

namespace App\Http\Middleware;

use App\Models\Workspace;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureWorkspaceMember
{
    public function handle(Request $request, Closure $next): Response
    {
        $workspace = $request->route('workspace');

        if (! $workspace instanceof Workspace) {
            return $next($request);
        }

        $isMember = $workspace->members()
            ->where('user_id', $request->user()->id)
            ->exists();

        if (! $isMember) {
            abort(403, 'You are not a member of this workspace.');
        }

        return $next($request);
    }
}
