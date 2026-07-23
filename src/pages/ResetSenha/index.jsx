import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import Input from '../../componentes/ui/Input';
import Button from '../../componentes/ui/Button';
import Card from '../../componentes/ui/Card';
import FinHawkIcon from '../../componentes/FinHawkIcon';

const ResetSenha = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [novaSenha, setNovaSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [loading, setLoading] = useState(false);
    const [sucesso, setSucesso] = useState(false);
    const [erro, setErro] = useState('');

    useEffect(() => {
        if (!token) {
            navigate('/esqueci-senha', { replace: true });
        }
    }, [token, navigate]);

    useEffect(() => {
        if (sucesso) {
            const timer = setTimeout(() => navigate('/login'), 2000);
            return () => clearTimeout(timer);
        }
    }, [sucesso, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErro('');

        if (novaSenha !== confirmarSenha) {
            setErro('As senhas não coincidem.');
            return;
        }
        if (novaSenha.length < 6) {
            setErro('A nova senha deve ter no mínimo 6 caracteres.');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword: novaSenha }),
            });

            if (response.ok) {
                setSucesso(true);
                return;
            }

            if (response.status === 400) {
                const data = await response.json().catch(() => null);
                setErro(data?.message || 'Link inválido ou expirado. Solicite um novo link de recuperação.');
                return;
            }

            throw new Error('Erro ao redefinir senha. Tente novamente.');
        } catch (err) {
            if (!sucesso) {
                setErro(err.message || 'Erro ao redefinir senha. Tente novamente.');
            }
        } finally {
            setLoading(false);
        }
    };

    if (!token) return null;

    return (
        <div className="flex min-h-screen items-center justify-center px-4 py-10">
            <Card className="w-full max-w-sm">
                <div className="mb-6 flex items-center gap-2">
                    <FinHawkIcon size={28} />
                    <span className="text-lg font-semibold text-text">FinHawk</span>
                </div>

                {sucesso ? (
                    <p className="rounded-md bg-success/10 px-3 py-2 text-sm text-success">
                        Senha redefinida com sucesso! Redirecionando para o login...
                    </p>
                ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div>
                            <h2 className="text-xl font-semibold text-text">Redefinir senha</h2>
                            <p className="mt-1 text-sm text-muted2">
                                Escolha uma nova senha para sua conta.
                            </p>
                        </div>

                        <Input
                            label="Nova Senha"
                            type="password"
                            value={novaSenha}
                            onChange={(e) => setNovaSenha(e.target.value)}
                            placeholder="Mínimo 6 caracteres"
                            disabled={loading}
                            autoComplete="new-password"
                        />

                        <Input
                            label="Confirmar Nova Senha"
                            type="password"
                            value={confirmarSenha}
                            onChange={(e) => setConfirmarSenha(e.target.value)}
                            placeholder="Repita a nova senha"
                            disabled={loading}
                            autoComplete="new-password"
                        />

                        {erro && (
                            <p className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">
                                {erro}
                                {erro.includes('inválido ou expirado') && (
                                    <> — <Link to="/esqueci-senha" className="underline">Solicitar novo link</Link></>
                                )}
                            </p>
                        )}

                        <Button type="submit" disabled={loading} className="w-full">
                            {loading ? 'Redefinindo...' : 'Redefinir Senha'}
                        </Button>

                        <div className="text-sm">
                            <Link to="/login" className="text-primary hover:underline">Voltar para o login</Link>
                        </div>
                    </form>
                )}
            </Card>
        </div>
    );
};

export default ResetSenha;
