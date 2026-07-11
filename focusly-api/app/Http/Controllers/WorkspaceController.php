<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceMember;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WorkspaceController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $workspaces = $request->user()
            ->workspaces()
            ->with('owner')
            ->withCount('projects')
            ->get();

        return response()->json($workspaces);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $workspace = Workspace::create([
            'name'     => $data['name'],
            'owner_id' => $request->user()->id,
        ]);

        // Add the creator as owner
        WorkspaceMember::create([
            'workspace_id' => $workspace->id,
            'user_id'      => $request->user()->id,
            'role'         => 'owner',
        ]);

        return response()->json($workspace->load('owner'), 201);
    }

    public function show(Request $request, Workspace $workspace): JsonResponse
    {
        $role = $workspace->getMemberRole($request->user()->id);
        $workspace->setAttribute('current_user_role', $role);

        return response()->json($workspace->load(['owner', 'projects']));
    }

    public function members(Workspace $workspace): JsonResponse
    {
        $members = $workspace->members()->with('user')->get();
        return response()->json($members);
    }

    public function invite(Request $request, Workspace $workspace): JsonResponse
    {
        $this->authorize('manageMembers', $workspace);

        $data = $request->validate([
            'email' => 'required|email|exists:users,email',
            'role'  => 'sometimes|in:admin,member',
        ]);

        $user = User::where('email', $data['email'])->firstOrFail();

        if ($workspace->members()->where('user_id', $user->id)->exists()) {
            return response()->json(['message' => 'User is already a member.'], 422);
        }

        $member = WorkspaceMember::create([
            'workspace_id' => $workspace->id,
            'user_id'      => $user->id,
            'role'         => $data['role'] ?? 'member',
        ]);

        // Return the full member record with user so the frontend can update state correctly
        return response()->json($member->load('user'), 201);
    }

    public function removeMember(Request $request, Workspace $workspace, WorkspaceMember $member): JsonResponse
    {
        $this->authorize('manageMembers', $workspace);

        // Ensure the member belongs to this workspace
        if ($member->workspace_id !== $workspace->id) {
            return response()->json(['message' => 'Member does not belong to this workspace.'], 404);
        }

        if ($member->user_id === $workspace->owner_id) {
            return response()->json(['message' => 'Cannot remove the workspace owner.'], 422);
        }

        $member->delete();

        return response()->json(['message' => 'Member removed.']);
    }

    public function update(Request $request, Workspace $workspace): JsonResponse
    {
        $this->authorize('update', $workspace);

        $data = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $workspace->update($data);

        return response()->json($workspace->load('owner'));
    }

    public function destroy(Request $request, Workspace $workspace): JsonResponse
    {
        $this->authorize('delete', $workspace);
        $workspace->delete();

        return response()->json(['message' => 'Workspace deleted.']);
    }
}
