/** Núcleo determinístico do HyperAccounting. Valores monetários são centavos inteiros. */

export type Direction = 'D' | 'C';

export interface JournalLine {
  account: string;
  direction: Direction;
  amountCents: bigint;
}

export interface JournalEntry {
  sourceEventId: string;
  description?: string;
  lines: readonly JournalLine[];
}

export function createJournalEntry(input: JournalEntry): JournalEntry {
  if (!input.sourceEventId.trim()) throw new Error('sourceEventId é obrigatório');
  if (input.lines.length < 2) throw new Error('lançamento deve ter ao menos duas linhas');

  let debits = 0n;
  let credits = 0n;
  for (const line of input.lines) {
    if (!line.account.trim()) throw new Error('conta é obrigatória');
    if (typeof line.amountCents !== 'bigint' || line.amountCents <= 0n) {
      throw new Error('valor deve ser centavos positivos');
    }
    if (line.direction === 'D') debits += line.amountCents;
    else credits += line.amountCents;
  }
  if (debits !== credits) throw new Error('lançamento não está equilibrado: ΣD deve ser igual a ΣC');
  return { ...input, lines: input.lines.map((line) => ({ ...line })) };
}

export interface IncomeStatementInput {
  revenueCents: bigint;
  deductionsCents?: bigint;
  cogsCents?: bigint;
  operatingExpensesCents?: bigint;
  taxCents?: bigint;
  financialResultCents?: bigint;
}

export interface IncomeStatement {
  grossRevenueCents: bigint;
  netRevenueCents: bigint;
  grossProfitCents: bigint;
  operatingResultCents: bigint;
  netResultCents: bigint;
}

export function calculateIncomeStatement(input: IncomeStatementInput): IncomeStatement {
  const deductions = input.deductionsCents ?? 0n;
  const cogs = input.cogsCents ?? 0n;
  const expenses = input.operatingExpensesCents ?? 0n;
  const tax = input.taxCents ?? 0n;
  const financial = input.financialResultCents ?? 0n;
  const netRevenue = input.revenueCents - deductions;
  const grossProfit = netRevenue - cogs;
  const operatingResult = grossProfit - expenses - tax;
  return {
    grossRevenueCents: input.revenueCents,
    netRevenueCents: netRevenue,
    grossProfitCents: grossProfit,
    operatingResultCents: operatingResult,
    netResultCents: operatingResult + financial,
  };
}

export type SimplesAnnex = 'I';

interface SimplesBracket {
  maxRbt12Cents: bigint;
  nominalRateBps: bigint;
  deductionCents: bigint;
}

// Anexo I (Comércio), LC 123/2006. Alíquotas em basis points (400 = 4%).
const ANNEX_I: readonly SimplesBracket[] = [
  { maxRbt12Cents: 180_000_00n, nominalRateBps: 400n, deductionCents: 0n },
  { maxRbt12Cents: 360_000_00n, nominalRateBps: 730n, deductionCents: 5_940_00n },
  { maxRbt12Cents: 720_000_00n, nominalRateBps: 950n, deductionCents: 13_860_00n },
  { maxRbt12Cents: 1_800_000_00n, nominalRateBps: 1_070n, deductionCents: 22_500_00n },
  { maxRbt12Cents: 3_600_000_00n, nominalRateBps: 1_430n, deductionCents: 87_300_00n },
  { maxRbt12Cents: 4_800_000_00n, nominalRateBps: 1_900n, deductionCents: 378_000_00n },
];

export interface SimplesDasInput {
  annex: SimplesAnnex;
  rbt12Cents: bigint;
  monthlyRevenueCents: bigint;
}

export interface SimplesDasResult {
  bracket: number;
  nominalRateBps: bigint;
  effectiveRateBps: bigint;
  dasCents: bigint;
}

function roundHalfUp(numerator: bigint, denominator: bigint): bigint {
  return (numerator + denominator / 2n) / denominator;
}

export function calculateSimplesDas(input: SimplesDasInput): SimplesDasResult {
  if (input.rbt12Cents <= 0n) throw new Error('RBT12 deve ser positivo');
  if (input.monthlyRevenueCents < 0n) throw new Error('receita mensal não pode ser negativa');
  const table = input.annex === 'I' ? ANNEX_I : undefined;
  if (!table) throw new Error(`anexo não suportado: ${input.annex}`);
  const index = table.findIndex((bracket) => input.rbt12Cents <= bracket.maxRbt12Cents);
  if (index < 0) throw new Error('RBT12 acima do limite do Anexo I');
  const bracket = table[index];
  const numerator = input.rbt12Cents * bracket.nominalRateBps - bracket.deductionCents * 10_000n;
  const rateDenominator = input.rbt12Cents * 10_000n;
  const effectiveRateBps = roundHalfUp(numerator * 10_000n, rateDenominator);
  const dasCents = roundHalfUp(input.monthlyRevenueCents * numerator, rateDenominator);
  return { bracket: index + 1, nominalRateBps: bracket.nominalRateBps, effectiveRateBps, dasCents };
}
