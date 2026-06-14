import React, { useState } from 'react';
import { formatCurrency } from '../utils/formatters';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faArrowTrendUp,
    faArrowTrendDown,
    faWallet,
    faClock
} from '@fortawesome/free-solid-svg-icons';
import { useTooltipsEnabled } from '../../../hooks/useTooltipsEnabled';

const DeltaBadge = ({ delta }) => {
    if (delta === 0) return null;
    const positive = delta > 0;
    return (
        <span className={`summary-card-delta ${positive ? 'delta-up' : 'delta-down'}`}>
            {positive ? '↑' : '↓'} {formatCurrency(Math.abs(delta))} vs mês anterior
        </span>
    );
};

function InfoTooltip({ text }) {
    const [show, setShow] = useState(false);
    return (
        <span
            className="metric-info-wrap"
            onMouseEnter={() => setShow(true)}
            onMouseLeave={() => setShow(false)}
        >
            <span className="metric-info">ⓘ</span>
            {show && <div className="metric-tooltip">{text}</div>}
        </span>
    );
}

const TOOLTIPS = {
    'Receitas': 'Soma de todos os lançamentos do tipo receita recebidos no mês selecionado.',
    'Despesas': 'Soma de todos os lançamentos do tipo despesa pagos no mês selecionado.',
    'Pendente do Mês': 'Lançamentos deste mês que ainda não foram pagos ou recebidos.',
    'Resultado Realizado': 'Receitas menos despesas já efetivadas neste mês. A seta compara este valor com o resultado do mês anterior.',
    'Saldo Acumulado': 'Soma de todos os resultados mensais desde o primeiro lançamento registrado na conta.',
};

const SummaryCards = ({
    receitas,
    despesas,
    pendenteMes,
    saldoRealizado,
    saldoAcumulado,
    deltaReceitas,
    deltaDespesas,
    deltaResultado
}) => {
    const tooltipsEnabled = useTooltipsEnabled();

    const pendingColor = pendenteMes > 0 ? 'warning' : 'success';
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
                        <div className="summary-card-title-row">
                            <span className="summary-card-title">{card.title}</span>
                            {tooltipsEnabled && TOOLTIPS[card.title] && (
                                <InfoTooltip text={TOOLTIPS[card.title]} />
                            )}
                        </div>
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
