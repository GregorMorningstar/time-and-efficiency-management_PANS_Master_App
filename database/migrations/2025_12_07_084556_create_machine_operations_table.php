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
        Schema::create('machine_operations', function (Blueprint $table) {
            $table->id();
            // barcode generowany w modelu automatycznie
            $table->string('barcode', 13)->unique()->nullable();
            // powiązanie z maszyną
            $table->foreignId('machine_id')->constrained()->cascadeOnDelete();
            // nazwa operacji
            $table->string('operation_name');
            //czas rozpoczeciea
            $table->dateTime('operation_start_time');
            //czas zakończenia
            $table->dateTime('operation_end_time')->nullable();
            // norma na godzinę
            $table->decimal('pieces_per_hour', 8, 2);
            // czas przezbrojenia w minutach (decimal jeśli potrzebna precyzja)
            $table->decimal('setup_time_minutes', 6, 2)->nullable();
            // obliczony OEE procent dla operacji
            $table->decimal('oee_percent', 5, 2)->nullable();
            // dodatkowy opis operacji
            $table->text('description')->nullable();

            $table->timestamps();

            // indeks pomocniczy: szybkie wyszukiwanie operacji dla maszyny
            $table->index(['machine_id', 'operation_name']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('machine_operations');
    }
};
