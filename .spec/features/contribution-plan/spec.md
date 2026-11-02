# Spec: Plano de aporte

> feature: contribution-plan
> status: pronta

## Contexto

Todo mês o Andrey decide à mão onde vai o aporte, seguindo a regra do "Onde Aportar": primeiro a classe mais abaixo do alvo e, dentro dela, as duas ações mais abaixo do alvo, meio a meio, sem passar do alvo de nenhuma. A conta à mão é lenta e fácil de errar; o app faz a conta a partir da carteira cadastrada e do valor que ele quer investir.

## Histórias

### US-001 — Cadastrar os ativos da carteira

Como Andrey, quero cadastrar cada ativo com a classe e o valor atual, para que o cálculo use a minha carteira real.

#### AC-001 — Ativo cadastrado aparece na classe certa

- **Dado** que não existe o ativo WEGE3
- **Quando** eu salvo WEGE3 na classe Ações BR com valor R$ 1.000,00
- **Então** a lista mostra WEGE3 em Ações BR com R$ 1.000,00
- **E** o ativo continua na lista depois de recarregar a página

#### AC-002 — Valor editado aparece atualizado

- **Dado** o ativo WEGE3 cadastrado com R$ 1.000,00
- **Quando** eu altero o valor para R$ 1.500,00 e salvo
- **Então** a lista mostra WEGE3 com R$ 1.500,00

#### AC-003 — Ativo removido sai da lista e do cálculo

- **Dado** o ativo LREN3 cadastrado
- **Quando** eu removo LREN3 e confirmo a remoção
- **Então** LREN3 não aparece mais na lista
- **E** os próximos planos de aporte não consideram LREN3

#### AC-004 — Código vazio é recusado

- **Dado** o formulário de novo ativo
- **Quando** eu salvo sem preencher o código
- **Então** a tela avisa "Informe o código do ativo"
- **E** nada é salvo

#### AC-005 — Valor fora da faixa é recusado

- **Dado** o formulário de novo ativo
- **Quando** eu salvo com valor negativo ou acima de R$ 100.000.000,00
- **Então** a tela avisa "Valor deve estar entre R$ 0,00 e R$ 100.000.000,00"
- **E** nada é salvo

#### AC-006 — Código repetido é recusado

- **Dado** o ativo WEGE3 já cadastrado
- **Quando** eu tento salvar outro ativo com o código WEGE3
- **Então** a tela avisa "Ativo já cadastrado"

#### AC-007 — Só existem as quatro classes

- **Dado** o formulário de novo ativo
- **Quando** eu abro a escolha de classe
- **Então** as opções são exatamente Ações BR, Stocks, Renda fixa e Bitcoin
- **E** o servidor recusa qualquer outra classe (resposta 400)

#### AC-008 — Carteira vazia convida a cadastrar

- **Dado** que nenhum ativo está cadastrado
- **Quando** eu abro a carteira
- **Então** a tela mostra "Nenhum ativo cadastrado" com a opção de adicionar um

#### AC-009 — Falha ao salvar não perde o que foi digitado

- **Dado** o formulário preenchido
- **Quando** o servidor falha ao salvar
- **Então** a tela avisa "Não foi possível salvar. Tente novamente."
- **E** o formulário continua preenchido

### US-002 — Calcular onde vai o aporte

Como Andrey, quero digitar quanto vou investir e ver quanto vai para cada ativo, para que eu siga a regra sem fazer conta.

#### AC-010 — Patrimônio total inclui o aporte

- **Dado** ativos que somam R$ 27.000,00
- **Quando** eu peço o plano para um aporte de R$ 6.000,00
- **Então** o plano usa R$ 33.000,00 como patrimônio total

#### AC-011 — Tabela por classe com alvo, atual e diferença

- **Dado** uma carteira cadastrada
- **Quando** eu peço o plano
- **Então** o plano mostra, para cada classe, o valor-alvo (total × alvo da classe), o valor atual e a diferença em reais

#### AC-012 — O aporte vai para a classe mais atrasada

