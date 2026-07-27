import { formatCurrency, formatDate } from '../utils/formatters';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCircleExclamation,
    faCircle,
    faCircleCheck
} from '@fortawesome/free-solid-svg-icons';
import Card from '../../../componentes/ui/Card';

const SECTION_CLASSES = {
    red: { bg: 'bg-danger/10 border-danger', icon: 'text-danger' },
    yellow: { bg: 'bg-warning/10 border-warning', icon: 'text-warning' },
    green: { bg: 'bg-success/10 border-success', icon: 'text-success' },
};

const TrafficLight = ({ overdueBills, dueTodayBills, next7DaysBills, onBillClick }) => {
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
        <Card>
            <h3 className="mb-4 text-lg font-semibold text-text">Semáforo de Vencimentos</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {sections.map((section, index) => (
                    <div
                        key={index}
                        className={`rounded-lg border-2 p-4 transition-transform hover:-translate-y-0.5 ${SECTION_CLASSES[section.color].bg}`}
                    >
                        <div className="mb-3 flex items-center gap-2 border-b border-border/50 pb-2">
                            <FontAwesomeIcon
                                icon={section.icon}
                                className={SECTION_CLASSES[section.color].icon}
                            />
                            <span className="flex-1 text-sm font-semibold text-text">{section.title}</span>
                            <span className="rounded-full bg-surface2 px-2 py-0.5 text-xs font-semibold text-text">
                                {section.bills.length}
                            </span>
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                            {section.bills.length === 0 ? (
                                <p className="py-4 text-center text-sm text-muted">{section.emptyMessage}</p>
                            ) : (
                                <ul className="flex flex-col gap-2">
                                    {section.bills.slice(0, 5).map((bill, idx) => (
                                        <li
                                            key={idx}
                                            onClick={onBillClick}
                                            className="flex cursor-pointer items-center justify-between rounded-md bg-surface p-3 shadow-sm transition hover:-translate-y-0.5 hover:opacity-90"
                                        >
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-sm font-medium text-text">
                                                    {bill.description}
                                                </span>
                                                <span className="text-xs text-muted2">
                                                    {formatDate(bill.maturity)}
                                                </span>
                                            </div>
                                            <span className="ml-4 whitespace-nowrap font-mono text-sm font-semibold text-danger">
                                                {formatCurrency(bill.installmentAmount || bill.value)}
                                            </span>
                                        </li>
                                    ))}
                                    {section.bills.length > 5 && (
                                        <li className="py-2 text-center text-xs font-medium italic text-muted2">
                                            +{section.bills.length - 5} mais
                                        </li>
                                    )}
                                </ul>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
};

export default TrafficLight;
