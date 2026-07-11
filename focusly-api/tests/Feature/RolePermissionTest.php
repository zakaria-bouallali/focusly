<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Workspace;
use App\Models\Project;
use App\Models\Task;

class RolePermissionTest extends TestCase
{
    use RefreshDatabase;

    private User $owner;
    private User $admin;
    private User $member;
    private User $stranger;
    private Workspace $workspace;
    private Project $project;

    protected function setUp(): void
    {
        parent::setUp();

        // 1. Create users
        $this->owner = User::create(['name' => 'Owner User', 'email' => 'owner@taskpilot.dev', 'password' => bcrypt('password')]);
        $this->admin = User::create(['name' => 'Admin User', 'email' => 'admin@taskpilot.dev', 'password' => bcrypt('password')]);
        $this->member = User::create(['name' => 'Member User', 'email' => 'member@taskpilot.dev', 'password' => bcrypt('password')]);
        $this->stranger = User::create(['name' => 'Stranger User', 'email' => 'stranger@taskpilot.dev', 'password' => bcrypt('password')]);

        // 2. Create workspace
        $this->workspace = Workspace::create(['name' => 'HQ Workspace', 'owner_id' => $this->owner->id]);

        // 3. Attach roles
        $this->workspace->users()->attach($this->owner->id, ['role' => 'owner']);
        $this->workspace->users()->attach($this->admin->id, ['role' => 'admin']);
        $this->workspace->users()->attach($this->member->id, ['role' => 'member']);

        // 4. Create project
        $this->project = Project::create(['name' => 'Secret Project', 'workspace_id' => $this->workspace->id]);
    }

    public function test_workspace_view_access(): void
    {
        // Owner, Admin, Member can view workspace
        $this->actingAs($this->owner)->getJson("/api/workspaces/{$this->workspace->id}")->assertStatus(200);
        $this->actingAs($this->admin)->getJson("/api/workspaces/{$this->workspace->id}")->assertStatus(200);
        $this->actingAs($this->member)->getJson("/api/workspaces/{$this->workspace->id}")->assertStatus(200);

        // Stranger cannot view workspace (returns 403 Forbidden)
        $this->actingAs($this->stranger)->getJson("/api/workspaces/{$this->workspace->id}")->assertStatus(403);
    }

    public function test_project_delete_access(): void
    {
        // Member CAN delete project (open permissions)
        $project2 = Project::create(['name' => 'Another Project', 'workspace_id' => $this->workspace->id]);
        $this->actingAs($this->member)->deleteJson("/api/projects/{$project2->id}")->assertStatus(200);

        // Admin can also delete project
        $this->actingAs($this->admin)->deleteJson("/api/projects/{$this->project->id}")->assertStatus(200);
    }

    public function test_project_creation_access(): void
    {
        // Admin can create project
        $this->actingAs($this->admin)->postJson("/api/workspaces/{$this->workspace->id}/projects", [
            'name' => 'Admin Project'
        ])->assertStatus(201);

        // Member CAN also create project (open permissions)
        $this->actingAs($this->member)->postJson("/api/workspaces/{$this->workspace->id}/projects", [
            'name' => 'Member Project'
        ])->assertStatus(201);
    }

    public function test_task_creation_and_deletion_access(): void
    {
        // Member can create task
        $taskResp = $this->actingAs($this->member)->postJson("/api/projects/{$this->project->id}/tasks", [
            'title' => 'Member Task',
            'status' => 'todo',
            'priority' => 'low'
        ]);
        $taskResp->assertStatus(201);
        $taskId = $taskResp->json('id');

        // Any workspace member can delete tasks (open permissions)
        $this->actingAs($this->admin)->deleteJson("/api/tasks/{$taskId}")->assertStatus(200);
    }

    public function test_admin_can_delete_any_task(): void
    {
        // Member creates task
        $task = Task::create([
            'title' => 'Task to be deleted by Admin',
            'project_id' => $this->project->id,
            'status' => 'todo',
            'priority' => 'low',
            'created_by' => $this->member->id
        ]);

        // Admin can delete this task
        $this->actingAs($this->admin)->deleteJson("/api/tasks/{$task->id}")->assertStatus(200);
    }

    public function test_only_owner_can_invite_members(): void
    {
        $newUser = User::create(['name' => 'New User', 'email' => 'new@test.dev', 'password' => bcrypt('password')]);

        // Member cannot invite (403)
        $this->actingAs($this->member)->postJson("/api/workspaces/{$this->workspace->id}/invite", [
            'email' => $newUser->email
        ])->assertStatus(403);

        // Owner can invite
        $this->actingAs($this->owner)->postJson("/api/workspaces/{$this->workspace->id}/invite", [
            'email' => $newUser->email
        ])->assertStatus(200);
    }
}
