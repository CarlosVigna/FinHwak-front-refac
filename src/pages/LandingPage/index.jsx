import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../Login/AuthContext';
import { useTheme } from '../../hooks/useTheme';
import FinHawkIcon from '../../componentes/FinHawkIcon';
import FinHawkLogo from '../../componentes/FinHawkLogo';
import SprayUnderline from '../../componentes/SprayUnderline';
import './LandingPage.css';

const FEATURES = [
    {
        icon: '📊',
        title: 'Dashboard em tempo real',
        desc: 'Visualize receitas, despesas, saldo previsto e realizado em um único painel.'
    },
    {
        icon: '🔔',
        title: 'Semáforo de vencimentos',
        desc: 'Identifique títulos vencidos, que vencem hoje e nos próximos 7 dias.'
    },
    {
        icon: '🗂️',
        title: 'Categorias personalizadas',
        desc: 'Organize seus lançamentos com categorias criadas por você.'
    },
    {
        icon: '📈',
        title: 'Gráficos anuais e mensais',
        desc: 'Acompanhe a evolução de receitas e despesas ao longo dos meses.'
    },
    {
        icon: '✅',
        title: 'Checklist mensal',
        desc: 'Liste e marque as contas do mês. Nunca mais esqueça um vencimento.'
    },
    {
        icon: '📤',
        title: 'Exportação CSV e PDF',
        desc: 'Exporte seus relatórios para análise em planilhas ou arquivos impressos.'
    },
];

const STATS = [
    { icon: '🎯', value: 'R$ 0', label: 'Para começar — sem cartão de crédito' },
    { icon: '🏦', value: 'Multi-conta', label: 'Organize por banco ou cartão' },
    { icon: '📤', value: 'CSV · PDF', label: 'Exportação incluída em todos os planos' },
    { icon: '✅', value: 'Checklist', label: 'Controle mensal automático' },
];

const STEPS = [
    {
        num: '1',
        title: 'Crie sua conta',
        desc: 'Cadastro em menos de 1 minuto. Sem cartão de crédito.'
    },
    {
        num: '2',
        title: 'Cadastre seus lançamentos',
        desc: 'Adicione receitas e despesas com categoria, data e valor.'
    },
    {
        num: '3',
        title: 'Acompanhe seu progresso',
        desc: 'Veja gráficos, relatórios e o semáforo de vencimentos em tempo real.'
    },
];

const FREE_FEATURES = [
    { ok: true,  text: '1 conta financeira' },
    { ok: true,  text: '100 lançamentos no total' },
    { ok: true,  text: '5 itens no checklist mensal' },
    { ok: true,  text: 'Dashboard e gráficos' },
    { ok: true,  text: 'Semáforo de vencimentos' },
    { ok: false, text: 'Exportação CSV e PDF' },
];

const PRO_FEATURES = [
    { ok: true, text: 'Contas ilimitadas' },
    { ok: true, text: 'Lançamentos ilimitados' },
    { ok: true, text: 'Checklist sem limite' },
    { ok: true, text: 'Dashboard e gráficos' },
    { ok: true, text: 'Semáforo de vencimentos' },
    { ok: true, text: 'Exportação CSV e PDF' },
];

