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
            ->get(); // aqui ele vai buscar todos os contatos do usuário autenticado, ordenando do mais recente para o mais antigo, e retornando como uma coleção de contatos.
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'in:cliente,fornecedor'],
            'email' => ['nullable', 'email'],
            'phone' => ['nullable', 'string', 'max:30'],
        ]);

        $contact = $request->user()->contacts()->create($data); //aqui ele vai criar um novo contato para o usuário autenticado, usando os dados validados da requisição. O método create() vai automaticamente preencher o campo user_id do contato com o ID do usuário autenticado, garantindo que o contato pertença a ele.

        return response()->json($contact, 201);
    }

    public function show(Request $request, Contact $contact)
    {
        $this->authorizeOwnership($request, $contact); //essa função é responsável por verificar se o contato pertence ao usuário autenticado. Se não pertencer, ele retorna um erro 403 (proibido).

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

    public function historico(Request $request, Contact $contact) 
        {
            $this->authorizeOwnership($request, $contact); 

            return $contact->editHistories;
        }
}