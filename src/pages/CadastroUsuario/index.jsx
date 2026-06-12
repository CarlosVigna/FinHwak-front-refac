import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Formulario from '../../componentes/Formulario';

const URL = `${import.meta.env.VITE_API_URL}`;

async function cadastrarUsuario(usuarioPayload) {
    const response = await fetch(URL + "/auth/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(usuarioPayload),
    });

    if (response.ok) {
        return { sucesso: true };
    }

    
    const data = await response.json().catch(() => null);
    return { sucesso: false, erro: data ? data.message : "Erro desconhecido" };
}

function CadastroUsuario() {
    const navigate = useNavigate();

    const [valores, setValores] = useState({
        nome: '',
        email: '',
        senha: '',
        confirmarSenha: ''
    });

    const [erro, setErro] = useState("");
    const [sucesso, setSucesso] = useState(""); 

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        setValores({
            ...valores,
            [name]: value
        });
    };

    const handleCadastro = async (e) => {
        e.preventDefault();

        const { nome, email, senha, confirmarSenha } = valores;

        if (senha !== confirmarSenha) {
            setErro("As senhas não coincidem!");
            return;
        }

        const payload = {
            name: nome,
            email: email,
            password: senha
        };

        try {
            const resultado = await cadastrarUsuario(payload);

            if (resultado.sucesso) {
                setSucesso("Cadastro realizado com sucesso! Redirecionando para login...");
                setValores({
                    nome: '',
                    email: '',
                    senha: '',
                    confirmarSenha: ''
                });
                setErro("");
                setTimeout(() => navigate('/login'), 3000);
            } else {
                setErro(resultado.erro || "Erro ao cadastrar Usuário. Tente novamente.");
            }
        } catch (error) {
            setErro("Erro de conexão com o servidor.");
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
                botaoTexto="Enviar Cadastro" 
                className="botao-enviar-cadastro"
                handleInputChange={handleInputChange}
                valores={valores}
                onSubmit={handleCadastro}
                layout="vertical" 
                customClass="auth-card cadastro-usuario"
                erro={erro}
                sucesso={sucesso}
            />
        </div>
    );
}

export default CadastroUsuario;
