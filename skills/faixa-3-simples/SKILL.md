---
name: hyperaccounting-faixa-3-simples
description: >
  Use quando a empresa está no Simples Nacional com RBT12 entre R$ 360.000,01 e
  R$ 720.000 (Faixa 3). Anexo I vai de 5,65 % a 7,58 % efetivos; Anexo III de 8,60 %
  a 11,05 %; Anexo V de 16,75 % a 18,13 %. É a faixa em que o Anexo V começa a
  perder para o Lucro Presumido e em que multi-loja, folha e DIFAL passam a pesar.
  Cobre subida para a Faixa 4, descida para a Faixa 2, comparação de regime para
  serviços e as alavancas de economia.
version: 1.0.0
---

# Faixa 3 do Simples Nacional — RBT12 de R$ 360.000,01 a R$ 720.000

## 1. Identificação

`regime == SIMPLES` e `360_000_00n < rbt12Cents <= 720_000_00n` (índice 2 em `ANNEX_I`).

## 2. Parâmetros da faixa

| Anexo | Nominal | Parcela a deduzir | Efetiva piso (R$ 360 k) | Efetiva teto (R$ 720 k) |
| :-- | --: | --: | --: | --: |
| I — Comércio | 9,50 % | R$ 13.860,00 | 5,65 % | **7,575 %** |
| II — Indústria | 10,00 % | R$ 13.860,00 | 6,15 % | 8,075 % |
| III — Serviços (Fator R ≥ 28 %) | 13,50 % | R$ 17.640,00 | 8,60 % | 11,05 % |
| IV — Serviços | 10,20 % | R$ 12.420,00 | 6,75 % | 8,475 % |
| V — Serviços (Fator R < 28 %) | 19,50 % | R$ 9.900,00 | 16,75 % | 18,125 % |

Exemplo (Anexo I, RBT12 = R$ 540.000, mês R$ 48.000):
`efetiva = (540.000 × 9,5 % − 13.860) / 540.000 = 37.440 / 540.000 = 6,93 %` → DAS R$ 3.328,00.

Marginal (Anexo I) ≈ 9,50 %. Ainda deixa 90,5 % — crescer continua valendo, mas a
partir daqui o DAS mensal vira o **maior custo fixo depois de folha e aluguel**, e
provisionar deixa de ser opcional.

## 3. Cenários de mudança de faixa

### 3.1 Subir (Faixa 3 → Faixa 4)

| # | Cenário | Sinal antecipado | Impacto | Ação prescrita |
| :-- | :-- | :-- | :-- | :-- |
| U1 | Crescimento orgânico | RBT12 projetado 90 d ≥ R$ 648.000 | marginal 9,50 % → 10,70 %; efetiva 7,575 % no cruzamento | provisionar; sem freio |
| U2 | 2ª/3ª loja no mesmo CNPJ | filial | RBT12 consolidado pode pular para a Faixa 4/5 | simular consolidado; comparar filial × sociedade nova com propósito real |
| U3 | Atacarejo / venda B2B com margem baixa e volume alto | mix de vendas com margem < 10 % > 30 % da receita | infla RBT12 e empurra para a Faixa 4 sem lucro proporcional | precificar B2B com o **marginal de 10,7 %** embutido ou converter em comissão |
| U4 | Sazonalidade/evento | previsão de demanda | pico infla 12 meses | provisão |
| U5 | Fator R cai < 28 % (serviços) | receita cresce, folha não | III (≈ 10 %) → V (≈ 17,5 %) | ajustar pró-labore/contratações (§4.2) |
| U6 | Contrato público/licitação | novo cliente governo | receita cresce em degrau; retenções na fonte (INSS 11 %, ISS) | compensar retenções no PGDAS-D; provisão |
| U7 | Reajuste de preço | ticket ↑ | RBT12 ↑ com margem ↑ | provisão |
| U8 | Receita de franquia/royalties/licenciamento | nova natureza de receita | Anexo diferente (III/V) | segregar |

### 3.2 Descer (Faixa 3 → Faixa 2)

| # | Cenário | Sinal | Impacto | Ação |
| :-- | :-- | :-- | :-- | :-- |
| D1 | Fechamento de ponto/loja | filial baixada | RBT12 cai ao longo de 12 meses | prever data da nova faixa; ajustar provisão |
| D2 | Perda de cliente B2B/governo | contrato encerrado | idem | idem |
| D3 | Conversão de atacarejo em comissão/consignação | contrato | RBT12 ↓ sem perda de lucro | ✅ recomendado |
| D4 | Fim de pico do ano anterior | mês que sai > mês que entra | RBT12 cai "sozinho" | comunicar a data |
| D5 | Cisão em duas empresas com propósito real (ex.: comércio × serviço de eventos com sócios diferentes) | reorganização societária | cada CNPJ cai de faixa | só com contador; precisa de substância |
| D6 | Redução deliberada de mix (encerrar cigarro/recarga/gás) | Pareto | receita ↓, lucro ↑ | ✅ |

### 3.3 Mudança de regime — Anexo V × Lucro Presumido (serviços)

| Regime | Carga aproximada (serviços, RBT12 ~R$ 600 k) |
| :-- | :-- |
| Simples Anexo V | ~17,8 % (inclui CPP) |
| Simples Anexo III (Fator R ≥ 28 %) | ~10,5 % (inclui CPP) |
| Lucro Presumido | IRPJ 4,8 % + CSLL 2,88 % + PIS/COFINS 3,65 % + ISS 2–5 % = **13,3–16,3 %** + INSS patronal 20 % + terceiros sobre a folha **por fora** |

