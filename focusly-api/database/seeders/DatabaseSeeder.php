<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceMember;
use App\Models\Project;
use App\Models\Task;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 0. Create super admin accounts
        User::create([
            'name'           => 'Super Admin Focusly',
            'email'          => 'admin@focusly.com',
            'password'       => bcrypt('password'),
            'is_super_admin' => true,
        ]);

        User::create([
            'name'           => 'Super Admin',
            'email'          => 'super@taskpilot.dev',
            'password'       => bcrypt('admin123'),
            'is_super_admin' => true,
        ]);

        // 1. Create standard users
        $owner = User::create([
            'name'  => 'Owen Owner',
            'email' => 'owner@taskpilot.dev',
            'password' => bcrypt('password123'),
        ]);

        $admin = User::create([
            'name'  => 'Addie Admin',
            'email' => 'admin@taskpilot.dev',
            'password' => bcrypt('password123'),
        ]);

        $member = User::create([
            'name'  => 'Manny Member',
            'email' => 'member@taskpilot.dev',
            'password' => bcrypt('password123'),
        ]);

        $stranger = User::create([
            'name'  => 'Steve Stranger',
            'email' => 'stranger@taskpilot.dev',
            'password' => bcrypt('password123'),
        ]);

        // 2. Create Workspace
        $workspace = Workspace::create([
            'name'     => 'Alpha Team Space',
            'owner_id' => $owner->id,
        ]);

        // 3. Assign roles in workspace
        WorkspaceMember::create([
            'workspace_id' => $workspace->id,
            'user_id'      => $owner->id,
            'role'         => 'owner',
        ]);

        WorkspaceMember::create([
            'workspace_id' => $workspace->id,
            'user_id'      => $admin->id,
            'role'         => 'admin',
        ]);

        WorkspaceMember::create([
            'workspace_id' => $workspace->id,
            'user_id'      => $member->id,
            'role'         => 'member',
        ]);

        // 4. Create Project
        $project = Project::create([
            'workspace_id' => $workspace->id,
            'name'         => 'Sprint 1 Roadmap',
            'description'  => 'Main engineering roadmap for the current launch sprint.',
        ]);

        // 5. Create some Tasks
        Task::create([
            'project_id'  => $project->id,
            'title'       => 'Setup Laravel Reverb WebSockets',
            'description' => 'Configure channels.php and reverb config variables.',
            'status'      => 'todo',
            'priority'    => 'high',
            'created_by'  => $owner->id,
        ]);

        Task::create([
            'project_id'  => $project->id,
            'title'       => 'Integrate Claude 3.5 AI Parser',
            'description' => 'Build parser flow in ImportNotes page and test endpoint.',
            'status'      => 'in_progress',
            'priority'    => 'high',
            'created_by'  => $admin->id,
        ]);

        Task::create([
            'project_id'  => $project->id,
            'title'       => 'Optimize CSS glassmorphic blurs',
            'description' => 'Tweak backdrop-filter rules for mobile browser compatibility.',
            'status'      => 'done',
            'priority'    => 'low',
            'created_by'  => $member->id,
        ]);
    }
}
