# contribution-planner

An app that works out where each monthly investment contribution should go, following the "Onde Aportar" ("where to invest") rule: the money goes to the asset class furthest below its target and, within that class, is split half and half between the two stocks furthest below their own targets, never pushing any of them past its target.

> **Status:** in design. The specs are written and the screens are drawn; the application code has not been written yet.

The UI and the specs are in Portuguese (pt-BR), and amounts are in Brazilian reais (R$).

## Screens

**Contribution plan** (*Plano de aporte*): enter the amount to invest and see what to buy.

![Contribution plan screen](docs/images/plano-de-aporte.png)

**Portfolio** (*Carteira*): register the assets, grouped by class.

![Portfolio screen](docs/images/carteira.png)

The design lives in [`design/contribution-planner.pen`](design/contribution-planner.pen) (made in Pencil). The images above are exported from it.

## How the calculation works

The portfolio has four asset classes: Brazilian stocks, US stocks, fixed income and Bitcoin. Each class has a target percentage set in the app (for example 50%, 20%, 20% and 10%), and the targets must add up to 100%.

1. Total wealth is the sum of all assets plus the contribution.
2. The contribution goes to the class with the largest gap to its target. Anything left over moves on to the next class.
3. Within the class, the amount is split half and half between the two stocks furthest below their own targets. No stock goes past its target; the excess goes to the other stock in the pair, then to the next ones.
4. The method never sells: anything at or above its target receives nothing.

## Stack

| Layer | Technology |
|---|---|
| Backend | Java 25, Spring Boot 4, Maven, Flyway |
| Database | PostgreSQL 17 (Docker for local development) |
| Frontend | React, Vite, TypeScript, shadcn/ui, Onest font |

Money is always stored as integer cents (`long`), never as floating point.

## Disclaimer

Not investment advice.
