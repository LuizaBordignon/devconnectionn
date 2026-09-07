import { useState } from 'react';
import { getPeriodReport, requestClosure, getClosure } from '../api/reports';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

export default function ReportPage() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [report, setReport] = useState(null);
  const [closure, setClosure] = useState(null);

  async function handleBuscar(e) {
    e.preventDefault();
    setReport(await getPeriodReport(startDate, endDate));
  }

  async function handleFechar() {
    const resultado = await requestClosure(startDate, endDate);
    setClosure(resultado);
  }

  async function handleAtualizarStatus() {
    setClosure(await getClosure(closure.id));
  }

    return (
    <Layout>
        <h1>Relatório do período</h1>

        <form className="card inline-form" onSubmit={handleBuscar}>
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
        <button className="btn" type="submit">Buscar</button>
        </form>

        {report && (
        <>
            <div className="summary-grid">
            <div className="summary-item"><div className="label">A pagar</div><div className="value">R$ {report.a_pagar}</div></div>
            <div className="summary-item"><div className="label">A receber</div><div className="value">R$ {report.a_receber}</div></div>
            <div className="summary-item"><div className="label">Liquidado</div><div className="value">R$ {report.liquidado}</div></div>
            <div className="summary-item"><div className="label">Vencido</div><div className="value">R$ {report.vencido}</div></div>
            </div>
            <button className="btn" onClick={handleFechar}>Fechar período (envia por e-mail)</button>
        </>
        )}

        {closure && (
        <div className="card" style={{ marginTop: 20 }}>
            <p>Status do fechamento: <span className={`status status-${closure.status === 'concluido' ? 'quitada' : closure.status === 'falhou' ? 'atrasada' : 'aberta'}`}>{closure.status}</span></p>
            {closure.status === 'falhou' && <p className="error-text">{closure.error_message}</p>}
            {(closure.status === 'pendente' || closure.status === 'processando') && (
            <button className="btn" onClick={handleAtualizarStatus}>Atualizar status</button>
            )}
        </div>
        )}
    </Layout>
    );
}