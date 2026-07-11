<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Workspace;
use App\Models\Project;
use App\Models\Task;

class TaskTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_create_project_and_task(): void
    {
        $user = User::create([
            'name' => 'Tester',
            'email' => 'test@example.com',
            'password' => bcrypt('password123'),
        ]);

        $workspace = Workspace::create(['name' => 'HQ', 'owner_id' => $user->id]);
        $workspace->users()->attach($user->id, ['role' => 'owner']);

        $projResp = $this->actingAs($user)->postJson("/api/workspaces/{$workspace->id}/projects", [
            'name' => 'Project Alpha',
            'description' => 'Test project',
        ]);

        $projResp->assertStatus(201);
        $projectId = $projResp->json('id');

        $taskResp = $this->actingAs($user)->postJson("/api/projects/{$projectId}/tasks", [
            'title' => 'First Task',
            'status' => 'todo',
            'priority' => 'high',
        ]);

        $taskResp->assertStatus(201)
                 ->assertJsonFragment(['title' => 'First Task', 'status' => 'todo']);
    }

    public function test_user_can_update_task_status(): void
    {
        $user = User::create([
            'name' => 'Tester',
            'email' => 'test@example.com',
            'password' => bcrypt('password123'),
        ]);

        $workspace = Workspace::create(['name' => 'HQ', 'owner_id' => $user->id]);
        $workspace->users()->attach($user->id, ['role' => 'owner']);
        $project = Project::create(['name' => 'Alpha', 'workspace_id' => $workspace->id]);
        $task = Task::create([
            'title' => 'Move Me',
            'project_id' => $project->id,
            'status' => 'todo',
            'priority' => 'medium',
            'created_by' => $user->id,
        ]);

        $response = $this->actingAs($user)->patchJson("/api/tasks/{$task->id}", [
            'status' => 'done',
        ]);

        $response->assertStatus(200)
                 ->assertJsonFragment(['status' => 'done']);
    }
}
