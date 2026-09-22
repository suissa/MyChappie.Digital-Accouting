# HyperAccounting — Plano de Implementação

> Complementa `../README.md` (contrato do módulo). Sequenciado por dependência real.
>
> **Convenções Lucy-mae** (`CLAUDE.md`): `src/entities/<name>/`; schema **dual** (`migration.ts` + `schema.prisma`); dinheiro em centavos inteiros — aqui obrigatoriamente **`BigInt`** (invariante do módulo); Zod em `shared/validation`; caminho vivo = `container.ts` + Express + `EventEmitter2`. Nome interno: `accounting` (novo). É um módulo de **projeção** (event sourcing): consome fatos, não os origina.

---

## 0. Resumo Executivo

| Marco | Entrega | Autonomia |
| :-- | :-- | :-- |
| **M1 — Fundação** | Motor de partidas dobradas em tempo real, plano de contas semântico, Diário/Razão vivos, reconciliação competência × caixa | `OBSERVE` |
| **M2 — Predição** | Previsor de carga tributária e risco de desenquadramento (RBT12, faixas do Simples/MEI), provisões trabalhistas | `SUGGEST` |
| **M3 — Otimização** | Otimizador de segregação monofásica / ICMS-ST em tempo real, otimizador de Fator R, detecção de risco de malha fina | `ASK` |
| **M4 — Autonomia** | Pacote fiscal do contador 1-clique, emissão/distribuição de guias com Pix, fechamento contábil autônomo | `EXECUTE` |

**Depende de:** HyperSales (`sale.confirmed`), HyperSupplier (`purchase.*`), HyperStock (`stock.*`, CMV, perdas), HyperFinancial (`finance.*`), HyperCompany (folha), HyperCommerce (NCM/CEST/regime do SKU).
**É consumido por:** HyperFinancial (valor a reservar), HyperSupplier (DIFAL), HyperCommerce (regime tributário do SKU), PersonalAssistant (relatórios contábeis).

---

## 1. Pré-requisitos e Dependências

| Item | Estado | Ação |
| :-- | :-- | :-- |
| Event store de fatos de negócio | `module_events` existe (log de auditoria) | Usar como fonte; projetar partidas dobradas a partir daí |
| Classificação fiscal do SKU | Não existe | Depende de HyperCommerce M1 (`ncm`, `cest`, `tax_regime`) |
| Tabelas de alíquotas (Anexos, PGDAS, NCM monofásico) | Não existem | Seed + fonte oficial (Receita/SEFAZ) |
| Regime tributário da empresa | Não existe | Vem de HyperCompany (`company_master`) |
| Precisão `BigInt` | Repo usa `number` para cents | Introduzir `bigint` nas colunas/serviços deste módulo |

---

## 2. Arquitetura no Repositório

```
src/entities/accounting/
  types.ts             # LedgerAccount, JournalEntry, TaxRule, BracketForecast, Provision, MonophasicSplit
  projection/
    double-entry.ts    # NOVO: evento de negócio → débito/crédito
    chart-of-accounts.ts # NOVO: plano de contas semântico auto-adaptativo
  reconcile/
    accrual-cash.ts    # NOVO: competência × caixa
  tax/
    tables.ts          # NOVO: alíquotas (Anexos, PGDAS, NCM monofásico, ICMS-ST)
    pgdas.ts           # NOVO: cálculo do DAS segregado
  forecast/
    bracket.ts         # NOVO: RBT12 + projeção de faturamento + faixa/alíquota efetiva
  optimizer/
    monophasic.ts      # NOVO: segregação monofásica/ST (LP)
    factor-r.ts        # NOVO: pró-labore ideal p/ Anexo III
  compliance/
    accountant-package.ts # NOVO: pacote 1-clique
    malha-fina.ts      # NOVO: maquininha declarada vs. notas
  agent.ts             # AccountingAgent (M4)
```

**Wiring:** caminho vivo (projeção síncrona a cada evento) + cron mensal (fechamento, pacote do contador). `AccountingAgent` reage a `sale.confirmed`, `purchase.*`, `finance.*`.

---

## 3. Modelo de Dados (colunas de valor em `BigInt`)

