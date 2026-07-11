<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Workspace;

class WorkspacePolicy
{
    public function view(User $user, Workspace $workspace): bool
    {
        return $workspace->members()->where('user_id', $user->id)->exists();
    }

    public function update(User $user, Workspace $workspace): bool
    {
        // Only the workspace owner can rename the workspace
        return $workspace->owner_id === $user->id;
    }

    public function manageMembers(User $user, Workspace $workspace): bool
    {
        // Workspace owner OR admin role can manage members
        $role = $workspace->getMemberRole($user->id);
        return $workspace->owner_id === $user->id || $role === 'admin';
    }

    public function delete(User $user, Workspace $workspace): bool
    {
        return $workspace->owner_id === $user->id;
    }
}
