---
name: hyperaccounting-faixa-navigator
description: >
  Use SEMPRE que o HyperAccounting precisar decidir "em qual faixa de imposto esta
  empresa está" ou "para qual faixa ela vai". Recebe RBT12 (receita bruta dos últimos
  12 meses), receita do mês, anexo do Simples e folha 12 meses; identifica a faixa
  (MEI, Simples Faixas 1-6, ou fora do Simples) e roteia para a skill
  `hyperaccounting-faixa-<N>` correspondente. Também é o dono das regras comuns a
  todas as faixas (janela deslizante do RBT12, fórmula da alíquota efetiva, limites
  proporcionais no 1º ano, sublimite de ICMS/ISS, tolerância de 20%).
version: 1.0.0
---

# Navegador de Faixas Tributárias (MEI → Simples Nacional → Lucro Presumido/Real)

> Contexto: Brasil, LC 123/2006 (com LC 155/2016). Valores em **centavos inteiros
> (`BigInt`)**, como o restante do módulo (`src/index.ts`). Esta skill não calcula
> imposto — ela decide **qual skill de faixa** deve responder e entrega a ela os
> parâmetros normalizados.

## 1. Entrada mínima (o que o agente precisa saber)

| Campo | Origem no ecossistema | Obrigatório |
| :-- | :-- | :--: |
| `rbt12Cents` — receita bruta acumulada dos 12 meses anteriores ao mês de apuração | HyperSales (`sale.confirmed`) + HyperFinancial | sim |
| `monthlyRevenueCents` — receita bruta do mês corrente (PA) | HyperSales | sim |
| `regime` — `MEI` \| `SIMPLES` \| `PRESUMIDO` \| `REAL` | HyperCompany (`company_master`) | sim |
| `annex` — `I` (comércio) \| `II` (indústria) \| `III`/`IV`/`V` (serviços) | HyperCompany | se `SIMPLES` |
| `payroll12Cents` — folha (salários + pró-labore + encargos + FGTS) dos 12 meses | HyperCompany (folha) | se anexo `III`/`V` |
| `monthsActive` — meses desde o início da atividade (para limite proporcional) | HyperCompany | sim |
| `monophasicShareBps` — % da receita em produtos monofásicos / ICMS-ST | HyperCommerce (NCM/CEST) | não (default 0) |
| `revenueHistory[13+]` — receita mês a mês, para saber qual mês *sai* da janela | HyperSales | sim para previsão |

## 2. Tabela mestra de faixas (roteamento)

| Faixa | RBT12 (anual) | Skill | Regime |
| :-- | :-- | :-- | :-- |
| **0 — MEI** | até **R$ 81.000,00** (tolerância até R$ 97.200,00) | `faixa-0-mei` | SIMEI (DAS fixo) |
| **1** | até **R$ 180.000,00** | `faixa-1-simples` | Simples Nacional |
| **2** | R$ 180.000,01 – **R$ 360.000,00** | `faixa-2-simples` | Simples Nacional |
| **3** | R$ 360.000,01 – **R$ 720.000,00** | `faixa-3-simples` | Simples Nacional |
| **4** | R$ 720.000,01 – **R$ 1.800.000,00** | `faixa-4-simples` | Simples Nacional |
| **5** | R$ 1.800.000,01 – **R$ 3.600.000,00** | `faixa-5-simples` | Simples Nacional (teto do sublimite ICMS/ISS) |
| **6** | R$ 3.600.000,01 – **R$ 4.800.000,00** | `faixa-6-simples` | Simples só federal; ICMS/ISS por fora |
| **7 — Pós-Simples** | acima de **R$ 4.800.000,00** (ou impedimento) | `faixa-7-pos-simples` | Lucro Presumido / Lucro Real |

Algoritmo de roteamento:

```text
se regime == MEI                      → faixa-0-mei
senão se regime in (PRESUMIDO, REAL)  → faixa-7-pos-simples
senão (SIMPLES):
    limite = 4.800.000 × min(monthsActive, 12) / 12     # proporcional no 1º ano
    se rbt12 > limite                 → faixa-7-pos-simples (cenário de exclusão)
    senão índice = primeiro i tal que rbt12 <= maxRbt12[i]   # igual a calculateSimplesDas()
                                      → faixa-<índice+1>-simples
```

## 3. Regras comuns a todas as faixas (não repita, referencie)

### 3.1 O RBT12 é uma **janela deslizante**, não um saldo
`RBT12(mês+1) = RBT12(mês) + receita(mês) − receita(mês − 12)`.
Consequência prática: **a faixa só desce se o mês que entra for menor que o mês que sai.**
Toda previsão de "subir/descer de faixa" deve olhar os dois lados da janela.

