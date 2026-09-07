import { useEffect, useState } from 'react';
import { getContacts, createContact, deleteContact } from '../api/contacts';
import Layout from '../components/Layout';

export default function ContactsPage() {
  const [contacts, setContacts] = useState([]);
  const [name, setName] = useState('');
  const [type, setType] = useState('cliente');

  async function load() {
    setContacts(await getContacts());
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    await createContact({ name, type });
    setName('');
    load();
  }

async function handleDelete(id) {
  if (!window.confirm('Tem certeza que deseja excluir este contato?')) {
    return;
  }
  try {
    await deleteContact(id);
    load();
  } catch (err) {
    alert(err.response?.data?.message || 'Erro ao apagar contato.');
  }
}

    return (
    <Layout>
        <h1>Contatos</h1>

        <form className="card inline-form" onSubmit={handleSubmit}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome" required />
        <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="cliente">Cliente</option>
            <option value="fornecedor">Fornecedor</option>
        </select>
        <button className="btn" type="submit">Adicionar</button>
        </form>

        <table>
        <thead>
            <tr>
            <th>Nome</th>
            <th>Tipo</th>
            <th></th>
            </tr>
        </thead>
        <tbody>
            {contacts.map((c) => (
            <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.type === 'cliente' ? 'Cliente' : 'Fornecedor'}</td>
                <td>
                <button className="btn-danger" onClick={() => handleDelete(c.id)}>Apagar</button>
                </td>
            </tr>
            ))}
        </tbody>
        </table>
    </Layout>
    );
}