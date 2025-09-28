<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('address_employees', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->onDelete('cascade'); // relacja 1:1 z users
            $table->string('street');
            $table->string('city');
            $table->string('house_number');
            $table->string('apartment_number')->nullable();
            $table->string('zip_code');
            $table->string('country');
            $table->string('phone_number');
            $table->boolean('rodo_accept')->default(false);
            $table->string('address_type'); // 'zamieszkania' lub 'korespondencyjny'
            $table->string('id_card_number');
            $table->string('pesel');
            $table->string('id_card_scan')->nullable();
            $table->timestamps();

            $table->index('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('address_employees');
    }
};
