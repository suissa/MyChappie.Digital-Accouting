---
name: hyperaccounting-faixa-1-simples
description: >
  Use quando a empresa é ME no Simples Nacional com RBT12 até R$ 180.000 (Faixa 1).
  É a faixa da alíquota fixa (4 % Anexo I, 6 % Anexo III, 15,5 % Anexo V): aqui o
  imposto é proporcional à receita sem parcela a deduzir, o Fator R decide entre
  6 % e 15,5 % para serviços, e a segregação de monofásicos/ICMS-ST pode cortar até
  metade do DAS de um bar ou mercadinho. Cobre cenários de subida para a Faixa 2,
  descida para MEI, economia e folga.
version: 1.0.0
---

# Faixa 1 do Simples Nacional — RBT12 até R$ 180.000

## 1. Identificação

`regime == SIMPLES` e `rbt12Cents <= 180_000_00n` (índice 0 em `ANNEX_I` de
`src/index.ts`). Empresas recém-desenquadradas do MEI entram aqui.

## 2. Parâmetros da faixa

| Anexo | Nominal | Parcela a deduzir | Efetiva (piso → teto) | Composição relevante |
| :-- | --: | --: | :-- | :-- |
| I — Comércio | 4,00 % | R$ 0 | **4,00 % → 4,00 %** | ICMS 34 %, COFINS 12,74 %, PIS 2,76 %, CPP 41,5 % |
| II — Indústria | 4,50 % | R$ 0 | 4,50 % | + IPI 7,5 % |
| III — Serviços (Fator R ≥ 28 %) | 6,00 % | R$ 0 | 6,00 % | ISS 33,5 %, CPP 43,4 % |
| IV — Serviços (construção, vigilância…) | 4,50 % | R$ 0 | 4,50 % | sem CPP (INSS patronal por fora) |
| V — Serviços (Fator R < 28 %) | 15,50 % | R$ 0 | 15,50 % | ISS 14 %, CPP 28,85 %, IRPJ 25 % |

Particularidade: é a **única faixa sem parcela a deduzir** → a efetiva é constante
em toda a faixa. Não há "aproximação do teto" que aumente a alíquota; o teto só
importa porque a Faixa 2 tem marginal maior.

Marginal ao cruzar para a Faixa 2 (Anexo I): de 4,00 % para ≈ 7,30 % sobre a receita
que ultrapassa — mas a **efetiva média** só chega a 5,65 % em R$ 360.000.

## 3. Cenários de mudança de faixa

### 3.1 Subir (Faixa 1 → Faixa 2)

| # | Cenário | Sinal antecipado | Impacto | Ação prescrita |
| :-- | :-- | :-- | :-- | :-- |
| U1 | Crescimento orgânico | RBT12 projetado 90 d ≥ R$ 162.000 (90 %) | efetiva sobe suavemente (4,00 % → até 5,65 %) | nenhuma freada — informar e provisionar |
| U2 | Recém-saída do MEI com crescimento acelerado | 1º ano como ME, receita m/m > 15 % | sobe de faixa dentro do 1º ano; limite proporcional | usar `limite × meses/12`; alertar que o RBT12 é **anualizado** nos primeiros 12 meses (média × 12) |
| U3 | Sazonalidade forte | pico histórico projetado | RBT12 "infla" por 12 meses após o pico | avisar que o pico eleva a alíquota pelos 12 meses seguintes; provisionar |
| U4 | Novo canal / delivery / marketplace | canal novo > 20 % da receita | idem U1 | conferir se marketplace emite NF em nome da empresa (receita = valor cheio) |
| U5 | Inclusão de serviço em comércio (ex.: bar passa a cobrar entrega ou eventos) | novo CNAE / nova natureza de receita | receita de serviço vai para Anexo III/V — **não** para o Anexo I | segregar a receita por anexo no PGDAS-D (a faixa continua sendo pelo RBT12 total) |
| U6 | Fator R cai abaixo de 28 % (serviços) | folha12/RBT12 < 28 % | **penhasco**: Anexo III (6 %) → Anexo V (15,5 %) | ajustar pró-labore (ver §4.2) — impacto maior que qualquer troca de faixa |
| U7 | Vendas de itens de alto valor/baixa margem | Pareto por margem | RBT12 sobe sem lucro | modelo de comissão/consignação |
| U8 | Fusão de dois pequenos negócios no mesmo CNPJ | alteração societária | RBT12 soma | avaliar se a soma cruza R$ 360 k (Faixa 3 marginal 9,5 %) |

### 3.2 Descer (Faixa 1 → MEI)

Ver `faixa-0-mei` §3.2 (janeiro, 6 condições). Cenários típicos: perda de cliente
âncora, redução de horário, saída de sócio, fim de contrato de fornecimento. O
agente só recomenda com projeção ≤ R$ 70.000 e sem funcionários além de 1.

### 3.3 Descer "de anexo" (V → III) sem mudar de faixa

É a descida mais valiosa do Simples e acontece **dentro** da Faixa 1: elevar a folha
(pró-labore + encargos + FGTS) até `folha12 ≥ 0,28 × RBT12`. O Fator R é calculado
mês a mês com janela de 12 meses, então o efeito não é instantâneo — o agente
projeta o mês em que o cruzamento ocorre.

