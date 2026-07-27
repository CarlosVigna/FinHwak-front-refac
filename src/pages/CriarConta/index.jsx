import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { translateError } from '../../utils/errorMessages';
import Input from '../../componentes/ui/Input';
import Button from '../../componentes/ui/Button';

const CriarConta = () => {
    const [name, setName] = useState('');
    const [photoUrl, setPhotoUrl] = useState('');
    const navigate = useNavigate();
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);
        setError(null);

        const dadosConta = {
            name: name,
            photoUrl: photoUrl
        };

        try {
            const response = await api.post('/account', dadosConta);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || "Erro ao criar conta.");
            }

            const data = await response.json();
            localStorage.setItem('accountId', String(data.id));
            localStorage.setItem('accountName', data.name);
            navigate('/cadastrarCategoria', { state: { fromNewAccount: true } });

        } catch (error) {
            console.error("Erro ao criar conta:", error);
            setError(translateError(error.message));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="mx-auto max-w-lg">
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-text">Criar Nova Conta</h1>
                <p className="mt-1 text-sm text-muted2">Preencha os dados para adicionar uma conta financeira.</p>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <Input
                    label="Nome da Conta:"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Nubank, Carteira, Banco do Brasil..."
                    required
                />

                <Input
                    label="URL da Foto (Opcional):"
                    type="text"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    placeholder="Cole o link de uma imagem/logo"
                />

                {error && (
                    <p className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>
                )}

                <div className="flex gap-3">
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Criando...' : 'Criar Conta'}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate('/contas')}
                        disabled={isSubmitting}
                    >
                        Cancelar
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default CriarConta;
