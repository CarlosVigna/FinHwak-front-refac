import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../../componentes/ui/Input';
import Button from '../../componentes/ui/Button';
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

    return (
        <div>
            <form onSubmit={handleCadastro} className="flex flex-col gap-4">
                <h2 className="text-xl font-semibold text-text">Cadastro de Usuário</h2>

                {erro && (
                    <p className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">{erro}</p>
                )}
                {sucesso && (
                    <p className="rounded-md bg-success/10 px-3 py-2 text-sm text-success">{sucesso}</p>
                )}

                <Input
                    label="Nome:"
                    type="text"
                    name="nome"
                    placeholder="Digite seu nome"
                    autoComplete="name"
                    value={valores.nome}
                    onChange={handleInputChange}
                />
                <Input
                    label="Email:"
                    type="email"
                    name="email"
                    placeholder="Digite seu e-mail"
                    autoComplete="email"
                    value={valores.email}
                    onChange={handleInputChange}
                />
                <Input
                    label="Senha:"
                    type="password"
                    name="senha"
                    placeholder="Digite sua senha"
                    autoComplete="new-password"
                    value={valores.senha}
                    onChange={handleInputChange}
                />
                <Input
                    label="Confirme sua senha:"
                    type="password"
                    name="confirmarSenha"
                    placeholder="Repita sua senha"
                    autoComplete="new-password"
                    value={valores.confirmarSenha}
                    onChange={handleInputChange}
                />

                <Button type="submit" disabled={loading} className="w-full">
                    {loading ? "Criando conta..." : "Enviar Cadastro"}
                </Button>
            </form>

            <div className="mt-3 text-sm text-muted2">
                Ao criar uma conta, você concorda com nossos{' '}
                <Link to="/termos" className="text-primary hover:underline">Termos de Uso</Link>
                {' '}e{' '}
                <Link to="/privacidade" className="text-primary hover:underline">Política de Privacidade</Link>
            </div>
        </div>
    );
}

export default CadastroUsuario;
