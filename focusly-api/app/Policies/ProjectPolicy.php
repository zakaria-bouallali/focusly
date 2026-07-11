<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\User;
use App\Models\Workspace;

class ProjectPolicy
{
    public function create(User $user, Workspace $workspace): bool
    {
        // Any workspace member can create projects
        return $workspace->members()->where('user_id', $user->id)->exists();
    }

    public function update(User $user, Project $project): bool
    {
        // Only the workspace owner can update projects
        return $project->workspace->owner_id === $user->id;
    }

    public function delete(User $user, Project $project): bool
    {
        // Only the workspace owner can delete projects
        return $project->workspace->owner_id === $user->id;
    }
}
