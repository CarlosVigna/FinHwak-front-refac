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
import Card from '../../../componentes/ui/Card';

const DeltaBadge = ({ delta }) => {
    if (delta === 0) return null;
    const positive = delta > 0;
    return (
        <span className={`text-xs font-medium ${positive ? 'text-success' : 'text-danger'}`}>
            {positive ? '↑' : '↓'} {formatCurrency(Math.abs(delta))} vs mês anterior
        </span>
    );
};

function InfoTooltip({ text }) {
    const [show, setShow] = useState(false);
    return (
        <span
            className="relative inline-flex"
            onMouseEnter={() => setShow(true)}
            onMouseLeave={() => setShow(false)}
        >
            <span className="cursor-help text-xs text-muted">ⓘ</span>
            {show && (
                <div className="absolute bottom-full left-1/2 z-10 mb-2 w-48 -translate-x-1/2 rounded-md bg-surface2 p-2 text-xs text-text shadow-lg">
                    {text}
                </div>
            )}
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

const COLOR_CLASSES = {
    success: { icon: 'bg-success/10 text-success', value: 'text-success' },
    danger: { icon: 'bg-danger/10 text-danger', value: 'text-danger' },
    warning: { icon: 'bg-warning/10 text-warning', value: 'text-warning' },
    blue: { icon: 'bg-info/10 text-info', value: 'text-text' },
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

    const cards = [
        {
            title: 'Receitas',
            value: receitas,
            icon: faArrowTrendUp,
            iconColor: 'success',
            valueColor: 'success',
            delta: deltaReceitas
        },
        {
            title: 'Despesas',
            value: despesas,
            icon: faArrowTrendDown,
            iconColor: 'danger',
            valueColor: 'danger',
            delta: deltaDespesas
        },
        {
            title: 'Pendente do Mês',
            value: pendenteMes,
            icon: faClock,
            iconColor: pendingColor,
            valueColor: pendingColor,
            delta: null
        },
        {
            title: 'Resultado Realizado',
            value: saldoRealizado,
            icon: faWallet,
            iconColor: 'blue',
            valueColor: realColor,
            delta: deltaResultado
        },
        {
            title: 'Saldo Acumulado',
            value: saldoAcumulado,
            icon: faWallet,
            iconColor: acumColor,
            valueColor: acumColor,
            delta: null
        }
    ];

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {cards.map((card, index) => (
                <Card key={index} className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                            <span className="text-sm text-muted2">{card.title}</span>
                            {tooltipsEnabled && TOOLTIPS[card.title] && (
                                <InfoTooltip text={TOOLTIPS[card.title]} />
                            )}
                        </div>
                        <div className={`flex h-8 w-8 items-center justify-center rounded-full ${COLOR_CLASSES[card.iconColor].icon}`}>
                            <FontAwesomeIcon icon={card.icon} size="sm" />
                        </div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className={`text-xl font-semibold ${COLOR_CLASSES[card.valueColor].value}`}>
                            {formatCurrency(card.value)}
                        </span>
                        {card.delta != null && <DeltaBadge delta={card.delta} />}
                    </div>
                </Card>
            ))}
        </div>
    );
};

export default SummaryCards;
