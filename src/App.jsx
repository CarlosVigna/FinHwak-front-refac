import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth, AuthProvider } from './pages/Login/AuthContext';
import { AccountProvider } from './contexts/AccountContext';
import PrivateRoute from './pages/Login/PrivateRoute';
import AccountRoute from './pages/Login/AccountRoute';
import ErrorBoundary from './componentes/ErrorBoundary';

import AppLayout from './componentes/layout/AppLayout';
import Footer from './componentes/Footer';

// Rotas carregadas sob demanda (React.lazy) -- cada uma vira seu proprio
// chunk, entao libs pesadas usadas so em telas especificas (recharts no
// Dashboard, jspdf/html2canvas nas telas com exportar PDF) saem do bundle
// principal e so baixam quando o usuario realmente visita aquela tela.
const AuthTabs = lazy(() => import('./pages/AuthTabs'));
const EsqueciSenha = lazy(() => import('./pages/EsqueciSenha'));
const ResetSenha = lazy(() => import('./pages/ResetSenha'));
const Privacidade = lazy(() => import('./pages/Privacidade'));
const Termos = lazy(() => import('./pages/Termos'));
const Contas = lazy(() => import('./pages/Contas'));
const CadastroTitulo = lazy(() => import('./pages/CadastroTitulo'));
const CadastroCategoria = lazy(() => import('./pages/CadastroCategoria'));
const CriarConta = lazy(() => import('./pages/CriarConta'));
const EditarConta = lazy(() => import('./pages/EditarConta'));
const ContaDetails = lazy(() => import('./pages/ContaDetails'));
const ContasReceber = lazy(() => import('./pages/ContasReceber'));
const ContasPagar = lazy(() => import('./pages/ContasPagar'));
const ContasRecebidas = lazy(() => import('./pages/ContasRecebidas'));
const ContasPagas = lazy(() => import('./pages/ContasPagas'));
const ContasPendentes = lazy(() => import('./pages/ContasPendentes'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ChecklistMensal = lazy(() => import('./pages/ChecklistMensal/index.jsx'));
const Configuracoes = lazy(() => import('./pages/Configuracoes'));

function RouteFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-border border-t-primary" />
    </div>
  );
}

// Paths que renderizam sem sidebar (layout público)
const PUBLIC_PATHS = ['/', '/login', '/cadastro', '/esqueci-senha', '/reset-senha', '/privacidade', '/termos'];

function App() {
  const { isAuthenticated } = useAuth();
  const { pathname } = useLocation();

  const isPublicPath = PUBLIC_PATHS.some(p =>
    pathname === p || (p !== '/' && pathname.startsWith(p + '/'))
  );

  // ── Rotas públicas — sem sidebar, sem app-layout ──
  if (isPublicPath) {
    return (
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/"              element={<Navigate to="/login" replace />} />
          <Route path="/login"         element={<AuthTabs />} />
          <Route path="/cadastro"      element={<AuthTabs initialTab="cadastro" />} />
          <Route path="/esqueci-senha" element={<EsqueciSenha />} />
          <Route path="/reset-senha"   element={<ResetSenha />} />
          <Route path="/privacidade"   element={<Privacidade />} />
          <Route path="/termos"        element={<Termos />} />
        </Routes>
      </Suspense>
    );
  }

  // ── Rotas privadas — com sidebar e app-layout ──
  const privateRoutes = (
    <ErrorBoundary>
      <Suspense fallback={<RouteFallback />}>
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
      </Suspense>
    </ErrorBoundary>
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-bg">
        <main className="p-4 lg:p-6">{privateRoutes}</main>
        <Footer />
      </div>
    );
  }

  return <AppLayout>{privateRoutes}</AppLayout>;
}

function AppWrapper() {
  return (
    <AuthProvider>
      <AccountProvider>
        <Router>
          <App />
        </Router>
      </AccountProvider>
    </AuthProvider>
  );
}

export default AppWrapper;
