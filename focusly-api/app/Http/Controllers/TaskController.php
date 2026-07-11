<?php

namespace App\Http\Controllers;

use App\Events\TaskCreated;
use App\Events\TaskUpdated;
use App\Models\Notification;
use App\Models\Project;
use App\Models\Task;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    public function index(Project $project): JsonResponse
    {
        $tasks = $project->tasks()
            ->with(['assignee', 'creator', 'comments.user'])
            ->get();

        return response()->json($tasks);
    }

    public function store(Request $request, Project $project): JsonResponse
    {
        $this->authorize('create', [Task::class, $project]);

        $data = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'status'      => 'sometimes|in:todo,in_progress,done',
            'priority'    => 'sometimes|in:low,medium,high',
            'assignee_id' => 'nullable|exists:users,id',
            'due_date'    => 'nullable|date',
        ]);

        $task = $project->tasks()->create(array_merge($data, [
            'created_by' => $request->user()->id,
        ]));

        $task->load(['assignee', 'creator']);

        // Notify assignee if set
        if ($task->assignee_id && $task->assignee_id !== $request->user()->id) {
            Notification::create([
                'user_id' => $task->assignee_id,
                'type'    => 'task_assigned',
                'payload' => ['task_id' => $task->id, 'task_title' => $task->title],
            ]);
        }

        broadcast(new TaskCreated($task))->toOthers();

        return response()->json($task, 201);
    }

    public function show(Task $task): JsonResponse
    {
        return response()->json($task->load(['assignee', 'creator', 'comments.user', 'attachments']));
    }

    public function update(Request $request, Task $task): JsonResponse
    {
        $this->authorize('update', $task);

        $data = $request->validate([
            'title'       => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'status'      => 'sometimes|in:todo,in_progress,done',
            'priority'    => 'sometimes|in:low,medium,high',
            'assignee_id' => 'nullable|exists:users,id',
            'due_date'    => 'nullable|date',
        ]);

        $task->update($data);
        $task->load(['assignee', 'creator']);

        broadcast(new TaskUpdated($task))->toOthers();

        return response()->json($task);
    }

    public function destroy(Task $task): JsonResponse
    {
        $this->authorize('delete', $task);
        $task->delete();

        return response()->json(['message' => 'Task deleted.']);
    }
}
