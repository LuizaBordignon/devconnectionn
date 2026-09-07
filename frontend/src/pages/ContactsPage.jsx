import { useEffect, useState } from 'react';
import { getContacts, createContact, updateContact, deleteContact, getContactHistory } from '../api/contacts';
import Layout from '../components/Layout';
import Modal from '../components/Modal';

export default function ContactsPage() {
  const [contacts, setContacts] = useState([]);
  const [name, setName] = useState('');
  const [type, setType] = useState('cliente');
  const [editingId, setEditingId] = useState(null);
  const [history, setHistory] = useState(null);

  async function load() {
    setContacts(await getContacts());
  }

  useEffect(() => {
    load();
  }, []);

  function resetForm() {
    setName('');
    setType('cliente');
    setEditingId(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (editingId) {
      await updateContact(editingId, { name, type });
    } else {
      await createContact({ name, type });
    }
    resetForm();
    load();
  }

  function handleEdit(contact) {
    setName(contact.name);
    setType(contact.type);
    setEditingId(contact.id);
  }

  async function handleDelete(id) {
    if (!window.confirm('Tem certeza que deseja excluir este contato?')) return;
    try {
      await deleteContact(id);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Erro ao apagar contato.');
    }
  }

  async function handleShowHistory(contact) {
    const records = await getContactHistory(contact.id);
    setHistory({ label: contact.name, records });
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
        <button className="btn" type="submit">{editingId ? 'Salvar alterações' : 'Adicionar'}</button>
        {editingId && (
          <button type="button" className="btn-secondary" onClick={resetForm}>Cancelar</button>
        )}
      </form>

      <table>
        <thead>
          <tr><th>Nome</th><th>Tipo</th><th></th></tr>
        </thead>
        <tbody>
          {contacts.map((c) => (
            <tr key={c.id}>
              <td>{c.name}</td>
              <td>{c.type === 'cliente' ? 'Cliente' : 'Fornecedor'}</td>
              <td>
                <div className="table-actions">
                  <button className="btn-secondary" onClick={() => handleEdit(c)}>Editar</button>
                  <button className="btn-secondary" onClick={() => handleShowHistory(c)}>Histórico</button>
                  <button className="btn-danger" onClick={() => handleDelete(c.id)}>Apagar</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {history && (
        <Modal title={`Histórico de "${history.label}"`} onClose={() => setHistory(null)}>
          {history.records.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)' }}>Nenhuma edição registrada.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {history.records.map((h) => (
                <li key={h.id} style={{ borderTop: '1px solid var(--color-border)', padding: '10px 0' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                    {new Date(h.created_at).toLocaleString('pt-BR')}
                  </div>
                  <div>Nome: {h.previous_data.name}</div>
                  <div>Tipo: {h.previous_data.type === 'cliente' ? 'Cliente' : 'Fornecedor'}</div>
                </li>
              ))}
            </ul>
          )}
        </Modal>
      )}
    </Layout>
  );
}