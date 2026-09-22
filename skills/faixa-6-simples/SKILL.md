---
name: hyperaccounting-faixa-6-simples
description: >
  Use quando a empresa está no Simples Nacional com RBT12 entre R$ 3.600.000,01 e
  R$ 4.800.000 (Faixa 6) — a última faixa, em que o DAS cobre só tributos federais
  (IRPJ, CSLL, PIS, COFINS, CPP) e ICMS/ISS são apurados por fora no regime normal.
  Anexo I 8,50 % → 11,13 % (federal); Anexo III 15,00 % → 19,50 %; Anexo V 15,50 %
  → 19,25 %. O teto desta faixa é a EXCLUSÃO do Simples (R$ 4,8 M, tolerância 20 %).
  Cobre subida para Lucro Presumido/Real, descida para a Faixa 5 (ICMS/ISS voltam ao
  DAS), e a decisão de "sair por escolha antes de sair por obrigação".
version: 1.0.0
---

# Faixa 6 do Simples Nacional — RBT12 de R$ 3.600.000,01 a R$ 4.800.000

## 1. Identificação

`regime == SIMPLES` e `3_600_000_00n < rbt12Cents <= 4_800_000_00n` (índice 5 em `ANNEX_I`).
A empresa aqui **já está** (ou estará a partir de janeiro) recolhendo ICMS/ISS fora do DAS.

## 2. Parâmetros da faixa

| Anexo | Nominal | Parcela a deduzir | Efetiva piso (R$ 3,6 M) | Efetiva teto (R$ 4,8 M) | Nota |
| :-- | --: | --: | --: | --: | :-- |
| I — Comércio | 19,00 % | R$ 378.000,00 | **8,50 %** | 11,125 % | ICMS = 0 % na partilha (por fora) |
| II — Indústria | 30,00 % | R$ 720.000,00 | 10,00 % | 15,00 % | ICMS e IPI tratados à parte |
| III — Serviços (Fator R ≥ 28 %) | 33,00 % | R$ 648.000,00 | 15,00 % | 19,50 % | ISS = 0 % na partilha (por fora) |
| IV — Serviços | 33,00 % | R$ 828.000,00 | 10,00 % | 15,75 % | ISS por fora; CPP por fora |
| V — Serviços (Fator R < 28 %) | 30,50 % | R$ 540.000,00 | 15,50 % | 19,25 % | ISS por fora |

Curiosidade útil: no Anexo I a efetiva **cai** de 11,875 % (teto da Faixa 5) para
8,50 % (piso da Faixa 6) porque o ICMS saiu da conta — mas a empresa passa a pagar
o ICMS no regime normal (débito − crédito, alíquota interna 17–20 %). A carga total
só é comparável somando os dois. O agente **sempre** apresenta `DAS + ICMS/ISS normal`.

Exemplo (Anexo I, RBT12 = R$ 4.200.000, mês R$ 350.000):
`efetiva_DAS = (4.200.000 × 19 % − 378.000) / 4.200.000 = 420.000 / 4.200.000 = 10,00 %` → DAS R$ 35.000
`+ ICMS normal` (ex.: débitos R$ 63.000 − créditos R$ 45.000) = R$ 18.000 → carga ≈ 15,1 %.

### O que acontece ao cruzar R$ 4.800.000 (exclusão do Simples)

| Excesso no ano-calendário | Efeito | Quando |
| :-- | :-- | :-- |
| ≤ 20 % (até R$ 5.760.000) | exclusão do Simples | a partir de **1º/jan do ano seguinte** |
| > 20 % (acima de R$ 5.760.000) | exclusão do Simples | a partir do **mês seguinte** ao excesso |
| 1º ano de atividade, > 20 % do limite proporcional | exclusão | **retroativa ao início** da atividade |

Excluída, a empresa vai para Lucro Presumido ou Lucro Real (`faixa-7-pos-simples`) e
só pode voltar ao Simples em janeiro de um ano em que a receita do ano anterior
tenha ficado ≤ R$ 4,8 M.

