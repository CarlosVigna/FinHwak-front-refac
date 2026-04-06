import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useAuth, AuthProvider } from './pages/Login/authContext';
import PrivateRoute from './pages/Login/privateRoute';
import AccountRoute from './pages/Login/AccountRoute';

import MenuHome from './componentes/MenuHome';
import Banner from './componentes/Banner';
import Footer from './componentes/Footer';
import BodyHome from './componentes/BodyHome';

import CadastroUsuario from './pages/CadastroUsuario';
import Login from './pages/Login';
import Contas from './pages/Contas';
import CadastroTitulo from './pages/CadastroTitulo';
import CadastroCategoria from './pages/CadastroCategoria';
import CriarConta from './pages/CriarConta';
import EditarConta from './pages/EditarConta';
import ContaDetails from './pages/ContaDetails';
import ContasReceber from './pages/ContasReceber';
import ContasPagar from './pages/ContasPagar';
import Sobre from './pages/Sobre';
import ContasRecebidas from './pages/ContasRecebidas';
import ContasPagas from './pages/ContasPagas';
import ContasPendentes from './pages/ContasPendentes';
import Dashboard from './pages/Dashboard';
import ChecklistMensal from './pages/Checklistmensal';

import './App.css';

function App() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const showBanner = ['/', '/home', '/sobre', '/login'].includes(location.pathname);

  return (
    <div className="app-shell">
      <MenuHome isAuthenticated={isAuthenticated} />
      <div className="app-content">
        {showBanner && <Banner />}
        <main>
          <Routes>
            <Route path="/" element={<BodyHome />} />
            <Route path="/home" element={<BodyHome />} />
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<CadastroUsuario />} />
            <Route path="/sobre" element={<Sobre />} />

            <Route
              path="/contas"
              element={
                <PrivateRoute>
                  <Contas />
                </PrivateRoute>
              }
            />

            <Route
              path="/criar-conta"
              element={
                <PrivateRoute>
                  <CriarConta />
                </PrivateRoute>
              }
            />

            <Route
              path="/editar-conta/:id"
              element={
                <PrivateRoute>
                  <EditarConta />
                </PrivateRoute>
              }
            />

            <Route
              path="/conta/:id"
              element={
                <PrivateRoute>
                  <ContaDetails />
                </PrivateRoute>
              }
            />

            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <AccountRoute>
                    <Dashboard />
                  </AccountRoute>
                </PrivateRoute>
              }
            />

            <Route
              path="/cadastroTitulo"
              element={
                <PrivateRoute>
                  <AccountRoute>
                    <CadastroTitulo />
                  </AccountRoute>
                </PrivateRoute>
              }
            />

            <Route
              path="/cadastrarCategoria"
              element={
                <PrivateRoute>
                  <AccountRoute>
                    <CadastroCategoria />
                  </AccountRoute>
                </PrivateRoute>
              }
            />

            <Route
              path="/relContasReceber"
              element={
                <PrivateRoute>
                  <AccountRoute>
                    <ContasReceber />
                  </AccountRoute>
                </PrivateRoute>
              }
            />

            <Route
              path="/relContasPagar"
              element={
                <PrivateRoute>
                  <AccountRoute>
                    <ContasPagar />
                  </AccountRoute>
                </PrivateRoute>
              }
            />

            <Route
              path="/relRecebimentos"
              element={
                <PrivateRoute>
                  <AccountRoute>
                    <ContasRecebidas />
                  </AccountRoute>
                </PrivateRoute>
              }
            />

            <Route
              path="/relPagamentos"
              element={
                <PrivateRoute>
                  <AccountRoute>
                    <ContasPagas />
                  </AccountRoute>
                </PrivateRoute>
              }
            />

            <Route
              path="/contas-pendentes"
              element={
                <PrivateRoute>
                  <AccountRoute>
                    <ContasPendentes />
                  </AccountRoute>
                </PrivateRoute>
              }
            />

            <Route
              path="/checklist-mensal"
              element={
                <PrivateRoute>
                  <AccountRoute>
                    <ChecklistMensal />
                  </AccountRoute>
                </PrivateRoute>
              }
            />
          </Routes>
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
      </Router>
    </AuthProvider>
  );
}

export default AppWrapper;