<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Workspace;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    public function index(Workspace $workspace): JsonResponse
    {
        $projects = $workspace->projects()->withCount('tasks')->get();
        return response()->json($projects);
    }

    public function store(Request $request, Workspace $workspace): JsonResponse
    {
        $this->authorize('create', [Project::class, $workspace]);

        $data = $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $project = $workspace->projects()->create($data);

        return response()->json($project, 201);
    }

    public function show(Request $request, Project $project): JsonResponse
    {
        $project->load([
            'workspace',
            'tasks' => fn ($query) => $query->latest()->with(['assignee', 'creator', 'comments.user']),
        ]);

        $role = $project->workspace->getMemberRole($request->user()->id);
        $project->workspace->setAttribute('current_user_role', $role);

        return response()->json($project);
    }

    public function destroy(Project $project): JsonResponse
    {
        $this->authorize('delete', $project);
        $project->delete();

        return response()->json(['message' => 'Project deleted.']);
    }

    public function update(Request $request, Project $project): JsonResponse
    {
        $this->authorize('update', $project);

        $data = $request->validate([
            'name'        => 'sometimes|string|max:255',
            'description' => 'nullable|string',
        ]);

        $project->update($data);

        return response()->json($project);
    }
}
