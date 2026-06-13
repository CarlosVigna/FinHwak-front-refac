import { useEffect, useState } from 'react';
import './PlanModal.css';

const LIMIT_LABELS = {
    accounts:  'contas financeiras (máx. 1)',
    bills:     'lançamentos (máx. 100)',
    checklist: 'itens no checklist (máx. 5)',
};

export default function PlanModal() {
    const [visible, setVisible] = useState(false);
    const [message, setMessage] = useState('');
    const [checkoutUrl, setCheckoutUrl] = useState(null);

    useEffect(() => {
        const handler = (e) => {
            setMessage(e.detail?.message || 'Limite do plano gratuito atingido.');
            setVisible(true);
            setCheckoutUrl(null);
        };
        window.addEventListener('plan-limit', handler);
        return () => window.removeEventListener('plan-limit', handler);
    }, []);

    const handleUpgrade = async (period) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/stripe/checkout?period=${period}`,
                { method: 'POST', headers: { Authorization: `Bearer ${token}` } }
            );
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            }
        } catch {
            setMessage('Erro ao iniciar pagamento. Tente novamente.');
        }
    };

    if (!visible) return null;

    return (
        <div className="plan-modal-overlay" onClick={() => setVisible(false)}>
            <div className="plan-modal" onClick={e => e.stopPropagation()}>
                <button className="plan-modal-close" onClick={() => setVisible(false)} aria-label="Fechar">×</button>

                <div className="plan-modal-icon">🔒</div>

                <h2 className="plan-modal-title">Limite do plano gratuito</h2>

                <p className="plan-modal-message">{message}</p>

                <div className="plan-modal-plans">
                    <div className="plan-modal-plan">
                        <div className="plan-modal-plan-name">Mensal</div>
                        <div className="plan-modal-plan-price">
                            R$ 19<span>,90</span>
                            <span className="plan-modal-plan-period">/mês</span>
                        </div>
                        <button className="plan-modal-btn" onClick={() => handleUpgrade('monthly')}>
                            Assinar mensal
                        </button>
                    </div>

                    <div className="plan-modal-plan plan-modal-plan--featured">
                        <div className="plan-modal-plan-badge">Melhor valor</div>
                        <div className="plan-modal-plan-name">Anual</div>
                        <div className="plan-modal-plan-price">
                            R$ 149<span>,00</span>
                            <span className="plan-modal-plan-period">/ano</span>
                        </div>
                        <div className="plan-modal-plan-saving">Economize R$ 90</div>
                        <button className="plan-modal-btn plan-modal-btn--primary" onClick={() => handleUpgrade('annual')}>
                            Assinar anual
                        </button>
                    </div>
                </div>

                <p className="plan-modal-fine">Pagamento seguro via Stripe. Cancele quando quiser.</p>
            </div>
        </div>
    );
}