### 3.2 A alíquota efetiva do Simples é contínua entre faixas
```text
alíquota efetiva = (RBT12 × alíquota nominal − parcela a deduzir) / RBT12
DAS do mês       = receita do mês × alíquota efetiva
```
No limite superior da Faixa N e no limite inferior da Faixa N+1 a efetiva é **a mesma**
(ex.: Anexo I, R$ 360.000: 5,65% nos dois lados). Dentro do Simples **não existe
"salto" retroativo** ao trocar de faixa; o que muda é a **alíquota marginal**
(≈ alíquota nominal da faixa). Os únicos "penhascos" reais são:

| Penhasco | Onde | Por quê |
| :-- | :-- | :-- |
| MEI → ME | R$ 81.000 (+20 %) | sai de DAS fixo (~R$ 80/mês) para % da receita + contabilidade + INSS patronal |
| Sublimite ICMS/ISS | R$ 3.600.000 | ICMS/ISS saem do DAS e passam ao regime normal |
| Exclusão do Simples | R$ 4.800.000 (+20 %) | migra para Presumido/Real, com obrigações acessórias muito maiores |
| Fator R (Anexo V ↔ III) | folha/RBT12 = 28 % | efetiva pode cair de 15,5 % para 6,0 % de um mês para outro |

### 3.3 Tolerância de 20 % e efeitos temporais
| Situação | Excesso ≤ 20 % | Excesso > 20 % |
| :-- | :-- | :-- |
| MEI passa de R$ 81.000 | vira ME em 1º/jan seguinte; excesso tributado pelo Simples no DAS de janeiro | desenquadramento **retroativo** a 1º/jan (ou ao início da atividade); recolhe como ME o ano todo, com multa e juros |
| Simples passa de R$ 4.800.000 | exclusão a partir de 1º/jan seguinte | exclusão a partir do **mês seguinte** ao excesso (1º ano: retroativa ao início) |
| Simples passa do sublimite R$ 3.600.000 | ICMS/ISS fora do Simples a partir de 1º/jan seguinte | ICMS/ISS fora a partir do mês seguinte |

### 3.4 Limite proporcional no ano de abertura
`limite_ano = limite_anual × meses_de_atividade / 12` (fração de mês conta como mês inteiro).
MEI: R$ 6.750/mês. Simples: R$ 400.000/mês. O agente **deve** usar o limite proporcional
para empresas com `monthsActive < 12`.

### 3.5 O que NÃO entra na receita bruta (reduz o RBT12 legalmente)
- Vendas canceladas e devoluções.
- Descontos incondicionais concedidos na nota.
- Receita de **comissão** (venda por conta e ordem, consignação, recarga de celular,
  correspondente bancário, bilhetes): a receita bruta é a comissão, não o valor
  transacionado — desde que a operação seja formalizada assim.
- Ganhos de capital, juros, rendimentos de aplicação (não compõem RBT12; são
  tributados à parte).

### 3.6 Regime de caixa (opção anual no PGDAS-D)
Permite reconhecer a receita **no recebimento** em vez da emissão. Útil para fiado,
crediário, cartão parcelado. Uma vez optado, vale o ano inteiro e a empresa deve
manter o Registro de Valores a Receber.

## 4. Sinais antecipados que o navegador emite (para todas as faixas)

| Sinal | Regra | Evento |
| :-- | :-- | :-- |
| `bracket.approach` | RBT12 projetado em 90 dias ≥ 90 % do teto da faixa | `Accounting.tax.threshold.forecasted` |
| `bracket.cross.up` | probabilidade > 80 % de cruzar o teto em ≤ 90 dias | `Accounting.tax.threshold.forecasted` |
| `bracket.cross.down` | mês que sai da janela > mês que entra por 3 meses seguidos e RBT12 projetado < piso da faixa | `Accounting.tax.threshold.forecasted` |
| `regime.cliff` | teto de MEI / sublimite / teto do Simples em ≤ 180 dias | `Accounting.tax.threshold.forecasted` + alerta prioritário |
| `factor-r.flip` | folha12/RBT12 cruzando 28 % (para cima ou para baixo) | `Accounting.tax.monophasic.optimized` (reaproveita canal de otimização) |

## 5. Resumo do que foi definido

- **8 faixas nomeadas** (MEI + 6 do Simples + Pós-Simples), cada uma com skill própria.
- Roteamento **determinístico** pelo mesmo `findIndex` de `calculateSimplesDas()`.
- Regras compartilhadas centralizadas aqui: janela deslizante, fórmula contínua,
  tolerância de 20 %, limite proporcional, exclusões de receita bruta, regime de caixa.
- A verdade que orienta todas as skills de faixa: **subir de faixa dentro do Simples
  não é um desastre; cruzar MEI→ME, R$ 3,6 M e R$ 4,8 M é.** Portanto a folga de
  segurança é proporcional ao penhasco, não ao número da faixa.

## Parâmetros a revalidar anualmente
Teto MEI (R$ 81.000 — há PLP tramitando para elevar), salário mínimo (base do DAS-MEI),
tabelas dos Anexos (LC 155/2016), sublimite estadual (alguns estados adotam R$ 1,8 M),
cronograma da Reforma Tributária (CBS 2027, IBS 2029-2033).
