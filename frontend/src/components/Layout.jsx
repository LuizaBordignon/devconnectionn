import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LINKS = [
  { to: '/contacts', label: 'Contatos' },
  { to: '/entries', label: 'Lançamentos' },
  { to: '/report', label: 'Relatório' },
];

export default function Layout({ children }) {
  const { logout } = useAuth();
  const { pathname } = useLocation();

  return (
    <div className="app-shell">
      <header className="topbar">
        <span className="brand">Contas</span>
        <nav>
          {LINKS.map((link) => (
            <Link key={link.to} to={link.to} className={pathname === link.to ? 'active' : ''}>
              {link.label}
            </Link>
          ))}
        </nav>
        <button className="btn btn-ghost" onClick={logout}>Sair</button>
      </header>
      <main className="content">{children}</main>
    </div>
  );
}