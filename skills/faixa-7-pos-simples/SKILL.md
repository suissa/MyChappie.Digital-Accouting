---
name: hyperaccounting-faixa-7-pos-simples
description: >
  Use quando a empresa está FORA do Simples Nacional — por receita acima de
  R$ 4.800.000, por impedimento (sócio PJ, atividade vedada, débito) ou por opção —
  e apura pelo Lucro Presumido ou Lucro Real. Aqui não há "faixa" por RBT12: a carga
  depende de margem, folha, créditos de PIS/COFINS/ICMS e do regime escolhido.
  Cobre a escolha Presumido × Real, a descida de volta ao Simples (só em janeiro,
  receita do ano anterior ≤ R$ 4,8 M), o limite de R$ 78 M do Presumido, a economia
  por regime e a transição IBS/CBS da Reforma Tributária.
version: 1.0.0
---

# Faixa 7 — Pós-Simples (Lucro Presumido / Lucro Real)

## 1. Identificação

`regime in (PRESUMIDO, REAL)`; ou `regime == SIMPLES` com `rbt12Cents > limite`
(cenário de exclusão em curso, roteado pelo `faixa-navigator`).

## 2. Parâmetros dos regimes

### 2.1 Lucro Presumido (receita anual ≤ R$ 78.000.000)

| Tributo | Base | Alíquota | Carga sobre receita (comércio) | Carga sobre receita (serviços) |
| :-- | :-- | --: | --: | --: |
| IRPJ | 8 % (comércio) / 32 % (serviços) da receita | 15 % (+10 % sobre o que exceder R$ 60 k/trimestre) | 1,20 % (+ adicional) | 4,80 % (+ adicional) |
| CSLL | 12 % (comércio) / 32 % (serviços) | 9 % | 1,08 % | 2,88 % |
| PIS | receita | 0,65 % (cumulativo, sem crédito) | 0,65 % | 0,65 % |
| COFINS | receita | 3,00 % (cumulativo) | 3,00 % | 3,00 % |
| **Federal** | | | **5,93 %** | **11,33 %** |
| ICMS | débito − crédito | 17–20 % interno | variável | — |
| ISS | receita de serviço | 2–5 % | — | 2–5 % |
| INSS patronal + terceiros + RAT | folha | ~26,8–28,8 % | por fora | por fora |

O Presumido **não olha o lucro real**: empresa com margem líquida < 8 % (comércio) ou
< 32 % (serviços) paga IRPJ/CSLL sobre lucro que não teve. Empresa com margem maior
que a presunção paga **menos** do que deveria — é o caso clássico de serviços de alta
margem.

### 2.2 Lucro Real (obrigatório acima de R$ 78 M ou para bancos/factoring etc.; opcional abaixo)

| Tributo | Base | Alíquota |
| :-- | :-- | --: |
| IRPJ | lucro real (contábil ajustado) | 15 % + 10 % sobre o que exceder R$ 240 k/ano |
| CSLL | lucro real | 9 % |
| PIS | receita, **não cumulativo** (crédito sobre insumos, energia, aluguel, frete…) | 1,65 % |
| COFINS | idem | 7,60 % |
| ICMS / ISS / INSS | iguais ao Presumido | |

O Real pune margem alta (34 % sobre o lucro) e premia margem baixa com muitos
insumos (créditos de 9,25 %). Prejuízo fiscal compensa até 30 % do lucro futuro.

### 2.3 Fórmula de decisão (o agente calcula mensalmente, decide em outubro)

```text
carga_presumido = 5,93 % (ou 11,33 %) × receita + adicional_IR + ICMS/ISS + INSS_folha
carga_real      = 34 % × lucro_ajustado + 9,25 % × (receita − base_de_créditos) + ICMS/ISS + INSS_folha
carga_simples   = DAS(anexo, RBT12) [+ ICMS/ISS normal se > sublimite]   # só se elegível
```
Regra prática: **Presumido vence** quando `margem_líquida > presunção` (8 %/32 %) e os
créditos de PIS/COFINS são pequenos; **Real vence** quando margem < presunção ou
créditos de PIS/COFINS > 3,5 % da receita (atacado, indústria, transporte).

## 3. Cenários de mudança de faixa

### 3.1 Subir (Presumido → Real obrigatório / crescimento)

| # | Cenário | Sinal antecipado | Impacto | Ação prescrita |
| :-- | :-- | :-- | :-- | :-- |
| U1 | Receita anual > R$ 78.000.000 | projeção anual | Lucro Real **obrigatório** no ano seguinte | preparar ECD/ECF completas, controle de créditos de PIS/COFINS, LALUR |
| U2 | Adicional de IRPJ (lucro presumido > R$ 60 k/trimestre; real > R$ 240 k/ano) | base trimestral | +10 % sobre o excesso | provisionar; avaliar trimestral × anual (Real) |
| U3 | Margem cai abaixo da presunção (8 %/32 %) | DRE real | Presumido passa a tributar lucro inexistente | simular Real; opção em janeiro |
| U4 | Crescimento de compras/insumos com PIS/COFINS destacado | mix de custos | créditos não aproveitados no Presumido | simular Real |
| U5 | Expansão para outros estados (filiais/e-commerce) | HyperCompany | DIFAL, substituição tributária, regimes especiais por UF | mapa tributário por UF |
| U6 | Contratação em massa | folha | INSS patronal ~28 % por fora (no Simples era dentro do DAS) | provisionar; avaliar desoneração setorial se aplicável |
| U7 | Atividade obrigada ao Real (factoring, instituição financeira, lucros do exterior) | CNAE/eventos | Real compulsório | migrar |

