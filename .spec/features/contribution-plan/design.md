# Design: Plano de aporte

> feature: contribution-plan
> status: proposto (aguardando aprovação do Andrey)

## Stack

| Camada | Escolha |
|---|---|
| Backend | Java 25, Spring Boot 4, Maven (wrapper `mvnw`) |
| Banco | Postgres 17 local via Docker Compose; migrações com Flyway |
| Frontend | React + Vite + TypeScript |
| Testes backend | JUnit 5, Spring Boot Test, Testcontainers (Postgres) |
| Testes frontend | Vitest, React Testing Library, MSW (simula a API) |

Hospedagem fica fora deste design (ADR-002 está como Proposed). Em dev, o Vite faz proxy de `/api` para `localhost:8080`, então não há CORS local.

## Estrutura do repositório

```
backend/
  pom.xml, mvnw
  src/main/java/dev/andreydedey/contributionplanner/
    asset/            # cadastro de ativos (entidade, repositório, controller, validação)
    plan/             # endpoint do plano (controller + DTOs)
    plan/domain/      # cálculo puro, sem Spring
    common/           # tratamento de erro da API
  src/main/resources/db/migration/   # Flyway
  src/test/java/...
frontend/
  src/api/            # cliente HTTP tipado
  src/lib/money.ts    # centavos <-> "R$ 1.500,00"
  src/features/assets/  # tela Carteira
  src/features/plan/    # tela Plano
docker-compose.yml    # Postgres local
scripts/run-tests.mjs # roda os dois lados e gera a prova única para o motor
```

## Dinheiro

Todo valor trafega e é calculado em **centavos inteiros (`long` no Java, `number` inteiro no TS)**. Nada de `double`/`float` e nada de `BigDecimal`. A API usa campos `...Cents`. O frontend converte de e para o formato brasileiro só na borda (`money.ts`).

Alvos podem ter fração de centavo (ex.: R$ 10.000,00 ÷ 3 ativos). Eles são representados como fração de inteiros, sem arredondar:

- alvo da classe = `total × pct / 100`
- alvo do ativo = `total × pct / (100 × n)`, com `n` = ativos da classe (com pesos, na asset-weights: `total × pct × peso / (100 × somaDosPesos)`)
- quanto falta = `Math.floorDiv(total × pct − atual × 100 × n, 100 × n)`, já arredondado **para baixo** no centavo antes de virar teto de alocação (ASM-008). Assim nada passa do alvo por arredondamento.

A ordem de atraso compara os numeradores (dentro da classe o denominador é o mesmo para todos os ativos; entre classes é sempre 100), então é exata. Toda multiplicação usa `Math.multiplyExact`: o maior intermediário fica na casa de 10¹⁴, longe do limite do `long` (~9,2 × 10¹⁸), e um estouro vira exceção em vez de número errado. Essas contas ficam num helper do `plan/domain` com testes próprios.

## Modelo de dados

Tabela `asset`:

| coluna | tipo | regra |
|---|---|---|
| id | bigint identity | PK |
| code | varchar(20) | obrigatório, único, guardado sem espaços nas pontas e em maiúsculas (ASM-009) |
| asset_class | varchar(20) | `ACOES_BR`, `STOCKS`, `RENDA_FIXA`, `BITCOIN` (check constraint + enum Java) |
| value_cents | bigint | 0 a 10.000.000.000 (R$ 100.000.000,00) |

O plano **não é gravado** (histórico é feature separada). Os alvos das classes (40/30/20/10) ficam como constante no enum `AssetClass` (ASM-003).

## API

| Método | Caminho | Corpo / resposta | Erros |
|---|---|---|---|
| GET | `/api/assets` | `[{id, code, assetClass, valueCents}]` | — |
| POST | `/api/assets` | `{code, assetClass, valueCents}` → 201 + ativo | 400 validação, 409 código repetido |
| PUT | `/api/assets/{id}` | igual ao POST → 200 | 400, 404, 409 |
| DELETE | `/api/assets/{id}` | 204 | 404 |
| POST | `/api/plans` | `{contributionCents}` → plano (abaixo) | 400 aporte fora da faixa |

