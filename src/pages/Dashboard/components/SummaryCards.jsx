import React from 'react';
import { formatCurrency } from '../utils/formatters';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faArrowTrendUp,
    faArrowTrendDown,
    faScaleBalanced,
    faWallet
} from '@fortawesome/free-solid-svg-icons';
import './SummaryCards.css';

const SummaryCards = ({ receitas, despesas, saldoPrevisto, saldoRealizado }) => {
    const cards = [
        {
            title: 'Receitas',
            value: receitas,
            icon: faArrowTrendUp,
            color: 'success',
            gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
        },
        {
            title: 'Despesas',
            value: despesas,
            icon: faArrowTrendDown,
            color: 'danger',
            gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
        },
        {
            title: 'Saldo Previsto',
            value: saldoPrevisto,
            icon: faScaleBalanced,
            color: saldoPrevisto >= 0 ? 'success' : 'danger',
            gradient: saldoPrevisto >= 0
                ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
        },
        {
            title: 'Saldo Realizado',
            value: saldoRealizado,
            icon: faWallet,
            color: saldoRealizado >= 0 ? 'success' : 'danger',
            gradient: saldoRealizado >= 0
                ? 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)'
                : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
        }
    ];

    return (
        <div className="summary-cards">
            {cards.map((card, index) => (
                <div
                    key={index}
                    className={`summary-card summary-card-${card.color}`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                >
                    <div className="summary-card-header">
                        <span className="summary-card-title">{card.title}</span>
                        <div
                            className="summary-card-icon"
                            style={{ background: card.gradient }}
                        >
                            <FontAwesomeIcon icon={card.icon} />
                        </div>
                    </div>
                    <div className="summary-card-body">
                        <span className={`summary-card-value ${card.color}`}>
                            {formatCurrency(card.value)}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default SummaryCards;
