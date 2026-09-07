import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import ContactsPage from './pages/ContactsPage';
import EntriesPage from './pages/EntriesPage';
import ReportPage from './pages/ReportPage';

function PrivateRoute({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" />;
}

function DefaultRedirect() {
  const { token } = useAuth();
  return <Navigate to={token ? '/contacts' : '/login'} />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<DefaultRedirect />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/contacts" element={<PrivateRoute><ContactsPage /></PrivateRoute>} />
          <Route path="/entries" element={<PrivateRoute><EntriesPage /></PrivateRoute>} />
          <Route path="/report" element={<PrivateRoute><ReportPage /></PrivateRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
