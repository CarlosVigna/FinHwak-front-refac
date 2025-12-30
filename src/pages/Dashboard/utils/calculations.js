/**
 * Calculation utilities for Dashboard
 */

/**
 * Filter bills by month and year
 * @param {Array} bills - Array of bills
 * @param {number} month - Month (0-11)
 * @param {number} year - Year
 * @returns {Array} Filtered bills
 */
export const filterByMonth = (bills, month, year) => {
    if (!bills || bills.length === 0) return [];

    return bills.filter(bill => {
        const maturityDate = new Date(bill.maturity.includes('T') ? bill.maturity : bill.maturity + 'T12:00:00');
        return maturityDate.getMonth() === month && maturityDate.getFullYear() === year;
    });
};

/**
 * Calculate total receitas (RECEIPT type)
 * @param {Array} bills - Array of bills
 * @returns {number} Total receitas
 */
export const calculateReceitas = (bills) => {
    if (!bills || bills.length === 0) return 0;

    return bills
        .filter(bill => {
            const type = bill.category?.type || bill.type;
            return type?.toUpperCase() === 'RECEIPT';
        })
        .reduce((sum, bill) => sum + Number(bill.installmentAmount || bill.value || 0), 0);
};

/**
 * Calculate total despesas (PAYMENT type)
 * @param {Array} bills - Array of bills
 * @returns {number} Total despesas
 */
export const calculateDespesas = (bills) => {
    if (!bills || bills.length === 0) return 0;

    return bills
        .filter(bill => {
            const type = bill.category?.type || bill.type;
            return type?.toUpperCase() === 'PAYMENT';
        })
        .reduce((sum, bill) => sum + Number(bill.installmentAmount || bill.value || 0), 0);
};

/**
 * Calculate saldo previsto (Receitas - Despesas)
 * @param {Array} bills - Array of bills
 * @returns {number} Saldo previsto
 */
export const calculateSaldoPrevisto = (bills) => {
    const receitas = calculateReceitas(bills);
    const despesas = calculateDespesas(bills);
    return receitas - despesas;
};

/**
 * Calculate saldo realizado (only PAID/RECEIVED status)
 * @param {Array} bills - Array of bills
 * @returns {number} Saldo realizado
 */
export const calculateSaldoRealizado = (bills) => {
    if (!bills || bills.length === 0) return 0;

    return bills
        .filter(bill => {
            const status = bill.status?.toUpperCase();
            return status === 'PAID' || status === 'RECEIVED';
        })
        .reduce((sum, bill) => {
            const type = bill.category?.type || bill.type;
            const value = Number(bill.installmentAmount || bill.value || 0);

            // Add for RECEIPT, subtract for PAYMENT
            if (type?.toUpperCase() === 'RECEIPT') {
                return sum + value;
            } else if (type?.toUpperCase() === 'PAYMENT') {
                return sum - value;
            }
            return sum;
        }, 0);
};

/**
 * Group bills by category for chart
 * @param {Array} bills - Array of bills (should be filtered for PAYMENT only)
 * @returns {Array} Array of {name, value, percentage}
 */
export const groupByCategory = (bills) => {
    if (!bills || bills.length === 0) return [];

    // Filter only PAYMENT type
    const payments = bills.filter(bill => {
        const type = bill.category?.type || bill.type;
        return type?.toUpperCase() === 'PAYMENT';
    });

    if (payments.length === 0) return [];

    // Group by category
    const grouped = payments.reduce((acc, bill) => {
        const categoryName = bill.category?.name || 'Sem Categoria';
        const value = Number(bill.installmentAmount || bill.value || 0);

        if (!acc[categoryName]) {
            acc[categoryName] = 0;
        }
        acc[categoryName] += value;

        return acc;
    }, {});

    // Calculate total for percentages
    const total = Object.values(grouped).reduce((sum, val) => sum + val, 0);

    // Convert to array with percentages
    return Object.entries(grouped)
        .map(([name, value]) => ({
            name,
            value,
            percentage: total > 0 ? (value / total) * 100 : 0
        }))
        .sort((a, b) => b.value - a.value); // Sort by value descending
};

/**
 * Get overdue bills (maturity < today AND status = PENDING)
 * @param {Array} bills - Array of bills
 * @returns {Array} Overdue bills
 */