Regra: o Presumido só vence o Anexo V quando a folha é pequena (< 15 % da receita)
**e** o ISS municipal é baixo. Antes de sair do Simples, o agente sempre testa
"e se o Fator R fosse corrigido?" — o Anexo III ganha dos dois. Sair do Simples
também perde: dispensa de obrigações acessórias, CPP dentro do DAS, e
simplicidade de retorno (só em janeiro).

## 4. Melhor forma de economizar nesta faixa

1. **Segregação de monofásicos/ICMS-ST.** Com efetiva 6,93 %, a fatia
   monofásica+ST paga ~3,50 %. Em R$ 48.000/mês com 55 % nessa condição: economia
   ≈ R$ 905/mês (~27 % do DAS). Obrigatório estar ativo.
2. **Fator R** (serviços). Nesta faixa, pró-labore precisa ser maior (folha 28 % de
   R$ 600 k = R$ 168 k/ano). Se a empresa já tem funcionários, o gap costuma ser
   pequeno; o agente calcula o pró-labore de equilíbrio e a data do cruzamento.
3. **Compensação de retenções na fonte** (ISS retido, INSS 11 % em cessão de
   mão de obra, IR sobre serviços a PJ): nunca deixar crédito parado; abater no
   PGDAS-D do mês.
4. **DIFAL na cotação** (HyperSupplier): compra interestadual de R$ 10.000 com
   ICMS 12 % em estado de destino a 18 % paga R$ 600 de DIFAL sem crédito — o
   preço "mais barato" pode ser mais caro. Cotar sempre pós-DIFAL.
5. **Regime de caixa** para vendas a prazo/parceladas.
6. **Pró-labore mínimo + lucro isento com escrituração completa** (a escrituração
   também é exigida para crédito bancário nesta faixa — dois ganhos).
7. **Descontos incondicionais na nota** em vez de brinde/desconto por fora.
8. **Não pagar Simples sobre receita que não é da empresa:** vale-transporte,
   gorjeta repassada (10 % de serviço em bar/restaurante **não** é receita se
   repassada integralmente aos funcionários — Lei 13.419/2017), reembolso de
   despesas de cliente.

## 5. Como não atingir o teto da faixa

Política: **teto (R$ 720 k) não é penhasco.** Mas a partir daqui o agente introduz
o conceito de **receita útil**: `receita_útil = receita − CMV − DAS_marginal`. Uma linha
de produto com margem bruta < 10,7 % (marginal da Faixa 4) tem receita útil
negativa — só serve para subir de faixa.

| Alavanca | Reduz RBT12? | Reduz lucro? | Usar? |
| :-- | :--: | :--: | :--: |
| Segregação monofásica/ST | não (reduz DAS) | não | ✅ |
| Cortar/convertar linhas com margem < marginal da próxima faixa | sim | ↑ lucro | ✅ (Pareto automático) |
| Comissão/consignação | sim | não | ✅ |
| Gorjeta/vale/reembolso fora da receita | sim | não | ✅ |
| Regime de caixa | desloca | não | ✅ |
| Descontos na nota | sim | pequeno | ✅ se já dá desconto |
| Cisão/2ª empresa | sim | não | ⚠️ só com propósito negocial e sócios/atividades distintos; contador obrigatório |
| Frear vendas | sim | **sim** | ❌ |
| Omitir receita | — | — | ❌ recusa + alerta de malha (adquirentes reportam) |

```text
se RBT12_projetado ≤ 648.000 (90 %)  → OBSERVE
se 648.000 < projetado ≤ 720.000     → SUGGEST: provisão na efetiva da Faixa 4; Pareto de receita útil
se projetado > 720.000               → SUGGEST informativo + ASK se houver linhas de receita útil negativa
se Anexo V e folha/RBT12 < 0,30      → ASK: plano de Fator R (antes de qualquer comparação de regime)
```

## 6. Playbook do agente

- **OBSERVE:** DAS, RBT12 com janela, Fator R, share monofásico, retenções a
  compensar, DIFAL por compra.
- **SUGGEST:** card mensal com DAS cheio × segregado; ranking de "receita útil" por
  linha; previsão de troca de faixa (subida/descida) com data.
- **ASK:** segregação, pró-labore, regime de caixa, corte/conversão de linhas,
  comparação Anexo V × Presumido (só depois de esgotar o Fator R).
- **EXECUTE:** PGDAS-D segregado com retenções compensadas; provisão semanal;
  eventos `Accounting.tax.monophasic.optimized`, `Accounting.tax.threshold.forecasted`.

## 7. Resumo do que foi definido para esta faixa

- **Faixa 3:** efetiva 5,65 % → 7,575 % (Anexo I); marginal 9,50 %. DAS vira custo
  fixo relevante — provisão obrigatória.
- **Subida (8 cenários):** orgânico, multi-loja, atacarejo de baixa margem,
  sazonalidade, queda do Fator R, contrato público, reajuste, royalties. Novo
  conceito: **receita útil** (linha com margem < 10,7 % só sobe faixa).
- **Descida (6 cenários):** fechar loja, perder cliente, converter em comissão, fim
  de pico, cisão com substância, corte de mix.
- **Regime:** única comparação relevante é Anexo V × Presumido, e a resposta padrão é
  "corrija o Fator R" (Anexo III vence os dois).
- **Melhor economia:** monofásicos/ST (~27 % do DAS), Fator R, compensar retenções,
  DIFAL na cotação, regime de caixa, lucro isento com escrituração, gorjeta/vale
  fora da receita.
- **Folga:** Pareto de receita útil, comissão, gorjetas fora, regime de caixa; cisão
  só com propósito real; nunca frear ou omitir.
