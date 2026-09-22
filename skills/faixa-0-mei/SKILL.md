---
name: hyperaccounting-faixa-0-mei
description: >
  Use quando a empresa é MEI (Microempreendedor Individual, regime SIMEI) ou quando
  uma ME de Faixa 1 do Simples está avaliando "voltar a ser MEI". Cobre o teto de
  R$ 81.000/ano, a tolerância de 20 %, os gatilhos de desenquadramento que não são
  de receita (funcionário extra, sócio, atividade proibida), como economizar dentro do
  MEI e como não estourar o teto sem esconder receita.
version: 1.0.0
---

# Faixa 0 — MEI (SIMEI)

## 1. Identificação (quando esta skill responde)

- `regime == MEI`; ou
- `regime == SIMPLES` e `annex == I|III` e RBT12 ≤ R$ 81.000 e o usuário perguntou
  se "compensa virar/voltar a ser MEI".

## 2. Parâmetros da faixa

| Parâmetro | Valor | Observação |
| :-- | :-- | :-- |
| Teto anual de receita bruta | **R$ 81.000,00** (R$ 6.750/mês médio) | proporcional no ano de abertura |
| Tolerância | até **R$ 97.200,00** (+20 %) | acima disso, retroativo |
| Imposto | **DAS fixo mensal** = 5 % do salário-mínimo (INSS) + R$ 1,00 (ICMS, comércio/indústria) e/ou R$ 5,00 (ISS, serviços) | ≈ R$ 82–87/mês em 2026 (SM R$ 1.621) — revalidar |
| Alíquota efetiva sobre receita | de ~1,3 % (no teto) a >10 % (receita baixa) | **quanto mais vende, menor a efetiva** — é o regime mais barato do país no teto |
| Funcionários | **no máximo 1**, com 1 salário-mínimo ou piso da categoria | 2º funcionário = desenquadramento |
| Sócio/titular | não pode ser sócio, administrador ou titular de outra empresa | |
| Atividades | apenas ocupações da lista do CGSIM (Anexo XI da Res. CGSN 140) | bar, mercearia, barbearia, lanchonete estão; consultoria, engenharia, medicina não |
| Contabilidade | dispensada (só DASN-SIMEI anual + relatório mensal de receitas) | |
| MEI caminhoneiro | teto R$ 251.600 | roteamento especial, mesma lógica |

O custo real de sair do MEI para ME (Faixa 1, Anexo I) em R$ 81.000/ano:

| Item | MEI | ME Simples F1 |
| :-- | --: | --: |
| Imposto anual | ~R$ 1.000 | R$ 3.240 (4 %) |
| Contabilidade | R$ 0 | R$ 2.400–4.800 |
| INSS do titular | incluso (5 % SM) | pró-labore: 11 % + patronal isenta no Simples |
| **Diferença anual** | — | **≈ +R$ 5.000 a +R$ 7.000** |

Por isso o MEI é o único regime em que **estourar o teto é sempre pior que não
estourar**, mesmo que a receita extra seja lucrativa — até ~R$ 100.000 de receita a
diferença de custo fixo raramente é coberta pela margem adicional.

## 3. Cenários de mudança de faixa

### 3.1 Subir (MEI → ME / Simples Faixa 1)

| # | Cenário | Sinal antecipado que o HyperAccounting detecta | Impacto | Ação prescrita |
| :-- | :-- | :-- | :-- | :-- |
| U1 | Crescimento orgânico de vendas | média móvel 3 m × 12 > R$ 81.000; RBT12 ≥ 90 % do teto | ≤ 20 %: vira ME em jan; > 20 %: retroativo | plano de folga (§5) ou transição planejada (§3.3) |
| U2 | Sazonalidade (dez, festas, verão) | histórico do ano anterior mostra pico; projeção do pico cruza o teto | idem | antecipar/postergar campanhas para o ano-calendário certo (legal: **quando** vender, não **se** declarar) |
| U3 | Novo canal (delivery, iFood, marketplace) | crescimento > 30 % m/m em canal novo | idem, mais rápido | avaliar comissão vs. receita própria (no marketplace a receita bruta é o valor da venda, não o líquido) |
| U4 | Aumento de preço / inflação | ticket médio sobe sem subir volume | RBT12 sobe mesmo sem crescer o negócio | reprecificar só o mix de margem alta; considerar cesta menor |
| U5 | Revenda de itens de alto valor e baixa margem (gás, cigarro, recarga, bebida em caixa fechada) | itens com margem < 8 % representam > 25 % da receita | inflam o RBT12 sem lucro | mover para modelo de **comissão/consignação** (receita = comissão) ou cortar |
| U6 | Contratar 2º funcionário | evento `Company.employee.hired` | desenquadramento imediato (não é de receita) | bloquear/alertar antes; sugerir MEI + diarista/PJ dentro da lei ou virar ME de propósito |
| U7 | Titular vira sócio de outra empresa | evento em HyperCompany | desenquadramento | alertar antes de assinar contrato social |
| U8 | Incluir atividade fora da lista (ex.: consultoria) | alteração de CNAE | desenquadramento | verificar CGSIM antes de alterar |
| U9 | Abrir filial | pedido de 2º endereço | proibido para MEI | virar ME |
| U10 | Receita de outra fonte lançada no CNPJ (aluguel, venda de ativo) | classificação contábil de "outras receitas" | ganho de capital não é receita bruta; aluguel de bem próprio é | classificar corretamente antes de somar ao RBT12 |
| U11 | Estouro ≤ 20 % (R$ 81.000,01–97.200) | RBT12 projetado fecha entre os limites | paga DAS complementar em janeiro sobre o excesso + vira ME em 1º/jan | pré-provisionar o complementar; preparar contabilidade para janeiro |
| U12 | Estouro > 20 % (> R$ 97.200) | RBT12 projetado acima | **retroativo a janeiro**: recalcula todo o ano como ME com multa/juros | alerta `regime.cliff` prioritário; parar de crescer no ano-calendário ou aceitar e virar ME já |

