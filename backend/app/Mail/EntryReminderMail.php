<?php

namespace App\Mail;

use App\Models\Entry;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class EntryReminderMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Entry $entry,
        public string $reason,
    ) {}

    public function build()
    {
        $assunto = $this->reason === 'overdue'
            ? "Conta vencida: {$this->entry->description}"
            : "Conta próxima do vencimento: {$this->entry->description}";

        return $this->subject($assunto)->view('emails.entry-reminder');
    }
}