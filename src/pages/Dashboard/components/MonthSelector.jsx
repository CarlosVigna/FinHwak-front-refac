import React from 'react';
import { formatMonthYear, getMonthName } from '../utils/formatters';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDays, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import './MonthSelector.css';

const MonthSelector = ({ selectedMonth, selectedYear, onMonthChange }) => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const handlePrevMonth = () => {
        let newMonth = selectedMonth - 1;
        let newYear = selectedYear;

        if (newMonth < 0) {
            newMonth = 11;
            newYear -= 1;
        }

        onMonthChange(newMonth, newYear);
    };

    const handleNextMonth = () => {
        let newMonth = selectedMonth + 1;
        let newYear = selectedYear;

        if (newMonth > 11) {
            newMonth = 0;
            newYear += 1;
        }

        onMonthChange(newMonth, newYear);
    };

    const handleCurrentMonth = () => {
        onMonthChange(currentMonth, currentYear);
    };

    const handleSelectChange = (e) => {
        const [month, year] = e.target.value.split('-').map(Number);
        onMonthChange(month, year);
    };

    // Generate options for the last 12 months and next 12 months
    const generateOptions = () => {
        const options = [];
        const startDate = new Date(currentYear, currentMonth - 12, 1);

        for (let i = 0; i < 25; i++) {
            const date = new Date(startDate);
            date.setMonth(date.getMonth() + i);
            const month = date.getMonth();
            const year = date.getFullYear();

            options.push({
                value: `${month}-${year}`,
                label: formatMonthYear(month, year),
                isCurrent: month === currentMonth && year === currentYear
            });
        }

        return options;
    };

    const options = generateOptions();
    const isCurrentMonth = selectedMonth === currentMonth && selectedYear === currentYear;

    return (
        <div className="month-selector">
            <div className="month-selector-controls">
                <button
                    className="month-nav-btn"
                    onClick={handlePrevMonth}
                    title="Mês anterior"
                >
                    <FontAwesomeIcon icon={faChevronLeft} />
                </button>

                <div className="month-display">
                    <FontAwesomeIcon icon={faCalendarDays} className="month-icon" />
                    <select
                        className="month-select"
                        value={`${selectedMonth}-${selectedYear}`}
                        onChange={handleSelectChange}
                    >
                        {options.map((option, index) => (
                            <option
                                key={index}
                                value={option.value}
                            >
                                {option.label}
                                {option.isCurrent ? ' (Atual)' : ''}
                            </option>
                        ))}
                    </select>
                </div>

                <button
                    className="month-nav-btn"
                    onClick={handleNextMonth}
                    title="Próximo mês"
                >
                    <FontAwesomeIcon icon={faChevronRight} />
                </button>
            </div>

            {!isCurrentMonth && (
                <button
                    className="month-current-btn"
                    onClick={handleCurrentMonth}
                >
                    Voltar para Mês Atual
                </button>
            )}
        </div>
    );
};

export default MonthSelector;
