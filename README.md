# contribution-planner

An app that works out where each monthly investment contribution should go, following the "Onde Aportar" ("where to invest") rule: the money goes to the asset class furthest below its target and, within that class, is split half and half between the two stocks furthest below their own targets, never pushing any of them past its target.

> **Status:** early development. The specs are written, the screens are drawn and the server and client skeletons are in place; the features have not been built yet.

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
| Server | Java 25, Spring Boot 4, Maven, Flyway |
| Database | PostgreSQL 17 (Docker for local development) |
| Client | React, Vite, TypeScript, shadcn/ui, Onest font, Bun |

Money is always stored as integer cents (`long`), never as floating point.

## Running locally

Requirements: Java 25, Bun and Docker.

```sh
# Server on http://localhost:8080, with PostgreSQL 17 in Docker on port 5433
# (set DB_PORT to change it; variables in a .env file at the root are loaded)
./run

# Client on http://localhost:5173 (proxies /api to the server)
cd client && bun install && bun run dev
```

To work on the client without the server, run `bun run dev:mock`: the API is mocked in the browser with MSW, starting from the example portfolio in the specs. In `client/`, `bun run test` runs the tests and `bun run lint` runs Biome.

The server tests start their own PostgreSQL with Testcontainers (`./mvnw verify`). With Colima instead of Docker Desktop, point Testcontainers at its socket first:

```sh
export DOCKER_HOST=unix://$HOME/.colima/default/docker.sock
export TESTCONTAINERS_DOCKER_SOCKET_OVERRIDE=/var/run/docker.sock
```

## Disclaimer

Not investment advice.