### 3.2 Descer (ME Faixa 1 → MEI) — "voltar a ser MEI"

Possível apenas em **janeiro** (opção pelo SIMEI até o último dia útil de janeiro),
se **todos** valerem:

| # | Condição | Como o agente verifica |
| :-- | :-- | :-- |
| D1 | Receita bruta do ano anterior ≤ R$ 81.000 | RBT do ano-calendário anterior |
| D2 | Sem sócios (empresário individual / SLU convertível) | HyperCompany |
| D3 | ≤ 1 funcionário | folha |
| D4 | CNAE(s) permitidos ao MEI | lista CGSIM |
| D5 | Sem débitos impeditivos no Simples | consulta e-CAC |
| D6 | Não é sócio de outra empresa | HyperCompany |

Cenários que levam uma ME a descer: perda de um cliente/canal grande (queda
> 40 % do RBT12), redução voluntária (aposentadoria parcial, meio período), separação
de sociedade (cada ex-sócio vira MEI), encerramento de linha de produto de baixa
margem. O agente **só recomenda descer** se a projeção de 12 meses ficar abaixo de
R$ 70.000 (folga de ~14 %) — descer e estourar de novo é o pior dos mundos.

### 3.3 Transição planejada (subir de propósito)

Quando o negócio vai realmente crescer, a **melhor forma de subir** é:
1. Fechar o ano ≤ R$ 81.000 (ou ≤ R$ 97.200 aceitando o complementar);
2. Comunicar desenquadramento no Portal do Simples com efeito 1º/jan;
3. Contratar contabilidade em dezembro; abrir conta PJ e maquininha no CNPJ;
4. Definir pró-labore mínimo (1 SM) + distribuição de lucros isenta.
Custo: previsível. Alternativa (estourar > 20 %): mesmo custo **+ multa + juros + recálculo
retroativo** — nunca é a melhor forma.

## 4. Melhor forma de economizar em impostos dentro do MEI

Ordem de impacto:

1. **Vender até o teto.** O DAS é fixo; cada real a mais até R$ 81.000 tem imposto
   marginal **zero**. A efetiva cai de 10 % (R$ 10 k/ano) para 1,3 % (R$ 81 k/ano).
   Não há regime mais barato — o objetivo é *usar* o MEI ao máximo, não fugir dele.
2. **Separar receita própria de comissão.** Recarga de celular, pagamento de contas
   (correspondente), bilhetes, produtos em consignação: formalizar como comissão faz a
   receita bruta ser 5–10 % do valor transacionado. Isso pode liberar dezenas de
   milhares de reais de "espaço" no teto.
3. **Classificar corretamente ICMS × ISS.** Bar/mercearia que também presta serviço
   (ex.: entrega própria cobrada) recolhe R$ 1 + R$ 5; só comércio paga R$ 1. Não
   pagar ISS por serviço que não presta.
4. **Não pagar INSS em duplicidade.** Se o titular também tem emprego CLT que já
   recolhe sobre o teto, o 5 % do DAS continua obrigatório, mas o agente deve avisar
   que não gera benefício adicional — evitar recolhimentos complementares (20 %)
   desnecessários.
5. **Pessoa física do titular.** Lucro do MEI distribuído é isento de IRPF até o
   limite de 8 % (comércio) / 32 % (serviços) da receita **sem** escrituração; com
   escrituração contábil simples, todo o lucro é isento. Para MEI perto do teto com
   margem alta, vale manter livro-caixa.
