---
name: hyperaccounting-faixa-5-simples
description: >
  Use quando a empresa está no Simples Nacional com RBT12 entre R$ 1.800.000,01 e
  R$ 3.600.000 (Faixa 5). É a última faixa em que ICMS e ISS ainda estão dentro do
  DAS: o teto desta faixa é o SUBLIMITE de R$ 3,6 M — o primeiro penhasco real
  depois do MEI. Anexo I 9,45 % → 11,88 %; Anexo III 14,02 % → 17,51 %; Anexo V
  19,55 % → 21,28 %. Cobre subida para a Faixa 6 (ICMS/ISS por fora), descida para a
  Faixa 4, e o plano de 24 meses para atravessar o sublimite sem susto.
version: 1.0.0
---

# Faixa 5 do Simples Nacional — RBT12 de R$ 1.800.000,01 a R$ 3.600.000

## 1. Identificação

`regime == SIMPLES` e `1_800_000_00n < rbt12Cents <= 3_600_000_00n` (índice 4 em `ANNEX_I`).

Atenção a estados com **sublimite reduzido** (R$ 1.800.000, opção de estados com
participação < 1 % no PIB): nesses, a lógica de "penhasco" desta skill vale já na
saída da Faixa 4. O agente lê `stateSublimitCents` do HyperCompany.

## 2. Parâmetros da faixa

| Anexo | Nominal | Parcela a deduzir | Efetiva piso (R$ 1,8 M) | Efetiva teto (R$ 3,6 M) |
| :-- | --: | --: | --: | --: |
| I — Comércio | 14,30 % | R$ 87.300,00 | 9,45 % | **11,875 %** |
| II — Indústria | 14,70 % | R$ 85.500,00 | 9,95 % | 12,325 % |
| III — Serviços (Fator R ≥ 28 %) | 21,00 % | R$ 125.640,00 | 14,02 % | 17,51 % |
| IV — Serviços | 22,00 % | R$ 183.780,00 | 11,79 % | 16,895 % |
| V — Serviços (Fator R < 28 %) | 23,00 % | R$ 62.100,00 | 19,55 % | 21,275 % |

Exemplo (Anexo I, RBT12 = R$ 2.700.000, mês R$ 225.000):
`efetiva = (2.700.000 × 14,3 % − 87.300) / 2.700.000 = 298.800 / 2.700.000 = 11,07 %` → DAS R$ 24.900,00.

Marginal (Anexo I) ≈ 14,30 % — a mais alta do Simples para comércio. E o teto
desta faixa é o **sublimite**: acima de R$ 3,6 M o ICMS (comércio/indústria) e o
ISS (serviços) saem do DAS e passam a ser apurados no regime normal do estado/município.

### O que acontece ao cruzar R$ 3.600.000

| Excesso no ano-calendário | Efeito | Quando |
| :-- | :-- | :-- |
| ≤ 20 % (até R$ 4.320.000) | ICMS/ISS fora do Simples | a partir de **1º/jan do ano seguinte** |
| > 20 % (acima de R$ 4.320.000) | ICMS/ISS fora do Simples | a partir do **mês seguinte** ao excesso |
| Em qualquer caso | os tributos federais continuam no DAS (Faixa 6) | — |

Para comércio, o ICMS é 33,5 % da alíquota do Anexo I nesta faixa (≈ 4,8 p.p. da
efetiva). Fora do DAS, a empresa apura **débito − crédito** do ICMS: pode ser
**melhor** (muito crédito de compras, produtos com ST/monofásicos) ou **pior**
(alíquota interna 18–20 % sem crédito relevante, serviços). O agente **simula os dois**
antes de tratar o sublimite como problema.

## 3. Cenários de mudança de faixa

### 3.1 Subir (Faixa 5 → Faixa 6, atravessando o sublimite)

| # | Cenário | Sinal antecipado | Impacto | Ação prescrita |
| :-- | :-- | :-- | :-- | :-- |
| U1 | Crescimento orgânico | RBT12 projetado 12 m ≥ R$ 3.240.000 (90 %) | ICMS/ISS fora a partir de janeiro (≤ 20 %) | **plano de 24 meses** (§5): créditos de ICMS, inscrição estadual em regime normal, ERP fiscal, contador |
| U2 | Crescimento acelerado (> 20 % de excesso) | projeção anual > R$ 4.320.000 | ICMS/ISS fora **no mês seguinte** — sem tempo de preparação | alerta `regime.cliff` com 180 d; preparar apuração normal "em paralelo" desde já |
| U3 | Rede de lojas / novos pontos | filiais | consolidado cruza | estudo societário legítimo (holding, sociedades com sócios distintos) — contador |
| U4 | Atacado/distribuição | mix de margem baixa | infla RBT12; no regime normal de ICMS o atacado costuma **ganhar** (crédito) | simular ICMS normal; pode ser vantajoso cruzar |
| U5 | E-commerce nacional | canal | DIFAL de saída + volume | simular |
| U6 | Aquisição/fusão | M&A | soma | modelar estrutura antes |
| U7 | Sazonalidade | previsão | pico infla 12 m | provisão; atenção ao teto **anual** (não RBT12) para o sublimite |
| U8 | Fator R cai < 28 % (serviços) | folha | III → V (+5 p.p.) | pró-labore/contratação |

