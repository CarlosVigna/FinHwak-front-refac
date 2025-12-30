import React from 'react';
import { formatCurrency, formatDate, getDayName } from '../utils/formatters';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons';
import './WeeklyTimeline.css';

const WeeklyTimeline = ({ weekData }) => {
    return (
        <div className="weekly-timeline">
            <h3 className="weekly-timeline-title">Linha do Tempo Semanal</h3>
            <div className="timeline-container">
                {weekData.map((day, index) => {
                    const hasTransactions = day.bills.length > 0;
                    const dayName = getDayName(day.date);
                    const dateNum = day.date.getDate();
                    const isToday = new Date().toDateString() === day.date.toDateString();

                    return (
                        <div
                            key={index}
                            className={`timeline-day ${isToday ? 'timeline-day-today' : ''}`}
                            style={{ animationDelay: `${index * 0.05}s` }}
                        >
                            <div className="timeline-day-header">
                                <span className="timeline-day-name">{dayName}</span>
                                <span className="timeline-day-date">({dateNum})</span>
                            </div>

                            {!hasTransactions ? (
                                <div className="timeline-day-empty">
                                    <span className="timeline-empty-icon">🎉</span>
                                    <span className="timeline-empty-text">Sem contas</span>
                                </div>
                            ) : (
                                <div className="timeline-day-content">
                                    {day.receitas > 0 && (
                                        <div className="timeline-transaction timeline-transaction-income">
                                            <FontAwesomeIcon icon={faArrowUp} className="timeline-icon" />
                                            <span className="timeline-value">
                                                {formatCurrency(day.receitas)}
                                            </span>
                                        </div>
                                    )}
                                    {day.despesas > 0 && (
                                        <div className="timeline-transaction timeline-transaction-expense">
                                            <FontAwesomeIcon icon={faArrowDown} className="timeline-icon" />
                                            <span className="timeline-value">
                                                {formatCurrency(day.despesas)}
                                            </span>
                                        </div>
                                    )}
                                    <div className="timeline-bills">
                                        {day.bills.slice(0, 3).map((bill, idx) => (
                                            <div key={idx} className="timeline-bill">
                                                <span className="timeline-bill-desc">
                                                    {bill.description}
                                                </span>
                                            </div>
                                        ))}
                                        {day.bills.length > 3 && (
                                            <div className="timeline-bill-more">
                                                +{day.bills.length - 3} mais
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default WeeklyTimeline;
