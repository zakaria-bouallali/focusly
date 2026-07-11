<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class AiTaskParser
{
    private ?string $apiKey = null;
    private string $model = 'claude-3-5-sonnet-20241022';

    public function __construct()
    {
        $this->apiKey = config('services.anthropic.api_key');
    }

    /**
     * Parse raw meeting notes into structured task suggestions.
     *
     * @return array<int, array{title: string, description: string, suggested_priority: string, suggested_assignee_name: string|null}>
     * @throws RuntimeException
     */
    public function parse(string $notes): array
    {
        $prompt = <<<PROMPT
You are a project management assistant. Extract actionable tasks from the following meeting notes.

Return ONLY a valid JSON array. No markdown, no explanation, no code fences. Just the JSON array.

Each item must have exactly these keys:
- "title": a short, punchy, Title Cased summary or noun phrase (2 to 4 words maximum, e.g. "Project Email Verification", "Verify Users First", "OAuth2 Refresh Tokens"). Never use ellipsis (...) or cut off sentences halfway.
- "description": detailed description preserving all context, requirements, and deadlines mentioned in the notes (string)
- "suggested_priority": one of "low", "medium", "high" (string)
- "suggested_assignee_name": person mentioned for this task, or null

Meeting notes:
{$notes}
PROMPT;

        if (empty($this->apiKey) || $this->apiKey === 'your_claude_api_key_here') {
            return $this->fallbackParse($notes);
        }

        try {
            $response = Http::withHeaders([
                'x-api-key'         => $this->apiKey,
                'anthropic-version' => '2023-06-01',
                'Content-Type'      => 'application/json',
            ])->timeout(30)->post('https://api.anthropic.com/v1/messages', [
                'model'      => $this->model,
                'max_tokens' => 2048,
                'messages'   => [
                    ['role' => 'user', 'content' => $prompt],
                ],
            ]);

            if ($response->failed()) {
                Log::warning('Anthropic API failed, falling back to local heuristic parser', ['status' => $response->status()]);
                return $this->fallbackParse($notes);
            }

            $content = $response->json('content.0.text', '');
            $tasks   = json_decode($content, true);

            if (! is_array($tasks)) {
                return $this->fallbackParse($notes);
            }

            return $tasks;
        } catch (\Exception $e) {
            Log::warning('Anthropic connection error, falling back to local heuristic parser', ['error' => $e->getMessage()]);
            return $this->fallbackParse($notes);
        }
    }

    /**
     * Local heuristic parser when Claude API key is not configured or offline.
     *
     * @return array<int, array{title: string, description: string, suggested_priority: string, suggested_assignee_name: string|null}>
     */
    private function fallbackParse(string $notes): array
    {
        $lines = preg_split('/(\r\n|\n|\.\s+)/', $notes, -1, PREG_SPLIT_NO_EMPTY);
        $tasks = [];

        foreach ($lines as $line) {
            $line = trim($line, ". \t\n\r\0\x0B");
            if (strlen($line) < 5) continue;

            $priority = 'medium';
            if (preg_match('/(high|urgent|asap|critical|immediate|priority)/i', $line)) {
                $priority = 'high';
            } elseif (preg_match('/(low|minor|optional|later|nice to have)/i', $line)) {
                $priority = 'low';
            }

            $assignee = null;
            if (preg_match('/^([A-Z][a-z]+)\s+(will|needs to|should|must|is assigned to|to)/', $line, $m)) {
                $assignee = $m[1];
            }

            $title = $this->generateSmartTitle($line);

            $tasks[] = [
                'title'                   => $title,
                'description'             => $line,
                'suggested_priority'      => $priority,
                'suggested_assignee_name' => $assignee,
            ];

            if (count($tasks) >= 8) break;
        }

        if (empty($tasks)) {
            $tasks[] = [
                'title'                   => 'Review Meeting Notes',
                'description'             => $notes,
                'suggested_priority'      => 'medium',
                'suggested_assignee_name' => null,
            ];
        }

        return $tasks;
    }

    /**
     * Generate a Title Cased, intelligent 2-4 word topic/noun summary from a sentence.
     */
    private function generateSmartTitle(string $line): string
    {
        $clean = preg_replace('/\[.*?\]|\(.*?\)/', ' ', $line);
        $clean = preg_replace('/^(task\s*\d*:|note\s*\d*:|-|\*|\d+\.)\s*/i', '', $clean);

        if (preg_match('/^([A-Z][a-z]+)\s+(will|needs to|should|must|is assigned to|to)\s+(.*)/i', $clean, $m)) {
            $clean = $m[3];
        }

        $clean = preg_replace('/\s+(by|before|due|on|in)\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday|today|tomorrow|next week|\d{1,2}\/\d{1,2}|\d{4}-\d{2}-\d{2}|end of day|eod|asap).*/i', '', $clean);
        $clean = trim(preg_replace('/\s+/', ' ', $clean), ". \t\n\r\0\x0B,-:;");

        $stopwords = [
            'i', 'me', 'my', 'we', 'us', 'our', 'you', 'your', 'he', 'him', 'his', 'she', 'her', 'it', 'its', 'they', 'them', 'their',
            'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about',
            'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out',
            'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any',
            'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than',
            'too', 'very', 'can', 'will', 'just', 'should', 'now', 'make', 'sure', 'check', 'verify', 'whether', 'ensure', 'need', 'needs',
            'must', 'would', 'could', 'shall', 'may', 'might', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'done',
            'task', 'note', 'item', 'please', 'remember', 'mandatory', 'required', 'try', 'look', 'users', 'user', 'create'
        ];

        $action = '';
        if (preg_match('/^(check if|make sure|ensure that|verify whether)\b/i', $line)) {
            $action = 'Verify';
        } elseif (preg_match('/^(check|verify|redesign|fix|draft|implement|add|update|build|setup|configure|create|remove|delete|deploy|review|test)\b/i', $clean, $am)) {
            $action = ucfirst(strtolower($am[1]));
        }

        $words = preg_split('/\s+/', preg_replace('/[^a-zA-Z0-9\s]/', '', $clean), -1, PREG_SPLIT_NO_EMPTY);
        $keywords = [];
        foreach ($words as $w) {
            $lw = strtolower($w);
            if (!in_array($lw, $stopwords) && strlen($w) >= 2) {
                $keywords[] = ucwords($w);
            }
        }

        if (!empty($keywords)) {
            $topic = implode(' ', array_slice(array_unique($keywords), 0, 3));
            if ($action && !stripos($topic, $action)) {
                $title = $action . ' ' . $topic;
            } else {
                $title = $topic;
            }
            $titleWords = preg_split('/\s+/', $title, -1, PREG_SPLIT_NO_EMPTY);
            if (count($titleWords) > 4) {
                $title = implode(' ', array_slice($titleWords, 0, 4));
            }
            return $title;
        }

        $cleanWords = preg_split('/\s+/', $clean, -1, PREG_SPLIT_NO_EMPTY);
        if (count($cleanWords) > 3) {
            return ucwords(implode(' ', array_slice($cleanWords, 0, 3)));
        }
        return ucwords($clean ?: 'Review Meeting Item');
    }
}
