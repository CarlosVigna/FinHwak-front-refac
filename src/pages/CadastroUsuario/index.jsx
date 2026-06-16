import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Formulario from '../../componentes/Formulario';
import { useAuth } from '../Login/AuthContext';

const API_URL = import.meta.env.VITE_API_URL;

function CadastroUsuario() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [valores, setValores] = useState({
        nome: '',
        email: '',
        senha: '',
        confirmarSenha: ''
    });

    const [erro, setErro] = useState("");
    const [sucesso, setSucesso] = useState("");
    const [loading, setLoading] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setValores({ ...valores, [name]: value });
    };

    const handleCadastro = async (e) => {
        e.preventDefault();

        const { nome, email, senha, confirmarSenha } = valores;

        if (senha !== confirmarSenha) {
            setErro("As senhas não coincidem!");
            return;
        }

        setLoading(true);
        setErro("");

        try {
            // 1. Registra o usuário
            const registerRes = await fetch(`${API_URL}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: nome, email, password: senha }),
            });

            if (!registerRes.ok) {
                const data = await registerRes.json().catch(() => null);
                setErro(data?.message || "Erro ao cadastrar. Tente novamente.");
                return;
            }

            // 2. Faz login automaticamente com as mesmas credenciais
            const loginRes = await fetch(`${API_URL}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password: senha }),
            });

            if (!loginRes.ok) {
                // Cadastro ok, login falhou: redireciona para login manual
                setSucesso("Cadastro realizado! Redirecionando para o login...");
                setTimeout(() => navigate('/login'), 2000);
                return;
            }

            const { token } = await loginRes.json();
            login(token);
            localStorage.setItem('finhawk-new-user', 'true');
            navigate('/contas');
        } catch {
            setErro("Erro de conexão com o servidor.");
        } finally {
            setLoading(false);
        }
    };

    const camposCadastro = [
        { label: "Nome:", placeholder: "Digite seu nome", type: "text", name: "nome" },
        { label: "Email:", placeholder: "Digite seu e-mail", type: "email", name: "email" },
        { label: "Senha:", placeholder: "Digite sua senha", type: "password", name: "senha" },
        { label: "Confirme sua senha:", placeholder: "Repita sua senha", type: "password", name: "confirmarSenha" }
    ];

    return (
        <div className="container-cadastro">
            <Formulario
                titulo="Cadastro de Usuário"
                campos={camposCadastro}
                botaoTexto={loading ? "Criando conta..." : "Enviar Cadastro"}
                className="fh-btn fh-btn-primary"
                handleInputChange={handleInputChange}
                valores={valores}
                onSubmit={handleCadastro}
                layout="vertical"
                customClass="auth-card cadastro-usuario"
                erro={erro}
                sucesso={sucesso}
                disabled={loading}
            />
            <div className="auth-extra-links" style={{ marginTop: '12px' }}>
                Ao criar uma conta, você concorda com nossos{' '}
                <Link to="/termos" className="btn-link">Termos de Uso</Link>
                {' '}e{' '}
                <Link to="/privacidade" className="btn-link">Política de Privacidade</Link>
            </div>
        </div>
    );
}

export default CadastroUsuario;
