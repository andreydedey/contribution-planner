# Spec: Pesos e quarentena

> feature: asset-weights
> status: pronta

## Contexto

Hoje toda ação de uma classe recebe a mesma parte do alvo. O Andrey quer dar mais peso às ações em que confia mais e colocar uma ação em quarentena quando perde a confiança nela: a ação fica na carteira, nunca é vendida e para de receber aportes até ele tirá-la da quarentena.

## Histórias

### US-004 — Dar peso relativo a uma ação

Como Andrey, quero dar um peso a cada ação, para que as ações em que confio mais fiquem com uma parte maior do alvo da classe.

#### AC-032 — Ação nova entra com peso 1

- **Dado** uma ação nova em Ações BR ou Stocks
- **Quando** eu a cadastro
- **Então** a lista mostra a ação com peso 1

#### AC-033 — Peso salvo aparece na lista

- **Dado** a ação WEGE3 com peso 1
- **Quando** eu salvo peso 2 para WEGE3
- **Então** a lista mostra WEGE3 com peso 2

#### AC-034 — Alvo segue o peso relativo

- **Dado** uma classe com alvo de R$ 9.000,00, WEGE3 com peso 2 e ITUB3 com peso 1
- **Quando** eu peço o plano
- **Então** o plano mostra alvo de R$ 6.000,00 para WEGE3 e R$ 3.000,00 para ITUB3

#### AC-035 — Peso fora da faixa é recusado

- **Dado** o campo de peso de uma ação
- **Quando** eu salvo um peso que não é número inteiro de 1 a 10
- **Então** a tela avisa "Peso deve ser um número inteiro de 1 a 10"

#### AC-036 — Peso só vale para ações

- **Dado** um ativo de Renda fixa ou Bitcoin
- **Quando** eu tento definir um peso para ele
- **Então** a tela avisa "Peso só vale para Ações BR e Stocks"

#### AC-037 — O plano usa os alvos com peso

- **Dado** ações com pesos diferentes na classe que recebe o aporte
- **Quando** eu peço o plano
- **Então** todas as regras do plano de aporte que usam o alvo da ação usam o alvo com peso

#### AC-038 — Proporção 10 para 1

- **Dado** uma ação com peso 10 e outra com peso 1 na mesma classe
- **Quando** eu peço o plano
- **Então** os alvos das duas ficam na proporção de 10 para 1

#### AC-039 — Remover uma ação redistribui os alvos

- **Dado** três ações com pesos na mesma classe
- **Quando** eu removo uma delas
- **Então** os alvos das outras duas são recalculados a partir dos pesos que sobraram

### US-005 — Colocar uma ação em quarentena

Como Andrey, quero colocar uma ação em quarentena, para que ela pare de receber aportes sem ser vendida.

#### AC-040 — Ação em quarentena é marcada na lista

- **Dado** a ação LREN3 ativa
- **Quando** eu coloco LREN3 em quarentena
- **Então** a lista mostra LREN3 como "Em quarentena"

#### AC-041 — Ação em quarentena tem alvo zero

- **Dado** a ação LREN3 em quarentena
- **Quando** eu peço o plano
- **Então** o plano mostra alvo de R$ 0,00 para LREN3

#### AC-042 — Ação em quarentena não recebe aporte

- **Dado** a ação LREN3 em quarentena
- **Quando** eu peço o plano
- **Então** o plano mostra R$ 0,00 para LREN3

#### AC-043 — Valor da ação em quarentena continua contando

- **Dado** LREN3 em quarentena com R$ 3.000,00
- **Quando** eu peço o plano
- **Então** os R$ 3.000,00 continuam somando no valor atual da classe e no patrimônio total

#### AC-044 — Sair da quarentena recalcula o alvo

- **Dado** a ação LREN3 em quarentena
- **Quando** eu tiro LREN3 da quarentena
- **Então** o alvo dela volta a ser calculado pelo peso

#### AC-045 — Peso é mantido durante a quarentena

- **Dado** LREN3 com peso 3 colocada em quarentena
- **Quando** eu tiro LREN3 da quarentena
- **Então** a lista mostra LREN3 com peso 3

#### AC-046 — Quarentena só vale para ações

- **Dado** um ativo de Renda fixa ou Bitcoin
- **Quando** eu tento colocá-lo em quarentena
- **Então** a tela avisa "Quarentena só vale para Ações BR e Stocks"

#### AC-047 — Classe toda em quarentena é pulada com aviso

- **Dado** que todas as ações da classe que receberia o aporte estão em quarentena
- **Quando** eu peço o plano
- **Então** a tela avisa "Todas as ações da classe <classe> estão em quarentena"
- **E** o aporte vai para a próxima classe com a maior diferença positiva

#### AC-048 — Quarentena nunca vende nem remove

- **Dado** a ação LREN3 em quarentena
- **Quando** eu peço o plano
- **Então** LREN3 continua na carteira com o mesmo valor
- **E** o plano não sugere venda

#### AC-049 — Única ação ativa recebe tudo até o alvo

- **Dado** uma classe em que só uma ação não está em quarentena
- **Quando** a classe recebe o aporte
- **Então** essa ação recebe todo o valor, sem passar do alvo dela

#### AC-050 — Exemplo com quarentena

- **Dado** uma classe com alvo de R$ 9.000,00, WEGE3 e ITUB3 com R$ 0,00 e LREN3 com R$ 3.000,00 em quarentena, todas com peso 1
- **Quando** eu peço o plano para R$ 2.000,00 nessa classe
- **Então** LREN3 recebe R$ 0,00
- **E** WEGE3 e ITUB3 recebem R$ 1.000,00 cada, com alvo de R$ 4.500,00

## Fora de escopo

- Peso ou quarentena para Renda fixa e Bitcoin.
- Vender uma ação em quarentena (o método nunca vende).
- Quarentena automática por queda de preço ou resultado (a decisão é do investidor).
- Lembretes para revisar ações em quarentena.
- Pesos para as classes (os alvos das classes ficam fixos).

## Suposições

| ID | Suposição | Status | Resolução |
|---|---|---|---|
| ASM-005 | Peso é número inteiro de 1 a 10 e ação nova entra com peso 1 | confirmada | Aprovado com a spec (usuário: "aprova elas") |
| ASM-006 | Classe com todas as ações em quarentena não recebe nada e o aporte vai para a próxima classe | confirmada | Aprovado com a spec (usuário: "aprova elas") |
| ASM-007 | Quarentena significa manter a ação, sem vender, e parar de aportar | confirmada | Definição do método Bastter (fórum bastter.com) |

## Perguntas em aberto

| ID | Pergunta | Status | Resposta |
|---|---|---|---|
| Q-005 | O peso é relativo ou percentual? | respondida | Relativo (usuário: "1. peso realtivo") |
| Q-006 | Peso e quarentena valem para quais classes? | respondida | Ações BR e Stocks (usuário: "2: vale para stocks também") |
| Q-007 | O valor da ação em quarentena continua contando na classe? | respondida | Sim (usuário: "3. continuar contando") |