| Tabela | Colunas-chave |
| :-- | :-- |
| `ledger_accounts` | `id`, `code`, `name`, `type` (`ASSET|LIABILITY|EQUITY|REVENUE|EXPENSE`), `parent_id`, `sector_tag` |
| `journal_entries` | `id`, `occurred_at`, `source_event_id`, `description`, `reversed_by` |
| `journal_lines` | `id`, `journal_entry_id`, `account_id`, `direction` (`D|C`), `amount_cents bigint` |
| `tax_rules` | `id`, `scope` (`ncm|cest|anexo|bracket`), `key`, `regime` (`MONOPHASIC|ST|FULL`), `rates jsonb`, `valid_from` |
| `company_tax_profile` | `regime` (`MEI|SIMPLES|PRESUMIDO|REAL`), `anexo`, `rbt12_cents bigint`, `updated_at` |
| `bracket_forecast` | `id`, `horizon_days`, `projected_revenue_cents bigint`, `rbt12_projected_cents bigint`, `bracket`, `effective_rate`, `crossing_date`, `das_estimate_cents bigint`, `computed_at` |
| `monophasic_split` | `period`, `full_revenue_cents bigint`, `st_revenue_cents bigint`, `monophasic_revenue_cents bigint`, `das_optimized_cents bigint`, `saving_cents bigint` |
| `provisions` | `purpose` (`13TH|VACATION|SEVERANCE|ECL`), `accrued_cents bigint`, `computed_at` |
| `accountant_packages` | `id`, `period`, `link`, `files jsonb`, `format` (`dominio|questor|alterdata|fortes`), `generated_at` |

Invariantes checados na escrita: `Σ D = Σ C` por `journal_entry`; `Ativo = Passivo + PL`.

---

## 4. Contratos de API (REST)

| Método | Rota | Propósito |
| :-- | :-- | :-- |
| `GET` | `/accounting/trial-balance?date=` | Balancete (analítico/sintético) |
| `GET` | `/accounting/pnl?period=` & `/accounting/balance-sheet` | DRE fiscal e Balanço |
| `GET` | `/accounting/journal?from=&to=` | Diário |
| `GET` | `/accounting/ledger/:accountCode` | Razão |
| `GET` | `/accounting/tax/forecast?horizon=90d` | Previsão de DAS / faixa / desenquadramento |
| `GET` | `/accounting/tax/monophasic?period=` | Segregação e economia |
| `GET` | `/accounting/factor-r/simulate` | Pró-labore ideal |
| `GET` | `/accounting/obligations` | Calendário de obrigações |
| `POST` | `/accounting/accountant-package/generate` | Pacote 1-clique |
| `GET` | `/accounting/report?q=...` | Relatório contábil sob demanda |

---

## 5. Eventos

| Direção | Evento | Payload | Marco |
| :-- | :-- | :-- | :-- |
| Consome | `purchase.order.placed` / `purchase.goods.received` | `{ poId, items[], nfeKey }` | M1 |
| Consome | `sale.confirmed` | `{ saleId, items[] (sku, qty, priceCents) }` | M1 |
| Consome | `payment.captured` / `finance.entry.recorded` | `{ amountCents, method }` | M1 |
| Consome | `stock.cogs.updated` / `stock.shrinkage.detected` | `{ cogsCents / lossCents }` | M1 |
| Consome | `catalog.margin.updated` (regime do SKU) | `{ sku, regime }` | M1 |
| Consome | `payroll.paid` / `labor.liability.provisioned` (HyperCompany) | `{ amountCents }` | M2 |
| Emite | `accounting.entry.recorded` | `{ journalEntryId }` | M1 |
| Emite | `accounting.tax.threshold.forecasted` | `{ dasEstimateCents, bracket, crossingDate }` | M2 |
| Emite | `accounting.tax.monophasic.optimized` | `{ savingCents }` | M3 |
| Emite | `accounting.provisions.projected` | `{ purpose, accruedCents }` | M2 |
| Emite | `accounting.discrepancy.flagged` | `{ kind, deltaCents }` | M3 |
| Emite | `accounting.monthly.closed` | `{ period }` | M4 |
| Emite | `accounting.obligation.scheduled` | `{ obligation, dueDate, amountCents }` | M2 |
| Emite | `accounting.tax.classification.updated` | `{ sku, regime }` | M1 |

---

## 6. Componentes de IA / Otimização

