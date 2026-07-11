<?php

namespace App\Http\Controllers;

use App\Models\Attachment;
use App\Models\Task;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AttachmentController extends Controller
{
    public function store(Request $request, Task $task): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|max:10240', // 10 MB
        ]);

        $file     = $request->file('file');
        $filename = $file->getClientOriginalName();
        $path     = $file->store("attachments/task-{$task->id}", 'public');

        $attachment = Attachment::create([
            'task_id'     => $task->id,
            'url'         => Storage::url($path),
            'filename'    => $filename,
            'uploaded_by' => $request->user()->id,
        ]);

        return response()->json($attachment, 201);
    }

    public function destroy(Attachment $attachment): JsonResponse
    {
        // Remove the file from storage
        $relativePath = str_replace('/storage/', '', $attachment->url);
        Storage::disk('public')->delete($relativePath);

        $attachment->delete();

        return response()->json(['message' => 'Attachment deleted.']);
    }
}
