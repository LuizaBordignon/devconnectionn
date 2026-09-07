import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
      navigate('/contacts');
    } catch {
      setError('Email ou senha inválidos.');
    }
  }

    return (
    <div className="login-shell">
        <div className="login-card">
        <h1>Entrar</h1>
        <form onSubmit={handleSubmit}>
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Senha" />
            {error && <p className="error-text">{error}</p>}
            <button className="btn" type="submit">Entrar</button>
        </form>
        </div>
    </div>
    );
}