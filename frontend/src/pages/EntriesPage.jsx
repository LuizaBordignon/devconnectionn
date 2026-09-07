import { useEffect, useState } from 'react';
import { getEntries, createEntry, liquidarEntry, deleteEntry } from '../api/entries';
import { getContacts } from '../api/contacts';
import Layout from '../components/Layout';

export default function EntriesPage() {
  const [entries, setEntries] = useState([]);
  const [contacts, setContacts] = useState([]);
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

  async function handleSubmit(e) {
    e.preventDefault();
    await createEntry(form);
    setForm({ contact_id: '', type: 'pagar', description: '', amount: '', due_date: '' });
    loadEntries();
  }

  async function handleLiquidar(entry) {
    const valor = window.prompt('Valor pago:', entry.amount);
    if (!valor) return;
    await liquidarEntry(entry.id, Number(valor));
    loadEntries();
  }

  async function handleDelete(id) {
    try {
      await deleteEntry(id);
      loadEntries();
    } catch (err) {
      alert(err.response?.data?.message || 'Erro ao apagar lançamento.');
    }
  }

  return (
    <Layout>
      <h1>Lançamentos</h1>

      <form className="card inline-form" onSubmit={handleSubmit}>
        <select
          value={form.contact_id}
          onChange={(e) => setForm({ ...form, contact_id: e.target.value })}
          required
        >
          <option value="">Selecione o contato</option>
          {contacts.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
          <option value="pagar">A pagar</option>
          <option value="receber">A receber</option>
        </select>

        <input
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Descrição"
          required
        />

        <input
          type="number"
          step="0.01"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
          placeholder="Valor"
          required
        />

        <input
          type="date"
          value={form.due_date}
          onChange={(e) => setForm({ ...form, due_date: e.target.value })}
          required
        />

        <button className="btn" type="submit">Adicionar</button>
      </form>

      <table>
        <thead>
          <tr>
            <th>Descrição</th>
            <th>Tipo</th>
            <th>Valor</th>
            <th>Vencimento</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id}>
              <td>{entry.description}</td>
              <td>{entry.type === 'pagar' ? 'A pagar' : 'A receber'}</td>
              <td>R$ {entry.amount}</td>
              <td>{entry.due_date?.slice(0, 10)}</td>
              <td>
                <span className={`status status-${entry.status}`}>{entry.status}</span>
              </td>
              <td>
                {entry.status !== 'quitada' && (
                  <div className="table-actions">
                    <button className="btn" onClick={() => handleLiquidar(entry)}>Liquidar</button>
                    <button className="btn-danger" onClick={() => handleDelete(entry.id)}>Apagar</button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Layout>
  );
}