import assert from 'node:assert/strict';
import test from 'node:test';
import {
  calculateSimplesDas,
  createJournalEntry,
  calculateIncomeStatement,
  type JournalLine,
} from '../src/index.ts';

test('não aceita lançamento sem origem ou com débito diferente do crédito', () => {
  const lines: JournalLine[] = [
    { account: '1.1.01', direction: 'D', amountCents: 1000n },
    { account: '3.1.01', direction: 'C', amountCents: 999n },
  ];

  assert.throws(() => createJournalEntry({ sourceEventId: '', lines }), /sourceEventId/);
  assert.throws(() => createJournalEntry({ sourceEventId: 'sale-1', lines }), /equilibrado/);
});

test('DRE calcula lucro pela competência, sem confundir receita com caixa', () => {
  const pnl = calculateIncomeStatement({
    revenueCents: 100_000n,
    deductionsCents: 5_000n,
    cogsCents: 40_000n,
    operatingExpensesCents: 20_000n,
    taxCents: 3_000n,
    financialResultCents: -2_000n,
  });

  assert.deepEqual(pnl, {
    grossRevenueCents: 100_000n,
    netRevenueCents: 95_000n,
    grossProfitCents: 55_000n,
    operatingResultCents: 32_000n,
    netResultCents: 30_000n,
  });
});

test('Simples Anexo I usa alíquota efetiva progressiva com RBT12 e parcela a deduzir', () => {
  const result = calculateSimplesDas({
    annex: 'I',
    rbt12Cents: 200_000_00n,
    monthlyRevenueCents: 20_000_00n,
  });

  assert.equal(result.bracket, 2);
  assert.equal(result.effectiveRateBps, 433n);
  assert.equal(result.dasCents, 86_600n);
});

test('Simples arredonda o DAS em centavos e rejeita receita/RBT12 inválidos', () => {
  assert.equal(calculateSimplesDas({ annex: 'I', rbt12Cents: 180_000_00n, monthlyRevenueCents: 1n }).dasCents, 0n);
  assert.throws(
    () => calculateSimplesDas({ annex: 'I', rbt12Cents: 0n, monthlyRevenueCents: 100n }),
    /RBT12/,
  );
  assert.throws(
    () => calculateSimplesDas({ annex: 'I', rbt12Cents: 100n, monthlyRevenueCents: -1n }),
    /receita mensal/,
  );
});
