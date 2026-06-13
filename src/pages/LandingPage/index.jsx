import { Link } from 'react-router-dom';
import { useAuth } from '../Login/AuthContext';
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

function LandingPage() {
    const { isAuthenticated } = useAuth();

    return (
        <div className="landing">

            {/* ── 1. Navbar ── */}
            <nav className="landing-nav">
                <Link to="/" className="landing-nav-brand">
                    <div className="sb-logo-mark">FH</div>
                    <span className="sb-logo-name">FinHawk</span>
                </Link>

                <div className="landing-nav-actions">
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
            <section className="landing-section">
                <span className="hero-tag">
                    <span className="hero-tag-dot" />
                    Controle financeiro pessoal
                </span>

                <h1 className="hero-h1">
                    Controle total<br />do seu dinheiro
                </h1>

                <p className="hero-sub">
                    Dashboard, relatórios e checklist mensal — tudo em um lugar.
                    Saiba exatamente para onde vai cada real.
                </p>

                <div className="hero-ctas">
                    <Link to="/cadastro" className="btn-landing-primary">
                        Criar conta grátis →
                    </Link>
                    <Link to="/login" className="btn-landing-ghost">
                        Já tenho conta
                    </Link>
                </div>

                {/* ── 3. Stats row ── */}
                <div className="stats-row">
                    {STATS.map((s) => (
                        <div className="stat-card" key={s.label}>
                            <div className="stat-card-icon">{s.icon}</div>
                            <div className="stat-card-value">{s.value}</div>
                            <div className="stat-card-label">{s.label}</div>
                        </div>
                    ))}
                </div>
            </section>

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

            {/* ── 7. CTA final ── */}
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

            {/* ── 8. Footer ── */}
            <footer className="landing-footer">
                <Link to="/" className="landing-footer-brand">
                    <div className="sb-logo-mark">FH</div>
                    <span style={{ fontSize: '0.88rem', color: 'var(--muted2)' }}>
                        FinHawk — Controle Financeiro Pessoal
                    </span>
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
