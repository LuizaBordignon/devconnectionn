import { useEffect, useState } from 'react';
import { getEntries, createEntry, updateEntry, liquidarEntry, deleteEntry, getEntryHistory } from '../api/entries';
import { getContacts } from '../api/contacts';
import Layout from '../components/Layout';
import Modal from '../components/Modal';

export default function EntriesPage() {
  const [entries, setEntries] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [history, setHistory] = useState(null);
  const [form, setForm] = useState({
    contact_id: '', type: 'pagar', description: '', amount: '', due_date: '',
  });

  async function loadEntries() {
    setEntries(await getEntries());
  }

  useEffect(() => {
    loadEntries();
    getContacts().then(setContacts);
  }, []);

  function resetForm() {
    setForm({ contact_id: '', type: 'pagar', description: '', amount: '', due_date: '' });
    setEditingId(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (editingId) {
      await updateEntry(editingId, {
        description: form.description,
        amount: form.amount,
        due_date: form.due_date,
      });
    } else {
      await createEntry(form);
    }
    resetForm();
    loadEntries();
  }

  function handleEdit(entry) {
    setForm({
      contact_id: entry.contact_id,
      type: entry.type,
      description: entry.description,
      amount: entry.amount,
      due_date: entry.due_date?.slice(0, 10),
    });
    setEditingId(entry.id);
  }

  async function handleLiquidar(entry) {
    if (!window.confirm(`Confirma a liquidação de "${entry.description}" no valor de R$ ${entry.amount}?`)) return;
    await liquidarEntry(entry.id, entry.amount);
    loadEntries();
  }

  async function handleDelete(id) {
    if (!window.confirm('Tem certeza que deseja excluir este lançamento?')) return;
    try {
      await deleteEntry(id);
      loadEntries();
    } catch (err) {
      alert(err.response?.data?.message || 'Erro ao apagar lançamento.');
    }
  }

  async function handleShowHistory(entry) {
    const records = await getEntryHistory(entry.id);
    setHistory({ label: entry.description, records });
  }

  return (
    <Layout>
      <h1>Lançamentos</h1>

      <form className="card inline-form" onSubmit={handleSubmit}>
        <select
          value={form.contact_id}
          onChange={(e) => setForm({ ...form, contact_id: e.target.value })}
          disabled={!!editingId}
          required
        >
          <option value="">Selecione o contato</option>
          {contacts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
          disabled={!!editingId}
        >
          <option value="pagar">A pagar</option>
          <option value="receber">A receber</option>
        </select>

        <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descrição" required />
        <input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="Valor" required />
        <input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} required />

        <button className="btn" type="submit">{editingId ? 'Salvar alterações' : 'Adicionar'}</button>
        {editingId && <button type="button" className="btn-secondary" onClick={resetForm}>Cancelar</button>}
      </form>
      {editingId && (
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
          Editando lançamento — contato e tipo não podem ser alterados.
        </p>
      )}

      <table>
        <thead>
          <tr><th>Descrição</th><th>Tipo</th><th>Valor</th><th>Vencimento</th><th>Status</th><th></th></tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id}>
              <td>{entry.description}</td>
              <td>{entry.type === 'pagar' ? 'A pagar' : 'A receber'}</td>
              <td>R$ {entry.amount}</td>
              <td>{entry.due_date?.slice(0, 10)}</td>
              <td><span className={`status status-${entry.status}`}>{entry.status}</span></td>
              <td>
                <div className="table-actions">
                  {entry.status !== 'quitada' && (
                    <>
                      <button className="btn" onClick={() => handleLiquidar(entry)}>Liquidar</button>
                      <button className="btn-secondary" onClick={() => handleEdit(entry)}>Editar</button>
                      <button className="btn-danger" onClick={() => handleDelete(entry.id)}>Apagar</button>
                    </>
                  )}
                  <button className="btn-secondary" onClick={() => handleShowHistory(entry)}>Histórico</button>
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
                  <div>Descrição: {h.previous_data.description}</div>
                  <div>Valor: R$ {h.previous_data.amount}</div>
                  <div>Vencimento: {h.previous_data.due_date?.slice(0, 10)}</div>
                </li>
              ))}
            </ul>
          )}
        </Modal>
      )}
    </Layout>
  );
}