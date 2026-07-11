<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\Task;
use App\Models\User;

class TaskPolicy
{
    public function create(User $user, Project $project): bool
    {
        // Any workspace member can create tasks
        return $project->workspace->members()->where('user_id', $user->id)->exists();
    }

    public function update(User $user, Task $task): bool
    {
        // Any workspace member can update tasks
        return $task->project->workspace->members()->where('user_id', $user->id)->exists();
    }

    public function delete(User $user, Task $task): bool
    {
        // Any workspace member can delete tasks
        return $task->project->workspace->members()->where('user_id', $user->id)->exists();
    }
}
