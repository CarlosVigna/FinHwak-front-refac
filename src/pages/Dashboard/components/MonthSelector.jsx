import React from 'react';
import { getMonthName } from '../utils/formatters';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

const MonthSelector = ({ selectedMonth, selectedYear, onMonthChange }) => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const isCurrentMonth = selectedMonth === currentMonth && selectedYear === currentYear;

    const handlePrevMonth = () => {
        const newMonth = selectedMonth === 0 ? 11 : selectedMonth - 1;
        const newYear = selectedMonth === 0 ? selectedYear - 1 : selectedYear;
        onMonthChange(newMonth, newYear);
    };

    const handleNextMonth = () => {
        const newMonth = selectedMonth === 11 ? 0 : selectedMonth + 1;
        const newYear = selectedMonth === 11 ? selectedYear + 1 : selectedYear;
        onMonthChange(newMonth, newYear);
    };

    const handleCurrentMonth = () => {
        if (!isCurrentMonth) onMonthChange(currentMonth, currentYear);
    };

    return (
        <div className="flex items-center gap-1 rounded-full border border-border bg-surface p-1">
            <button
                className="flex h-7 w-7 items-center justify-center rounded-full text-muted2 hover:bg-surface2 hover:text-text"
                onClick={handlePrevMonth}
                title="Mês anterior"
                type="button"
            >
                <FontAwesomeIcon icon={faChevronLeft} size="xs" />
            </button>

            <button
                className={`rounded-full px-3 py-1 text-sm font-medium ${!isCurrentMonth ? 'text-muted2 hover:text-text' : 'text-text'}`}
                onClick={handleCurrentMonth}
                title={isCurrentMonth ? undefined : 'Clique para voltar ao mês atual'}
                type="button"
            >
                {getMonthName(selectedMonth)} {selectedYear}
            </button>

            <button
                className="flex h-7 w-7 items-center justify-center rounded-full text-muted2 hover:bg-surface2 hover:text-text"
                onClick={handleNextMonth}
                title="Próximo mês"
                type="button"
            >
                <FontAwesomeIcon icon={faChevronRight} size="xs" />
            </button>
        </div>
    );
};

export default MonthSelector;
