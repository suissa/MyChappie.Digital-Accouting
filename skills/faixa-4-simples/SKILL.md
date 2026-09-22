---
name: hyperaccounting-faixa-4-simples
description: >
  Use quando a empresa está no Simples Nacional com RBT12 entre R$ 720.000,01 e
  R$ 1.800.000 (Faixa 4) — a faixa mais larga e onde a maioria das PMEs de comércio
  se estabiliza. Anexo I 7,58 % → 9,45 %; Anexo III 11,05 % → 14,02 %; Anexo V
  18,13 % → 19,55 %. Cobre subida para a Faixa 5 (onde o sublimite de ICMS/ISS
  aparece no horizonte), descida para a Faixa 3, o momento em que o Lucro Presumido
  vira alternativa para serviços, e as alavancas de economia.
version: 1.0.0
---

# Faixa 4 do Simples Nacional — RBT12 de R$ 720.000,01 a R$ 1.800.000

## 1. Identificação

`regime == SIMPLES` e `720_000_00n < rbt12Cents <= 1_800_000_00n` (índice 3 em `ANNEX_I`).

## 2. Parâmetros da faixa

| Anexo | Nominal | Parcela a deduzir | Efetiva piso (R$ 720 k) | Efetiva teto (R$ 1,8 M) |
| :-- | --: | --: | --: | --: |
| I — Comércio | 10,70 % | R$ 22.500,00 | 7,575 % | **9,45 %** |
| II — Indústria | 11,20 % | R$ 22.500,00 | 8,075 % | 9,95 % |
| III — Serviços (Fator R ≥ 28 %) | 16,00 % | R$ 35.640,00 | 11,05 % | 14,02 % |
| IV — Serviços | 14,00 % | R$ 39.780,00 | 8,475 % | 11,79 % |
| V — Serviços (Fator R < 28 %) | 20,50 % | R$ 17.100,00 | 18,125 % | 19,55 % |

Exemplo (Anexo I, RBT12 = R$ 1.200.000, mês R$ 100.000):
`efetiva = (1.200.000 × 10,7 % − 22.500) / 1.200.000 = 105.900 / 1.200.000 = 8,825 %` → DAS R$ 8.825,00.

Marginal (Anexo I) ≈ 10,70 %. A faixa tem R$ 1,08 M de largura — a empresa passa
anos aqui. O trabalho do agente muda de "avisar de faixa" para **otimizar o
mix e preparar o sublimite de R$ 3,6 M** com antecedência.

## 3. Cenários de mudança de faixa

### 3.1 Subir (Faixa 4 → Faixa 5)

| # | Cenário | Sinal antecipado | Impacto | Ação prescrita |
| :-- | :-- | :-- | :-- | :-- |
| U1 | Crescimento orgânico | RBT12 projetado 90 d ≥ R$ 1.620.000 | marginal 10,70 % → 14,30 %; efetiva 9,45 % no cruzamento | provisionar; iniciar plano do sublimite (R$ 3,6 M) com 2+ anos de antecedência |
| U2 | Rede de lojas (3+ pontos) no mesmo CNPJ | filiais | consolidado pula para 5/6 rápido | estudo societário com contador: holding × filiais × franquia |
| U3 | Atacado/distribuição (margem 5–12 %) | mix | receita útil negativa em parte do mix | precificar com marginal 14,3 % ou converter em comissão/representação |
| U4 | E-commerce/marketplace nacional | canal | receita cheia + DIFAL de saída para consumidor final em outro estado | avaliar; DIFAL de saída no Simples é recolhido por fora (ver §4.5) |
| U5 | Aquisição de concorrente | M&A | RBT12 soma no mesmo CNPJ | modelar antes: manter CNPJ separado com sócios/marca própria pode ser legítimo |
| U6 | Fator R cai < 28 % (serviços) | folha estagnada | III (≈ 13 %) → V (≈ 19 %) | pró-labore/contratação (§4.2) |
| U7 | Sazonalidade/evento | previsão | pico infla 12 meses | provisão |
| U8 | Incorporação de receita de terceiros (venda "por conta" sem contrato de comissão) | classificação de receita | receita cheia infla RBT12 | formalizar comissão |