## 4. Melhor forma de economizar nesta faixa

Ordem de impacto (comércio/bar/mercearia primeiro, serviços depois):

1. **Segregação de monofásicos (PIS/COFINS) e ICMS-ST no PGDAS-D.** No Anexo I,
   PIS+COFINS = 15,5 % da alíquota e ICMS = 34 %. Um bar com 60 % da receita em
   cerveja, refrigerante, água (monofásicos + ST) paga, sobre essa parcela, apenas
   50,5 % da alíquota: efetiva cai de 4,00 % para **~2,02 %** nessa fatia — economia
   de ~30 % do DAS total. É o "Real-Time Monophasic Optimizer" do README §6.
   Requer NCM/CEST corretos vindos do HyperCommerce.
2. **Fator R (serviços).** Barbearia, salão, academia, escola, clínica de estética
   etc.: folha ≥ 28 % da receita → Anexo III (6 %) em vez de V (15,5 %). Com RBT12
   de R$ 150.000, pró-labore de R$ 3.500/mês + 20 % INSS já cruza o limiar; o custo
   previdenciário extra (~R$ 900/mês) é menor que a economia (~R$ 1.190/mês).
   O agente calcula o **pró-labore mínimo de equilíbrio** e mostra a economia líquida.
3. **Regime de caixa.** Fiado/crediário/cartão parcelado: reconhecer no recebimento
   adia o DAS e casa imposto com dinheiro no caixa. Opção em janeiro.
4. **Pró-labore mínimo + distribuição de lucros isenta.** Sócio retira 1 SM de
   pró-labore (11 % INSS) e o restante como lucro (isento de IRPF). Distribuição
   acima da presunção (8 %/32 %) exige escrituração contábil — o HyperAccounting
   já a produz (Diário/Razão vivos), então o lucro **integral** pode sair isento.
5. **Segregar receita por anexo** quando há comércio + serviço no mesmo CNPJ:
   cada receita na sua tabela; nunca lançar serviço no Anexo I "porque é menor" (é
   erro, gera autuação) nem comércio no III.
6. **Não confundir despesas com dedução.** No Simples, compras/despesas **não**
   reduzem o DAS. O único "gasto" que reduz imposto é folha (via Fator R). Alertar
   sempre que o usuário disser "vou comprar para pagar menos imposto".

## 5. Como não atingir o teto da faixa

Aqui o teto (R$ 180.000) **não é um penhasco** — cruzar custa marginal de 7,3 % em vez
de 4 % apenas sobre o excesso, e a efetiva média sobe devagar. Portanto a política é
**"não freie o crescimento; provisione"**:

| Alavanca | Quando usar |
| :-- | :-- |
| Provisão semanal do DAS já na nova efetiva projetada | sempre que RBT12 projetado > R$ 180 k |
| Monofásicos/ST (§4.1) — reduz o **imposto**, não a receita | sempre; compensa com folga a subida de faixa |
| Comissão/consignação para itens de baixa margem | se > 25 % da receita tem margem < 8 % |
| Regime de caixa | se > 20 % das vendas são a prazo |
| Deslocar a **data de entrega** de pedidos grandes (com o cliente) | só na virada do ano, se a empresa estiver no 1º ano com limite proporcional |

Alavanca que **não** deve ser usada nesta faixa: qualquer freio de vendas. Um real de
receita a mais na Faixa 2 deixa ~92,7 % de margem bruta (vs. 96 %); freiar para
economizar 3,3 pontos é destruir lucro.

## 6. Playbook do agente

- **OBSERVE:** calcula DAS com `calculateSimplesDas({annex, rbt12, monthlyRevenue})`;
  mantém `monophasicShare` e `factorR` por mês.
- **SUGGEST:** card mensal com "imposto sem otimização × com segregação"; alerta de
  Fator R 30 dias antes de cair abaixo de 28 %; aviso de aproximação da Faixa 2 em
  tom informativo ("sua alíquota vai de 4,00 % para 4,3 % — não é motivo para frear").
- **ASK:** aprovação da segregação monofásica e do ajuste de pró-labore; opção pelo
  regime de caixa em janeiro.
- **EXECUTE:** gera memória de cálculo do PGDAS-D segregado, emite
  `Accounting.tax.monophasic.optimized` e `Accounting.tax.threshold.forecasted`.

## 7. Resumo do que foi definido para esta faixa

- **Faixa 1 = alíquota constante** (4 % / 6 % / 15,5 %); o teto de R$ 180 k não é
  penhasco e **não deve frear vendas**.
- **Subida (8 cenários):** crescimento, 1º ano pós-MEI (limite proporcional),
  sazonalidade, canal novo, serviço em comércio, queda do Fator R, revenda de baixa
  margem, fusão. O único crítico é o **Fator R** (6 % → 15,5 %).
- **Descida:** para MEI só em janeiro (ver faixa 0); e a descida "de anexo" V → III via
  pró-labore, que vale mais do que qualquer faixa.
- **Melhor economia:** segregação de monofásicos/ICMS-ST (até ~30 % do DAS em
  bares), Fator R, regime de caixa, pró-labore mínimo + lucros isentos com a
  escrituração que o módulo já gera; nunca "comprar para abater".
- **Folga:** provisionar na alíquota futura; reduzir imposto (não receita); comissão
  para baixa margem.
