<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Enums\MachineStatus;


return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('machines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->string('model');
            $table->string('image_path')->nullable();
            $table->integer('year_of_production')->nullable();
            $table->integer('working_hours')->default(0);
            $table->string('serial_number')->unique();
            $table->string('barcode', 13)->unique()->nullable();
            $table->text('description')->nullable();
            $table->integer('max_productions_per_hour')->nullable();
            $table->foreignId('department_id')->constrained()->onDelete('cascade');
            $table->enum('status', array_map(function($c){ return $c->value; }, MachineStatus::cases()))
                  ->default(MachineStatus::INACTIVE->value);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('machines');
    }
};
