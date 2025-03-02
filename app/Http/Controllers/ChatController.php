<?php

namespace App\Http\Controllers;

use App\Models\Chat;
use App\Models\User;
use App\Events\NewChatMessage;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class ChatController extends Controller
{
    public function index()
    {
        $chats = auth()->user()->chats()
            ->with(['vendor:id,name,avatar', 'user:id,name,avatar'])
            ->latest('last_message_at')
            ->get();

        return Inertia::render('Chat/Index', [
            'chats' => $chats
        ]);
    }

    public function show(Chat $chat)
    {
        $this->authorize('view', $chat);

        $chat->load(['messages' => function ($query) {
            $query->latest()->limit(50)->with('user:id,name,avatar');
        }]);

        // Mark messages as read
        if (auth()->user()->id === $chat->user_id) {
            $chat->update(['user_unread_count' => 0]);
        } else {
            $chat->update(['vendor_unread_count' => 0]);
        }

        return Inertia::render('Chat/Show', [
            'chat' => $chat
        ]);
    }

    public function store(Request $request, User $vendor)
    {
        $chat = Chat::firstOrCreate(
            [
                'user_id' => auth()->id(),
                'vendor_id' => $vendor->id,
            ],
            [
                'last_message_at' => now(),
            ]
        );

        return redirect()->route('chats.show', $chat);
    }

    public function sendMessage(Request $request, Chat $chat)
    {
        $this->authorize('send-message', $chat);

        $message = $chat->messages()->create([
            'user_id' => auth()->id(),
            'content' => $request->content,
        ]);

        $chat->update([
            'last_message' => $request->content,
            'last_message_at' => now(),
            $chat->user_id === auth()->id() 
                ? 'vendor_unread_count' 
                : 'user_unread_count' => DB::raw('COALESCE(user_unread_count, 0) + 1'),
        ]);

        broadcast(new NewChatMessage($message))->toOthers();

        return back();
    }
} 