import { Link } from 'react-router-dom';

const p = { color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.7', margin: '12px 0 0' };
const h2 = { marginTop: '28px' };
const ul = { color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.8', paddingLeft: '20px', margin: '10px 0 0' };

const Termos = () => (
    <div className="fh-page">
        <div className="configuracoes-container">
            <h1 className="titulo-contas">Termos de Uso</h1>

            <div className="secao-superior">
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: '0 0 24px' }}>
                    Atualizado em 12 de junho de 2026
                </p>

                <h2 className="historico-titulo">1. Objeto</h2>
                <p style={p}>
                    O FinHawk é uma aplicação de controle financeiro pessoal desenvolvida para uso individual.
                    Ao criar uma conta ou utilizar o serviço, o usuário concorda com estes termos em sua integralidade.
                </p>

                <h2 className="historico-titulo" style={h2}>2. Responsabilidade do Usuário</h2>
                <p style={p}>Ao utilizar o FinHawk, o usuário se compromete a:</p>
                <ul style={ul}>
                    <li>Manter suas credenciais de acesso (e-mail e senha) em sigilo</li>
                    <li>Utilizar a plataforma apenas para fins pessoais e lícitos</li>
                    <li>Responsabilizar-se pela veracidade dos dados financeiros inseridos</li>
                    <li>Não utilizar scripts automatizados, robôs ou mecanismos que sobrecarreguem os servidores</li>
                </ul>

                <h2 className="historico-titulo" style={h2}>3. Disponibilidade do Serviço</h2>
                <p style={p}>
                    O FinHawk é disponibilizado "no estado em que se encontra", sem garantia de disponibilidade
                    ininterrupta. Podem ocorrer indisponibilidades temporárias para manutenção, atualizações ou
                    por motivos de força maior, sem que isso gere qualquer direito a indenização.
                </p>

                <h2 className="historico-titulo" style={h2}>4. Segurança da Conta</h2>
                <p style={p}>
                    O usuário é responsável por todas as ações realizadas em sua conta. Em caso de suspeita de
                    acesso não autorizado, recomenda-se alterar a senha imediatamente em{' '}
                    <strong>Configurações → Alterar Senha</strong> e entrar em contato pelo e-mail de suporte.
                </p>

                <h2 className="historico-titulo" style={h2}>5. Exclusão de Conta</h2>
                <p style={p}>
                    O usuário pode excluir sua conta a qualquer momento em{' '}
                    <strong>Configurações → Privacidade e Dados → Excluir Minha Conta</strong>.
                </p>
                <p style={p}>
                    A exclusão é permanente e irreversível: todos os dados (contas, categorias, lançamentos,
                    checklist e histórico) serão removidos definitivamente e não poderão ser recuperados.
                </p>

                <h2 className="historico-titulo" style={h2}>6. Limitação de Responsabilidade</h2>
                <p style={p}>
                    O FinHawk é uma ferramenta de organização financeira pessoal, não uma plataforma de
                    consultoria financeira ou de investimentos. O desenvolvedor não se responsabiliza por
                    decisões financeiras tomadas com base nas informações registradas na plataforma.
                </p>
                <p style={p}>
                    Para dúvidas ou sugestões: <strong>garcia.carlosfilho@gmail.com</strong>
                </p>

                <p style={{ ...p, marginTop: '28px' }}>
                    <Link to="/privacidade" className="btn-link">Ver Política de Privacidade</Link>
                </p>
            </div>
        </div>
    </div>
);

export default Termos;
