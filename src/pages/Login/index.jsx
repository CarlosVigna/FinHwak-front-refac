import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Formulario from '../../componentes/Formulario';
import { useAuth } from './authContext';
import './login.css';

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
        
        console.log('Tentativa de login com:', email, password);

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

            console.log('Resposta do servidor:', response);

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                const errorMessage = errorData?.message || 'Erro ao fazer login (Verifique suas credenciais).';
                setErro(errorMessage);
                return;
            }

            const data = await response.json();
            console.log('Dados recebidos no login:', data);

            
            const { token } = data; 
            
            
            login(token, null); 
            
            localStorage.setItem('token', token);
            

            setValores({ email: '', password: '' });
            setErro('');

            console.log('Redirecionando para /contas');
            navigate('/contas');
        } catch (error) {
            console.error('Erro na requisição:', error);
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
        <div className='container-login'>
            <Formulario
                titulo="Login"
                campos={camposLogin}
                botaoTexto={isLoading ? 'Carregando...' : 'Entrar'}
                className="botao-login"
                handleInputChange={handleInputChange}
                valores={valores}
                onSubmit={handleLogin}
                disabled={isLoading}
                customClass="login-form" 
                layout="vertical" 
                erro={erro}
            />
        </div>
    );
};

export default Login;