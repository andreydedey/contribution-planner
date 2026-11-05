# ADR-004: Seguir Conventional Commits nas mensagens de commit

- **Data**: 2026-11-02
- **Status**: Accepted
- **Decidida por**: Andrey
- **Tags**: processo, git

## Contexto e problema

O projeto usa a onp-spec-driven, em que cada tarefa (T-xxx) vira um commit. Os commits são feitos tanto por pessoas quanto por agentes, e o histórico precisa dizer, de relance, o tipo da mudança e a qual feature e tarefa ela pertence. Sem um padrão, cada commit sai num formato diferente.

## Motivadores

- Histórico legível e filtrável por tipo de mudança.
- Rastreio de commit para tarefa da spec.
- Um padrão conhecido, que agentes e ferramentas já entendem.

## Opções avaliadas

- Conventional Commits, com a feature no escopo e a tarefa no início da descrição
- Formato padrão da onp-spec-driven (`T-xxx feature: título`)
- Sem padrão

## Decisão

Opção escolhida: **"Conventional Commits"** ([v1.0.0](https://www.conventionalcommits.org/pt-br/v1.0.0/)), no formato:

```
<tipo>(<escopo>): <descrição>

[corpo opcional]

[rodapés opcionais]
```

- **Tipos**: `feat`, `fix`, `test`, `refactor`, `docs`, `style`, `perf`, `build`, `ci`, `chore`. Mudança incompatível leva `!` após o tipo ou o rodapé `BREAKING CHANGE:`.
- **Escopo**: o nome da feature da spec (`contribution-plan`, `asset-weights`) ou a área (`adr`, `spec`, `client`, `server`, `infra`).
- **Descrição**: em português, no imperativo e em minúsculas. Em commit de tarefa, começa pelo código da tarefa.
- **Rodapé**: commits feitos com agente levam o `Co-Authored-By` do agente.

Exemplos:

```
feat(contribution-plan): T-003 calcular a divisão meio a meio do par
test(contribution-plan): T-002 cobrir o teto do alvo (AC-015, AC-028)
docs(adr): registrar a decisão de hospedagem
```

O formato padrão da onp-spec-driven já rastreia a tarefa, mas não diz o tipo da mudança. Colocar o código da tarefa no início da descrição mantém o rastreio dentro do Conventional Commits.

### Consequências positivas

- O tipo, a feature e a tarefa aparecem na primeira linha do commit.
- O histórico pode ser filtrado por tipo (`git log --grep "^feat"`) ou por tarefa (`git log --grep "T-003"`).
- O formato abre caminho para changelog automático no futuro.

### Consequências negativas

- O motor da onp-spec-driven gerava mensagens no formato `T-xxx feature: título`. Os modelos de mensagem foram adaptados na cópia local da skill (`scripts/lib/src/core/plano.js`, `SKILL.md`, `references/fluxo.md`). Se a skill for reinstalada ou atualizada, a adaptação se perde e precisa ser refeita. O motor não lê o histórico do git, então o formato não afeta o rastreio.
- Não há verificação automática (hook ou commitlint) por enquanto. O padrão depende de disciplina e de revisão.

## Prós e contras das opções

### Conventional Commits ✅ Escolhida

- ✅ Padrão amplamente conhecido, com tipo e escopo
- ✅ Mantém o código da tarefa na descrição
- ❌ Exige adaptar o modelo de mensagem do motor da onp-spec-driven

### Formato padrão da onp-spec-driven

- ✅ Já é o que o motor gera, sem adaptação
- ❌ Não diz o tipo da mudança
- ❌ Commits fora de tarefas ficam sem padrão

### Sem padrão

- ✅ Nenhum esforço
- ❌ Histórico inconsistente e difícil de filtrar

## Links

- https://www.conventionalcommits.org/pt-br/v1.0.0/
- [Skill onp-spec-driven](../../.claude/skills/onp-spec-driven/SKILL.md)