### 3.2 Descer (Faixa 4 → Faixa 3)

| # | Cenário | Sinal | Impacto | Ação |
| :-- | :-- | :-- | :-- | :-- |
| D1 | Fechamento de loja/canal | filial baixada | RBT12 cai em 12 meses | prever data; provisão |
| D2 | Perda de contrato B2B/governo/atacado | contrato | idem | idem |
| D3 | Conversão de distribuição em representação comercial (comissão) | contrato | receita bruta cai muito; lucro igual | ✅ recomendado quando margem < 10 % |
| D4 | Cisão com propósito (ex.: separar indústria de comércio, cada uma no seu anexo) | reorganização | cada CNPJ desce de faixa | contador; precisa de substância econômica |
| D5 | Crise setorial/macro | queda > 20 % por 3 meses | idem D1 | idem |
| D6 | Corte deliberado de linhas de receita útil negativa | Pareto | receita ↓, lucro ↑ | ✅ |

### 3.3 Mudança de regime — Simples × Lucro Presumido

| Perfil | Simples (efetiva ~R$ 1,2 M) | Lucro Presumido | Vencedor típico |
| :-- | :-- | :-- | :-- |
| Comércio (Anexo I) | 8,8 % com ICMS dentro; monofásico/ST abate | 5,93 % federal + ICMS regime normal (débito − crédito) + INSS patronal 20 %+ por fora | **Simples**, exceto comércio com margem alta, folha mínima e muito crédito de ICMS |
| Serviços Anexo III | ~13 % com CPP dentro | 13,3–16,3 % + INSS patronal por fora | **Simples** |
| Serviços Anexo V | ~19 % com CPP dentro | 13,3–16,3 % + INSS patronal por fora | **Presumido** se folha < 15 % da receita; senão corrigir Fator R |
| Indústria | ~9,5 % com IPI dentro | 5,93 % + IPI + ICMS + INSS | Simples salvo alto crédito |

Regra do agente: só recomenda sair do Simples quando a economia líquida anual
projetada > R$ 30.000 **e** persiste em 3 cenários (base, −20 %, +20 % de receita),
descontando custo contábil extra (~R$ 1.000–2.000/mês) e obrigações acessórias (SPED,
EFD-Contribuições, DCTF). A saída só vale a partir de 1º/jan.

## 4. Melhor forma de economizar nesta faixa

1. **Segregação de monofásicos/ICMS-ST** — em R$ 100 k/mês com 50 % monofásico+ST,
   efetiva 8,825 % → fatia paga ~4,46 %: economia ≈ R$ 2.180/mês. Em 12 meses,
   paga o módulo inteiro.
2. **Fator R** para serviços (folha 28 % de R$ 1,2 M = R$ 336 k/ano). Empresas de
   serviço nesta faixa normalmente já têm folha; o gap é fechado com pró-labore dos
   sócios. Economia III × V ≈ 6 p.p. da receita = R$ 72 k/ano.
3. **Estudo societário legítimo** para redes: filial × sociedade com sócios
   distintos × franquia. O agente não decide; prepara a simulação de RBT12 por
   estrutura e encaminha ao contador (⚠️ grupo econômico de fato é autuação).
4. **Compensação de retenções** (ISS, INSS 11 %, IRRF/CSRR sobre serviços a PJ).
5. **DIFAL de entrada (compras) e de saída (e-commerce)**: no Simples ambos são por
   fora e sem crédito; embutir no preço/cotação.
6. **Regime de caixa** para crediário/cartão parcelado.
7. **Pró-labore mínimo + lucro isento com escrituração completa** — nesta faixa a
   escrituração é praticamente obrigatória (bancos exigem balanço).
8. **Gorjeta, vale, reembolso fora da receita bruta.**
9. **Receitas financeiras fora do PGDAS** (rendimento de aplicação não é receita
   bruta; é tributado na fonte).