## 3. Cenários de mudança de faixa

### 3.1 Subir (Faixa 6 → Pós-Simples)

| # | Cenário | Sinal antecipado | Impacto | Ação prescrita |
| :-- | :-- | :-- | :-- | :-- |
| U1 | Crescimento orgânico | RBT anual projetado ≥ R$ 4.320.000 (90 %) | exclusão em janeiro (≤ 20 %) | **sair por escolha**: comparar Presumido × Real em outubro e optar em janeiro, com tudo pronto |
| U2 | Crescimento acelerado (> 20 %) | projeção anual > R$ 5.760.000 | exclusão no **mês seguinte** — 30 dias para virar Presumido/Real | alerta `regime.cliff` com 180 d; apuração paralela desde já |
| U3 | Rede/expansão | filiais | consolidado cruza | estrutura societária com substância (holding + operacionais) — contador/advogado |
| U4 | Atacado/distribuição | mix | receita útil negativa; mas no Real o PIS/COFINS não cumulativo + ICMS normal costumam favorecer | simular Real |
| U5 | M&A | aquisição | soma | modelar |
| U6 | Sazonalidade | previsão | pico pode cruzar o teto **anual** | provisão; regime de caixa desloca recebimentos |
| U7 | Fator R cai < 28 % (serviços) | folha | III → V (+0,5 a +4 p.p. nesta faixa; menos dramático que nas faixas baixas) | pró-labore |
| U8 | Impedimento não-receita (sócio PJ, sócio no exterior, atividade vedada, débito com a Fazenda) | HyperCompany / e-CAC | exclusão independente de receita | alerta e regularização antes do fato |

### 3.2 Descer (Faixa 6 → Faixa 5, ICMS/ISS voltam ao DAS)

| # | Cenário | Sinal | Impacto | Ação |
| :-- | :-- | :-- | :-- | :-- |
| D1 | Receita **anual** ≤ R$ 3,6 M (fechamento de loja, perda de contrato, crise) | RBT ano | ICMS/ISS voltam ao DAS em 1º/jan seguinte | **atenção ao saldo credor de ICMS**: pode ser perdido na volta; consumir antes (compras menores, vendas tributadas) |
| D2 | Representação/comissão para distribuição | contrato | RBT12 cai | ✅ se margem < 14 % |
| D3 | Cisão com substância | reorganização | cada CNPJ desce | contador |
| D4 | Corte de receita útil negativa (margem < 19 % nominal, ~11 % efetiva + ICMS) | Pareto | receita ↓, lucro ↑ | ✅ |
| D5 | Fim de pico do ano anterior | janela | RBT12 cai sozinho | comunicar data; avaliar se vale voltar ao sublimite |

Descer para a Faixa 5 nem sempre é bom: comércio com muito crédito de ICMS pode
preferir **ficar** no regime normal de ICMS. O agente compara `ICMS normal × ICMS no DAS`
antes de recomendar qualquer coisa.

### 3.3 Mudança de regime — Simples × Presumido × Real (comparação obrigatória anual)

| Perfil (RBT12 ~R$ 4,2 M) | Simples F6 (DAS + ICMS/ISS normal) | Lucro Presumido | Lucro Real | Vencedor típico |
| :-- | :-- | :-- | :-- | :-- |
| Comércio margem baixa (< 12 %), muito crédito | ~10 % + ICMS normal + CPP dentro | 5,93 % + ICMS normal + INSS patronal ~28 % da folha | 34 % × lucro (pequeno) + 9,25 % não cumulativo (com crédito) + ICMS + INSS | **Real** ou Presumido |
| Comércio margem alta | ~10 % + ICMS | idem | idem | **Simples** (CPP dentro pesa) |
| Serviços Anexo III, folha alta | ~17 % com CPP | 13,3–16,3 % + INSS patronal por fora | 34 % × lucro + 9,25 % + ISS + INSS | **Simples** |
| Serviços Anexo V, folha baixa | ~17,5 % | 13,3–16,3 % + INSS baixo | — | **Presumido** |
| Indústria | ~12 % + ICMS/IPI | 5,93 % + IPI/ICMS + INSS | Real com créditos de insumos | depende de créditos — simular |

