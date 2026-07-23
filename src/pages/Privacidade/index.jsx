import { Link } from 'react-router-dom';

const Privacidade = () => (
    <div className="mx-auto max-w-2xl px-4 py-10 text-text">
        <div className="mb-6">
            <Link to="/" className="text-sm text-primary hover:underline">← Voltar para o início</Link>
        </div>

        <div className="flex flex-col gap-4 [&_h1]:text-2xl [&_h1]:font-semibold [&_h2]:mt-6 [&_h2]:text-lg [&_h2]:font-semibold [&_p]:text-muted2 [&_li]:text-muted2 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-1">
            <h1>Política de Privacidade</h1>
            <span className="text-sm text-muted">Atualizado em 12 de junho de 2026</span>

            <h2>1. Dados Coletados</h2>
            <p>O FinHawk coleta apenas os dados estritamente necessários para a prestação do serviço:</p>
            <ul>
                <li>Nome completo e endereço de e-mail (identificação e autenticação)</li>
                <li>Dados financeiros inseridos pelo usuário: contas, categorias, lançamentos e checklist mensal</li>
                <li>Registros de atividade: datas de criação e modificação dos dados</li>
            </ul>
            <p>
                Não são coletados CPF, dados bancários, cartões de crédito ou quaisquer dados sensíveis não
                relacionados ao uso do serviço.
            </p>

            <h2>2. Finalidade do Tratamento</h2>
            <p>Os dados coletados são utilizados exclusivamente para:</p>
            <ul>
                <li>Prestação do serviço de controle financeiro pessoal</li>
                <li>Autenticação segura e gerenciamento de sessão</li>
                <li>Envio de e-mails transacionais (como recuperação de senha)</li>
            </ul>
            <p>Nenhum dado é utilizado para fins comerciais, publicidade ou marketing.</p>

            <h2>3. Compartilhamento de Dados</h2>
            <p>
                Seus dados não são vendidos, alugados nem compartilhados com terceiros para fins comerciais.
            </p>
            <p>
                Para a operação do sistema, podem ser utilizados serviços de infraestrutura de terceiros —
                como banco de dados em nuvem e servidores SMTP para envio de e-mails —, sempre sob compromisso
                contratual de confidencialidade.
            </p>

            <h2>4. Segurança</h2>
            <p>Adotamos as seguintes medidas técnicas para proteger seus dados:</p>
            <ul>
                <li>Senhas armazenadas com hash BCrypt (não reversível)</li>
                <li>Comunicação protegida por HTTPS/TLS</li>
                <li>Tokens de sessão com expiração automática em 2 horas</li>
                <li>Tokens de recuperação de senha com validade de 30 minutos e uso único</li>
            </ul>

            <h2>5. Seus Direitos (LGPD)</h2>
            <p>
                De acordo com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), você tem direito a:
            </p>
            <ul>
                <li>
                    <strong className="text-text">Alterar seus dados pessoais:</strong>{' '}
                    Configurações → Dados Pessoais
                </li>
                <li>
                    <strong className="text-text">Alterar sua senha:</strong>{' '}
                    Configurações → Alterar Senha
                </li>
                <li>
                    <strong className="text-text">Excluir sua conta e todos os dados:</strong>{' '}
                    Configurações → Privacidade e Dados → Excluir Minha Conta
                </li>
                <li>Solicitar informações adicionais pelo e-mail abaixo</li>
            </ul>

            <h2>6. Contato</h2>
            <p>
                Para dúvidas ou solicitações relacionadas a esta política, entre em contato:{' '}
                <strong className="text-text">garcia.carlosfilho@gmail.com</strong>
            </p>

            <div className="mt-6 flex gap-4 border-t border-border pt-4 text-sm">
                <Link to="/termos" className="text-primary hover:underline">Ver Termos de Uso</Link>
                <Link to="/" className="text-primary hover:underline">Voltar ao início</Link>
            </div>
        </div>
    </div>
);

export default Privacidade;