| Capacidade | Tipo | Baseline v1 | Evolução | Libs | Fallback |
| :-- | :-- | :-- | :-- | :-- | :-- |
| Classificação contábil de evento (D/C) | Motor determinístico + LLM | Regras por tipo de evento (venda, compra, perda, pagamento) | LLM classifica despesa informal ("moça da faxina" → Serviços de Terceiros) | OpenRouter | Conta "a classificar" + revisão |
| Plano de contas semântico | LLM + ontologia | Ontologia base + LLM mapeia termo falado → conta | Adaptação setorial | OpenRouter | Plano padrão do segmento |
| Previsão de faturamento (RBT12) | IA especializada | Herda a previsão do HyperSales/HyperFinancial + tendência | Série temporal própria com intervalos | `simple-statistics` | Extrapolação linear |
| Cálculo de faixa/alíquota efetiva | Motor determinístico | Fórmulas PGDAS oficiais sobre RBT12 projetado | — | — | — |
| Segregação monofásica/ST | Otimização (LP) + regras | Classificar receita por NCM/CEST; deduzir PIS/COFINS/ICMS já recolhidos | MIP para casos limítrofes | `javascript-lp-solver` | Sem segregação (paga cheio) — mas alerta |
| Fator R | Otimização | Buscar pró-labore que atinge 28% da folha ponderando custo previdenciário × economia de anexo | — | — | Manter anexo atual |
| Risco de malha fina | IA especializada | Comparar volume declarado por adquirentes (DIMOB/DIRF) vs. notas emitidas; z-score da divergência | Modelo de risco | `simple-statistics` | Alerta manual |
| Provisões trabalhistas | Motor determinístico | Acúmulo mensal de 13º + férias + 1/3 + estimativa de rescisão por colaborador | ECL (IFRS 9) para fiado | — | — |
| Relatório sob demanda | LLM + SQL | NL → consulta | — | OpenRouter | Fixos |

**Invariantes (Zero-Trust Auditability):** nenhum `journal_entry` sem `source_event_id`; consolidado é imutável (correção só por estorno com causa); todo cálculo em `BigInt`.

---

## 7. Integrações Externas

- **Fontes fiscais:** tabelas do Simples Nacional (Anexos), lista de NCM monofásicos (PIS/COFINS), CEST/ICMS-ST por UF — carga versionada; SEFAZ para validar chave de NF-e.
- **Softwares contábeis:** exportação nos layouts Domínio, Questor, Alterdata, Fortes.
- **Pix copia-e-cola:** para guias (DAS/GPS/DARF) — reusa gerador do HyperFinancial.
- **WhatsZap MCP:** alertas preditivos, guia com Pix, pacote do contador (link protegido), relatórios.
- **OpenRouter:** classificação contábil e relatório.

---

## 8. Roadmap de Entregas

### Marco 1 — Fundação (`OBSERVE`) — ~3–4 sprints
1. `ledger_accounts` + `journal_entries` + `journal_lines` (`BigInt`); invariantes `ΣD=ΣC` e equação patrimonial na escrita.
2. `projection/double-entry.ts`: regras para venda, compra, CMV, perda, pagamento, taxa.
3. `chart-of-accounts.ts`: ontologia base + classificação LLM de despesa informal.
4. `reconcile/accrual-cash.ts`: competência × caixa (fiado, adiantamento, a prazo).
5. Balancete/Diário/Razão vivos (`GET /accounting/...`).
   **Pronto quando:** cada `sale.confirmed`/`purchase.*` gera partidas dobradas auditáveis até o evento; balancete fecha em qualquer instante.

### Marco 2 — Predição (`SUGGEST`) — ~3 sprints
1. `tax/tables.ts` (Anexos, PGDAS) + `company_tax_profile` (RBT12).
2. `forecast/bracket.ts`: `bracket_forecast`; `accounting.tax.threshold.forecasted`; alerta de desenquadramento MEI / mudança de faixa.
3. Provisões trabalhistas → `accounting.provisions.projected` (reserva no HyperFinancial).
4. Calendário de obrigações → `accounting.obligation.scheduled`.
   **Pronto quando:** o comerciante recebe "dia 22 você entra na Faixa 2; DAS previsto R$ 1.772; reserve R$ 443/semana" antes do fato.

### Marco 3 — Otimização (`ASK`) — ~3–4 sprints
1. `tax/tables.ts` com NCM monofásico + CEST/ICMS-ST; `tax/pgdas.ts`.
2. `optimizer/monophasic.ts`: segregação em tempo real; `monophasic_split`; `accounting.tax.monophasic.optimized`.
3. `optimizer/factor-r.ts`: pró-labore ideal.
4. `compliance/malha-fina.ts`: divergência maquininha × notas → `accounting.discrepancy.flagged`.
   **Pronto quando:** o DAS calculado já vem segregado, com economia em reais demonstrada, para aprovação.

