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
        Schema::create('machine_responsibilities', function (Blueprint $table) {
            $table->id();
            $table->string('barcode', 13)->unique()->nullable();

            // FK do users (typ unsignedBigInteger)
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            // FK do machines
            $table->foreignId('machine_id')->constrained()->cascadeOnDelete();

            // FK do machine_operations — użyj constrained('machine_operations')
            $table->foreignId('machine_operation_id')->nullable()->constrained('machine_operations')->cascadeOnDelete();

            $table->timestamp('assigned_at')->nullable();
            $table->timestamp('released_at')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('machine_responsibilities');
    }
};
