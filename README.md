# contribution-planner

App pessoal que calcula onde vai o aporte mensal de uma carteira de investimentos, seguindo a regra "Onde Aportar": o aporte vai para a classe de ativos mais abaixo do alvo e, dentro dela, para as duas ações mais atrasadas, meio a meio, sem passar do alvo de nenhuma.

> **Status:** em design. As specs estão aprovadas e as telas estão desenhadas; o código da aplicação ainda não foi escrito.

## Telas

**Plano de aporte**: digite quanto vai investir e veja o que comprar.

![Tela Plano de aporte](docs/images/plano-de-aporte.png)

**Carteira**: cadastro dos ativos, agrupados por classe.

![Tela Carteira](docs/images/carteira.png)

O desenho fica em [`design/contribution-planner.pen`](design/contribution-planner.pen) (feito no Pencil). As imagens acima são exportadas dele.

## Como o cálculo funciona

A carteira tem quatro classes com alvos fixos: Ações BR 40%, Stocks 30%, Renda fixa 20% e Bitcoin 10%.

1. O patrimônio total é a soma dos ativos mais o aporte.
2. O aporte vai para a classe com a maior diferença até o alvo. Se sobrar, segue para a próxima.
3. Dentro da classe, o valor é dividido meio a meio entre as duas ações mais abaixo do próprio alvo. Nenhuma ação passa do alvo; o excesso vai para a outra do par e depois para as próximas.
4. O método nunca vende: quem está no alvo ou acima dele não recebe nada.

Todas as regras, com exemplos verificáveis, estão nas specs:

- [Plano de aporte](.spec/features/contribution-plan/spec.md) e o [design técnico](.spec/features/contribution-plan/design.md)
- [Pesos e quarentena](.spec/features/asset-weights/spec.md) (próxima feature)

## Stack

| Camada | Tecnologia |
|---|---|
| Backend | Java 25, Spring Boot 4, Maven, Flyway |
| Banco | PostgreSQL 17 (Docker no desenvolvimento) |
| Frontend | React, Vite, TypeScript, shadcn/ui, fonte Onest |
| Posições da carteira | API da Pluggy via MeuPluggy (planejado) |

Restrição do projeto: custo zero de hospedagem e de APIs. Valores em dinheiro são sempre centavos inteiros (`long`), nunca ponto flutuante.

## Decisões de arquitetura

| ADR | Decisão | Status |
|---|---|---|
| [001](docs/adr/001-usar-pluggy-via-meu-pluggy-para-posicoes.md) | Buscar as posições pela Pluggy via MeuPluggy | Accepted |
| [002](docs/adr/002-hospedar-em-vercel-render-e-neon.md) | Hospedar em Vercel, Render e Neon | Proposed |
| [003](docs/adr/003-usar-shadcn-ui-com-telas-desenhadas-no-pencil.md) | shadcn/ui no código, telas desenhadas no Pencil | Accepted |
| [004](docs/adr/004-seguir-conventional-commits.md) | Commits no padrão Conventional Commits | Accepted |

## Como o projeto é desenvolvido

- **Spec-driven:** cada feature tem uma spec com histórias e critérios de aceite. Todo critério vira um teste anotado com `@spec:AC-xxx`, e uma feature só fecha quando a auditoria mecânica da skill [onp-spec-driven](.claude/skills/onp-spec-driven/SKILL.md) sai limpa.
- **Constituição:** princípios verificáveis do projeto em [`.spec/constituicao.md`](.spec/constituicao.md).
- **Commits:** [Conventional Commits](https://www.conventionalcommits.org/pt-br/v1.0.0/), com a feature no escopo e a tarefa na descrição, por exemplo `feat(contribution-plan): T-003 calcular a divisão meio a meio do par`.

## Aviso

Projeto pessoal e de estudo. Não é recomendação de investimento.