- **Dado** uma classe com a maior diferença positiva até o alvo
- **Quando** eu peço o plano
- **Então** o aporte é colocado nessa classe

#### AC-013 — Dentro da classe, meio a meio entre as duas mais atrasadas

- **Dado** uma classe com duas ou mais ações abaixo do alvo que recebe o aporte
- **Quando** eu peço o plano
- **Então** o valor é dividido meio a meio entre as duas ações com a maior diferença até o próprio alvo

#### AC-014 — Classe com um só ativo recebe tudo nele

- **Dado** uma classe com exatamente um ativo que recebe o aporte
- **Quando** eu peço o plano
- **Então** todo o valor da classe vai para esse ativo

#### AC-015 — Teto do alvo passa a sobra para a outra do par

- **Dado** que a metade de uma ação do par passa do que falta para o alvo dela
- **Quando** eu peço o plano
- **Então** essa ação recebe só o que falta para o alvo
- **E** o excesso vai para a outra ação do par

#### AC-016 — Par completo passa a sobra para a próxima ação

- **Dado** que as duas ações do par chegam ao alvo e ainda sobra valor
- **Quando** eu peço o plano
- **Então** a sobra vai para a próxima ação da classe com a maior diferença positiva

#### AC-017 — Quem está no alvo ou acima não recebe nada

- **Dado** uma classe ou ação com valor atual igual ou acima do alvo
- **Quando** eu peço o plano
- **Então** o plano mostra R$ 0,00 para ela

#### AC-018 — Nunca aloca mais que o aporte

- **Dado** qualquer carteira e qualquer aporte válido
- **Quando** eu peço o plano
- **Então** a soma dos valores alocados mais o valor não alocado é igual ao aporte

#### AC-019 — Lista do que comprar e do que sobrou

- **Dado** um plano calculado
- **Quando** o plano aparece na tela
- **Então** a tela lista cada ativo que recebe valor, com o valor em reais
- **E** mostra o total não alocado

#### AC-020 — Aporte fora da faixa é recusado

- **Dado** uma carteira cadastrada
- **Quando** eu peço o plano com aporte zero, negativo ou acima de R$ 1.000.000,00
- **Então** a tela avisa "Valor do aporte deve ser maior que R$ 0,00 e até R$ 1.000.000,00"

#### AC-021 — Sem ativos não dá para calcular

- **Dado** que nenhum ativo está cadastrado
- **Quando** eu abro a tela do plano
- **Então** o botão de calcular fica desabilitado
- **E** a tela mostra "Cadastre seus ativos para calcular o aporte"

#### AC-022 — Alvo de cada ativo é igual dentro da classe

- **Dado** uma classe com alvo de R$ 13.200,00 e 4 ativos
- **Quando** eu peço o plano
- **Então** cada ativo da classe tem alvo de R$ 3.300,00
- **E** esta regra é substituída pelos pesos da feature asset-weights

#### AC-023 — Centavos arredondados para baixo

- **Dado** que a divisão meio a meio gera fração de centavo
- **Quando** eu peço o plano
- **Então** cada valor é arredondado para baixo no centavo
- **E** o centavo que sobra vai para a primeira ação do par

#### AC-024 — Empate decidido pela ordem alfabética

- **Dado** duas ações empatadas na segunda maior diferença
- **Quando** eu peço o plano
- **Então** entra no par a ação cujo código vem primeiro na ordem alfabética

#### AC-025 — Classe atrasada sem ativos gera aviso e é pulada

- **Dado** que a classe com a maior diferença positiva não tem ativos cadastrados
- **Quando** eu peço o plano
- **Então** a tela avisa "A classe <classe> está abaixo do alvo e não tem ativos cadastrados"
- **E** o aporte vai para a próxima classe com a maior diferença positiva

#### AC-026 — Sobra da classe vai para a próxima classe

- **Dado** um aporte maior que a diferença da classe que o recebe
- **Quando** eu peço o plano
- **Então** o excesso vai para a próxima classe com a maior diferença positiva, seguindo a mesma regra

