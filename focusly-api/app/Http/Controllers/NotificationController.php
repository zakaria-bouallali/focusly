<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $notifications = $request->user()
            ->notifications()
            ->latest()
            ->take(50)
            ->get();

        return response()->json($notifications);
    }

    public function markRead(Request $request, Notification $notification): JsonResponse
    {
        if ($notification->user_id !== $request->user()->id) {
            abort(403);
        }

        $notification->update(['read' => true]);

        return response()->json($notification);
    }

    public function markAllRead(Request $request): JsonResponse
    {
        $request->user()->notifications()->where('read', false)->update(['read' => true]);

        return response()->json(['message' => 'All notifications marked as read.']);
    }
}