### 3.2 Descer (Faixa 5 → Faixa 4)

| # | Cenário | Sinal | Impacto | Ação |
| :-- | :-- | :-- | :-- | :-- |
| D1 | Fechamento de loja/canal | filial baixada | RBT12 cai em 12 m | prever data; se a queda for grande, reavaliar estrutura |
| D2 | Perda de contrato/cliente grande | contrato | idem | idem |
| D3 | Representação/comissão para distribuição de baixa margem | contrato | RBT12 cai; lucro igual | ✅ |
| D4 | Cisão com propósito (indústria × comércio × serviço) | reorganização | cada CNPJ desce | contador; substância |
| D5 | Crise setorial | queda > 20 % 3 m | idem D1 | idem |
| D6 | Corte de linhas de receita útil negativa (margem < 14,3 %) | Pareto | receita ↓, lucro ↑ | ✅ |
| D7 | Volta do sublimite (empresa que já saiu, receita anual ≤ R$ 3,6 M) | RBT ano anterior | ICMS/ISS voltam ao DAS em 1º/jan seguinte | comunicar; recompor estoque de crédito (o saldo credor de ICMS pode ser perdido — planejar) |

### 3.3 Mudança de regime — Simples × Presumido/Real

Nesta faixa a comparação passa a ser feita **todo ano em outubro**, com 3 cenários:

| Perfil | Simples (efetiva ~R$ 2,7 M) | Presumido | Real | Vencedor típico |
| :-- | :-- | :-- | :-- | :-- |
| Comércio margem baixa (< 15 %), muito crédito | 11 % com ICMS dentro | 5,93 % federal + ICMS normal (crédito) + INSS patronal | 34 % sobre lucro real + PIS/COFINS 9,25 % não cumulativo + ICMS + INSS | frequentemente **Presumido** ou até **Real** |
| Comércio margem alta, pouco crédito | 11 % | idem | idem | **Simples** |
| Serviços Anexo III | ~16 % com CPP | 13,3–16,3 % + INSS patronal por fora | — | **Simples** se folha relevante |
| Serviços Anexo V | ~20,5 % | 13,3–16,3 % + INSS | — | **Presumido** salvo Fator R corrigível |

Só sai do Simples com economia líquida > R$ 50 k/ano em 3 cenários, considerando
custo de compliance (SPED Fiscal, EFD-Contribuições, ECD/ECF, DCTF) ≈ R$ 2–4 k/mês.

## 4. Melhor forma de economizar nesta faixa

1. **Segregação de monofásicos/ICMS-ST** — em R$ 225 k/mês com 45 % monofásico+ST e
   efetiva 11,07 %: economia ≈ R$ 5.600/mês. Continua sendo a maior alavanca.
2. **Preparar o ICMS normal como oportunidade, não ameaça.** Comércio com compras
   tributadas (NF com destaque de ICMS) e vendas de ST/monofásicos pode pagar
   **menos** ICMS no regime normal do que os 4,8 p.p. embutidos no DAS. O agente
   calcula `icms_normal = débitos − créditos` em paralelo desde R$ 2,5 M de RBT12.
3. **Fator R** (folha 28 % de R$ 2,7 M = R$ 756 k/ano) — empresas de serviço nesta
   faixa normalmente têm folha; fechar o gap com pró-labore dos sócios.
4. **Estrutura societária com substância** para redes (holding patrimonial +
   operacionais com sócios/atividades distintos). Só via contador/advogado; o
   agente prepara a simulação de RBT12 por estrutura.
5. **Retenções na fonte** compensadas; **DIFAL** de entrada e saída embutidos.
6. **Regime de caixa** para parcelado/crediário.
7. **Pró-labore e distribuição de lucros isenta com escrituração completa** — com
   ECD (obrigatória fora do Simples) já em vista, escriturar agora custa pouco a mais.
8. **Exclusões de receita bruta** (gorjeta, vale, reembolso, receita financeira,
   ganho de capital).
9. **Planejamento anual em outubro**: Simples × Presumido × Real com 3 cenários —
   a opção é irrevogável pelo ano-calendário.

## 5. Como não atingir o teto da faixa (o sublimite)

Aqui o teto **é** penhasco — mas um penhasco que pode ser **degrau para cima** se a
empresa chegar preparada. A política tem dois trilhos:

**Trilho A — chegar preparado (default, para quem vai crescer):**

