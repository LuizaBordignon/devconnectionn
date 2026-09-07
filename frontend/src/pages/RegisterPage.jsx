import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState([]);
  const { register } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors([]);
    try {
      await register(name, email, password);
      navigate('/contacts');
    } catch (err) {
      const validationErrors = err.response?.data?.errors;
      if (validationErrors) {
        setErrors(Object.values(validationErrors).flat());
      } else {
        setErrors(['Não foi possível criar a conta.']);
      }
    }
  }

  return (
    <div className="login-shell">
      <div className="login-card">
        <h1>Criar conta</h1>
        <form onSubmit={handleSubmit}>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome" required />
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Senha (mínimo 8 caracteres)"
            required
          />
          {errors.length > 0 && (
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {errors.map((msg, i) => <li key={i} className="error-text">{msg}</li>)}
            </ul>
          )}
          <button className="btn" type="submit">Criar conta</button>
        </form>
        <p style={{ marginTop: 12, fontSize: '0.9rem' }}>
          Já tem conta? <Link to="/login">Entrar</Link>
        </p>
      </div>
    </div>
  );
}