### 3.2 Descer (Pós-Simples → Simples Faixa 6 ou inferior)

Possível apenas em **janeiro**, se **todas** valerem:

| # | Condição | Como o agente verifica |
| :-- | :-- | :-- |
| D1 | Receita bruta do ano anterior ≤ R$ 4.800.000 (proporcional se início no ano) | RBT anual |
| D2 | Sem impedimentos (sócio PJ, sócio domiciliado no exterior, sócio com > 10 % em outra empresa cujo RBT12 somado > R$ 4,8 M, atividade vedada, S/A, cooperativa, filial no exterior) | HyperCompany |
| D3 | Sem débitos exigíveis com Fazendas/INSS (ou parcelados) | e-CAC |
| D4 | Não excluída por infração nos últimos 3 (ou 10) anos | histórico |

Cenários que levam a descer: contração real do negócio, cisão com substância que
deixa cada CNPJ ≤ R$ 4,8 M, venda de unidade, fim de contrato grande, regularização
de impedimento (sócio PJ sai da sociedade). O agente só recomenda voltar se
`carga_simples < min(carga_presumido, carga_real)` **e** a projeção de 12 meses fica
≤ R$ 4,3 M (folga de ~10 %) — voltar e ser excluído de novo é o pior cenário
(exclusão no mês seguinte se > 20 %).

### 3.3 Descer "de regime" (Real → Presumido)

Quando margem sobe acima da presunção e créditos são pequenos. Opção em janeiro
(primeiro DARF do ano), irrevogável no ano.

## 4. Melhor forma de economizar em cada regime

### 4.1 Lucro Presumido
1. **Distribuição de lucros isenta acima da presunção com escrituração contábil**
   (ECD). Sem ECD, só o lucro presumido líquido de tributos sai isento; com ECD,
   **todo** o lucro contábil. É a maior alavanca de PF do sócio.
2. **Pró-labore mínimo** (11 % INSS + IRPF) e o restante como lucro isento.
3. **Receitas financeiras** tributadas à parte (não entram em PIS/COFINS
   cumulativo); **ganho de capital** à parte.
4. **Segregação de receitas por presunção**: transporte de carga 8 %, serviços
   hospitalares 8 % (com estrutura), revenda 8 %, serviços 32 % — classificar cada
   receita corretamente muda a base de IRPJ/CSLL.
5. **Monofásicos/ST**: no Presumido a revenda de produto monofásico tem PIS/COFINS
   **zero** (não 0,65 % + 3 %) — bar, farmácia, autopeças e mercado economizam 3,65 %
   sobre essa fatia. Segregar por NCM/CST (HyperCommerce).
6. **ICMS normal bem apurado** (créditos, CIAP, ST, benefícios estaduais).
7. **Retenções na fonte** (IRRF 1,5 %, CSRF 4,65 %, ISS, INSS 11 %) compensadas
   sem deixar crédito parado.
8. **Trimestral × mensal**: IRPJ/CSLL trimestrais; planejar vendas grandes no início
   do trimestre não muda a carga, mas o **adicional** de 10 % é por trimestre — receita
   estável entre trimestres evita picos que acionam o adicional.

### 4.2 Lucro Real
1. **Créditos de PIS/COFINS não cumulativos** sobre insumos (conceito amplo pós-STJ
   REsp 1.221.170: essencialidade/relevância), energia, aluguel PJ, frete, depreciação.
   Auditoria de 100 % das notas de entrada.
2. **Despesas dedutíveis** — o único regime em que "gastar reduz imposto":
   provisões dedutíveis, depreciação acelerada, PLR (dedutível e sem INSS), JCP (juros
   sobre capital próprio: dedutível a 15 % de IRRF em vez de 34 %), pesquisa e
   inovação (Lei do Bem), PAT.
3. **Compensação de prejuízo fiscal** (30 % do lucro/ano) e base negativa de CSLL.
4. **Estimativa mensal × trimestral**: balanços de suspensão/redução para não
   antecipar IRPJ em meses fracos.
5. **ICMS e IPI** com créditos plenos; regimes especiais e incentivos (SUDENE/SUDAM
   reduzem IRPJ em 75 %).
6. **JCP** para sócios em vez de só dividendos, quando o patrimônio líquido é grande.

### 4.3 Comum aos dois
- **Holding patrimonial** para imóveis/participações (aluguel no Presumido a
  ~11,33 % + ISS 0 vs. 27,5 % na PF); com advogado e contador.