export const getOverdueBills = (bills) => {
    if (!bills || bills.length === 0) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return bills.filter(bill => {
        const maturityDate = new Date(bill.maturity.includes('T') ? bill.maturity : bill.maturity + 'T12:00:00');
        maturityDate.setHours(0, 0, 0, 0);

        const isPending = bill.status?.toUpperCase() === 'PENDING';
        const isOverdue = maturityDate < today;

        return isPending && isOverdue;
    }).sort((a, b) => new Date(a.maturity) - new Date(b.maturity));
};

/**
 * Get bills due today or tomorrow
 * @param {Array} bills - Array of bills
 * @returns {Array} Bills due today/tomorrow
 */
export const getBillsDueToday = (bills) => {
    if (!bills || bills.length === 0) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return bills.filter(bill => {
        const maturityDate = new Date(bill.maturity.includes('T') ? bill.maturity : bill.maturity + 'T12:00:00');
        maturityDate.setHours(0, 0, 0, 0);

        const isPending = bill.status?.toUpperCase() === 'PENDING';
        const isDueToday = maturityDate.getTime() === today.getTime();
        const isDueTomorrow = maturityDate.getTime() === tomorrow.getTime();

        return isPending && (isDueToday || isDueTomorrow);
    }).sort((a, b) => new Date(a.maturity) - new Date(b.maturity));
};

/**
 * Get bills due in next 7 days (excluding today and tomorrow)
 * @param {Array} bills - Array of bills
 * @returns {Array} Bills due in next 7 days
 */
export const getBillsNext7Days = (bills) => {
    if (!bills || bills.length === 0) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    return bills.filter(bill => {
        const maturityDate = new Date(bill.maturity.includes('T') ? bill.maturity : bill.maturity + 'T12:00:00');
        maturityDate.setHours(0, 0, 0, 0);

        const isPending = bill.status?.toUpperCase() === 'PENDING';
        const isInRange = maturityDate >= dayAfterTomorrow && maturityDate <= sevenDaysFromNow;

        return isPending && isInRange;
    }).sort((a, b) => new Date(a.maturity) - new Date(b.maturity));
};

/**
 * Group bills by day for timeline
 * @param {Array} bills - Array of bills
 * @param {number} days - Number of days to show (default 7)
 * @returns {Array} Array of {date, dayName, receitas, despesas, bills}
 */
export const groupByDay = (bills, days = 7) => {
    if (!bills) bills = [];

    const result = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < days; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);

        const dayBills = bills.filter(bill => {
            const maturityDate = new Date(bill.maturity.includes('T') ? bill.maturity : bill.maturity + 'T12:00:00');
            maturityDate.setHours(0, 0, 0, 0);
            return maturityDate.getTime() === date.getTime();
        });

        const receitas = dayBills
            .filter(bill => {
                const type = bill.category?.type || bill.type;
                return type?.toUpperCase() === 'RECEIPT';
            })
            .reduce((sum, bill) => sum + Number(bill.installmentAmount || bill.value || 0), 0);

        const despesas = dayBills
            .filter(bill => {
                const type = bill.category?.type || bill.type;
                return type?.toUpperCase() === 'PAYMENT';
            })
            .reduce((sum, bill) => sum + Number(bill.installmentAmount || bill.value || 0), 0);

        result.push({
            date,
            receitas,
            despesas,
            bills: dayBills
        });
    }

    return result;
};

/**
 * Group bills by month for annual chart
 * @param {Array} bills - Array of bills
 * @param {number} monthsBack - Months to show before current (default 6)
 * @param {number} monthsForward - Months to show after current (default 5)
 * @returns {Array} Array of {month, year, monthName, receitas, despesas}
 */
export const groupByMonth = (bills, monthsBack = 6, monthsForward = 5) => {
    if (!bills) bills = [];

    const result = [];
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Start from monthsBack ago
    const startDate = new Date(currentYear, currentMonth - monthsBack, 1);

    // Total months to show
    const totalMonths = monthsBack + monthsForward + 1;

    for (let i = 0; i < totalMonths; i++) {
        const date = new Date(startDate);
        date.setMonth(date.getMonth() + i);

        const month = date.getMonth();
        const year = date.getFullYear();

        const monthBills = filterByMonth(bills, month, year);

        const receitas = calculateReceitas(monthBills);
        const despesas = calculateDespesas(monthBills);

        result.push({
            month,
            year,
            receitas,
            despesas,
            isCurrent: month === currentMonth && year === currentYear
        });
    }

    return result;
};
