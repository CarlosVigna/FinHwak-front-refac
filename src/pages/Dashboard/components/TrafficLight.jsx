import React from 'react';
import { formatCurrency, formatDate } from '../utils/formatters';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCircleExclamation,
    faCircle,
    faCircleCheck
} from '@fortawesome/free-solid-svg-icons';
import './TrafficLight.css';

const TrafficLight = ({ overdueBills, dueTodayBills, next7DaysBills }) => {
    const sections = [
        {
            title: 'Atrasadas',
            icon: faCircleExclamation,
            color: 'red',
            bills: overdueBills,
            emptyMessage: 'Nenhuma conta atrasada! 🎉'
        },
        {
            title: 'Vence Hoje/Amanhã',
            icon: faCircle,
            color: 'yellow',
            bills: dueTodayBills,
            emptyMessage: 'Nada vencendo hoje ou amanhã'
        },
        {
            title: 'Próximos 7 Dias',
            icon: faCircleCheck,
            color: 'green',
            bills: next7DaysBills,
            emptyMessage: 'Nenhuma conta nos próximos 7 dias'
        }
    ];

    return (
        <div className="traffic-light">
            <h3 className="traffic-light-title">Semáforo de Vencimentos</h3>
            <div className="traffic-light-sections">
                {sections.map((section, index) => (
                    <div
                        key={index}
                        className={`traffic-section traffic-section-${section.color}`}
                        style={{ animationDelay: `${index * 0.1}s` }}
                    >
                        <div className="traffic-section-header">
                            <FontAwesomeIcon
                                icon={section.icon}
                                className={`traffic-icon traffic-icon-${section.color}`}
                            />
                            <span className="traffic-section-title">{section.title}</span>
                            <span className="traffic-badge">{section.bills.length}</span>
                        </div>
                        <div className="traffic-section-body">
                            {section.bills.length === 0 ? (
                                <p className="traffic-empty">{section.emptyMessage}</p>
                            ) : (
                                <ul className="traffic-list">
                                    {section.bills.slice(0, 5).map((bill, idx) => (
                                        <li key={idx} className="traffic-item">
                                            <div className="traffic-item-info">
                                                <span className="traffic-item-description">
                                                    {bill.description}
                                                </span>
                                                <span className="traffic-item-date">
                                                    {formatDate(bill.maturity)}
                                                </span>
                                            </div>
                                            <span className="traffic-item-value">
                                                {formatCurrency(bill.installmentAmount || bill.value)}
                                            </span>
                                        </li>
                                    ))}
                                    {section.bills.length > 5 && (
                                        <li className="traffic-item-more">
                                            +{section.bills.length - 5} mais
                                        </li>
                                    )}
                                </ul>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TrafficLight;
