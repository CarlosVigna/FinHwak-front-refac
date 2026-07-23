import { useNavigate } from 'react-router-dom';
import { FiMenu, FiLogOut, FiSun, FiMoon } from 'react-icons/fi';
import { useAuth } from '../../pages/Login/AuthContext';
import { useTheme } from '../../hooks/useTheme';

export default function AppHeader({ onOpenMobileMenu }) {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="flex items-center justify-between border-b border-border bg-surface px-4 py-3 lg:px-6">
            <button
                type="button"
                onClick={onOpenMobileMenu}
                aria-label="Abrir menu"
                className="text-xl text-muted2 hover:text-text lg:hidden"
            >
                <FiMenu />
            </button>

            <div className="ml-auto flex items-center gap-4">
                {user?.name && (
                    <span className="text-sm text-text">{user.name}</span>
                )}
                <button
                    type="button"
                    onClick={toggleTheme}
                    aria-label={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
                    title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
                    className="flex h-8 w-8 items-center justify-center rounded-md text-lg text-muted2 hover:bg-surface2 hover:text-text"
                >
                    {theme === 'dark' ? <FiSun /> : <FiMoon />}
                </button>
                <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 text-sm text-muted2 hover:text-danger"
                >
                    <FiLogOut />
                    Sair
                </button>
            </div>
        </header>
    );
}
