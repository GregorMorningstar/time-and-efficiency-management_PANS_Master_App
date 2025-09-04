<?php

namespace App\Http\Controllers;

use App\Models\Chat;
use App\Models\User;
use Inertia\Inertia;
use App\Events\MessageSent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ChatController extends Controller
{
    public function index(Request $request)
    {
       $user_id = Auth::id();
       $other_user_id = $request->integer('other_user_id');
       $users = User::select('id','name','email')->orderBy('name')->get();

       $chats = [];
       if ($other_user_id) {
           $chats = Chat::where(function ($query) use ($user_id, $other_user_id) {
                $query->where('sender_id', $user_id)
                      ->where('receiver_id', $other_user_id);
            })->orWhere(function ($query) use ($user_id, $other_user_id) {
                $query->where('sender_id', $other_user_id)
                      ->where('receiver_id', $user_id);
            })
            ->orderBy('created_at')
            ->get();
       }

       return Inertia::render('chat/index', [
           'chats' => $chats,
           'other_user_id' => $other_user_id,
           'user_id' => $user_id,
           'users' => $users
       ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'other_user_id' => 'required|exists:users,id',
            'message' => 'required|string|max:255',
        ]);

        $chat = Chat::create([
            'sender_id' => Auth::id(),
            'receiver_id' => $validated['other_user_id'],
            'message' => $validated['message'],

        ]);


    // Nadawcy nie wysyłamy ponownie tej samej wiadomości (unik duplikatu w UI) – event dostanie tylko odbiorca
    broadcast(new MessageSent($chat))->toOthers();

    return response()->json($chat, 201);
    }
}
