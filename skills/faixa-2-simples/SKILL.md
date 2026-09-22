---
name: hyperaccounting-faixa-2-simples
description: >
  Use quando a empresa está no Simples Nacional com RBT12 entre R$ 180.000,01 e
  R$ 360.000 (Faixa 2). Primeira faixa com parcela a deduzir: a alíquota efetiva
  sobe continuamente (Anexo I 4,00 % → 5,65 %). É a faixa típica de bares, mercearias,
  lanchonetes e salões consolidados. Cobre subida para a Faixa 3, descida para a
  Faixa 1, o cálculo do custo marginal de crescer, e as alavancas de economia.
version: 1.0.0
---

# Faixa 2 do Simples Nacional — RBT12 de R$ 180.000,01 a R$ 360.000

## 1. Identificação

`regime == SIMPLES` e `180_000_00n < rbt12Cents <= 360_000_00n` (índice 1 em `ANNEX_I`).

## 2. Parâmetros da faixa

| Anexo | Nominal | Parcela a deduzir | Efetiva piso (R$ 180 k) | Efetiva teto (R$ 360 k) |
| :-- | --: | --: | --: | --: |
| I — Comércio | 7,30 % | R$ 5.940,00 | 4,00 % | **5,65 %** |
| II — Indústria | 7,80 % | R$ 5.940,00 | 4,50 % | 6,15 % |
| III — Serviços (Fator R ≥ 28 %) | 11,20 % | R$ 9.360,00 | 6,00 % | 8,60 % |
| IV — Serviços | 9,00 % | R$ 8.100,00 | 4,50 % | 6,75 % |
| V — Serviços (Fator R < 28 %) | 18,00 % | R$ 4.500,00 | 15,50 % | 16,75 % |

Exemplo (Anexo I, RBT12 = R$ 270.000, receita do mês R$ 24.000):
`efetiva = (270.000 × 7,30 % − 5.940) / 270.000 = 13.770 / 270.000 = 5,10 %` → DAS R$ 1.224,00.

**Custo marginal de crescer** nesta faixa (Anexo I): cada R$ 1.000 a mais de RBT12
eleva a efetiva em ~0,0061 p.p., e a receita nova paga ≈ 7,30 %. Ainda deixa 92,7 %
de receita líquida de DAS — crescer continua valendo a pena.

## 3. Cenários de mudança de faixa

### 3.1 Subir (Faixa 2 → Faixa 3)

| # | Cenário | Sinal antecipado | Impacto | Ação prescrita |
| :-- | :-- | :-- | :-- | :-- |
| U1 | Crescimento orgânico | RBT12 projetado 90 d ≥ R$ 324.000 | marginal 7,30 % → 9,50 % (Anexo I); efetiva continua em 5,65 % no cruzamento | informar; provisionar; **sem freio** |
| U2 | Abertura de 2º ponto/quiosque no mesmo CNPJ | evento HyperCompany (filial) | RBT12 soma os dois pontos; pode pular direto para a Faixa 3/4 | simular RBT12 consolidado antes de abrir; comparar com filial × nova empresa (⚠️ ver §5) |
| U3 | Contrato B2B novo (fornecer para restaurante/evento) | pedido recorrente > 15 % da receita | idem U1, mais rápido | conferir se é venda (Anexo I) ou serviço (III/V) |
| U4 | Sazonalidade + evento local (festa, feriado prolongado) | previsão de demanda do HyperStock/`Demand Prediction` | pico infla RBT12 por 12 meses | provisionar DAS maior pelos 12 meses seguintes |
| U5 | Reajuste de preço acima da inflação | ticket médio ↑, volume estável | RBT12 ↑ sem custo ↑ — melhor cenário de subida | nenhuma ação além de provisão |
| U6 | Fator R cai < 28 % (serviços) | folha12/RBT12 em tendência de queda porque a receita cresce mais que a folha | Anexo III (≈ 7 %) → V (≈ 16 %): **+9 p.p.** | reajustar pró-labore/contratar antes do cruzamento — é o cenário mais caro desta faixa |
| U7 | Absorver receita de outro CNPJ (baixa de MEI do cônjuge) | alteração cadastral | RBT12 salta | simular antes |
| U8 | Receita de aluguel de espaço/equipamento no CNPJ | classificação "outras receitas" | conta como receita bruta se for atividade; cuidado com Anexo | classificar corretamente |

### 3.2 Descer (Faixa 2 → Faixa 1)

Só acontece quando o mês que entra na janela é menor que o que sai (`faixa-navigator` §3.1).

| # | Cenário | Sinal | Impacto | Ação |
| :-- | :-- | :-- | :-- | :-- |
| D1 | Perda de canal/cliente âncora | queda > 25 % em 2 meses seguidos | efetiva cai gradualmente ao longo de 12 meses (não de imediato) | ajustar provisão; **não** contar com a queda de alíquota já no mês seguinte |
| D2 | Fim de uma sazonalidade excepcional do ano anterior | mês de saída da janela era pico | RBT12 cai "sozinho" | prever a data em que a faixa desce e comunicar |
| D3 | Redução voluntária (fechar linha de produto de baixa margem, encerrar delivery) | decisão do gestor | RBT12 ↓, margem ↑ | simular: em geral **lucro sobe** apesar de receita cair |
| D4 | Conversão de revenda em comissão | contrato com fornecedor | receita bruta cai sem perda de lucro | recomendado quando margem < 8 % |
| D5 | Separação de sociedade (cada sócio leva parte) | alteração societária | os dois CNPJs voltam à Faixa 1 ou MEI | orientação do contador |

