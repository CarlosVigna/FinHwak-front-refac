import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../services/api';
import { translateError } from '../../utils/errorMessages';
import Input from '../../componentes/ui/Input';
import Button from '../../componentes/ui/Button';

const EditarConta = () => {
    const [name, setName] = useState('');
    const [photoUrl, setPhotoUrl] = useState('');
    const [erro, setErro] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const navigate = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        const fetchConta = async () => {
            try {
                const response = await api.get(`/account/${id}`);

                if (!response.ok) {
                    throw new Error("Erro ao carregar dados da conta");
                }

                const data = await response.json();

                setName(data.name || '');
                setPhotoUrl(data.photoUrl || '');

            } catch (error) {
                setErro(translateError(error.message));
            } finally {
                setLoading(false);
            }
        };

        fetchConta();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSaving) return;

        setIsSaving(true);
        setErro(null);

        const dadosAtualizados = {
            name: name,
            photoUrl: photoUrl
        };

        try {
            const response = await api.put(`/account/${id}`, dadosAtualizados);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || "Erro ao atualizar conta");
            }

            navigate('/contas', { state: { sucesso: 'Conta atualizada com sucesso!' } });
        } catch (error) {
            setErro(translateError(error.message));
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return <div className="p-6 text-sm text-muted2">Carregando dados da conta...</div>;
    }

    return (
        <div className="mx-auto max-w-lg">
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-text">Editar Conta</h1>
                <p className="mt-1 text-sm text-muted2">Atualize os dados da conta selecionada.</p>
            </div>

            {erro && (
                <p className="mb-4 rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">{erro}</p>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <Input
                    label="Nome da Conta:"
                    id="name"
                    name="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Nubank, Carteira..."
                    required
                />

                <Input
                    label="URL da Foto:"
                    id="photoUrl"
                    name="photoUrl"
                    type="text"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    placeholder="Insira a nova URL da foto"
                />

                <div className="flex gap-3">
                    <Button type="submit" disabled={isSaving}>
                        {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate('/contas')}
                        disabled={isSaving}
                    >
                        Cancelar
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default EditarConta;