Regra: sair do Simples quando a economia líquida anual > R$ 80 k em 3 cenários (base,
−20 %, +20 %), descontando compliance (~R$ 3–5 k/mês: SPED Fiscal, EFD-Contribuições,
ECD, ECF, DCTF, eSocial completo). Opção em janeiro, irrevogável no ano.

## 4. Melhor forma de economizar nesta faixa

1. **ICMS normal bem feito.** Aqui a maior alavanca deixa de ser a segregação
   monofásica de ICMS (já está fora) e passa a ser a **apuração de créditos**: NF de
   compra com destaque, crédito de energia (indústria), ativo imobilizado (CIAP),
   devoluções, ST como substituído (não paga de novo). O agente audita 100 % das
   NF-e de entrada.
2. **Segregação monofásica de PIS/COFINS** continua valendo no DAS: PIS+COFINS
   = 34,4 % da alíquota do Anexo I nesta faixa (≈ 3,4 p.p. da efetiva). Bar/mercado
   com 50 % em bebidas economiza ~1,7 p.p. da receita.
3. **Regime especial/benefício estadual** (TTD, crédito presumido, atacadista):
   no regime normal de ICMS a empresa passa a ter acesso a benefícios estaduais
   inexistentes no Simples. Mapear por estado (HyperCompany `uf`).
4. **Fator R** (folha 28 % de R$ 4,2 M = R$ 1,18 M/ano) — serviços de grande folha
   já cumprem; senão avaliar Presumido.
5. **Estrutura societária com substância** (holding patrimonial, operacionais por
   atividade/UF) — advogado + contador; o agente só simula RBT12 e carga por estrutura.
6. **Planejamento anual em outubro** (Simples × Presumido × Real, 3 cenários) —
   obrigatório nesta faixa; a decisão errada custa 6 dígitos.
7. **Retenções, DIFAL, regime de caixa, lucro isento com ECD, exclusões de receita
   bruta** — mesmas alavancas das faixas anteriores, agora com escrituração completa
   obrigatória na prática.
8. **Preparar a Reforma Tributária:** a partir de 2027 (CBS) e 2029–2033 (IBS), o
   Simples poderá optar por recolher IBS/CBS "por fora" para gerar crédito ao cliente
   B2B. Empresas desta faixa com clientes PJ devem simular a opção — pode ser o
   diferencial competitivo em B2B.

## 5. Como não atingir o teto da faixa (a exclusão)

Política: **este teto é o maior penhasco depois do MEI — mas a resposta certa
raramente é "frear"; é "sair por escolha, no dia certo, com tudo pronto".**

**Trilho A — sair por escolha (default para quem cresce):**

| Prazo | Ação |
| :-- | :-- |
| RBT12 ≥ R$ 4,0 M | apuração paralela de Presumido e Real (mensal); ECD/ECF em preparação; catálogo com NCM/CST completos para EFD-Contribuições |
| Outubro | comparativo definitivo (3 cenários); decidir regime |
| Novembro–dezembro | contador/ERP prontos; certificado digital; parametrização de PIS/COFINS (cumulativo × não cumulativo) |
| Janeiro | opção pelo regime escolhido (ou comunicação de exclusão por excesso); primeiro DARF/DCTF |
| Nunca | cruzar > 20 % (R$ 5,76 M) por acidente: exclusão no mês seguinte, sem tempo de preparo |

**Trilho B — ficar abaixo de R$ 4,8 M sem perder lucro:**

