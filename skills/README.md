# HyperAccounting — Skills por Faixa Tributária

Uma skill por faixa de imposto (MEI → Simples Nacional Faixas 1-6 → Lucro
Presumido/Real), mais um navegador que identifica a faixa e roteia. Cada skill
declara, para a sua faixa: **parâmetros**, **todos os cenários de subida e descida**,
**a melhor forma de economizar**, **como não atingir o teto** e um **resumo**.

Implementam o "Tax Threshold & Bracket Forecaster" (README §5) e o "Monophasic &
Tax Credit Optimizer" (README §6). Alinhadas à tabela `ANNEX_I` e a
`calculateSimplesDas()` em `src/index.ts`.

```
skills/
  faixa-navigator/        # identifica a faixa, regras comuns, roteamento
  faixa-0-mei/            # até R$ 81 k         (DAS fixo)
  faixa-1-simples/        # até R$ 180 k        (4,00 % fixo no Anexo I)
  faixa-2-simples/        # R$ 180 k – 360 k    (4,00 → 5,65 %)
  faixa-3-simples/        # R$ 360 k – 720 k    (5,65 → 7,58 %)
  faixa-4-simples/        # R$ 720 k – 1,8 M    (7,58 → 9,45 %)
  faixa-5-simples/        # R$ 1,8 M – 3,6 M    (9,45 → 11,88 %) — teto = sublimite ICMS/ISS
  faixa-6-simples/        # R$ 3,6 M – 4,8 M    (8,50 → 11,13 % federal + ICMS/ISS por fora) — teto = exclusão
  faixa-7-pos-simples/    # acima de R$ 4,8 M   (Presumido / Real)
```

## Princípio que atravessa todas as faixas

A alíquota efetiva do Simples é **contínua** entre faixas (`(RBT12 × nominal − PD) / RBT12`
é igual dos dois lados de cada limite). Subir de faixa dentro do Simples muda só a
alíquota **marginal** — não é penhasco e **nunca justifica frear vendas**. Os
penhascos reais são três, e a folga de segurança é proporcional a eles:

| Penhasco | Limite | Tolerância | Efeito |
| :-- | :-- | :-- | :-- |
| MEI → ME | R$ 81.000 | 20 % (R$ 97.200) | DAS fixo → % da receita + contabilidade; > 20 % retroativo |
| Sublimite ICMS/ISS | R$ 3.600.000 | 20 % (R$ 4.320.000) | ICMS/ISS saem do DAS (janeiro se ≤ 20 %; mês seguinte se > 20 %) |
| Exclusão do Simples | R$ 4.800.000 | 20 % (R$ 5.760.000) | Presumido/Real (janeiro se ≤ 20 %; mês seguinte se > 20 %) |

Mais um penhasco que não é de faixa: **Fator R** (folha/RBT12 = 28 %) troca Anexo V
(15,5 %+) por Anexo III (6 %+) para serviços — vale mais que qualquer faixa.

Linhas vermelhas comuns: o agente **recusa** omissão de receita (venda sem nota,
Pix pessoal) e **não recomenda** fracionar o mesmo negócio em vários CNPJs; estrutura
societária só com propósito negocial e substância, via contador/advogado.

## Resumo do que foi definido para cada faixa

