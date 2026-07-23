import { useState, useEffect } from 'react';
import Login from '../Login/Login';
import CadastroUsuario from '../CadastroUsuario';
import PropTypes from 'prop-types';
import FinHawkIcon from '../../componentes/FinHawkIcon';

const AuthTabs = ({ initialTab = 'login' }) => {
    const [active, setActive] = useState(initialTab);

    useEffect(() => {
        setActive(initialTab);
    }, [initialTab]);

    return (
        <div className="flex min-h-screen flex-col lg:flex-row">

            {/* ── Lado esquerdo: hero + stats ── */}
            <div className="hidden flex-1 flex-col justify-between bg-primary p-10 text-white lg:flex">
                <div className="flex flex-col gap-4">
                    <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs">
                        <span className="h-1.5 w-1.5 rounded-full bg-success" />
                        Sistema financeiro pessoal
                    </span>
                    <h1 className="text-3xl font-semibold leading-tight text-white">
                        Controle total<br />do seu dinheiro
                    </h1>
                    <p className="max-w-md text-white/70">
                        Organize contas, receitas, despesas e relatórios em um único lugar, com visão em tempo real das suas finanças.
                    </p>
                </div>

                <div className="overflow-hidden rounded-lg shadow-lg">
                    <img
                        src="/screenshots/dashboard_dark.png"
                        alt="FinHawk — visão do dashboard"
                        className="w-full"
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                </div>
            </div>

            {/* ── Lado direito: form ── */}
            <div className="flex flex-1 flex-col justify-center px-6 py-10 sm:px-12 lg:px-16">
                <div className="mx-auto w-full max-w-sm">
                    <div className="mb-6 flex items-center gap-2">
                        <FinHawkIcon size={28} />
                        <span className="text-lg font-semibold text-text">FinHawk</span>
                    </div>

                    <div className="mb-6 flex rounded-md border border-border p-1">
                        <button
                            type="button"
                            onClick={() => setActive('login')}
                            className={`flex-1 rounded px-3 py-1.5 text-sm font-medium transition-colors ${active === 'login' ? 'bg-primary text-white' : 'text-muted2 hover:text-text'}`}
                        >
                            Entrar
                        </button>
                        <button
                            type="button"
                            onClick={() => setActive('cadastro')}
                            className={`flex-1 rounded px-3 py-1.5 text-sm font-medium transition-colors ${active === 'cadastro' ? 'bg-primary text-white' : 'text-muted2 hover:text-text'}`}
                        >
                            Criar conta
                        </button>
                    </div>

                    {active === 'login' ? <Login /> : <CadastroUsuario />}
                </div>
            </div>

        </div>
    );
};

AuthTabs.propTypes = {
    initialTab: PropTypes.string,
};

export default AuthTabs;
