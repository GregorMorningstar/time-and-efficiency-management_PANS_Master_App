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
        Schema::create('failure_reports', function (Blueprint $table) {
            $table->id();
            //barcode generwany w modelu autpomatycznie
            $table->string('barcode', 13)->unique()->nullable();
            // powiązanie z użytkownikiem (np. właściciel/odpowiedzialny)
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            // powiązanie z maszyną
            $table->foreignId('machine_id')->constrained()->cascadeOnDelete();
            // zakres/ciężkość awarii
            $table->integer('fault_range')->nullable();
            $table->text('description')->nullable();
            // kiedy nastąpiła awaria (data/czas)
            $table->dateTime('failure_date')->nullable();
             // kiedy zgłoszono
            $table->timestamp('reported_at')->useCurrent();
            // data usunięcia / soft delete
            $table->softDeletes(); // dodaje deleted_at
            $table->timestamps();
            // indeksy pomocnicze
            $table->index(['machine_id', 'user_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('failure_reports');
    }
};
