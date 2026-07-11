<?php

use Illuminate\Support\Facades\Broadcast;

// Authorize the private workspace channel — only members can subscribe
Broadcast::channel('workspace.{workspaceId}', function ($user, $workspaceId) {
    return \App\Models\WorkspaceMember::where('workspace_id', $workspaceId)
        ->where('user_id', $user->id)
        ->exists();
});
