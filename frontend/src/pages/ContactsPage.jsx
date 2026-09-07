import { useEffect, useState } from 'react';
import { getContacts, createContact, deleteContact } from '../api/contacts';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ContactsPage() {
  const [contacts, setContacts] = useState([]);
  const [name, setName] = useState('');
  const [type, setType] = useState('cliente');
  const { logout } = useAuth();

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
    await deleteContact(id);
    load();
  }

  return (
    <div>
      <nav>
        <Link to="/contacts">Contatos</Link> | <Link to="/entries">Lançamentos</Link> | <Link to="/report">Relatório</Link>
        {' '}<button onClick={logout}>Sair</button>
      </nav>

      <h1>Contatos</h1>

      <form onSubmit={handleSubmit}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome" required />
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="cliente">Cliente</option>
          <option value="fornecedor">Fornecedor</option>
        </select>
        <button type="submit">Adicionar</button>
      </form>

      <ul>
        {contacts.map((c) => (
          <li key={c.id}>
            {c.name} ({c.type})
            <button onClick={() => handleDelete(c.id)}>Apagar</button>
          </li>
        ))}
      </ul>
    </div>
  );
}