<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Services\AiTaskParser;
use App\Services\AiThreadSummarizer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use RuntimeException;

class AiController extends Controller
{
    public function parseNotes(Request $request, AiTaskParser $parser): JsonResponse
    {
        $request->validate([
            'notes' => 'required|string|min:10|max:10000',
        ]);

        try {
            $tasks = $parser->parse($request->input('notes'));
            return response()->json(['tasks' => $tasks]);
        } catch (RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 503);
        }
    }

    public function summarizeThread(Request $request, AiThreadSummarizer $summarizer): JsonResponse
    {
        $request->validate([
            'task_id' => 'required|exists:tasks,id',
        ]);

        $task = Task::findOrFail($request->input('task_id'));

        try {
            $summary = $summarizer->summarize($task);
            return response()->json(['summary' => $summary]);
        } catch (RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 503);
        }
    }
}
