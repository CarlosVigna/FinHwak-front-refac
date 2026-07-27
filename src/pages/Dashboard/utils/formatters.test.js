import { describe, it, expect } from 'vitest';
import { formatCurrency } from './formatters';

// formatCurrency e o que o usuario le em toda tela -- se isso mostrar um
// numero errado (sinal trocado, arredondamento, R$ faltando), a confianca
// no app inteiro cai.
//
// Nota: toLocaleString('pt-BR', {style:'currency'}) usa um espaco
// nao-quebravel (U+00A0) entre "R$" e o numero, nao um espaco comum --
// por isso os literais abaixo usam a constante NBSP em vez de um espaco
// digitado direto (evita caractere invisivel divergente no arquivo).
const NBSP = String.fromCharCode(160);

describe('formatCurrency', () => {
    it('formata valor positivo em R$ com duas casas decimais', () => {
        expect(formatCurrency(1234.5)).toBe(`R$${NBSP}1.234,50`);
    });

    it('formata zero', () => {
        expect(formatCurrency(0)).toBe(`R$${NBSP}0,00`);
    });

    it('formata valor negativo mantendo o sinal', () => {
        expect(formatCurrency(-250.75)).toBe(`-R$${NBSP}250,75`);
    });

    it('formata valores grandes com separador de milhar', () => {
        expect(formatCurrency(1000000)).toBe(`R$${NBSP}1.000.000,00`);
    });

    it('formata valores pequenos (centavos)', () => {
        expect(formatCurrency(0.05)).toBe(`R$${NBSP}0,05`);
    });

    it('trata undefined como R$ 0,00 em vez de quebrar', () => {
        // este caso e um early-return com string literal fixa no codigo
        // (espaco comum), diferente do caminho via toLocaleString acima
        // (espaco nao-quebravel) -- ambos renderizam identico pro usuario.
        expect(formatCurrency(undefined)).toBe('R$ 0,00');
    });

    it('trata null como R$ 0,00 em vez de quebrar', () => {
        expect(formatCurrency(null)).toBe('R$ 0,00');
    });

    it('arredonda corretamente em vez de truncar', () => {
        expect(formatCurrency(19.999)).toBe(`R$${NBSP}20,00`);
    });
});
