/**
 * Formatting utilities for Dashboard
 */

/**
 * Format value to BRL currency
 * @param {number} value - Value to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (value) => {
    if (value === undefined || value === null) return 'R$ 0,00';
    return Number(value).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
};

/**
 * Format date string to pt-BR format
 * @param {string} dateString - Date string to format
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString) => {
    if (!dateString) return '-';
    // Fix timezone issue by adding T12:00:00 if only date
    const data = new Date(dateString.includes('T') ? dateString : dateString + 'T12:00:00');
    return data.toLocaleDateString('pt-BR');
};

/**
 * Format month and year for display
 * @param {number} month - Month (0-11)
 * @param {number} year - Year
 * @returns {string} Formatted month/year string
 */
export const formatMonthYear = (month, year) => {
    const monthName = getMonthName(month);
    return `${monthName} ${year}`;
};

/**
 * Get Portuguese month name
 * @param {number} month - Month (0-11)
 * @returns {string} Month name in Portuguese
 */
export const getMonthName = (month) => {
    const months = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return months[month];
};

/**
 * Get short Portuguese month name
 * @param {number} month - Month (0-11)
 * @returns {string} Short month name
 */
export const getShortMonthName = (month) => {
    const months = [
        'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
        'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
    ];
    return months[month];
};

/**
 * Get day of week name
 * @param {Date} date - Date object
 * @returns {string} Day name in Portuguese
 */
export const getDayName = (date) => {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return days[date.getDay()];
};

/**
 * Format percentage
 * @param {number} value - Value to format
 * @returns {string} Formatted percentage
 */
export const formatPercentage = (value) => {
    return `${value.toFixed(1)}%`;
};
