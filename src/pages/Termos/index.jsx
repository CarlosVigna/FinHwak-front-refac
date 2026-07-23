import { Link } from 'react-router-dom';

const Termos = () => (
    <div className="mx-auto max-w-2xl px-4 py-10 text-text">
        <div className="mb-6">
            <Link to="/" className="text-sm text-primary hover:underline">← Voltar para o início</Link>
        </div>

        <div className="flex flex-col gap-4 [&_h1]:text-2xl [&_h1]:font-semibold [&_h2]:mt-6 [&_h2]:text-lg [&_h2]:font-semibold [&_p]:text-muted2 [&_li]:text-muted2 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-1">
            <h1>Termos de Uso</h1>
            <span className="text-sm text-muted">Atualizado em 12 de junho de 2026</span>

            <h2>1. Objeto</h2>
            <p>
                O FinHawk é uma aplicação de controle financeiro pessoal desenvolvida para uso individual.
                Ao criar uma conta ou utilizar o serviço, o usuário concorda com estes termos em sua integralidade.
            </p>

            <h2>2. Responsabilidade do Usuário</h2>
            <p>Ao utilizar o FinHawk, o usuário se compromete a:</p>
            <ul>
                <li>Manter suas credenciais de acesso (e-mail e senha) em sigilo</li>
                <li>Utilizar a plataforma apenas para fins pessoais e lícitos</li>
                <li>Responsabilizar-se pela veracidade dos dados financeiros inseridos</li>
                <li>Não utilizar scripts automatizados, robôs ou mecanismos que sobrecarreguem os servidores</li>
            </ul>

            <h2>3. Disponibilidade do Serviço</h2>
            <p>
                O FinHawk é disponibilizado "no estado em que se encontra", sem garantia de disponibilidade
                ininterrupta. Podem ocorrer indisponibilidades temporárias para manutenção, atualizações ou
                por motivos de força maior, sem que isso gere qualquer direito a indenização.
            </p>

            <h2>4. Segurança da Conta</h2>
            <p>
                O usuário é responsável por todas as ações realizadas em sua conta. Em caso de suspeita de
                acesso não autorizado, recomenda-se alterar a senha imediatamente em{' '}
                <strong className="text-text">Configurações → Alterar Senha</strong> e entrar em contato pelo e-mail de suporte.
            </p>

            <h2>5. Exclusão de Conta</h2>
            <p>
                O usuário pode excluir sua conta a qualquer momento em{' '}
                <strong className="text-text">Configurações → Privacidade e Dados → Excluir Minha Conta</strong>.
            </p>
            <p>
                A exclusão é permanente e irreversível: todos os dados (contas, categorias, lançamentos,
                checklist e histórico) serão removidos definitivamente e não poderão ser recuperados.
            </p>

            <h2>6. Limitação de Responsabilidade</h2>
            <p>
                O FinHawk é uma ferramenta de organização financeira pessoal, não uma plataforma de
                consultoria financeira ou de investimentos. O desenvolvedor não se responsabiliza por
                decisões financeiras tomadas com base nas informações registradas na plataforma.
            </p>
            <p>Para dúvidas ou sugestões: <strong className="text-text">garcia.carlosfilho@gmail.com</strong></p>

            <div className="mt-6 flex gap-4 border-t border-border pt-4 text-sm">
                <Link to="/privacidade" className="text-primary hover:underline">Ver Política de Privacidade</Link>
                <Link to="/" className="text-primary hover:underline">Voltar ao início</Link>
            </div>
        </div>
    </div>
);

export default Termos;