| Faixa | Teto é penhasco? | Cenários ↑ | Cenários ↓ | Melhor economia | Como não atingir o teto |
| :-- | :--: | :--: | :--: | :-- | :-- |
| **0 · MEI** (≤ R$ 81 k) | **Sim** | 12 (4 não dependem de receita: 2º funcionário, sociedade, CNAE, filial) | ME → MEI só em janeiro, 6 condições, projeção ≤ R$ 70 k | Usar o teto ao máximo (marginal zero); revenda de baixa margem como **comissão**; ICMS × ISS corretos; nunca "comprar para abater" | Meta R$ 75 k; mix, comissão, timing de entrega, devoluções; estouro ≤ 20 % aceitável se calculado; > 20 % nunca — transição planejada |
| **1** (≤ R$ 180 k) | Não | 8 (crítico: Fator R 6 % → 15,5 %) | Para MEI (janeiro) e "de anexo" V → III via pró-labore | **Monofásicos/ICMS-ST** (~30 % do DAS em bares); Fator R; regime de caixa; pró-labore mínimo + lucro isento com escrituração | Provisionar na alíquota futura; reduzir **imposto**, não receita; comissão para baixa margem; nunca frear |
| **2** (R$ 180–360 k) | Não | 8 (2º ponto, B2B, evento, preço, Fator R, absorção de CNPJ) | 5 (âncora, fim de pico, redução voluntária, comissão, separação) — lenta, 3 meses para ser estrutural | Monofásicos/ST; fórmula do **pró-labore mínimo** para Fator R; regime de caixa; DIFAL na cotação; desconto na nota em vez de brinde | Só alavancas que reduzem RBT12 **sem** reduzir lucro; 2ª empresa só com propósito real |
| **3** (R$ 360–720 k) | Não | 8 (multi-loja, atacarejo, licitação, royalties…) | 6 (fechar loja, cliente, comissão, pico, cisão, mix) | Monofásicos/ST (~27 %); Fator R; **compensar retenções**; DIFAL; gorjeta/vale/reembolso fora da receita | Conceito de **receita útil** (linha com margem < marginal da próxima faixa só sobe faixa) — Pareto automático; Anexo V × Presumido só depois de esgotar o Fator R |
| **4** (R$ 720 k – 1,8 M) | Não (mas o de 2 faixas acima é) | 8 (rede, atacado, e-commerce/DIFAL de saída, M&A…) | 6 (representação, cisão, crise, receita útil…) | Monofásicos/ST (~R$ 2 k/mês em R$ 100 k); Fator R (~6 p.p.); estudo societário legítimo; **começar a acumular créditos de ICMS** para o sublimite | Receita útil, comissão, exclusões; saída do Simples só com > R$ 30 k/ano em 3 cenários e em janeiro |
| **5** (R$ 1,8 – 3,6 M) | **Sim** (sublimite) | 8 (acelerado > 20 % = efeito no mês seguinte) | 7 (inclui **volta ao sublimite**, com risco de perder saldo credor de ICMS) | Monofásicos/ST (~R$ 5,6 k/mês); **ICMS normal como oportunidade** (débito − crédito simulado desde R$ 2,5 M); planejamento de outubro | **Trilho A** (24 meses: créditos, NCM, contador, cruzar em ≤ 20 % com efeito em janeiro) ou **Trilho B** (ficar sem perder lucro); nunca cruzar > 20 % por acidente |
| **6** (R$ 3,6 – 4,8 M) | **Sim** (exclusão) | 8 (inclui **impedimentos não-receita**) | 5 (descer nem sempre é melhor — comparar ICMS normal × no DAS) | **ICMS normal bem apurado** (créditos, CIAP, ST, benefícios estaduais); monofásicos PIS/COFINS (~1,7 p.p.); planejamento anual; IBS/CBS por fora para B2B | **Sair por escolha em janeiro com tudo pronto** (apuração paralela desde R$ 4,0 M) ou ficar sem perder lucro; economia > R$ 80 k/ano para sair |
| **7 · Pós-Simples** | Não até R$ 78 M | 7 (R$ 78 M → Real obrigatório, adicional de IRPJ, margem < presunção…) | Volta ao Simples só em janeiro, 4 condições, projeção ≤ R$ 4,3 M; Real → Presumido | **Presumido:** lucro integral isento com ECD, segregação por presunção, monofásicos com PIS/COFINS zero. **Real:** créditos amplos, PLR/JCP/Lei do Bem, prejuízo fiscal. Ambos: holding com substância, DRE 2033 | Escolha de regime e estrutura, não freio; fracionar para "caber no Simples" é recusado |

## Contrato com o módulo

| Entrada (do navegador) | Saída (de cada faixa) | Evento |
| :-- | :-- | :-- |
| `rbt12Cents`, `monthlyRevenueCents`, `annex`, `payroll12Cents`, `monthsActive`, `monophasicShareBps`, `revenueHistory` | faixa atual, efetiva, DAS, data prevista de troca (↑/↓), lista de alavancas aplicáveis com economia em R$, modo (`OBSERVE`/`SUGGEST`/`ASK`/`EXECUTE`) | `Accounting.tax.threshold.forecasted`, `Accounting.tax.monophasic.optimized`, `Accounting.provisions.projected` |

## Parâmetros a revalidar anualmente

Teto MEI e salário-mínimo; tabelas dos Anexos (LC 155/2016); sublimite estadual;
limite do Presumido (R$ 78 M); cronograma da Reforma Tributária (CBS 2027, IBS
2029-2033). Cada skill lista os seus no rodapé.
