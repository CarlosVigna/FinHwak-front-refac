// Traduz mensagens de erro tecnicas (vindas do backend em ingles, ou de
// falhas de rede do proprio navegador) para portugues simples, sem tocar
// nas mensagens originais -- o GlobalExceptionHandler do backend decide o
// status HTTP fazendo match de substring nessas mesmas strings em ingles
// (ex: "not found" -> 404), entao traduzir la quebraria esse roteamento.
// Essa camada fica só na borda, no momento de mostrar pro usuario.

const TRANSLATIONS = [
    [/failed to fetch|networkerror|load failed|network request failed/i,
        'Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.'],
    [/access denied|access not allowed|not allowed to/i,
        'Você não tem permissão para fazer isso.'],
    [/unauthenticated/i,
        'Sua sessão expirou. Faça login novamente.'],
    [/account not found/i, 'Conta não encontrada.'],
    [/bill not found/i, 'Lançamento não encontrado.'],
    [/category not found or archived/i, 'Categoria não encontrada ou arquivada.'],
    [/category must belong to the same account/i, 'A categoria precisa pertencer à mesma conta.'],
    [/category not found/i, 'Categoria não encontrada.'],
    [/checklist item not found/i, 'Item do checklist não encontrado.'],
    [/email already registered/i, 'Este e-mail já está cadastrado.'],
    [/user not found/i, 'Usuário não encontrado.'],
    [/backup version invalid/i, 'Arquivo de backup inválido. Selecione um arquivo gerado pelo FinHawk.'],
];

const FALLBACK = 'Algo deu errado. Tente novamente em instantes.';

export function translateError(message) {
    if (!message || typeof message !== 'string') return FALLBACK;

    for (const [pattern, translated] of TRANSLATIONS) {
        if (pattern.test(message)) return translated;
    }

    // Qualquer coisa que nao bateu num padrao conhecido passa direto --
    // no codebase de hoje isso e quase sempre mensagem que o proprio
    // frontend/backend ja escreveu em portugues (validacao, fallback
    // customizado por tela). Melhor mostrar essa mensagem especifica do
    // que trocar por um fallback generico "por via das duvidas".
    return message;
}