### Marco 4 — Autonomia (`EXECUTE`) — ~3 sprints
1. `compliance/accountant-package.ts`: pacote 1-clique (XML, balancete, razão, memórias) nos layouts de mercado, link protegido.
2. Emissão/distribuição de guias (DAS/GPS/DARF) com Pix copia-e-cola; auditoria valor calculado × guia.
3. `AccountingAgent`: fechamento contábil autônomo no último dia do mês → `accounting.monthly.closed`.
   **Pronto quando:** no dia 1º o contador recebe o pacote pronto e o comerciante recebe a guia com Pix.

---

## 9. Estratégia de Testes

- **Unit:** invariantes (`ΣD=ΣC`, `A=P+PL`), regras de projeção por tipo de evento, fórmulas PGDAS (casos oficiais), LP de segregação (cenários conhecidos), Fator R, precisão `BigInt` (sem float).
- **Integração:** Postgres real — sequência de eventos de um mês de bar → balancete e DRE conferidos contra planilha de referência.
- **E2E:** áudio de despesa informal → conta correta; `sale.confirmed` de item monofásico → dedução no DAS.
- **Backtest:** previsão de RBT12/faixa contra 12 meses reais; métrica: erro do DAS previsto vs. real, antecedência do alerta de desenquadramento.
- **Validação fiscal:** conferência da segregação por um contador (aceitação humana obrigatória antes de M4).

---

## 10. Métricas de Sucesso

| Marco | Métrica | Alvo |
| :-- | :-- | :-- |
| M1 | Balancete sempre em equilíbrio | 100% |
| M1 | Fatos contábeis com evento de origem | 100% |
| M2 | Erro do DAS previsto (mês seguinte) | ≤ 5% |
| M2 | Antecedência do alerta de mudança de faixa | ≥ 15 dias |
| M3 | Redução do DAS por segregação monofásica | 20% a 60% |
| M3 | Divergências de malha fina detectadas | 100% acima do limiar |
| M4 | Guias pagas no prazo (sem multa/juros) | 100% |

---

## 11. Riscos e Mitigação

| Risco | Impacto | Mitigação |
| :-- | :-- | :-- |
| Erro de cálculo tributário | Multa / autuação | Aceitação humana do contador antes do modo EXECUTE; tabelas versionadas; testes contra casos oficiais |
| Classificação de NCM errada | Segregação indevida | Validar na base oficial; contador revisa; só segregar acima de confiança |
| Mudança na legislação (Reforma Tributária IBS/CBS) | Modelo desatualizado | Camada `tax_rules` versionada por `valid_from`; simulador de reforma separado |
| `BigInt` vs. `number` no resto do repo | Bugs de conversão | Este módulo isola `BigInt`; conversão só nas bordas com teste |
| Falta de dados para RBT12 | Previsão fraca | Usar 12 meses declarados + previsão do HyperSales; bandas amplas no início |

---

## 12. Checklist de Implementação

- [ ] `ledger_accounts` / `journal_entries` / `journal_lines` (`BigInt`) + invariantes na escrita
- [ ] `projection/double-entry.ts` (regras por tipo de evento)
- [ ] `chart-of-accounts.ts` (ontologia + LLM p/ despesa informal)
- [ ] `reconcile/accrual-cash.ts` (competência × caixa)
- [ ] Balancete / Diário / Razão vivos
- [ ] `tax/tables.ts` (Anexos, PGDAS) + `company_tax_profile`
- [ ] `forecast/bracket.ts` + alerta de desenquadramento
- [ ] Provisões trabalhistas + `accounting.obligation.scheduled`
- [ ] NCM monofásico + CEST/ICMS-ST + `tax/pgdas.ts`
- [ ] `optimizer/monophasic.ts` + `monophasic_split`
- [ ] `optimizer/factor-r.ts`
- [ ] `compliance/malha-fina.ts`
- [ ] `compliance/accountant-package.ts` (layouts Domínio/Questor/Alterdata/Fortes)
- [ ] Emissão de guias com Pix copia-e-cola
- [ ] `AccountingAgent` (fechamento autônomo)
- [ ] Aceitação do contador registrada antes de EXECUTE
- [ ] Testes unit + integração + e2e + backtest
