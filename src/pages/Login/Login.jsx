import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../../componentes/ui/Input';
import Button from '../../componentes/ui/Button';
import { useAuth } from './AuthContext';

const Login = () => {
    const { login } = useAuth();

    const [valores, setValores] = useState({
        email: '',
        password: ''
    });

    const [erro, setErro] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setValores({
            ...valores,
            [name]: value
        });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        const { email, password } = valores;

        if (!email || !password) {
            setErro('Por favor, preencha todos os campos.');
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                const errorMessage = errorData?.message || 'Erro ao fazer login (Verifique suas credenciais).';
                setErro(errorMessage);
                return;
            }

            const data = await response.json();
            const { token, refreshToken } = data;

            localStorage.removeItem('accountId');
            login(token, refreshToken);

            setValores({ email: '', password: '' });
            setErro('');

            navigate('/contas');
        } catch (error) {
            console.error('Erro na requisicao:', error);
            setErro('Erro ao conectar com o servidor.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <h2 className="text-xl font-semibold text-text">Entrar</h2>

                {erro && (
                    <p className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">{erro}</p>
                )}

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
                    name="password"
                    placeholder="Digite sua senha"
                    autoComplete="current-password"
                    value={valores.password}
                    onChange={handleInputChange}
                />

                <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? 'Entrando...' : 'Entrar'}
                </Button>
            </form>

            <div className="mt-4 text-sm">
                <Link to="/esqueci-senha" className="text-primary hover:underline">Esqueci minha senha</Link>
            </div>
            <div className="mt-2 text-sm text-muted2">
                Ao continuar, você concorda com nossos{' '}
                <Link to="/termos" className="text-primary hover:underline">Termos de Uso</Link>
                {' '}e{' '}
                <Link to="/privacidade" className="text-primary hover:underline">Política de Privacidade</Link>
            </div>
            <p className="mt-4 text-xs text-muted">
                O servidor pode levar alguns segundos para responder na primeira requisição.
            </p>
        </>
    );
};

export default Login;
