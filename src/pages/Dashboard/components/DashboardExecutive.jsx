import React from 'react';
import { formatCurrency } from '../utils/formatters';
import './DashboardExecutive.css';

const TendenciaBadge = ({ delta }) => {
    if (delta === null || delta === undefined || delta === 0) {
        return (
            <span className="dashboard-executive-secondary">
                Sem alteração
            </span>
        );
    }
    const positivo = delta > 0;
    return (
        <span className={positivo
            ? 'dashboard-executive-delta-positive'
            : 'dashboard-executive-delta-negative'
        }>
            {positivo ? '↑' : '↓'} {formatCurrency(Math.abs(delta))} vs mês anterior
        </span>
    );
};

const DashboardExecutive = ({
    receitas,
    despesas,
    pendenteMes,
    saldoRealizado,
    deltaReceitas,
    deltaDespesas,
    deltaResultado
}) => {
    const cards = [
        {
            titulo: 'Receitas',
            valor: receitas,
            rodape: <TendenciaBadge delta={deltaReceitas} />
        },
        {
            titulo: 'Despesas',
            valor: despesas,
            rodape: <TendenciaBadge delta={deltaDespesas} />
        },
        {
            titulo: 'Pendente',
            valor: pendenteMes,
            rodape: (
                <span className="dashboard-executive-secondary">
                    {pendenteMes > 0 ? 'Existem contas pendentes' : 'Tudo em dia'}
                </span>
            )
        },
        {
            titulo: 'Resultado',
            valor: saldoRealizado,
            rodape: <TendenciaBadge delta={deltaResultado} />
        }
    ];

    return (
        <div className="dashboard-executive">
            {cards.map((card) => (
                <div key={card.titulo} className="dashboard-executive-card">
                    <span className="dashboard-executive-title">{card.titulo}</span>
                    <div className="dashboard-executive-value">
                        {formatCurrency(card.valor)}
                    </div>
                    <div className="dashboard-executive-footer">
                        {card.rodape}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default DashboardExecutive;
