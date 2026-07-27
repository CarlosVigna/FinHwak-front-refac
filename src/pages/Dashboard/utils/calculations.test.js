import { describe, it, expect } from 'vitest';
import {
    calculateReceitas,
    calculateDespesas,
    calculateSaldoRealizado,
    calculateSaldoPrevisto,
    calculatePendenteMes,
    filterByMonth,
} from './calculations';

// Estas funcoes duplicam no frontend a mesma agregacao que o backend faz
// (soma de lancamentos por tipo/status) pra alimentar os cards do
// Dashboard sem esperar um round-trip por interacao -- exatamente o tipo
// de calculo financeiro que nao pode falhar silenciosamente.

const bill = (overrides) => ({
    installmentAmount: '0',
    status: 'PENDING',
    maturity: '2026-07-15',
    category: { type: 'PAYMENT' },
    ...overrides,
});

describe('calculateReceitas / calculateDespesas', () => {
    it('soma simples: uma receita e uma despesa nao se misturam', () => {
        const bills = [
            bill({ installmentAmount: '1000.00', category: { type: 'RECEIPT' } }),
            bill({ installmentAmount: '300.00', category: { type: 'PAYMENT' } }),
        ];

        expect(calculateReceitas(bills)).toBe(1000);
        expect(calculateDespesas(bills)).toBe(300);
    });

    it('periodo vazio retorna zero, nao erro', () => {
        expect(calculateReceitas([])).toBe(0);
        expect(calculateDespesas([])).toBe(0);
        expect(calculateReceitas(null)).toBe(0);
        expect(calculateReceitas(undefined)).toBe(0);
    });

    it('mistura de RECEIPT e PAYMENT soma cada lado separadamente', () => {
        const bills = [
            bill({ installmentAmount: '500', category: { type: 'RECEIPT' } }),
            bill({ installmentAmount: '200', category: { type: 'RECEIPT' } }),
            bill({ installmentAmount: '150', category: { type: 'PAYMENT' } }),
            bill({ installmentAmount: '50', category: { type: 'PAYMENT' } }),
        ];

        expect(calculateReceitas(bills)).toBe(700);
        expect(calculateDespesas(bills)).toBe(200);
    });

    it('aceita o tipo vindo direto em bill.type quando nao ha bill.category', () => {
        const bills = [bill({ installmentAmount: '80', category: undefined, type: 'RECEIPT' })];
        expect(calculateReceitas(bills)).toBe(80);
    });

    it('valores decimais somam sem perder centavos (dentro da precisao de float)', () => {
        const bills = [
            bill({ installmentAmount: '19.99', category: { type: 'RECEIPT' } }),
            bill({ installmentAmount: '0.01', category: { type: 'RECEIPT' } }),
        ];
        expect(calculateReceitas(bills)).toBeCloseTo(20.0, 2);
    });
});

describe('calculateSaldoRealizado', () => {
    it('so conta lancamentos PAID ou RECEIVED, ignora PENDING', () => {
        const bills = [
            bill({ installmentAmount: '500', status: 'PENDING', category: { type: 'RECEIPT' } }),
            bill({ installmentAmount: '200', status: 'PENDING', category: { type: 'PAYMENT' } }),
            bill({ installmentAmount: '100', status: 'RECEIVED', category: { type: 'RECEIPT' } }),
            bill({ installmentAmount: '30', status: 'PAID', category: { type: 'PAYMENT' } }),
        ];

        // pendentes (500 receita, 200 despesa) nao entram -- so 100 - 30
        expect(calculateSaldoRealizado(bills)).toBe(70);
    });

    it('periodo vazio retorna zero', () => {
        expect(calculateSaldoRealizado([])).toBe(0);
    });
});

describe('calculateSaldoPrevisto', () => {
    it('soma TODOS os lancamentos independente do status (previsto, nao realizado)', () => {
        const bills = [
            bill({ installmentAmount: '1000', status: 'PENDING', category: { type: 'RECEIPT' } }),
            bill({ installmentAmount: '400', status: 'PAID', category: { type: 'PAYMENT' } }),
        ];
        expect(calculateSaldoPrevisto(bills)).toBe(600);
    });
});

describe('calculatePendenteMes', () => {
    it('soma so os lancamentos PENDING', () => {
        const bills = [
            bill({ installmentAmount: '100', status: 'PENDING' }),
            bill({ installmentAmount: '50', status: 'PAID' }),
            bill({ installmentAmount: '25', status: 'PENDING' }),
        ];
        expect(calculatePendenteMes(bills)).toBe(125);
    });
});

describe('filterByMonth', () => {
    it('filtra lancamentos pelo mes/ano de vencimento', () => {
        const bills = [
            bill({ maturity: '2026-07-10' }),
            bill({ maturity: '2026-08-01' }),
            bill({ maturity: '2026-07-31' }),
        ];

        const julho = filterByMonth(bills, 6, 2026); // mes 0-indexado: 6 = julho
        expect(julho).toHaveLength(2);
    });

    it('array vazio retorna vazio, nao erro', () => {
        expect(filterByMonth([], 6, 2026)).toEqual([]);
    });
});
