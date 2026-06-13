import React, {
    useState,
    useEffect,
    useMemo,
    useCallback
} from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
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
    calculatePendenteMes,
    calculateDelta,
    groupByCategory,
    groupReceitasByCategory,
    getOverdueBills,
    getBillsDueToday,
    getBillsNext7Days,
    groupByDay,
    groupByMonth
} from './utils/calculations';
import ConsolidatedOverview from './components/ConsolidatedOverview';

const Dashboard = () => {
    const navigate = useNavigate();
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showConsolidated, setShowConsolidated] = useState(false);

    const currentDate = new Date();
    const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
    const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

    useEffect(() => {
        const accountId = localStorage.getItem('accountId');
        const requestConsolidated = localStorage.getItem('dashboardShowConsolidated');

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
            const accountId = localStorage.getItem('accountId');

            if (!accountId) {
                throw new Error('Nenhuma conta selecionada. Volte e selecione uma conta.');
            }

            const response = await api.get(`/bill/account/${accountId}`);

            if (!response.ok) {
                const text = await response.text();
                throw new Error(text || 'Falha ao carregar dados do dashboard.');
            }

            const data = await response.json();
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

    const handleOpenPendingBills = useCallback(() => {
        navigate('/contas-pendentes');
    }, [navigate]);

    const handleShowConsolidated = useCallback(() => {
        const currentAccountId = localStorage.getItem('accountId');
        if (currentAccountId) {
            localStorage.setItem('lastAccountId', currentAccountId);
        }
        localStorage.setItem('dashboardShowConsolidated', 'true');
        setShowConsolidated(true);
    }, []);

    const handleBackToDashboard = useCallback(() => {
        localStorage.removeItem('dashboardShowConsolidated');
        const lastAccountId = localStorage.getItem('lastAccountId');
        if (lastAccountId) {
            localStorage.setItem('accountId', lastAccountId);
        }
        setShowConsolidated(false);
        fetchBills();
    }, []);

    const handleSelectAccount = useCallback((id) => {
        localStorage.setItem('accountId', String(id));
        localStorage.removeItem('dashboardShowConsolidated');
        setShowConsolidated(false);
        fetchBills();
    }, []);

    const filteredBills = useMemo(
        () => filterByMonth(bills, selectedMonth, selectedYear),
        [bills, selectedMonth, selectedYear]
    );

    const previousMonth = selectedMonth === 0 ? 11 : selectedMonth - 1;
    const previousYear = selectedMonth === 0 ? selectedYear - 1 : selectedYear;

    const previousBills = useMemo(
        () => filterByMonth(bills, previousMonth, previousYear),
        [bills, previousMonth, previousYear]
    );

    const receitas = useMemo(
        () => calculateReceitas(filteredBills),
        [filteredBills]
    );

    const despesas = useMemo(
        () => calculateDespesas(filteredBills),
        [filteredBills]
    );

    const saldoPrevisto = useMemo(
        () => calculateSaldoPrevisto(filteredBills),
        [filteredBills]
    );

    const saldoRealizado = useMemo(
        () => calculateSaldoRealizado(filteredBills),
        [filteredBills]
    );

    const saldoAcumulado = useMemo(
        () => calculateSaldoRealizado(bills),
        [bills]
    );

    const pendenteMes = useMemo(
        () => calculatePendenteMes(filteredBills),
        [filteredBills]
    );

    const receitasMesAnterior = useMemo(
        () => calculateReceitas(previousBills),
        [previousBills]
    );

    const despesasMesAnterior = useMemo(
        () => calculateDespesas(previousBills),
        [previousBills]
    );

    const saldoRealizadoMesAnterior = useMemo(
        () => calculateSaldoRealizado(previousBills),
        [previousBills]
    );

    const deltaReceitas = useMemo(
        () => calculateDelta(receitas, receitasMesAnterior),
        [receitas, receitasMesAnterior]
    );

    const deltaDespesas = useMemo(
        () => calculateDelta(despesas, despesasMesAnterior),
        [despesas, despesasMesAnterior]
    );

    const deltaResultado = useMemo(
        () => calculateDelta(saldoRealizado, saldoRealizadoMesAnterior),
        [saldoRealizado, saldoRealizadoMesAnterior]
    );

    const overdueBills = useMemo(
        () => getOverdueBills(bills),
        [bills]
    );

    const dueTodayBills = useMemo(
        () => getBillsDueToday(bills),
        [bills]
    );

    const next7DaysBills = useMemo(
        () => getBillsNext7Days(bills),
        [bills]
    );

    const categoryData = useMemo(
        () => groupByCategory(filteredBills),
        [filteredBills]
    );

    const receitasCategoryData = useMemo(
        () => groupReceitasByCategory(filteredBills),
        [filteredBills]
    );

    const timelineReferenceDate = useMemo(() => {
        const now = new Date();
        const isCurrentMonth =
            selectedMonth === now.getMonth() &&
            selectedYear === now.getFullYear();
        return isCurrentMonth
            ? now
            : new Date(selectedYear, selectedMonth, 1);
    }, [selectedMonth, selectedYear]);

    const weekData = useMemo(
        () => groupByDay(filteredBills, timelineReferenceDate, 7),
        [filteredBills, timelineReferenceDate]
    );

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

    if (showConsolidated || !accountId) {
        return (
            <div className="dashboard-page">
                <ConsolidatedOverview
                    onSelectAccount={handleSelectAccount}
                    onBackToDashboard={handleBackToDashboard}
                />
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

            {bills.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">📊</div>
                    <h3>Nenhum lançamento ainda</h3>
                    <p>Adicione receitas e despesas para ver seu dashboard em ação.</p>
                    <div className="empty-state-actions">
                        <button
                            className="botao-nova-conta"
                            onClick={() => navigate('/cadastroTitulo')}
                        >
                            + Novo Lançamento
                        </button>
                        <button
                            className="botao-cancelar"
                            onClick={() => navigate('/cadastrarCategoria')}
                        >
                            Cadastrar Categoria
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    <SummaryCards
                        receitas={receitas}
                        despesas={despesas}
                        pendenteMes={pendenteMes}
                        saldoPrevisto={saldoPrevisto}
                        saldoRealizado={saldoRealizado}
                        saldoAcumulado={saldoAcumulado}
                        deltaReceitas={deltaReceitas}
                        deltaDespesas={deltaDespesas}
                        deltaResultado={deltaResultado}
                    />

                    <TrafficLight
                        overdueBills={overdueBills}
                        dueTodayBills={dueTodayBills}
                        next7DaysBills={next7DaysBills}
                        onBillClick={handleOpenPendingBills}
                    />

                    <div className="dashboard-grid">
                        <div className="dashboard-grid-item">
                            <CategoryChart
                                title="Para onde vai meu dinheiro?"
                                data={categoryData}
                            />
                        </div>
                        <div className="dashboard-grid-item">
                            <CategoryChart
                                title="De onde vem meu dinheiro?"
                                data={receitasCategoryData}
                            />
                        </div>
                    </div>

                    <WeeklyTimeline weekData={weekData} />

                    <AnnualChart monthData={monthData} />
                </>
            )}
        </div>
    );
};

export default Dashboard;
