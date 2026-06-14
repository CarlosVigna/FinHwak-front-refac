import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useAuth, AuthProvider } from './pages/Login/AuthContext';
import PrivateRoute from './pages/Login/PrivateRoute';
import AccountRoute from './pages/Login/AccountRoute';
import ErrorBoundary from './componentes/ErrorBoundary';

import LandingPage from './pages/LandingPage';
import MenuHome from './componentes/MenuHome';
import Footer from './componentes/Footer';
import PlanModal from './componentes/PlanModal';
import AuthTabs from './pages/AuthTabs';
import EsqueciSenha from './pages/EsqueciSenha';
import ResetSenha from './pages/ResetSenha';
import Privacidade from './pages/Privacidade';
import Termos from './pages/Termos';
import Contas from './pages/Contas';
import CadastroTitulo from './pages/CadastroTitulo';
import CadastroCategoria from './pages/CadastroCategoria';
import CriarConta from './pages/CriarConta';
import EditarConta from './pages/EditarConta';
import ContaDetails from './pages/ContaDetails';
import ContasReceber from './pages/ContasReceber';
import ContasPagar from './pages/ContasPagar';
import ContasRecebidas from './pages/ContasRecebidas';
import ContasPagas from './pages/ContasPagas';
import ContasPendentes from './pages/ContasPendentes';
import Dashboard from './pages/Dashboard';
import ChecklistMensal from './pages/ChecklistMensal/index.jsx';
import Configuracoes from './pages/Configuracoes';

// Paths que renderizam sem sidebar (layout público)
const PUBLIC_PATHS = ['/', '/login', '/cadastro', '/esqueci-senha', '/reset-senha', '/privacidade', '/termos'];

function App() {
  const { isAuthenticated } = useAuth();
  const { pathname } = useLocation();

  const isPublicPath = PUBLIC_PATHS.some(p =>
    pathname === p || (p !== '/' && pathname.startsWith(p))
  );

  // ── Rotas públicas — sem sidebar, sem app-layout ──
  if (isPublicPath) {
    return (
      <Routes>
        <Route path="/"              element={<LandingPage />} />
        <Route path="/login"         element={<AuthTabs />} />
        <Route path="/cadastro"      element={<AuthTabs initialTab="cadastro" />} />
        <Route path="/esqueci-senha" element={<EsqueciSenha />} />
        <Route path="/reset-senha"   element={<ResetSenha />} />
        <Route path="/privacidade"   element={<Privacidade />} />
        <Route path="/termos"        element={<Termos />} />
      </Routes>
    );
  }

  // ── Rotas privadas — com sidebar e app-layout ──
  return (
    <div className="app-layout">
      {isAuthenticated && <MenuHome />}
      <div className={`app-main${!isAuthenticated ? ' app-main-full' : ''}`}>
        <main>
          <ErrorBoundary>
          <Routes>
            <Route
              path="/contas"
              element={<PrivateRoute><Contas /></PrivateRoute>}
            />
            <Route
              path="/criar-conta"
              element={<PrivateRoute><CriarConta /></PrivateRoute>}
            />
            <Route
              path="/editar-conta/:id"
              element={<PrivateRoute><EditarConta /></PrivateRoute>}
            />
            <Route
              path="/conta/:id"
              element={<PrivateRoute><ContaDetails /></PrivateRoute>}
            />
            <Route
              path="/dashboard"
              element={<PrivateRoute><Dashboard /></PrivateRoute>}
            />
            <Route
              path="/cadastroTitulo"
              element={<PrivateRoute><AccountRoute><CadastroTitulo /></AccountRoute></PrivateRoute>}
            />
            <Route
              path="/cadastrarCategoria"
              element={<PrivateRoute><AccountRoute><CadastroCategoria /></AccountRoute></PrivateRoute>}
            />
            <Route
              path="/relContasReceber"
              element={<PrivateRoute><AccountRoute><ContasReceber /></AccountRoute></PrivateRoute>}
            />
            <Route
              path="/relContasPagar"
              element={<PrivateRoute><AccountRoute><ContasPagar /></AccountRoute></PrivateRoute>}
            />
            <Route
              path="/relRecebimentos"
              element={<PrivateRoute><AccountRoute><ContasRecebidas /></AccountRoute></PrivateRoute>}
            />
            <Route
              path="/relPagamentos"
              element={<PrivateRoute><AccountRoute><ContasPagas /></AccountRoute></PrivateRoute>}
            />
            <Route
              path="/contas-pendentes"
              element={<PrivateRoute><AccountRoute><ContasPendentes /></AccountRoute></PrivateRoute>}
            />
            <Route
              path="/checklist-mensal"
              element={<PrivateRoute><AccountRoute><ChecklistMensal /></AccountRoute></PrivateRoute>}
            />
            <Route
              path="/configuracoes"
              element={<PrivateRoute><Configuracoes /></PrivateRoute>}
            />
          </Routes>
          </ErrorBoundary>
        </main>
        <Footer />
      </div>
    </div>
  );
}

function AppWrapper() {
  return (
    <AuthProvider>
      <Router>
        <App />
        <PlanModal />
      </Router>
    </AuthProvider>
  );
}

export default AppWrapper;
