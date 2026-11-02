# ADR-002: Hospedar o frontend na Vercel, o backend no Render e o banco no Neon

- **Data**: 2026-11-02
- **Status**: Proposed
- **Decidida por**: Andrey (pendente)
- **Tags**: infraestrutura, hospedagem, custo

## Contexto e problema

O contribution-planner tem frontend React, backend Java/Spring Boot e precisa de um Postgres. É um app pessoal com uma restrição dura de custo zero de hospedagem. Os planos grátis disponíveis têm limites de memória, sono por inatividade ou expiração de dados, e é preciso escolher uma combinação que funcione dentro deles.

## Motivadores

- Custo zero.
- Pouca manutenção de infraestrutura.
- Os dados do banco não podem expirar.

## Opções avaliadas

- React na Vercel, Spring Boot no plano grátis do Render e Postgres no plano grátis do Neon
- Uma VM Oracle Cloud Always Free com tudo dentro dela
- Postgres no plano grátis do Render, no lugar do Neon

## Decisão proposta

Opção proposta: **"Vercel + Render + Neon"**, porque cada parte fica num serviço gerenciado e gratuito, sem servidor para manter. A VM Oracle tem mais recursos, mas exige manutenção. O Postgres do Render foi descartado porque o banco expira em 30 dias no plano grátis.

### Consequências positivas

- Custo zero nas três camadas.
- Nenhum servidor para administrar.
- O banco no Neon não tem a expiração de 30 dias do Render.

### Consequências negativas

- O backend no Render tem 512 MB de memória, o que limita a JVM do Spring Boot.
- O backend dorme após 15 min sem acesso e leva cerca de 1 min para acordar, então o primeiro acesso depois de um tempo parado é lento.
- São três provedores diferentes, cada um com seu painel, suas variáveis de ambiente e seus limites de plano grátis, que podem mudar.

## Prós e contras das opções

### Vercel + Render + Neon ⏳ Proposta

- ✅ Gratuita e gerenciada
- ✅ Sem manutenção de servidor
- ❌ Backend com 512 MB e sono após 15 min (cerca de 1 min para acordar)
- ❌ Três provedores para configurar

### VM Oracle Cloud Always Free

- ✅ Gratuita, com 2 OCPU e 12 GB de memória desde junho de 2026
- ✅ Sem sono por inatividade
- ❌ Exige manutenção da VM (sistema, atualizações, banco, deploy)

### Postgres no plano grátis do Render

- ✅ Mesmo provedor do backend
- ❌ O banco expira em 30 dias no plano grátis

## Links

- [ADR-001: Usar a Pluggy via MeuPluggy para buscar as posições da carteira](001-usar-pluggy-via-meu-pluggy-para-posicoes.md)
