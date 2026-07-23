import { useState } from 'react';
import { Link } from 'react-router-dom';
import Input from '../../componentes/ui/Input';
import Button from '../../componentes/ui/Button';
import Card from '../../componentes/ui/Card';
import FinHawkIcon from '../../componentes/FinHawkIcon';

const EsqueciSenha = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [erro, setErro] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email.trim()) {
            setErro('Informe o e-mail cadastrado.');
            return;
        }

        setLoading(true);
        setErro('');

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim() }),
            });

            if (!response.ok) {
                throw new Error('Erro ao enviar. Tente novamente.');
            }

            setSent(true);
        } catch (err) {
            setErro(err.message || 'Erro ao enviar. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center px-4 py-10">
            <Card className="w-full max-w-sm">
                <div className="mb-6 flex items-center gap-2">
                    <FinHawkIcon size={28} />
                    <span className="text-lg font-semibold text-text">FinHawk</span>
                </div>

                {sent ? (
                    <div>
                        <p className="rounded-md bg-success/10 px-3 py-2 text-sm text-success">
                            Se o e-mail informado estiver cadastrado, você receberá um link em breve.
                        </p>
                        <div className="mt-4 text-sm">
                            <Link to="/login" className="text-primary hover:underline">Voltar para o login</Link>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div>
                            <h2 className="text-xl font-semibold text-text">Recuperar senha</h2>
                            <p className="mt-1 text-sm text-muted2">
                                Informe o e-mail cadastrado e enviaremos um link para redefinir sua senha.
                            </p>
                        </div>

                        <Input
                            label="E-mail"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Digite seu e-mail"
                            disabled={loading}
                            autoComplete="email"
                        />

                        {erro && (
                            <p className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">{erro}</p>
                        )}

                        <Button type="submit" disabled={loading} className="w-full">
                            {loading ? 'Enviando...' : 'Enviar link de recuperação'}
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

export default EsqueciSenha;