#### AC-027 — Exemplo do primeiro aporte

- **Dado** R$ 16.000,00 em Renda fixa, R$ 11.000,00 em Bitcoin, WEGE3, ITUB3, EGIE3 e LREN3 com R$ 0,00 e nenhuma stock
- **Quando** eu peço o plano para R$ 6.000,00
- **Então** o plano mostra R$ 3.000,00 para EGIE3 e R$ 3.000,00 para ITUB3

### US-003 — Confiar nos números da estratégia

Como Andrey, quero que o cálculo reproduza os exemplos da minha estratégia, para que eu confie nele.

#### AC-028 — Exemplo do teto entre duas ações

- **Dado** a ação A a R$ 1.500,00 do alvo e a ação B a R$ 3.000,00 do alvo, na classe que recebe o aporte
- **Quando** eu peço o plano para R$ 4.000,00
- **Então** o plano mostra R$ 1.500,00 para A e R$ 2.500,00 para B

#### AC-029 — Carteira zerada segue a mesma regra

- **Dado** todos os ativos com valor R$ 0,00
- **Quando** eu peço o plano
- **Então** a alocação segue a mesma regra, com o patrimônio total igual ao aporte

#### AC-030 — Aporte de um centavo vai inteiro para a primeira do par

- **Dado** um aporte de R$ 0,01 dividido entre duas ações
- **Quando** eu peço o plano
- **Então** a primeira ação do par recebe R$ 0,01

#### AC-031 — Nenhuma classe com ativos abaixo do alvo

- **Dado** que nenhuma classe com ativos está abaixo do alvo
- **Quando** eu peço o plano
- **Então** nada é alocado
- **E** a tela avisa "Nenhuma classe com ativos está abaixo do alvo"

## Fora de escopo

- Buscar posições na Pluggy (feature pluggy-sync, depois da primeira compra de ações).
- Cotações e quantidade de ações inteiras (precisa de fonte de preço).
- Histórico de aportes (feature separada, P2).
- Login (feature auth, no MVP).
- Pesos e quarentena (feature asset-weights).
- Editar os alvos das classes pelo app (ficam 40/30/20/10 no código).
- Vender ativos para rebalancear (o método nunca vende).
- Excluir reserva de emergência da renda fixa (basta não cadastrar a reserva).
- Relatório de imposto de renda.
- Recomendar quais ativos comprar (o app só calcula sobre as escolhas do Andrey).

## Suposições

| ID | Suposição | Status | Resolução |
|---|---|---|---|
| ASM-001 | Valores em reais com 2 casas; metades arredondadas para baixo e o centavo extra para a primeira do par | confirmada | Aprovado com a spec (usuário: "aprova elas") |
| ASM-002 | Empate na segunda maior diferença é decidido pela ordem alfabética do código | confirmada | Aprovado com a spec (usuário: "aprova elas") |
| ASM-003 | Alvos das classes: Ações BR 40%, Stocks 30%, Renda fixa 20%, Bitcoin 10% | confirmada | Alvos atuais da estratégia do Andrey |
| ASM-004 | Nesta feature os valores dos ativos são digitados em reais | confirmada | A integração com a Pluggy é a feature pluggy-sync |

## Perguntas em aberto

| ID | Pergunta | Status | Resposta |
|---|---|---|---|
| Q-001 | Se a classe mais atrasada não tem ativos (ex.: Stocks), o app avisa e pula para a próxima? | respondida | Sim (usuário: "1. sim") |
| Q-002 | Se o aporte passa do que falta na classe, a sobra vai para a próxima classe mais atrasada? | respondida | Sim (usuário: "2. sim") |
| Q-003 | Login no MVP como feature separada e histórico como P2? | respondida | Sim (usuário: "3. sim") |
| Q-004 | O alvo de cada ação dentro da classe é peso igual? | respondida | Pesos viram feature própria; aqui vale peso igual até lá (usuário: "4. o peso será uma feature também") |