function LandingPage() {
    const { isAuthenticated } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [annual, setAnnual] = useState(false);

    return (
        <div className="landing">

            {/* ── 1. Navbar ── */}
            <nav className="landing-nav">
                <Link to="/" className="landing-nav-brand">
                    <div className="sb-logo-mark">
                        <FinHawkIcon className="landing-nav-icon" size={28} />
                    </div>
                    <span className="sb-logo-name">FinHawk</span>
                </Link>

                <div className="landing-nav-actions">
                    <button
                        className="landing-theme-toggle"
                        onClick={toggleTheme}
                        aria-label={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
                        title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
                    >
                        {theme === 'dark' ? '☀' : '🌙'}
                    </button>
                    {isAuthenticated ? (
                        <Link to="/dashboard" className="btn-landing-primary">
                            Ir para o app →
                        </Link>
                    ) : (
                        <>
                            <Link to="/login" className="btn-landing-nav">
                                Entrar
                            </Link>
                            <Link to="/cadastro" className="btn-landing-primary">
                                Criar conta grátis →
                            </Link>
                        </>
                    )}
                </div>
            </nav>

            {/* ── 2. Hero ── */}
            <section className="landing-hero">
                <div className="landing-hero-content">
                    <span className="hero-tag">
                        <span className="hero-tag-dot" />
                        Controle financeiro pessoal
                    </span>

                    <h1 className="hero-h1">
                        Seu dinheiro.<br />
                        Suas regras.<br />
                        <span className="accent">Seu futuro.</span>
                    </h1>

                    <p className="hero-sub">
                        Assuma o controle das suas finanças e construa liberdade todos os dias.
                    </p>

                    <div className="hero-ctas">
                        <Link to="/cadastro" className="btn-landing-primary">
                            Criar conta grátis →
                        </Link>
                        <Link to="/login" className="btn-landing-ghost">
                            Já tenho conta
                        </Link>
                    </div>
                </div>

                <div className="landing-hero-image">
                    <div className="hero-visual-card">
                        <FinHawkIcon className="hero-visual-icon" size={72} />
                        <SprayUnderline width={200} className="hero-visual-spray" />
                        <div className="hero-visual-stats">
                            <div className="hero-visual-stat">
                                <span className="hvs-label">Resultado do mês</span>
                                <span className="hvs-value" style={{ color: 'var(--green)' }}>+R$ 3.290</span>
                            </div>
                            <div className="hero-visual-stat">
                                <span className="hvs-label">Contas ativas</span>
                                <span className="hvs-value">3</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── 3. Stats row ── */}
            <div className="landing-stats-bar">
                <div className="stats-row">
                    {STATS.map((s) => (
                        <div className="stat-card" key={s.label}>
                            <div className="stat-card-icon">{s.icon}</div>
                            <div className="stat-card-value">{s.value}</div>
                            <div className="stat-card-label">{s.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── 4. Problema ── */}
            <div className="landing-section-full">
                <section className="landing-section">
                    <h2 className="problem-h2">
                        A maioria das pessoas não sabe para onde vai o dinheiro
                    </h2>
                    <p className="problem-p">
                        Sem um controle claro, é quase impossível saber se você está
                        gastando mais do que ganha — e quando percebe, já é tarde.
                        O FinHawk transforma dados financeiros em visibilidade real:
                        você vê exatamente o que entra, o que sai e o que está pendente.
                    </p>
                </section>
            </div>

            {/* ── 5. Features ── */}
            <section className="landing-section">
                <div className="features-intro">
                    <h2>Tudo que você precisa para ter controle de verdade</h2>
                    <p>Ferramentas práticas, sem complexidade desnecessária.</p>
                </div>

                <div className="features-grid">
                    {FEATURES.map((f) => (
                        <div className="feature-card" key={f.title}>
                            <div className="feature-icon">{f.icon}</div>
                            <div className="feature-title">{f.title}</div>
                            <div className="feature-desc">{f.desc}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── 6. Como funciona ── */}
            <div className="landing-section-full">
                <section className="landing-section">
                    <div className="how-header">
                        <h2>Como funciona</h2>
                        <p>Em três passos você já tem controle total das suas finanças.</p>
                    </div>

                    <div className="steps">
                        {STEPS.map((s, i) => (
                            <>
                                <div className="step" key={s.num}>
                                    <div className="step-num">{s.num}</div>
                                    <div className="step-title">{s.title}</div>
                                    <div className="step-desc">{s.desc}</div>
                                </div>
                                {i < STEPS.length - 1 && (
                                    <div className="step-arrow" key={`arrow-${i}`}>→</div>
                                )}
                            </>
                        ))}
                    </div>
                </section>
            </div>

            {/* ── 7. Preços ── */}
            <section className="landing-section" id="precos">
                <div className="pricing-header">
                    <h2>Planos simples, sem surpresas</h2>
                    <p>Comece grátis. Faça upgrade quando precisar de mais.</p>
                </div>

                <div className="pricing-toggle">
                    <span className={`pricing-toggle-label${!annual ? ' active' : ''}`} onClick={() => setAnnual(false)}>
                        Mensal
                    </span>
                    <button
                        className="pricing-toggle-switch"
                        data-annual={annual}
                        onClick={() => setAnnual(a => !a)}
                        aria-label="Alternar período"
                    />
                    <span className={`pricing-toggle-label${annual ? ' active' : ''}`} onClick={() => setAnnual(true)}>
                        Anual <span className="pricing-toggle-badge">–37%</span>
                    </span>
                </div>

                <div className="pricing-cards">
                    {/* Free */}
                    <div className="pricing-card">
                        <div className="pricing-card-plan">Gratuito</div>
                        <div className="pricing-card-price">R$ 0</div>
                        <div className="pricing-card-period">para sempre</div>
                        <div className="pricing-card-saving">&nbsp;</div>
                        <ul className="pricing-card-features">
                            {FREE_FEATURES.map(f => (
                                <li key={f.text}>
                                    <span className={f.ok ? 'check' : 'cross'}>{f.ok ? '✓' : '×'}</span>
                                    <span style={{ color: f.ok ? 'var(--text)' : 'var(--muted)' }}>{f.text}</span>
                                </li>
                            ))}
                        </ul>
                        <Link to="/cadastro" className="pricing-card-cta">
                            Criar conta grátis
                        </Link>
                    </div>

                    {/* Pro */}
                    <div className="pricing-card pricing-card--pro">
                        <div className="pricing-card-badge">PRO</div>
                        <div className="pricing-card-plan">Pro</div>
                        <div className="pricing-card-price">
                            <sup>R$</sup>
                            {annual ? '149' : '19'}
                            <span className="pricing-card-price-cents">{annual ? ',00' : ',90'}</span>
                        </div>
                        <div className="pricing-card-period">{annual ? 'por ano' : 'por mês'}</div>
                        <div className="pricing-card-saving">
                            {annual ? 'Economize R$ 90,80 vs mensal' : ' '}
                        </div>
                        <ul className="pricing-card-features">
                            {PRO_FEATURES.map(f => (
                                <li key={f.text}>
                                    <span className="check">✓</span>
                                    {f.text}
                                </li>
                            ))}
                        </ul>
                        {isAuthenticated ? (
                            <button
                                className="pricing-card-cta pricing-card-cta--primary"
                                onClick={() => {
                                    const token = localStorage.getItem('token');
                                    fetch(`${import.meta.env.VITE_API_URL}/stripe/checkout?period=${annual ? 'annual' : 'monthly'}`, {
                                        method: 'POST',
                                        headers: { Authorization: `Bearer ${token}` }
                                    })
                                        .then(r => r.json())
                                        .then(d => { if (d.url) window.location.href = d.url; });
                                }}
                            >
                                Assinar {annual ? 'anual' : 'mensal'} →
                            </button>
                        ) : (
                            <Link to="/cadastro" className="pricing-card-cta pricing-card-cta--primary">
                                Começar agora →
                            </Link>
                        )}
                    </div>
                </div>
            </section>

            {/* ── 8. CTA final ── */}
            <section className="landing-section cta-section">
                <h2 className="cta-h2">Comece agora. É grátis.</h2>
                <p className="cta-sub">
                    Sem cartão de crédito. Cancele quando quiser.
                </p>

                <Link to="/cadastro" className="btn-landing-primary">
                    Criar minha conta grátis →
                </Link>

                <div className="cta-badges">
                    <span className="cta-badge">✓ Cadastro em 1 minuto</span>
                    <span className="cta-badge">✓ Dados protegidos com JWT</span>
                    <span className="cta-badge">✓ Export CSV e PDF incluso</span>
                </div>
            </section>

            {/* ── 9. Footer ── */}
            <footer className="landing-footer">
                <Link to="/" className="landing-footer-brand">
                    <FinHawkLogo className="footer-logo" height={32} />
                </Link>

                <div className="landing-footer-links">
                    <Link to="/privacidade">Privacidade</Link>
                    <Link to="/termos">Termos</Link>
                    <span style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
                        © {new Date().getFullYear()} FinHawk
                    </span>
                </div>
            </footer>

        </div>
    );
}

export default LandingPage;
