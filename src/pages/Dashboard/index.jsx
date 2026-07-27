import {
    useState,
    useEffect,
    useMemo,
    useCallback,
    useRef
} from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { translateError } from '../../utils/errorMessages';
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
import Button from '../../componentes/ui/Button';

const Dashboard = () => {
    const navigate = useNavigate();
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showConsolidated, setShowConsolidated] = useState(false);
    const isMounted = useRef(true);

    const currentDate = new Date();
    const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
    const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

    useEffect(() => {
        // Reseta o ref a cada (re)montagem — sem isso, o StrictMode do React
        // (mount → cleanup → mount, só em dev) deixa isMounted.current presa
        // em `false` para sempre, e o finally do fetchBills nunca chega a
        // chamar setLoading(false): spinner infinito.
        isMounted.current = true;
        return () => { isMounted.current = false; };
    }, []);

    const fetchBills = useCallback(async () => {
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
            if (isMounted.current) {
                setBills(data);
                setError(null);
            }
        } catch (err) {
            if (isMounted.current) {
                console.error('❌ Erro ao buscar dados:', err);
                setError(translateError(err.message));
            }
        } finally {
            if (isMounted.current) setLoading(false);
        }
    }, []);

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
    }, [fetchBills]);

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
            <div className="flex flex-col items-center justify-center gap-3 py-24">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-border border-t-primary" />
                <p className="text-sm text-muted2">Carregando dashboard...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center gap-3 rounded-lg border border-danger/20 bg-danger/5 p-10 text-center">
                <h2 className="text-lg font-semibold text-text">❌ Erro ao carregar dashboard</h2>
                <p className="text-sm text-muted2">{error}</p>
                <Button onClick={fetchBills}>Tentar Novamente</Button>
            </div>
        );
    }

    const accountId = localStorage.getItem('accountId');

    if (showConsolidated || !accountId) {
        return (
            <ConsolidatedOverview
                onSelectAccount={handleSelectAccount}
                onBackToDashboard={handleBackToDashboard}
            />
        );
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-text">Dashboard Financeiro</h1>
                    <p className="mt-1 text-sm text-muted2">Visão completa das suas finanças</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <MonthSelector
                        selectedMonth={selectedMonth}
                        selectedYear={selectedYear}
                        onMonthChange={handleMonthChange}
                    />
                    <Button
                        variant="outline"
                        onClick={handleShowConsolidated}
                        title="Exibir visão consolidada de todas as contas"
                    >
                        📊 Visão Consolidada
                    </Button>
                </div>
            </div>

            {bills.length === 0 ? (
                <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-surface p-10 text-center">
                    <div className="text-4xl">📊</div>
                    <h3 className="text-lg font-semibold text-text">Nenhum lançamento ainda</h3>
                    <p className="text-sm text-muted2">Adicione receitas e despesas para ver seu dashboard em ação.</p>
                    <div className="flex flex-wrap justify-center gap-3">
                        <Button onClick={() => navigate('/cadastroTitulo')}>+ Novo Lançamento</Button>
                        <Button variant="outline" onClick={() => navigate('/cadastrarCategoria')}>Cadastrar Categoria</Button>
                    </div>
                </div>
            ) : (
                <>
                    <SummaryCards
                        receitas={receitas}
                        despesas={despesas}
                        pendenteMes={pendenteMes}
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

                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        <CategoryChart
                            title="Para onde vai meu dinheiro?"
                            data={categoryData}
                        />
                        <CategoryChart
                            title="De onde vem meu dinheiro?"
                            data={receitasCategoryData}
                        />
                    </div>

                    <WeeklyTimeline weekData={weekData} />

                    <AnnualChart monthData={monthData} />
                </>
            )}
        </div>
    );
};

export default Dashboard;