Erros saem como `{code, message}`, com `code` estável (`CODE_REQUIRED`, `VALUE_OUT_OF_RANGE`, `DUPLICATE_CODE`, `INVALID_CLASS`, `CONTRIBUTION_OUT_OF_RANGE`) e `message` com o texto da spec em português. Uma classe desconhecida no JSON vira 400 `INVALID_CLASS` (AC-007).

Resposta do plano:

```json
{
  "totalCents": 3300000,
  "classes": [
    {"assetClass": "ACOES_BR", "targetCents": 1320000, "currentCents": 0,
     "gapCents": 1320000, "allocatedCents": 600000}
  ],
  "allocations": [{"code": "EGIE3", "assetClass": "ACOES_BR", "amountCents": 300000}],
  "unallocatedCents": 0,
  "warnings": ["A classe Stocks está abaixo do alvo e não tem ativos cadastrados"]
}
```

## Validação

O frontend valida código vazio (AC-004) e faixa de valor (AC-005, AC-020) antes de enviar, com os textos da spec, para que "nada é salvo" valha sem ida ao servidor. O backend valida as mesmas regras de novo (Bean Validation), porque a API não confia no cliente. O código repetido (AC-006) só o servidor sabe: 409 → "Ativo já cadastrado".

## O cálculo (`plan/domain`)

Classe `ContributionPlanner`, pura, sem dependência de Spring nem de banco. Entrada: lista de ativos (código, classe, centavos), aporte em centavos e uma `AssetTargetPolicy`. Saída: o plano acima.

`AssetTargetPolicy` decide o alvo de cada ativo dentro da classe. Nesta feature a implementação é `EqualWeightPolicy`, com o alvo da classe ÷ número de ativos (AC-022). A feature asset-weights troca só essa peça.

Passo a passo:

1. `total = soma dos ativos + aporte` (AC-010, AC-029).
2. Para cada classe: `alvo = total × percentual`, `atual = soma dos ativos da classe`, `falta = alvo − atual` (AC-011).
3. `restante = aporte`. Percorre as classes com `falta > 0` em ordem decrescente de falta (AC-012):
   - classe sem ativos → adiciona o aviso e pula (AC-025);
   - `orçamento = min(restante, falta da classe arredondada para baixo)` (AC-026);
   - distribui o orçamento dentro da classe (abaixo) e desconta de `restante`.
4. Se nenhuma classe com ativos tem `falta > 0`, não aloca nada e avisa (AC-031).
5. `naoAlocado = restante`. Invariante: `soma das alocações + naoAlocado = aporte` (AC-018).

Distribuição dentro da classe:

1. Ordena os ativos com `falta > 0` por falta decrescente e, no empate, por código em ordem alfabética (AC-024). Quem tem `falta ≤ 0` recebe R$ 0,00 (AC-017).
2. Um só ativo elegível → recebe `min(orçamento, falta)` (AC-014).
3. Dois ou mais → o par são os dois primeiros. `metade = orçamento ÷ 2` arredondado para baixo; o primeiro do par recebe `metade + resto` (o centavo extra) e o segundo recebe `metade` (AC-013, AC-023, AC-030).
4. Teto: se um do par passa da própria falta, fica só com a falta e o excesso vai para o outro, também limitado à falta dele (AC-015, AC-028).
5. Se os dois chegam ao alvo e ainda sobra, a sobra vai para o próximo ativo da ordem, depois para o seguinte, até acabar a sobra ou os ativos (AC-016, Q-008). O que não couber volta para `restante` e segue para a próxima classe.

Conferência com o AC-027: total R$ 33.000,00, Ações BR com alvo R$ 13.200,00 e falta R$ 13.200,00, a maior. O orçamento é R$ 6.000,00. Os quatro ativos têm falta de R$ 3.300,00 cada, empatados, e pela ordem alfabética o par é EGIE3 + ITUB3, R$ 3.000,00 cada. ✓

## Telas

- **Carteira**: lista agrupada por classe, formulário de novo ativo e de edição (select com as 4 classes), remoção com diálogo de confirmação próprio (não `window.confirm`, para ser testável), estado vazio (AC-008) e erro de servidor mantendo o formulário preenchido (AC-009).
- **Plano**: campo de aporte, botão Calcular (desabilitado sem ativos, AC-021), tabela por classe (AC-011), lista do que comprar e do que não foi alocado (AC-019) e avisos (AC-025, AC-031).

