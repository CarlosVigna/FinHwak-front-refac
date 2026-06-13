import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency, getShortMonthName } from '../utils/formatters';
import './AnnualChart.css';

const CustomizedTick = ({ x, y, payload, chartData }) => {
    const item = chartData.find(d => d.name === payload.value);
    const isCurrent = item?.isCurrent;
    return (
        <text
            x={x}
            y={y + 12}
            textAnchor="middle"
            style={{
                fill: isCurrent ? 'var(--green)' : 'var(--muted2)',
                fontSize: '0.875rem',
                fontWeight: isCurrent ? '800' : '600',
            }}
        >
            {isCurrent ? `● ${payload.value}` : payload.value}
        </text>
    );
};

const AnnualChart = ({ monthData }) => {
    if (!monthData || monthData.length === 0) {
        return (
            <div className="annual-chart">
                <h3 className="annual-chart-title">Evolução Anual</h3>
                <div className="annual-chart-empty">
                    <p>📈 Nenhum dado disponível</p>
                </div>
            </div>
        );
    }

    const chartData = monthData.map(item => ({
        name: getShortMonthName(item.month),
        Receitas: item.receitas,
        Despesas: item.despesas,
        isCurrent: item.isCurrent
    }));

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="annual-tooltip">
                    <p className="annual-tooltip-label">{label}</p>
                    {payload.map((entry, index) => (
                        <p
                            key={index}
                            className="annual-tooltip-value"
                            style={{ color: entry.color }}
                        >
                            {entry.name}: {formatCurrency(entry.value)}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="annual-chart">
            <h3 className="annual-chart-title">Evolução Anual (12 Meses)</h3>
            <div className="annual-chart-container">
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart
                        data={chartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis
                            dataKey="name"
                            stroke="var(--muted)"
                            tick={<CustomizedTick chartData={chartData} />}
                        />
                        <YAxis
                            stroke="var(--muted)"
                            style={{ fontSize: '0.875rem' }}
                            tickFormatter={(value) => {
                                if (value >= 1000) {
                                    return `R$ ${(value / 1000).toFixed(0)}k`;
                                }
                                return `R$ ${value}`;
                            }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            wrapperStyle={{ fontSize: '0.875rem', fontWeight: 600 }}
                        />
                        <Bar
                            dataKey="Receitas"
                            fill="var(--green)"
                            radius={[8, 8, 0, 0]}
                            animationBegin={0}
                            animationDuration={800}
                        />
                        <Bar
                            dataKey="Despesas"
                            fill="var(--red)"
                            radius={[8, 8, 0, 0]}
                            animationBegin={100}
                            animationDuration={800}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default AnnualChart;