| Alavanca | Reduz RBT anual? | Reduz lucro? | Usar? |
| :-- | :--: | :--: | :--: |
| Representação/comissão para distribuição | sim | não | ✅ |
| Pareto de receita útil | sim | ↑ | ✅ |
| Exclusões de receita bruta (gorjeta, vale, reembolso, financeiras, ganho de capital) | sim | não | ✅ |
| Regime de caixa (recebimentos de dezembro em janeiro) | desloca | não | ✅ |
| Data de entrega/prestação de grandes pedidos de dezembro em janeiro, com o cliente | desloca | não | ✅ documentado |
| Estrutura societária com substância | sim | não | ⚠️ advogado + contador |
| Frear vendas / recusar clientes | sim | **sim** | ❌ — frear R$ 500 k de receita com 25 % de margem para evitar ~3 p.p. de carga extra destrói R$ 125 k para economizar R$ 15 k |
| Omitir receita | — | — | ❌ recusa; e-Financeira/DIMP/NF-e cruzam tudo |

```text
se RBT12_projetado ≤ 4.000.000                → OBSERVE (+ auditoria de créditos de ICMS)
se 4.000.000 < projetado ≤ 4.320.000          → SUGGEST: iniciar Trilho A (apuração paralela)
se 4.320.000 < projetado ≤ 4.800.000          → ASK: Trilho A (sair em janeiro por escolha) × Trilho B (ficar)
se projetado_anual > 5.760.000 (> 20 %)       → ASK prioritário `regime.cliff`: exclusão no mês seguinte — migrar agora
se impedimento não-receita detectado          → ASK prioritário: regularizar antes do fato
todo outubro                                  → EXECUTE: comparativo Simples × Presumido × Real (3 cenários)
```

## 6. Playbook do agente

- **OBSERVE:** DAS federal, ICMS/ISS normal (débito − crédito), carga total, RBT12
  e RBT anual, Fator R, share monofásico (PIS/COFINS), saldo credor de ICMS,
  apuração paralela Presumido/Real, impedimentos cadastrais.
- **SUGGEST:** card mensal "carga total = DAS + ICMS/ISS"; painel "exclusão em X
  meses"; auditoria de créditos de ICMS perdidos; comparativo de regimes.
- **ASK:** Trilho A × B; saída do Simples (outubro); estrutura societária
  (encaminha); benefícios estaduais; opção IBS/CBS por fora (a partir de 2027).
- **EXECUTE:** PGDAS-D (federal) + apuração de ICMS/ISS; provisão; dossiê de
  migração de regime; pacote do contador com ECD; eventos
  `Accounting.tax.threshold.forecasted` (prioridade máxima),
  `Accounting.tax.monophasic.optimized`, `Accounting.provisions.projected`.

## 7. Resumo do que foi definido para esta faixa

- **Faixa 6:** DAS só federal (Anexo I 8,50 % → 11,125 %) + ICMS/ISS no regime
  normal; a carga real é a **soma**. O teto (R$ 4,8 M, tolerância R$ 5,76 M) é a
  **exclusão do Simples**.
- **Subida (8 cenários):** orgânico, acelerado (> 20 %), rede, atacado, M&A,
  sazonalidade, Fator R e **impedimentos não-receita** (sócio PJ/exterior, atividade
  vedada, débito) — o último exclui mesmo sem crescer.
- **Descida (5 cenários):** receita anual ≤ R$ 3,6 M (com risco de perder saldo
  credor de ICMS), representação, cisão, receita útil, fim de pico. Descer nem
  sempre é melhor — comparar ICMS normal × ICMS no DAS.
- **Regime:** comparação anual obrigatória (Simples × Presumido × Real, 3 cenários,
  economia > R$ 80 k/ano para sair); comércio de margem baixa com crédito tende ao
  Real/Presumido; serviços Anexo III com folha ficam.
- **Melhor economia:** **ICMS normal bem apurado** (créditos, CIAP, ST, benefícios
  estaduais), monofásicos de PIS/COFINS no DAS (~1,7 p.p.), Fator R, estrutura com
  substância, planejamento de outubro, preparação para IBS/CBS por fora (B2B).
- **Não atingir o teto:** Trilho A "sair por escolha em janeiro com tudo pronto"
  (default) ou Trilho B "ficar sem perder lucro"; nunca cruzar > 20 % por
  acidente; nunca frear vendas nem omitir receita.
