<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// Autoryzacja prywatnego kanału czatu dla odbiorcy
Broadcast::channel('chat.{id}', function ($user, $id) {
    // Użytkownik może nasłuchiwać swojego własnego kanału prywatnego
    return (int) $user->id === (int) $id;
});

// Kanał może być użyty zarówno dla nadawcy jak i odbiorcy (już powyżej). Dodatkowe reguły niepotrzebne.

// Presence channel do statusów online w czacie
Broadcast::channel('presence.chat', function ($user) {
    return ['id' => $user->id, 'name' => $user->name];
});
