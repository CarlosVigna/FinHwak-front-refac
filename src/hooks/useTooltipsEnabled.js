import { useState, useEffect } from 'react';

export function useTooltipsEnabled() {
  const [enabled, setEnabled] = useState(
    () => localStorage.getItem('finhawk-tooltips') !== 'false'
  );

  useEffect(() => {
    const handler = () => {
      setEnabled(localStorage.getItem('finhawk-tooltips') !== 'false');
    };
    window.addEventListener('finhawk-tooltips-changed', handler);
    return () => window.removeEventListener('finhawk-tooltips-changed', handler);
  }, []);

  return enabled;
}
