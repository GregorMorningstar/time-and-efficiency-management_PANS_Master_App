<?php

use App\Enums\UserRole;
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
        Schema::create('users', function (Blueprint $table) {
            $table->id();

            $table->string('name');
            $table->string('email')->unique();

            $table->enum('role', array_map(fn ($r) => $r->value, UserRole::cases()))
                  ->default(UserRole::EMPLOYEE->value)
                  ->index();
            $table->string('barcode')->unique()->nullable()->length(13);
            $table->boolean('education_completed')->default(false)->index();
            $table->boolean('experience_completed')->default(false)->index();
            $table->boolean('address_completed')->default(false)->index();

            //urlop
            $table->integer('annual_leave_entitlement')->default(20);
            $table->integer('leave_balance')->default(20);
            $table->integer('leave_used')->default(0);
            $table->integer('carryover_leave')->default(0);
            $table->timestamp('email_verified_at')->nullable();

            $table->integer('experience_months')->default(0); //months of experience
            $table->integer('education_levels')->default(0); //highest education level add 8 years (98 months) for experience_months
            $table->string('password');
            $table->rememberToken();
            $table->timestamps();
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable()->index();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('users');
    }
};
