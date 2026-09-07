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
    Schema::create('period_closures', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')->constrained()->cascadeOnDelete();
        $table->date('start_date');
        $table->date('end_date');
        $table->enum('status', ['pendente', 'processando', 'concluido', 'falhou'])->default('pendente');
        $table->string('file_path')->nullable();
        $table->text('error_message')->nullable();
        $table->timestamp('completed_at')->nullable();
        $table->timestamps();

        $table->unique(['user_id', 'start_date', 'end_date']);
    });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('period_closures');
    }
};
