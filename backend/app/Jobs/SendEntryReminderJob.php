<?php

namespace App\Jobs;

use App\Mail\EntryReminderMail;
use App\Models\Entry;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class SendEntryReminderJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public function __construct(
        public int $entryId,
        public string $reason,
    ) {}

    public function handle(): void
    {
        $entry = Entry::find($this->entryId);

        if (!$entry) {
            return;
        }

        $coluna = $this->reason === 'overdue' ? 'overdue_notified_at' : 'due_soon_notified_at';

        if ($entry->$coluna !== null) {
            return;
        }

        Mail::to($entry->user->email)->send(new EntryReminderMail($entry, $this->reason));

        $entry->update([$coluna => now()]);
    }
}