<?php

namespace App\Events;

use App\Models\Task;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TaskCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Task $task)
    {
        $this->task->loadMissing(['assignee', 'creator']);
    }

    public function broadcastOn(): array
    {
        $workspaceId = $this->task->project->workspace_id;
        return [new PrivateChannel("workspace.{$workspaceId}")];
    }

    public function broadcastAs(): string
    {
        return 'task.created';
    }

    public function broadcastWith(): array
    {
        return ['task' => $this->task->toArray()];
    }
}
