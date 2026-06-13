import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { formatCurrency, formatPercentage } from '../utils/formatters';
import './CategoryChart.css';

const COLORS = [
    'var(--green)',
    'var(--blue)',
    'var(--accent)',
    'var(--amber)',
    'var(--red)',
    'var(--muted2)',
    'var(--green)',
    'var(--blue)',
    'var(--accent)',
    'var(--amber)',
];

const CategoryChart = ({ data, title }) => {
    if (!data || data.length === 0) {
        return (
            <div className="category-chart">
                <h3 className="category-chart-title">{title}</h3>
                <div className="category-chart-empty">
                    <p>📊 Nenhuma movimentação encontrada</p>
                </div>
            </div>
        );
    }

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="category-tooltip">
                    <p className="category-tooltip-name">{data.name}</p>
                    <p className="category-tooltip-value">{formatCurrency(data.value)}</p>
                    <p className="category-tooltip-percentage">{formatPercentage(data.percentage)}</p>
                </div>
            );
        }
        return null;
    };

    const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage }) => {
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        if (percentage < 5) return null; // Don't show label for small slices

        return (
            <text
                x={x}
                y={y}
                fill="white"
                textAnchor={x > cx ? 'start' : 'end'}
                dominantBaseline="central"
                fontSize="12"
                fontWeight="700"
            >
                {`${percentage.toFixed(0)}%`}
            </text>
        );
    };

    return (
        <div className="category-chart">
            <h3 className="category-chart-title">{title}</h3>
            <div className="category-chart-container">
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={CustomLabel}
                            outerRadius={100}
                            innerRadius={60}
                            fill="var(--accent)"
                            dataKey="value"
                            animationBegin={0}
                            animationDuration={800}
                        >
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[index % COLORS.length]}
                                />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            verticalAlign="bottom"
                            height={36}
                            formatter={(value, entry) => {
                                const item = data.find(d => d.name === value);
                                return `${value} (${formatPercentage(item?.percentage || 0)})`;
                            }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default CategoryChart;
