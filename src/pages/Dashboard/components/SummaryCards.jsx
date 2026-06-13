import React from 'react';
import { formatCurrency } from '../utils/formatters';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faArrowTrendUp,
    faArrowTrendDown,
    faScaleBalanced,
    faWallet,
    faClock
} from '@fortawesome/free-solid-svg-icons';

const DeltaBadge = ({ delta }) => {
    if (delta === 0) return null;
    const positive = delta > 0;
    return (
        <span className={`summary-card-delta ${positive ? 'delta-up' : 'delta-down'}`}>
            {positive ? '↑' : '↓'} {formatCurrency(Math.abs(delta))} vs mês anterior
        </span>
    );
};

const SummaryCards = ({
    receitas,
    despesas,
    pendenteMes,
    saldoPrevisto,
    saldoRealizado,
    saldoAcumulado,
    deltaReceitas,
    deltaDespesas,
    deltaResultado
}) => {
    const pendingColor = pendenteMes > 0 ? 'warning' : 'success';
    const prevColor    = saldoPrevisto   >= 0 ? 'success' : 'danger';
    const realColor    = saldoRealizado  >= 0 ? 'success' : 'danger';
    const acumColor    = saldoAcumulado  >= 0 ? 'success' : 'danger';

    const iconToken = {
        success: { bg: 'var(--green-soft)', color: 'var(--green)' },
        danger:  { bg: 'var(--red-soft)',   color: 'var(--red)' },
        warning: { bg: 'var(--amber-soft)', color: 'var(--amber)' },
        blue:    { bg: 'var(--blue-soft)',  color: 'var(--blue)' },
    };

    const cards = [
        {
            title: 'Receitas',
            value: receitas,
            icon: faArrowTrendUp,
            color: 'success',
            icon_: iconToken.success,
            delta: deltaReceitas
        },
        {
            title: 'Despesas',
            value: despesas,
            icon: faArrowTrendDown,
            color: 'danger',
            icon_: iconToken.danger,
            delta: deltaDespesas
        },
        {
            title: 'Pendente do Mês',
            value: pendenteMes,
            icon: faClock,
            color: pendingColor,
            icon_: iconToken[pendingColor],
            delta: null
        },
        {
            title: 'Resultado Previsto',
            value: saldoPrevisto,
            icon: faScaleBalanced,
            color: prevColor,
            icon_: iconToken[prevColor],
            delta: null
        },
        {
            title: 'Resultado Realizado',
            value: saldoRealizado,
            icon: faWallet,
            color: realColor,
            icon_: iconToken.blue,
            delta: deltaResultado
        },
        {
            title: 'Saldo Acumulado',
            value: saldoAcumulado,
            icon: faWallet,
            color: acumColor,
            icon_: iconToken[acumColor],
            delta: null
        }
    ];

    return (
        <div className="summary-cards">
            {cards.map((card, index) => (
                <div
                    key={index}
                    className={`summary-card summary-card-${card.color}`}
                    style={{ animationDelay: `${index * 0.08}s` }}
                >
                    <div className="summary-card-header">
                        <span className="summary-card-title">{card.title}</span>
                        <div
                            className="summary-card-icon"
                            style={{ background: card.icon_.bg, color: card.icon_.color }}
                        >
                            <FontAwesomeIcon icon={card.icon} />
                        </div>
                    </div>
                    <div className="summary-card-body">
                        <span className={`summary-card-value ${card.color}`}>
                            {formatCurrency(card.value)}
                        </span>
                        {card.delta != null && <DeltaBadge delta={card.delta} />}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default SummaryCards;
