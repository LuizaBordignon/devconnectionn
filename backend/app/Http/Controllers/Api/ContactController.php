<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use Illuminate\Http\Request;

class ContactController extends Controller
{
    public function index(Request $request)
    {
        return $request->user()
            ->contacts()
            ->latest()
            ->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'in:cliente,fornecedor'],
            'email' => ['nullable', 'email'],
            'phone' => ['nullable', 'string', 'max:30'],
        ]);

        $contact = $request->user()->contacts()->create($data);

        return response()->json($contact, 201);
    }

    public function show(Request $request, Contact $contact)
    {
        $this->authorizeOwnership($request, $contact);

        return $contact;
    }

    public function update(Request $request, Contact $contact)
    {
        $this->authorizeOwnership($request, $contact);

        $data = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'type' => ['sometimes', 'required', 'in:cliente,fornecedor'],
            'email' => ['nullable', 'email'],
            'phone' => ['nullable', 'string', 'max:30'],
        ]);

        $contact->update($data);

        return $contact;
    }

    public function destroy(Request $request, Contact $contact)
        {
            $this->authorizeOwnership($request, $contact);

            abort_if(
                $contact->entries()->exists(),
                422,
                'Não é possível apagar um contato com lançamentos vinculados.'
            );

            $contact->delete();

            return response()->json(null, 204);
        }

    private function authorizeOwnership(Request $request, Contact $contact): void
    {
        abort_if($contact->user_id !== $request->user()->id, 403, 'Este contato não pertence a você.');
    }
}