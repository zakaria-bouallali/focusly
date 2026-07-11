<?php

namespace App\Http\Controllers;

use App\Events\CommentAdded;
use App\Models\Comment;
use App\Models\Notification;
use App\Models\Task;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    public function store(Request $request, Task $task): JsonResponse
    {
        $data = $request->validate([
            'body' => 'required|string',
        ]);

        $comment = $task->comments()->create([
            'user_id' => $request->user()->id,
            'body'    => $data['body'],
        ]);

        $comment->load('user');

        // Notify task creator if different user
        if ($task->created_by !== $request->user()->id) {
            Notification::create([
                'user_id' => $task->created_by,
                'type'    => 'new_comment',
                'payload' => [
                    'task_id'    => $task->id,
                    'task_title' => $task->title,
                    'commenter'  => $request->user()->name,
                ],
            ]);
        }

        broadcast(new CommentAdded($task, $comment))->toOthers();

        return response()->json($comment, 201);
    }
}
