<?php

namespace App\Mail;

use App\Models\PeriodClosure;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;

class PeriodClosureMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public PeriodClosure $closure) {}

    public function build()
    {
        $inicio = $this->closure->start_date->format('d/m/Y');
        $fim = $this->closure->end_date->format('d/m/Y');

        return $this->subject("Fechamento do período {$inicio} a {$fim}")
            ->view('emails.period-closure')
            ->attach(Storage::path($this->closure->file_path));
    }
}