6. **Estoque e compras não reduzem imposto** (DAS é fixo). Portanto **nunca** comprar
   estoque "para abater imposto" — é um erro comum trazido da cultura de Lucro Real.

## 5. Como não atingir o teto da faixa (plano de folga)

Meta: fechar o ano-calendário com **RBT ≤ R$ 75.000** (folga de ~7,5 %) sem
esconder uma única venda.

| Alavanca | Legal? | Mecânica |
| :-- | :--: | :-- |
| Monitorar **ritmo de queima**: `folga_restante = 81.000 − RBT_ano`; `dias_até_estouro = folga / receita_média_diária` | ✅ | alerta semanal a partir de 70 % do teto; diário a partir de 90 % |
| Deslocar **quando** a venda acontece (entregas/serviços grandes contratados em dezembro executados em janeiro, com o cliente ciente) | ✅ | o fato gerador é a entrega/prestação; combinar com o cliente e documentar |
| Cortar itens de alta receita e baixa margem (U5) | ✅ | análise de Pareto por margem em HyperSales |
| Converter revenda em comissão/consignação (§4.2) | ✅ | contrato com o fornecedor |
| Devoluções e cancelamentos lançados corretamente | ✅ | não somam à receita bruta |
| Aceitar o estouro ≤ 20 % de forma **calculada** (R$ 81.000–97.200) | ✅ | complementar de janeiro é barato (≈ 4–6 % só sobre o excesso); pior é o > 20 % |
| Abrir 2º CNPJ (cônjuge/parente) para "dividir" a receita | ⚠️ | planejamento abusivo se for o mesmo negócio (grupo econômico de fato, confusão patrimonial). O agente **não recomenda**; apenas informa o risco e encaminha ao contador |
| Vender "sem nota"/no CPF/Pix pessoal | ❌ | omissão de receita — o agente **recusa** e alerta que adquirentes de cartão/Pix informam à Receita (malha) |

Regra de decisão do agente:

```text
se projeção_ano ≤ 75.000              → OBSERVE (nada a fazer)
se 75.000 < projeção ≤ 81.000         → SUGGEST: alavancas ✅ 1-5
se 81.000 < projeção ≤ 97.200         → ASK: "segurar" (alavancas) OU "aceitar complementar e virar ME em jan"
se projeção > 97.200                  → ASK prioritário: transição planejada (§3.3) — não existe cenário bom em ficar MEI
```

## 6. Playbook do agente

- **OBSERVE:** acumula RBT do ano e RBT12; calcula folga e ritmo de queima.
- **SUGGEST:** a partir de 70 % do teto envia card semanal ("faltam R$ X; no ritmo
  atual estoura em DD/MM"); lista alavancas legais aplicáveis ao mix do cliente.
- **ASK:** a partir de 90 % oferece os dois caminhos (segurar × transição) com custo
  em reais de cada um; pede aprovação de 1 clique.
- **EXECUTE:** gera a comunicação de desenquadramento, o checklist de virada e a
  provisão do DAS complementar de janeiro; emite `Accounting.tax.threshold.forecasted`
  e `Accounting.provisions.projected`.

Mensagem-modelo (WhatsApp):

```text
🔮 MEI — teto de R$ 81.000
Você já faturou R$ 63.400 este ano (78 %).
No ritmo atual (R$ 260/dia) o teto chega em 14/11.
Opções:
[1] Segurar: mover R$ 9.800 de recarga/gás para comissão → sobra R$ 8.700 de folga
[2] Virar ME em janeiro (custo extra ≈ R$ 520/mês) e crescer sem limite
[3] Falar com o contador
```

## 7. Resumo do que foi definido para esta faixa

- **Teto:** R$ 81.000 (tolerância R$ 97.200); imposto fixo ≈ R$ 82–87/mês.
- **Cenários de subida:** 12 (crescimento, sazonalidade, novo canal, preço, revenda de
  baixa margem, 2º funcionário, sociedade, CNAE, filial, outras receitas, estouro
  ≤ 20 %, estouro > 20 %) — 4 deles **não dependem de receita**.
- **Cenários de descida:** só em janeiro, 6 condições, e só recomendado com projeção
  ≤ R$ 70.000.
- **Melhor economia:** usar o teto ao máximo (imposto marginal zero), converter
  revenda de baixa margem em comissão, classificar ICMS/ISS corretamente, não comprar
  estoque "para abater".
- **Não atingir o teto:** meta R$ 75.000; alavancas legais de mix, comissão, timing da
  entrega e devoluções; estouro ≤ 20 % é aceitável quando calculado; > 20 % nunca.
- **Linha vermelha:** o agente recusa qualquer estratégia de omissão de receita e
  não recomenda 2º CNPJ para o mesmo negócio.
