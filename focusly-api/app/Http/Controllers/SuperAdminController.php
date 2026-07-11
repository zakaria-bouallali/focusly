<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Workspace;
use Illuminate\Http\JsonResponse;

class SuperAdminController extends Controller
{
    public function stats(): JsonResponse
    {
        $users = User::where('is_super_admin', false)
            ->withCount(['workspaces as workspace_count'])
            ->get()
            ->map(function (User $user) {
                // Count all projects across all user's workspaces
                $projectCount = $user->workspaces()
                    ->withCount('projects')
                    ->get()
                    ->sum('projects_count');

                return [
                    'id'              => $user->id,
                    'name'            => $user->name,
                    'email'           => $user->email,
                    'last_login_at'   => $user->last_login_at?->toIso8601String(),
                    'last_logout_at'  => $user->last_logout_at?->toIso8601String(),
                    'workspace_count' => $user->workspace_count,
                    'project_count'   => $projectCount,
                ];
            });

        return response()->json([
            'total_members'    => $users->count(),
            'total_workspaces' => Workspace::count(),
            'users'            => $users,
        ]);
    }
}
