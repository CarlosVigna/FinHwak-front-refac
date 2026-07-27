import { formatCurrency, getDayName } from '../utils/formatters';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons';
import Card from '../../../componentes/ui/Card';

const WeeklyTimeline = ({ weekData }) => {
    return (
        <Card>
            <h3 className="mb-4 text-lg font-semibold text-text">Linha do Tempo Semanal</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
                {weekData.map((day, index) => {
                    const hasTransactions = day.bills.length > 0;
                    const dayName = getDayName(day.date);
                    const dateNum = day.date.getDate();
                    const isToday = new Date().toDateString() === day.date.toDateString();

                    return (
                        <div
                            key={index}
                            className={[
                                'flex flex-col gap-2 rounded-lg border p-3',
                                isToday ? 'border-primary bg-primary/5' : 'border-border bg-surface',
                            ].join(' ')}
                        >
                            <div className="flex items-baseline justify-between">
                                <span className="text-sm font-semibold text-text">{dayName}</span>
                                <span className="text-xs text-muted">({dateNum})</span>
                            </div>

                            {!hasTransactions ? (
                                <div className="flex flex-col items-center gap-1 py-3 text-center">
                                    <span className="text-lg">🎉</span>
                                    <span className="text-xs text-muted">Sem contas</span>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    {day.receitas > 0 && (
                                        <div className="flex items-center gap-1.5 text-sm text-success">
                                            <FontAwesomeIcon icon={faArrowUp} size="xs" />
                                            <span>{formatCurrency(day.receitas)}</span>
                                        </div>
                                    )}
                                    {day.despesas > 0 && (
                                        <div className="flex items-center gap-1.5 text-sm text-danger">
                                            <FontAwesomeIcon icon={faArrowDown} size="xs" />
                                            <span>{formatCurrency(day.despesas)}</span>
                                        </div>
                                    )}
                                    <div className="flex flex-col gap-1">
                                        {day.bills.slice(0, 3).map((bill, idx) => (
                                            <div key={idx} className="truncate text-xs text-muted2">
                                                {bill.description}
                                            </div>
                                        ))}
                                        {day.bills.length > 3 && (
                                            <div className="text-xs italic text-muted">
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
        </Card>
    );
};

export default WeeklyTimeline;
