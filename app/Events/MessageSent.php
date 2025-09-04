<?php

namespace App\Events;

use App\Models\Chat;
use Illuminate\Broadcasting\Channel;
use Illuminate\Queue\SerializesModels;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;

class MessageSent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $chatMessage;

    /**
     * Create a new event instance.
     *
     * @return void
     */
    public function __construct(Chat $chatMessage)
    {
        $this->chatMessage = $chatMessage;
    }

  

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn()
    {
        $channels = [new PrivateChannel('chat.' . $this->chatMessage->receiver_id)];
        if ($this->chatMessage->receiver_id !== $this->chatMessage->sender_id) {
            $channels[] = new PrivateChannel('chat.' . $this->chatMessage->sender_id);
        }
        return $channels;
    }

    public function broadcastWith(): array
    {
        return [
            'chatMessage' => [
                'id' => $this->chatMessage->id,
                'sender_id' => $this->chatMessage->sender_id,
                'receiver_id' => $this->chatMessage->receiver_id,
                'message' => $this->chatMessage->message,
                'created_at' => $this->chatMessage->created_at?->toISOString(),
            ],
        ];
    }

    public function broadcastAs(): string
    {
        return 'MessageSent';
    }
}
