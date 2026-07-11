<?php

namespace App\Events;

use App\Models\Comment;
use App\Models\Task;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CommentAdded implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Task $task, public Comment $comment)
    {
        $this->comment->loadMissing('user');
    }

    public function broadcastOn(): array
    {
        $workspaceId = $this->task->project->workspace_id;
        return [new PrivateChannel("workspace.{$workspaceId}")];
    }

    public function broadcastAs(): string
    {
        return 'comment.added';
    }

    public function broadcastWith(): array
    {
        return [
            'task_id' => $this->task->id,
            'comment' => $this->comment->toArray(),
        ];
    }
}