10. **Antecipar o sublimite:** a partir de R$ 1,5 M, começar a organizar créditos de
    ICMS (notas de compra com destaque) — quando passar de R$ 3,6 M, o ICMS sai do
    DAS e a empresa passa a apurar débito − crédito; quem chega sem histórico paga
    mais.

## 5. Como não atingir o teto da faixa

Política: **teto (R$ 1,8 M) não é penhasco; o que está a 2 faixas (R$ 3,6 M) é.**
Foco em receita útil e estrutura, não em freio.

| Alavanca | Reduz RBT12? | Reduz lucro? | Usar? |
| :-- | :--: | :--: | :--: |
| Segregação monofásica/ST | não (reduz DAS) | não | ✅ |
| Pareto de receita útil (margem < 14,3 %) | sim | ↑ | ✅ |
| Representação/comissão para distribuição | sim | não | ✅ |
| Gorjeta/vale/reembolso/receita financeira fora | sim | não | ✅ |
| Regime de caixa | desloca | não | ✅ |
| Descontos incondicionais na nota | sim | pequeno | ✅ |
| Estrutura societária (holding/filial/sociedade distinta) | sim | não | ⚠️ só com propósito, contador, substância (sócios, capital, gestão e caixa próprios) |
| Frear vendas | sim | **sim** | ❌ |
| Omitir receita | — | — | ❌ recusa + alerta (DIMP/e-Financeira cruzam cartão/Pix com NF) |

```text
se RBT12_projetado ≤ 1.620.000 (90 %)  → OBSERVE
se 1.620.000 < projetado ≤ 1.800.000   → SUGGEST: provisão na Faixa 5; Pareto; iniciar dossiê do sublimite
se projetado > 1.800.000               → SUGGEST + ASK: plano de 24 meses para o sublimite R$ 3,6 M
se Anexo V e folha/RBT12 < 0,30        → ASK: Fator R; se inviável, simular Presumido (3 cenários)
```

## 6. Playbook do agente

- **OBSERVE:** DAS, RBT12 com janela, Fator R, share monofásico, retenções, DIFAL,
  créditos de ICMS potenciais (para o futuro sublimite).
- **SUGGEST:** card mensal DAS cheio × segregado; ranking de receita útil; previsão
  de faixa; comparativo anual Simples × Presumido (só informativo até o gatilho do §3.3).
- **ASK:** segregação, pró-labore, regime de caixa, corte/conversão de linhas,
  saída do Simples (com 3 cenários), estudo societário (encaminha ao contador).
- **EXECUTE:** PGDAS-D segregado; provisão semanal; pacote do contador com
  balancete (bancos); eventos `Accounting.tax.monophasic.optimized`,
  `Accounting.tax.threshold.forecasted`, `Accounting.provisions.projected`.

## 7. Resumo do que foi definido para esta faixa

- **Faixa 4:** a mais larga (R$ 720 k → R$ 1,8 M); efetiva 7,575 % → 9,45 % (Anexo I);
  marginal 10,70 %. A empresa passa anos aqui; o agente muda o foco para **mix e
  preparação do sublimite**.
- **Subida (8 cenários):** orgânico, rede de lojas, atacado, e-commerce nacional
  (DIFAL de saída), aquisição, queda do Fator R, sazonalidade, receita de terceiros
  sem contrato de comissão.
- **Descida (6 cenários):** fechar loja, perder contrato, virar representação,
  cisão com substância, crise, corte de receita útil negativa.
- **Regime:** Simples vence para comércio e Anexo III; Anexo V com folha < 15 %
  pode migrar para Presumido — só com economia > R$ 30 k/ano em 3 cenários e a
  partir de janeiro.
- **Melhor economia:** monofásicos/ST (~R$ 2 k/mês em R$ 100 k), Fator R (~6 p.p.),
  estudo societário legítimo para redes, retenções, DIFAL, regime de caixa, lucro
  isento, receitas financeiras fora, **começar a acumular créditos de ICMS** para o
  sublimite.
- **Folga:** receita útil, comissão, exclusões de receita bruta; estrutura só com
  substância; nunca frear ou omitir.
