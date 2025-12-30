import React, { useState, useEffect } from 'react';
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
import './dashboard.css';

const Dashboard = () => {
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Month filter state - default to current month
    const currentDate = new Date();
    const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
    const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

    // Fetch bills on component mount
    useEffect(() => {
        fetchBills();
    }, []);

    const fetchBills = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const accountId = localStorage.getItem('accountId');

            if (!token) {
                throw new Error('Usuário não autenticado.');
            }

            if (!accountId) {
                throw new Error('Nenhuma conta selecionada. Volte e selecione uma conta.');
            }

            const url = `${import.meta.env.VITE_API_URL}/bill/account/${accountId}`;
            console.log('🌐 Buscando dados do dashboard na URL:', url);

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

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
    const filteredBills = filterByMonth(bills, selectedMonth, selectedYear);

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
    const weekData = groupByDay(bills, 7);

    // Annual chart data (shows 12 months)
    const monthData = groupByMonth(bills, 6, 5);

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

    return (
        <div className="dashboard-page">
            <div className="page-header">
                <h1 className="page-title">Dashboard Financeiro</h1>
                <p className="page-subtitle">Visão completa das suas finanças</p>
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
