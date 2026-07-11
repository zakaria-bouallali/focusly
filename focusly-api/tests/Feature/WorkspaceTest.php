<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Workspace;

class WorkspaceTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_create_workspace(): void
    {
        $user = User::create([
            'name' => 'Owner',
            'email' => 'owner@example.com',
            'password' => bcrypt('password123'),
        ]);

        $response = $this->actingAs($user)->postJson('/api/workspaces', [
            'name' => 'Acme Corp',
        ]);

        $response->assertStatus(201)
                 ->assertJsonFragment(['name' => 'Acme Corp']);

        $this->assertDatabaseHas('workspaces', ['name' => 'Acme Corp', 'owner_id' => $user->id]);
        $this->assertDatabaseHas('workspace_members', ['user_id' => $user->id, 'role' => 'owner']);
    }

    public function test_owner_can_invite_member(): void
    {
        $owner = User::create([
            'name' => 'Owner',
            'email' => 'owner@example.com',
            'password' => bcrypt('password123'),
        ]);

        $member = User::create([
            'name' => 'Member',
            'email' => 'member@example.com',
            'password' => bcrypt('password123'),
        ]);

        $workspace = Workspace::create(['name' => 'Dev Workspace', 'owner_id' => $owner->id]);
        $workspace->users()->attach($owner->id, ['role' => 'owner']);

        $response = $this->actingAs($owner)->postJson("/api/workspaces/{$workspace->id}/invite", [
            'email' => 'member@example.com',
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('workspace_members', ['workspace_id' => $workspace->id, 'user_id' => $member->id, 'role' => 'member']);
    }
}
