import { NavLink, useNavigate } from 'react-router-dom';
import {
    FiGrid, FiArrowUpCircle, FiArrowDownCircle, FiAlertCircle, FiCheckSquare,
    FiPlusCircle, FiCheckCircle, FiDollarSign, FiCreditCard, FiTag, FiSettings,
    FiSun, FiMoon, FiChevronDown,
} from 'react-icons/fi';
import { useTheme } from '../../hooks/useTheme';
import { useAccount } from '../../contexts/AccountContext';
import FinHawkIcon from '../FinHawkIcon';

const SECTIONS = [
    {
        label: 'OPERAÇÃO',
        items: [
            { to: '/dashboard', label: 'Dashboard', Icon: FiGrid },
            { to: '/relContasPagar', label: 'Contas a Pagar', Icon: FiArrowUpCircle },
            { to: '/relContasReceber', label: 'Contas a Receber', Icon: FiArrowDownCircle },
            { to: '/contas-pendentes', label: 'Pendências', Icon: FiAlertCircle },
            { to: '/checklist-mensal', label: 'Checklist Mensal', Icon: FiCheckSquare },
        ],
    },
    {
        label: 'LANÇAMENTOS',
        items: [
            { to: '/cadastroTitulo', label: 'Novo Lançamento', Icon: FiPlusCircle },
            { to: '/relPagamentos', label: 'Pagamentos Realizados', Icon: FiCheckCircle },
            { to: '/relRecebimentos', label: 'Recebimentos Realizados', Icon: FiDollarSign },
        ],
    },
    {
        label: 'CADASTROS',
        items: [
            { to: '/contas', label: 'Minhas Contas', Icon: FiCreditCard, alwaysUnlocked: true },
            { to: '/cadastrarCategoria', label: 'Categorias', Icon: FiTag },
        ],
    },
    {
        label: 'SISTEMA',
        items: [
            { to: '/configuracoes', label: 'Configurações', Icon: FiSettings, alwaysUnlocked: true },
        ],
    },
];

function NavItem({ to, label, Icon, locked, onLockedClick, onClick }) {
    const baseClasses = 'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors';

    if (locked) {
        return (
            <button
                type="button"
                onClick={onLockedClick}
                title="Selecione uma conta primeiro"
                className={[baseClasses, 'w-full text-left text-muted hover:bg-surface2 hover:text-muted2'].join(' ')}
            >
                <Icon className="shrink-0" />
                {label}
            </button>
        );
    }

    return (
        <NavLink
            to={to}
            onClick={onClick}
            className={({ isActive }) =>
                [
                    baseClasses,
                    isActive
                        ? 'bg-primary text-white'
                        : 'text-muted2 hover:bg-surface2 hover:text-text',
                ].join(' ')
            }
        >
            <Icon className="shrink-0" />
            {label}
        </NavLink>
    );
}

export default function AppSidebar({ isMobileOpen, onCloseMobile }) {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const { accountId, accountName, clearAccount } = useAccount();
    const hasAccount = !!accountId;

    const goToContas = () => {
        clearAccount();
        onCloseMobile?.();
        navigate('/contas');
    };

    const handleLockedClick = () => {
        onCloseMobile?.();
        navigate('/contas');
    };

    return (
        <>
            {isMobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={onCloseMobile}
                />
            )}

            <aside
                className={[
                    'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-surface',
                    'transition-transform duration-200 lg:static lg:translate-x-0',
                    isMobileOpen ? 'translate-x-0' : '-translate-x-full',
                ].join(' ')}
            >
                <div className="flex items-center gap-2 px-4 py-4 border-b border-border">
                    <FinHawkIcon size={26} />
                    <span className="text-lg font-semibold text-text">FinHawk</span>
                </div>

                {accountName && (
                    <button
                        type="button"
                        onClick={goToContas}
                        className="mx-4 mt-3 flex items-center gap-2 rounded-md bg-surface2 px-3 py-2 text-left text-sm text-text hover:bg-border"
                    >
                        <span className="h-2 w-2 shrink-0 rounded-full bg-success" />
                        <span className="flex-1 truncate">{accountName}</span>
                        <FiChevronDown className="shrink-0 text-muted" />
                    </button>
                )}

                <nav className="flex-1 overflow-y-auto px-2 py-4">
                    {SECTIONS.map((section) => (
                        <div key={section.label} className="mb-4">
                            <div className="px-3 pb-1 text-xs font-semibold tracking-wide text-muted">
                                {section.label}
                            </div>
                            <div className="flex flex-col gap-0.5">
                                {section.items.map((item) => (
                                    <NavItem
                                        key={item.to}
                                        to={item.to}
                                        label={item.label}
                                        Icon={item.Icon}
                                        locked={!item.alwaysUnlocked && !hasAccount}
                                        onLockedClick={handleLockedClick}
                                        onClick={onCloseMobile}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </nav>

                <div className="border-t border-border p-3">
                    <button
                        type="button"
                        onClick={toggleTheme}
                        className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-muted2 hover:bg-surface2 hover:text-text"
                    >
                        {theme === 'dark' ? <FiSun className="shrink-0" /> : <FiMoon className="shrink-0" />}
                        {theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
                    </button>
                </div>
            </aside>
        </>
    );
}