- **Estrutura por UF/atividade** com substância.
- **Planejamento anual em outubro** (Presumido × Real × Simples se elegível), 3
  cenários; a opção é irrevogável no ano.
- **Reforma Tributária (LC 214/2025):** CBS substitui PIS/COFINS em 2027; IBS
  substitui ICMS/ISS gradualmente 2029–2033; crédito financeiro amplo e
  não cumulatividade plena. Empresas com cadeia longa (atacado/indústria) ganham;
  serviços com pouca compra perdem — o agente já roda o "DRE 2033" (README §7.1)
  para reprecificar.

## 5. Como não atingir o teto (R$ 78 M do Presumido) — e como usar o Simples como teto de baixo

Política: acima do Simples **não há penhasco de receita** até R$ 78 M; o único
"teto" relevante é o **adicional de IRPJ** por trimestre. O foco vira **escolha de
regime e estrutura**, não freio de receita.

| Alavanca | Objetivo | Usar? |
| :-- | :-- | :--: |
| Comparativo anual de regimes com 3 cenários | escolher o regime certo (6–7 dígitos de diferença) | ✅ obrigatório |
| Segregação por presunção/monofásicos (Presumido) | reduzir base sem reduzir receita | ✅ |
| Créditos plenos (Real) | idem | ✅ |
| Holding/estrutura com substância | separar patrimônio e atividades | ⚠️ advogado + contador |
| Voltar ao Simples (janeiro) quando receita ≤ R$ 4,3 M projetada e carga menor | usar o Simples como piso | ✅ se as 4 condições valem |
| Fracionar em várias empresas "para caber no Simples" | — | ❌ planejamento abusivo (grupo econômico de fato); o agente recusa e informa |
| Frear vendas | — | ❌ |
| Omitir receita | — | ❌ recusa; e-Financeira/DIMP/NF-e/SPED cruzam tudo |

```text
mensal        → OBSERVE: carga efetiva por regime (Presumido, Real, Simples se elegível), créditos, retenções
trimestral    → SUGGEST: adicional de IRPJ projetado; balanço de suspensão (Real)
outubro       → ASK: regime do ano seguinte (3 cenários)
janeiro       → EXECUTE: opção formal; se voltar ao Simples, comunicação até o último dia útil
se receita_anual_projetada > 70.200.000 (90 % de 78 M) → SUGGEST: preparar Real obrigatório
se impedimento surge/some                              → ASK: efeito na elegibilidade ao Simples
```

## 6. Playbook do agente

- **OBSERVE:** DRE real mensal (o módulo já projeta partidas dobradas), margem
  líquida × presunção, créditos de PIS/COFINS/ICMS, folha e INSS patronal,
  retenções, adicional de IRPJ trimestral, elegibilidade ao Simples.
- **SUGGEST:** card mensal "carga por regime"; alertas de adicional de IRPJ; auditoria
  de créditos não tomados; DRE 2033 (IBS/CBS).
- **ASK:** regime do ano seguinte (outubro); ECD para lucro isento; JCP/PLR (Real);
  holding/estrutura (encaminha); volta ao Simples.
- **EXECUTE:** apuração de IRPJ/CSLL/PIS/COFINS (trimestral ou mensal), ICMS/ISS,
  DCTF/EFD-Contribuições/SPED Fiscal via contador; pacote com ECD/ECF; eventos
  `Accounting.tax.threshold.forecasted` (R$ 78 M, adicional), `Accounting.provisions.projected`,
  `Accounting.monthly.closed`.

## 7. Resumo do que foi definido para esta faixa

- **Pós-Simples:** sem faixa por RBT12; carga = f(regime, margem, folha, créditos).
  Presumido federal 5,93 % (comércio) / 11,33 % (serviços) + ICMS/ISS + INSS por fora;
  Real 34 % sobre lucro + 9,25 % não cumulativo com créditos.
- **Subida (7 cenários):** R$ 78 M (Real obrigatório), adicional de IRPJ, margem
  abaixo da presunção, créditos não aproveitados, expansão interestadual,
  contratação em massa, atividades obrigadas ao Real.
- **Descida:** volta ao Simples só em janeiro com 4 condições e projeção ≤ R$ 4,3 M;
  Real → Presumido quando margem > presunção e créditos pequenos.
- **Melhor economia — Presumido:** lucro integral isento com ECD, segregação por
  presunção, monofásicos com PIS/COFINS zero, retenções, receita estável entre
  trimestres. **Real:** créditos amplos de PIS/COFINS, despesas dedutíveis
  (PLR, JCP, Lei do Bem), prejuízo fiscal, balanços de suspensão, incentivos
  regionais. **Ambos:** holding com substância, planejamento de outubro, DRE 2033
  para IBS/CBS.
- **Teto:** não há penhasco de receita até R$ 78 M; o trabalho é escolher regime e
  estrutura. Fracionar empresas para "caber no Simples" é recusado; frear e omitir,
  nunca.
