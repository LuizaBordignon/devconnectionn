<h2>{{ $reason === 'overdue' ? 'Conta vencida' : 'Conta próxima do vencimento' }}</h2>

<p>Lançamento: <strong>{{ $entry->description }}</strong></p>
<p>Valor: R$ {{ number_format($entry->amount, 2, ',', '.') }}</p>
<p>Vencimento: {{ $entry->due_date->format('d/m/Y') }}</p>

@if($reason === 'overdue')
    <p style="color: red;">Esta conta venceu e ainda não foi paga.</p>
@else
    <p style="color: orange;">Esta conta vence em breve.</p>
@endif