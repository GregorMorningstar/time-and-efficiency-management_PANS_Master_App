<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Enums\EducationsDegree;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('educations', function (Blueprint $table) {
            $table->id();

            // Relacja do users
            $table->foreignId('user_id')
                  ->constrained()
                  ->cascadeOnDelete();

            // Poziom wykształcenia (zmienione z 'degree' na 'level' aby spójne z serwisem/kodem)
            $table->enum(
                'level',
                array_map(fn($c) => $c->value, EducationsDegree::cases())
            )->index();

            // Nazwa szkoły
            $table->string('school');

            // Dane adresowe
            $table->string('address')->nullable();
            $table->string('zip_code', 10)->nullable();
            $table->string('city');

            // Daty i lata pomocnicze
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->unsignedSmallInteger('start_year');
            $table->unsignedSmallInteger('end_year')->nullable();

            // czy szkoła trwa

            $table->boolean('is_current')->default(false);
            // Ścieżka do pliku (zmienione z diploma_scan_path)
            $table->string('diploma_path')->nullable();

            // RODO
            $table->boolean('rodo_accepted')->default(false);
            $table->timestamp('rodo_accepted_at')->nullable();

            $table->timestamps();

            // Indeksy
            $table->index(['user_id','start_year']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('educations');
    }
};
