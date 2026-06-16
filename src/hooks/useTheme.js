import { useEffect, useState } from 'react';

const STORAGE_KEY = 'finhawk-theme';

export function useTheme() {
    const [theme, setTheme] = useState(
        () => localStorage.getItem(STORAGE_KEY) || 'light'
    );

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem(STORAGE_KEY, theme);
    }, [theme]);

    const toggleTheme = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'));

    return { theme, toggleTheme };
}
