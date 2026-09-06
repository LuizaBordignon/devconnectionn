<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use App\Models\Entry;
use Illuminate\Http\Request;

class EntryController extends Controller
{
    public function index(Request $request)
    {
        return $request->user()
            ->entries()
            ->with('contact')
            ->latest('due_date')
            ->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'contact_id' => ['required', 'integer'],
            'type' => ['required', 'in:pagar,receber'],
            'description' => ['required', 'string', 'max:255'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'due_date' => ['required', 'date'],
        ]);

        $contact = Contact::find($data['contact_id']);
        abort_if(!$contact || $contact->user_id !== $request->user()->id, 422, 'Contato inválido.');

        $entry = $request->user()->entries()->create($data);

        return response()->json($entry, 201);
    }

    public function show(Request $request, Entry $entry)
    {
        $this->authorizeOwnership($request, $entry);

        return $entry->load('contact');
    }

    public function update(Request $request, Entry $entry)
    {
        $this->authorizeOwnership($request, $entry);

        $data = $request->validate([
            'description' => ['sometimes', 'required', 'string', 'max:255'],
            'amount' => ['sometimes', 'required', 'numeric', 'min:0.01'],
            'due_date' => ['sometimes', 'required', 'date'],
        ]);

        $entry->update($data);

        return $entry;
    }

    public function destroy(Request $request, Entry $entry)
    {
        $this->authorizeOwnership($request, $entry);

        $entry->delete();

        return response()->json(null, 204);
    }

    public function liquidar(Request $request, Entry $entry)
    {
        $this->authorizeOwnership($request, $entry);

        $data = $request->validate([
            'paid_amount' => ['required', 'numeric', 'min:0.01'],
        ]);

        try {
            $entry->liquidar($data['paid_amount']);
        } catch (\DomainException $e) {
            abort(422, $e->getMessage());
        }

        return $entry;
    }

    private function authorizeOwnership(Request $request, Entry $entry): void
    {
        abort_if($entry->user_id !== $request->user()->id, 403, 'Este lançamento não pertence a você.');
    }
}