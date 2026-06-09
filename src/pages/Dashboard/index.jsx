import React, {
    useState,
    useEffect,
    useMemo
} from 'react';
import MonthSelector from './components/MonthSelector';
import SummaryCards from './components/SummaryCards';
import TrafficLight from './components/TrafficLight';
import CategoryChart from './components/CategoryChart';
import WeeklyTimeline from './components/WeeklyTimeline';
import AnnualChart from './components/AnnualChart';
import {
    filterByMonth,
    calculateReceitas,
    calculateDespesas,
    calculateSaldoPrevisto,
    calculateSaldoRealizado,
    groupByCategory,
    getOverdueBills,
    getBillsDueToday,
    getBillsNext7Days,
    groupByDay,
    groupByMonth
} from './utils/calculations';
import ConsolidatedOverview from './components/ConsolidatedOverview';

const Dashboard = () => {
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showConsolidated, setShowConsolidated] = useState(false);

    // Month filter state - default to current month
    const currentDate = new Date();
    const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
    const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

    // Fetch bills on component mount
    useEffect(() => {
        const accountId = localStorage.getItem('accountId');

        const requestConsolidated =
            localStorage.getItem('dashboardShowConsolidated');

        if (requestConsolidated === 'true') {
            setShowConsolidated(true);
            setLoading(false);
            return;
        }

        if (!accountId) {
            setLoading(false);
            return;
        }

        fetchBills();
    }, []);

    const fetchBills = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const accountId =
                localStorage.getItem('accountId');

            console.log(
                '[Dashboard]',
                {
                    accountId,
                    showConsolidated,
                    loading
                }
            );;

            if (!token) {
                throw new Error('Usuário não autenticado.');
            }

            if (!accountId) {
                throw new Error('Nenhuma conta selecionada. Volte e selecione uma conta.');
            }

            const url = `${import.meta.env.VITE_API_URL}/bill/account/${accountId}`;
            console.log('🌐 Buscando dados do dashboard na URL:', url);
            console.log('[Dashboard] TOKEN:', token);

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log('[Dashboard] fetch status:', response.status);

            if (!response.ok) {
                const text = await response.text();
                throw new Error(text || 'Falha ao carregar dados do dashboard.');
            }

            const data = await response.json();
            console.log('✅ Dados carregados:', data.length, 'títulos');

            setBills(data);
            setError(null);
        } catch (err) {
            console.error('❌ Erro ao buscar dados:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleMonthChange = (month, year) => {
        setSelectedMonth(month);
        setSelectedYear(year);
    };

    // Filter bills by selected month for summary cards and category chart
    const filteredBills = useMemo(
        () =>
            filterByMonth(
                bills,
                selectedMonth,
                selectedYear
            ),
        [bills, selectedMonth, selectedYear]
    );

    // Calculate summary metrics
    const receitas = calculateReceitas(filteredBills);
    const despesas = calculateDespesas(filteredBills);
    const saldoPrevisto = calculateSaldoPrevisto(filteredBills);
    const saldoRealizado = calculateSaldoRealizado(filteredBills);

    // Traffic light data (always uses all bills, not filtered by month)
    const overdueBills = getOverdueBills(bills);
    const dueTodayBills = getBillsDueToday(bills);
    const next7DaysBills = getBillsNext7Days(bills);

    // Category chart data (uses filtered bills)
    const categoryData = groupByCategory(filteredBills);

    // Weekly timeline data (always shows next 7 days from today)
    const weekData = useMemo(
        () => groupByDay(bills, 7),
        [bills]
    );

    // Annual chart data (shows 12 months)
    const monthData = useMemo(
    () => groupByMonth(bills, 6, 5),
    [bills]
);

    if (loading) {
        return (
            <div className="dashboard-page">
                <div className="dashboard-loading">
                    <div className="loading-spinner"></div>
                    <p>Carregando dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-page">
                <div className="dashboard-error">
                    <h2>❌ Erro ao carregar dashboard</h2>
                    <p>{error}</p>
                    <button
                        className="retry-btn"
                        onClick={fetchBills}
                    >
                        Tentar Novamente
                    </button>
                </div>
            </div>
        );
    }
    const accountId = localStorage.getItem('accountId');
    const handleSelectAccount = (id) => {
        localStorage.setItem('accountId', String(id));
        localStorage.removeItem('dashboardShowConsolidated');
        // reload dashboard for selected account
        window.location.reload();
    };
    const handleShowConsolidated = () => {
        const currentAccountId = localStorage.getItem('accountId');

        if (currentAccountId) {
            localStorage.setItem('lastAccountId', currentAccountId);
        }

        localStorage.setItem('dashboardShowConsolidated', 'true');

        setShowConsolidated(true);
    };

    if (showConsolidated || !accountId) {
        if (!loading) {
            return (
                <div className="dashboard-page">
                    <ConsolidatedOverview
                        onSelectAccount={handleSelectAccount}
                        onBackToDashboard={() => {
                            localStorage.removeItem('dashboardShowConsolidated');

                            const lastAccountId =
                                localStorage.getItem('lastAccountId');

                            if (lastAccountId) {
                                localStorage.setItem('accountId', lastAccountId);
                            }

                            window.location.reload();
                        }}
                    />
                </div>
            );
        }
        // Still loading
        return (
            <div className="dashboard-page">
                <div className="dashboard-loading">
                    <div className="loading-spinner"></div>
                    <p>Carregando visão consolidada...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-page">
            <div className="page-header">
                <div className="dashboard-header-row">
                    <div>
                        <h1 className="page-title">Dashboard Financeiro</h1>
                        <p className="page-subtitle">Visão completa das suas finanças</p>
                    </div>
                    <button
                        className="btn-consolidated"
                        onClick={handleShowConsolidated}
                        title="Exibir visão consolidada de todas as contas"
                    >
                        📊 Visão Consolidada
                    </button>
                </div>
            </div>

            <MonthSelector
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
                onMonthChange={handleMonthChange}
            />

            <SummaryCards
                receitas={receitas}
                despesas={despesas}
                saldoPrevisto={saldoPrevisto}
                saldoRealizado={saldoRealizado}
            />

            <TrafficLight
                overdueBills={overdueBills}
                dueTodayBills={dueTodayBills}
                next7DaysBills={next7DaysBills}
            />

            <div className="dashboard-grid">
                <div className="dashboard-grid-item">
                    <CategoryChart data={categoryData} />
                </div>
                <div className="dashboard-grid-item">
                    <WeeklyTimeline weekData={weekData} />
                </div>
            </div>

            <AnnualChart monthData={monthData} />
        </div>
    );
};

export default Dashboard;