O agente só chama de "descida" a queda **estrutural** (3 meses seguidos); queda de 1
mês é ruído.

### 3.3 Mudança de regime

Não há cenário de regime nesta faixa: o Simples é sempre mais barato que Lucro
Presumido para comércio (Presumido ≈ 5,93 % federal + ICMS estadual cheio) e para
serviços no Anexo III. Só o **Anexo V** merece comparação (16 % vs. Presumido
serviços 11,33 % + ISS 2–5 % = 13,3–16,3 %) — e a resposta certa é quase sempre
"conserte o Fator R", não "saia do Simples".

## 4. Melhor forma de economizar nesta faixa

1. **Segregação de monofásicos e ICMS-ST** (README §6). Com efetiva de 5,10 %, a
   fatia monofásica+ST paga ~2,58 % (50,5 % da alíquota). Bar com 60 % da receita
   nessa condição: DAS cai ~30 %. **Maior alavanca em reais** para comércio.
2. **Fator R** para serviços: `pró-labore mínimo = (0,28 × RBT12 − folha_atual_12m) / 12 / 1,20`
   (o 1,20 aproxima INSS patronal 20 % sobre pró-labore que **também** conta como folha).
   O agente mostra "custo previdenciário extra × economia de DAS" e só recomenda
   quando a economia líquida for positiva (quase sempre, nesta faixa).
3. **Regime de caixa** se vendas a prazo/cartão parcelado > 20 %.
4. **Pró-labore mínimo + lucro isento com escrituração** (o módulo gera Diário/Razão;
   lucro contábil integral sai isento de IRPF).
5. **Segregar receita por anexo** (comércio × serviço no mesmo CNPJ).
6. **DIFAL / compras interestaduais** (README §7.2): nesta faixa começa a valer a
   pena comparar fornecedor de outro estado — o Simples paga DIFAL sem crédito. O
   HyperSupplier deve receber o custo "pós-DIFAL" para cotar.
7. **Descontos incondicionais na nota** em vez de "brinde"/desconto por fora:
   reduzem a receita bruta e o DAS; brinde não.

## 5. Como não atingir o teto da faixa

Política: **teto não é penhasco → não frear.** As alavancas abaixo reduzem RBT12
**sem** reduzir lucro; se uma alavanca reduz lucro, não é para ser usada.

| Alavanca | Reduz RBT12? | Reduz lucro? | Usar? |
| :-- | :--: | :--: | :--: |
| Segregação monofásica/ST | não (reduz DAS) | não | ✅ sempre |
| Comissão/consignação para baixa margem | sim | não | ✅ |
| Devoluções/cancelamentos corretos | sim | não | ✅ |
| Regime de caixa (adia) | desloca | não | ✅ se a prazo |
| Descontos incondicionais na nota | sim | sim (menor) | ✅ se já concede desconto de qualquer forma |
| Cortar produto de baixa margem | sim | pode subir | ✅ com Pareto |
| Abrir 2ª empresa para o 2º ponto | sim | não | ⚠️ só com propósito negocial real (sócios, marca, atividade distinta); mesmo negócio com "CNPJ do cunhado" = grupo econômico de fato → autuação. Encaminhar ao contador |
| Frear vendas / recusar clientes | sim | **sim** | ❌ |
| Vender sem nota | — | — | ❌ recusa + alerta de malha |

Regra do agente:

```text
se RBT12_projetado ≤ 324.000 (90 %)   → OBSERVE
se 324.000 < projetado ≤ 360.000      → SUGGEST: provisão na efetiva de Faixa 3 + alavancas ✅
se projetado > 360.000                → SUGGEST: "você vai para a Faixa 3; efetiva ainda 5,65 %; provisão X/semana"
se Fator R projetado < 0,30 (serviços)→ ASK: ajuste de pró-labore (prioridade sobre qualquer coisa de faixa)
```

## 6. Playbook do agente

- **OBSERVE:** DAS mensal por `calculateSimplesDas`; RBT12 com janela (mês entra /
  mês sai); Fator R; share monofásico.
- **SUGGEST:** card mensal "DAS cheio × DAS segregado × economia"; previsão de
  data de troca de faixa (subida ou descida) e da nova efetiva.
- **ASK:** aprovação de segregação, de pró-labore, de regime de caixa (janeiro),
  de reclassificação de itens para comissão.
- **EXECUTE:** memória de cálculo do PGDAS-D, provisão semanal em HyperFinancial,
  eventos `Accounting.tax.monophasic.optimized`, `Accounting.tax.threshold.forecasted`.

## 7. Resumo do que foi definido para esta faixa

- **Faixa 2:** efetiva contínua de 4,00 % a 5,65 % (Anexo I); marginal 7,30 %.
  Crescer continua valendo — teto **não** é penhasco.
- **Subida (8 cenários):** orgânico, 2º ponto no mesmo CNPJ, contrato B2B, sazonalidade
  + evento, reajuste de preço, queda do Fator R, absorção de outro CNPJ, outras
  receitas. O crítico é o **Fator R** (+9 p.p.).
- **Descida (5 cenários):** perda de âncora, fim de pico do ano anterior, redução
  voluntária, conversão em comissão, separação societária — sempre lenta (janela de
  12 meses) e só considerada estrutural após 3 meses.
- **Melhor economia:** monofásicos/ST (~30 % do DAS em bares), Fator R com fórmula de
  pró-labore mínimo, regime de caixa, lucro isento com escrituração, DIFAL na cotação,
  desconto na nota em vez de brinde.
- **Folga:** só alavancas que reduzem RBT12 **sem** reduzir lucro; 2ª empresa apenas
  com propósito negocial real; nunca frear vendas nem omitir receita.
