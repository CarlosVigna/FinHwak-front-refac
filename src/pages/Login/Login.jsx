import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Formulario from '../../componentes/Formulario';
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

    const handleLogin = async () => {
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

    const camposLogin = [
        { label: 'Email:', placeholder: 'Digite seu e-mail', type: 'email', name: 'email' },
        { label: 'Senha:', placeholder: 'Digite sua senha', type: 'password', name: 'password' },
    ];

    return (
        <>
            <Formulario
                titulo="Entrar"
                campos={camposLogin}
                botaoTexto={isLoading ? 'Entrando...' : 'Entrar'}
                handleInputChange={handleInputChange}
                valores={valores}
                onSubmit={handleLogin}
                disabled={isLoading}
                customClass="auth-card login-card"
                layout="vertical"
                erro={erro}
            />
            <div className="auth-extra-links">
                <Link to="/esqueci-senha" className="btn-link">Esqueci minha senha</Link>
            </div>
            <div className="auth-extra-links" style={{ marginTop: '8px' }}>
                Ao continuar, você concorda com nossos{' '}
                <Link to="/termos" className="btn-link">Termos de Uso</Link>
                {' '}e{' '}
                <Link to="/privacidade" className="btn-link">Política de Privacidade</Link>
            </div>
            <p className="login-notice">
                O servidor pode levar alguns segundos para responder na primeira requisição.
            </p>
        </>
    );
};

export default Login;
