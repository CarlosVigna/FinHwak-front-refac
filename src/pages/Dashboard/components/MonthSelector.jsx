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
        <div className="month-pill">
            <button
                className="month-pill-nav"
                onClick={handlePrevMonth}
                title="Mês anterior"
                type="button"
            >
                <FontAwesomeIcon icon={faChevronLeft} />
            </button>

            <button
                className={`month-pill-label${!isCurrentMonth ? ' month-pill-label--past' : ''}`}
                onClick={handleCurrentMonth}
                title={isCurrentMonth ? undefined : 'Clique para voltar ao mês atual'}
                type="button"
            >
                {getMonthName(selectedMonth)} {selectedYear}
            </button>

            <button
                className="month-pill-nav"
                onClick={handleNextMonth}
                title="Próximo mês"
                type="button"
            >
                <FontAwesomeIcon icon={faChevronRight} />
            </button>
        </div>
    );
};

export default MonthSelector;