| Prazo antes do cruzamento | Ação |
| :-- | :-- |
| 24 meses (RBT12 ≈ R$ 2,5 M) | ligar simulação paralela de ICMS/ISS normal; exigir NF com destaque de ICMS de todos os fornecedores; corrigir NCM/CEST de 100 % do catálogo |
| 12 meses (≈ R$ 3,0 M) | contratar/alinhar contador com experiência em regime normal; escolher ERP fiscal (SPED Fiscal); revisar preços com ICMS destacado |
| 6 meses (≈ R$ 3,3 M) | decidir: cruzar em ≤ 20 % (efeito em janeiro, previsível) × > 20 % (efeito no mês seguinte, caótico). **Nunca cruzar > 20 % sem querer** |
| 3 meses | inscrição estadual/municipal no regime normal preparada; cadastro de clientes com IE para B2B |
| Cruzamento | apuração normal de ICMS/ISS; DAS só federal (Faixa 6) |

**Trilho B — ficar abaixo sem perder lucro (para quem não quer/pode cruzar ainda):**

| Alavanca | Reduz RBT12 anual? | Reduz lucro? | Usar? |
| :-- | :--: | :--: | :--: |
| Representação/comissão para distribuição | sim | não | ✅ |
| Pareto de receita útil (margem < 14,3 %) | sim | ↑ | ✅ |
| Exclusões de receita bruta | sim | não | ✅ |
| Regime de caixa (desloca recebimentos de dezembro para janeiro) | desloca | não | ✅ (o sublimite olha o **ano-calendário**) |
| Data de entrega/prestação de grandes pedidos de dezembro em janeiro, com o cliente | desloca | não | ✅ documentado |
| Estrutura societária com substância | sim | não | ⚠️ contador/advogado |
| Frear vendas | sim | **sim** | ❌ — a R$ 3,6 M, frear R$ 300 k de receita para "economizar" 4,8 p.p. de ICMS destrói mais lucro do que o imposto |
| Omitir receita | — | — | ❌ recusa; e-Financeira/DIMP cruzam cartão e Pix |

```text
se RBT12_projetado ≤ 2.500.000               → OBSERVE
se 2.500.000 < projetado ≤ 3.240.000         → SUGGEST: iniciar Trilho A (créditos, NCM, contador)
se 3.240.000 < projetado ≤ 3.600.000         → ASK: Trilho A (cruzar em janeiro) × Trilho B (ficar)
se projetado_anual > 4.320.000 (> 20 %)      → ASK prioritário `regime.cliff`: efeito no mês seguinte — preparar apuração normal agora
se Anexo V e folha/RBT12 < 0,30              → ASK: Fator R; senão simular Presumido
todo outubro                                 → EXECUTE: comparativo Simples × Presumido × Real (3 cenários)
```

## 6. Playbook do agente

- **OBSERVE:** DAS, RBT12 com janela, RBT **anual** (para o sublimite), Fator R,
  share monofásico, `icms_normal` paralelo, saldo de créditos de ICMS potenciais,
  qualidade de NCM/CEST do catálogo.
- **SUGGEST:** card mensal com DAS cheio × segregado; painel "sublimite em X meses";
  comparativo ICMS no DAS × ICMS normal.
- **ASK:** segregação, Fator R, regime de caixa, Trilho A × B, estrutura societária
  (encaminha), saída do Simples (outubro).
- **EXECUTE:** PGDAS-D segregado; provisão; dossiê de transição do sublimite; pacote
  do contador; eventos `Accounting.tax.threshold.forecasted` (prioridade alta),
  `Accounting.tax.monophasic.optimized`, `Accounting.provisions.projected`.

## 7. Resumo do que foi definido para esta faixa

- **Faixa 5:** efetiva 9,45 % → 11,875 % (Anexo I); marginal 14,30 % (a mais alta do
  Simples para comércio). O teto é o **sublimite de R$ 3,6 M**: ICMS/ISS saem do DAS
  (janeiro se ≤ 20 %; mês seguinte se > 20 %).
- **Subida (8 cenários):** orgânico, acelerado (> 20 %), rede, atacado, e-commerce,
  M&A, sazonalidade (teto **anual**), Fator R.
- **Descida (7 cenários):** fechar loja, perder contrato, representação, cisão com
  substância, crise, receita útil, e **volta ao sublimite** (com risco de perder saldo
  credor de ICMS).
- **Regime:** comparação anual em outubro (Simples × Presumido × Real, 3 cenários);
  comércio de margem baixa com muito crédito pode sair; serviços Anexo III ficam.
- **Melhor economia:** monofásicos/ST (~R$ 5,6 k/mês em R$ 225 k), **tratar o ICMS
  normal como oportunidade** (débito − crédito calculado em paralelo desde R$ 2,5 M),
  Fator R, estrutura com substância, retenções, DIFAL, regime de caixa, exclusões.
- **Não atingir o teto:** dois trilhos — **A** (chegar preparado em 24 meses e cruzar
  em ≤ 20 % com efeito em janeiro) ou **B** (ficar abaixo só com alavancas que não
  reduzem lucro). Nunca cruzar > 20 % por acidente; nunca frear ou omitir.