## Como cada critério de aceite é provado

| Camada | Critérios de aceite |
|---|---|
| Unitário do cálculo (JUnit, sem Spring) | AC-010 a AC-018, AC-022 a AC-031 |
| Integração da API (Spring Boot + Testcontainers) | AC-001 (persistência), AC-003 (removido sai do plano), AC-005, AC-006, AC-007 (400), AC-020 |
| Frontend (Vitest + RTL + MSW) | AC-001, AC-002, AC-003, AC-004, AC-005, AC-006, AC-007, AC-008, AC-009, AC-019, AC-020, AC-021, AC-025, AC-031 |

O AC-018 é testado com várias carteiras e aportes gerados a partir de uma semente fixa (reproduzível), conferindo a invariante em todas.

## Integração com o motor da onp-spec-driven

O motor só lê `tap`, `vitest-json` ou `jest-json`, com **um** `testCommand`, e casa a tag `@spec:AC-xxx` no **título** do teste. Ele não lê JUnit XML, e o `scaffold` não gera Java. Proposta:

- Testes JUnit com `@DisplayName("AC-013: meio a meio entre as duas mais atrasadas @spec:AC-013")`. O Surefire é configurado para gravar o display name no XML.
- Testes Vitest com a tag no nome do `it(...)`.
- `scripts/run-tests.mjs` (Node, sem dependências) roda `mvnw test` e `vitest run --reporter=json`, converte os XMLs do Surefire para o formato `jest-json` (teste pulado vira `skipped`, que o motor não aceita como prova), junta com o JSON do Vitest e grava `.spec/verification/raw.json`. O script sai com erro se algum dos lados falhar.
- `onpspec.config.json` passa a ser:

```json
{
  "testCommand": "node scripts/run-tests.mjs",
  "reporter": "jest-json",
  "reporterOutputFile": ".spec/verification/raw.json",
  "testGlobs": ["backend/src/test/**", "frontend/src/**/*.test.ts", "frontend/src/**/*.test.tsx"],
  "srcGlobs": ["backend/src/main/**", "frontend/src/**"]
}
```

Os testes JUnit são escritos à mão, já que o scaffold não gera Java.

## Mudanças na constituição (aprovadas pelo usuário: "Aprovo as três"; aplicar junto com a aprovação do design)

A constituição atual verifica `src/**/*.js`, que não existe nesta stack. Proposta:

- **P-002** [RECOMENDADO] Segredos nunca em código: trocar o glob para `backend/src/main/**` e `frontend/src/**`.
- **P-003** [DEVE] Dinheiro só em centavos `long`: proibido `\b(double|float|Double|Float|BigDecimal)\b` em `backend/src/main/java/**/plan/**/*.java` e `backend/src/main/java/**/asset/**/*.java`.
- **P-004** [DEVE] O cálculo não depende de framework: proibido `import org\.springframework|import jakarta\.persistence` em `backend/src/main/java/**/plan/domain/**`.

## Suposições

| ID | Suposição | Status |
|---|---|---|
| ASM-008 | Alvos com fração de centavo ficam como fração de inteiros; o "quanto falta" é arredondado para baixo antes de virar teto | aberta |
| ASM-009 | O código do ativo é salvo sem espaços nas pontas e em maiúsculas; "wege3" e "WEGE3" são o mesmo ativo | aberta |
| ASM-010 | Pacote Java `dev.andreydedey.contributionplanner` e build com Maven | aberta |
| ASM-011 | Postgres 17 no Docker (para ficar compatível com o Neon depois) | aberta |
| ASM-012 | Enquanto não houver login, a API fica aberta e só roda local | aberta |

## Perguntas em aberto

| ID | Pergunta | Status |
|---|---|---|
| Q-008 | AC-016: quando o par chega ao alvo e sobra valor, a sobra vai inteira para o próximo ativo (um de cada vez, até acabar), ou forma um novo par meio a meio? | respondida: um de cada vez (usuário: "Uma de cada vez (literal)") |
