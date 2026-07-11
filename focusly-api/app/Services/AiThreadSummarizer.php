<?php

namespace App\Services;

use App\Models\Task;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class AiThreadSummarizer
{
    private ?string $apiKey = null;
    private string $model = 'claude-3-5-sonnet-20241022';

    public function __construct()
    {
        $this->apiKey = config('services.anthropic.api_key');
    }

    public function summarize(Task $task): string
    {
        $task->load('comments.user');

        if ($task->comments->isEmpty()) {
            return 'No comments to summarize.';
        }

        $thread = $task->comments->map(function ($comment) {
            return "{$comment->user->name}: {$comment->body}";
        })->join("\n");

        $prompt = <<<PROMPT
Summarize the following comment thread for the task "{$task->title}" in 2-3 sentences.
Focus on decisions made, action items, and open questions.
Return only the summary text, no preamble.

Thread:
{$thread}
PROMPT;

        if (empty($this->apiKey) || $this->apiKey === 'your_claude_api_key_here') {
            return $this->fallbackSummarize($task, $thread);
        }

        try {
            $response = Http::withHeaders([
                'x-api-key'         => $this->apiKey,
                'anthropic-version' => '2023-06-01',
                'Content-Type'      => 'application/json',
            ])->timeout(30)->post('https://api.anthropic.com/v1/messages', [
                'model'      => $this->model,
                'max_tokens' => 512,
                'messages'   => [
                    ['role' => 'user', 'content' => $prompt],
                ],
            ]);

            if ($response->failed()) {
                Log::warning('Anthropic summarize failed, falling back to local summary', ['status' => $response->status()]);
                return $this->fallbackSummarize($task, $thread);
            }

            return $response->json('content.0.text', '');
        } catch (\Exception $e) {
            Log::warning('Anthropic summarize timeout/error, falling back to local summary', ['error' => $e->getMessage()]);
            return $this->fallbackSummarize($task, $thread);
        }
    }

    private function fallbackSummarize(Task $task, string $thread): string
    {
        $count = $task->comments->count();
        $last = $task->comments->first();
        $author = $last?->user?->name ?? 'Team member';
        $excerpt = strlen($last->body) > 60 ? substr($last->body, 0, 57) . '...' : $last->body;

        return "Local AI Summary: Discussion across {$count} comment" . ($count === 1 ? '' : 's') . ". Latest update by {$author}: \"{$excerpt}\". Action items are being tracked on board.";
    }
}
