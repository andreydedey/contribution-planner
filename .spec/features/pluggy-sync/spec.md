# Spec: Sincronizar a carteira com a Pluggy

> feature: pluggy-sync
> status: rascunho

## Contexto

Hoje o Andrey digita todo mês o valor de cada ativo da carteira, olhando o app do Inter. A Pluggy já entrega as posições do Inter pelo MeuPluggy (ADR-001), com o valor atualizado a cada 24h. Esta feature troca a digitação por um botão na Carteira que busca as posições na Pluggy e atualiza os ativos. O bitcoin e o que não vem da Pluggy continuam digitados.

## Histórias

### US-007 — Atualizar a carteira com os valores da Pluggy

Como Andrey, quero apertar um botão na Carteira e ter os valores dos meus ativos atualizados pela Pluggy, para que eu não precise digitar valor nenhum antes de calcular o aporte.

#### AC-057 — Ativo já cadastrado recebe o valor da Pluggy

- **Dado** o ativo WEGE3 cadastrado em Ações BR com R$ 1.000,00
- **E** a Pluggy com WEGE3 valendo R$ 2.023,98
- **Quando** eu clico em "Sincronizar com a Pluggy"
- **Então** a lista mostra WEGE3 com R$ 2.023,98
- **E** a tela avisa "1 ativo atualizado"

#### AC-058 — Ação que só existe na Pluggy é cadastrada em Ações BR

- **Dado** que o ativo ITUB3 não está cadastrado
- **E** a Pluggy com a ação ITUB3 valendo R$ 2.104,66
- **Quando** eu sincronizo com a Pluggy
- **Então** a lista mostra ITUB3 em Ações BR com R$ 2.104,66
- **E** a tela avisa "1 ativo cadastrado"

#### AC-059 — Renda fixa que só existe na Pluggy é cadastrada em Renda fixa

- **Dado** a Pluggy com um CDB ativo valendo R$ 500,00
- **E** nenhum ativo ligado a esse CDB
- **Quando** eu sincronizo com a Pluggy
- **Então** a lista mostra o CDB em Renda fixa com R$ 500,00

#### AC-060 — Ativo digitado à mão não é alterado

- **Dado** o ativo BTC cadastrado em Bitcoin com R$ 3.000,00
- **E** a Pluggy sem nenhuma posição BTC
- **Quando** eu sincronizo com a Pluggy
- **Então** a lista mostra BTC com R$ 3.000,00
- **E** a tela não mostra aviso sobre BTC

#### AC-061 — Ativo que sumiu da Pluggy mantém o último valor, com aviso

- **Dado** o ativo LREN3 já sincronizado com R$ 1.986,00
- **E** a Pluggy sem LREN3 ativa (ausente ou encerrada)
- **Quando** eu sincronizo com a Pluggy
- **Então** a lista mostra LREN3 com R$ 1.986,00
- **E** a tela avisa "LREN3 não veio da Pluggy; o valor anterior foi mantido"

#### AC-062 — Tipo de investimento que a carteira não usa é ignorado, com aviso

- **Dado** a Pluggy com um fundo de investimento chamado "Fundo XYZ"
- **Quando** eu sincronizo com a Pluggy
- **Então** nenhum ativo é cadastrado para o fundo
- **E** a tela avisa "Fundo XYZ foi ignorado: tipo de investimento não usado na carteira"

#### AC-063 — Sincronizar de novo não duplica ativos

- **Dado** a carteira já sincronizada com WEGE3, ITUB3 e LREN3
- **Quando** eu sincronizo de novo e a Pluggy traz as mesmas posições
- **Então** a lista continua com um único WEGE3, um único ITUB3 e um único LREN3

#### AC-064 — Valor digitado à mão é substituído pelo da Pluggy

- **Dado** o ativo WEGE3 já sincronizado e editado à mão para R$ 500,00
- **E** a Pluggy com WEGE3 valendo R$ 2.023,98
- **Quando** eu sincronizo com a Pluggy
- **Então** a lista mostra WEGE3 com R$ 2.023,98

#### AC-065 — Ativo que vem da Pluggy é identificado na lista

- **Dado** WEGE3 sincronizado com a Pluggy e BTC digitado à mão
- **Quando** eu abro a Carteira
- **Então** a lista mostra a marca "Pluggy" em WEGE3
- **E** não mostra a marca em BTC

### US-008 — Saber quando a sincronização não deu certo

Como Andrey, quero ser avisado quando a sincronização falha, para que eu não calcule o aporte achando que os valores estão atualizados.

#### AC-066 — Falha na Pluggy não altera a carteira

- **Dado** o ativo WEGE3 cadastrado com R$ 1.000,00
- **Quando** eu sincronizo e a Pluggy não responde ou recusa o acesso
- **Então** a tela avisa "Não foi possível consultar a Pluggy. Tente novamente."
- **E** a lista mostra WEGE3 com R$ 1.000,00

#### AC-067 — Sem credenciais da Pluggy a tela avisa

- **Dado** o servidor sem as credenciais da Pluggy configuradas
- **Quando** eu sincronizo com a Pluggy
- **Então** a tela avisa "Integração com a Pluggy não configurada"
- **E** nenhum ativo é alterado

#### AC-068 — Botão fica bloqueado enquanto sincroniza

- **Dado** a Carteira aberta
- **Quando** eu clico em "Sincronizar com a Pluggy"
- **Então** o botão mostra "Sincronizando…" e fica desabilitado até a resposta chegar

## Fora de escopo

- Sincronizar sozinho, ao abrir a tela ou por agendamento (Q-011).
- Buscar bitcoin e stocks americanas na Pluggy: continuam digitados.
- Remover ou zerar ativo que sumiu da Pluggy (Q-013).
- Bloquear a edição manual de ativos sincronizados (Q-014).
- Guardar histórico de sincronizações ou mostrar a quantidade de ações.
- Peso e quarentena: a sincronização não lê nem altera esses campos quando eles existirem (feature asset-weights).

## Suposições

<!-- O que estamos ASSUMINDO sem confirmação. Status: aberta | confirmada | invalidada -->

| ID | Suposição | Status | Resolução |
|---|---|---|---|
| ASM-016 | O ativo fica ligado à Pluggy pelo id do investimento. Na primeira sincronização, um ativo já cadastrado com o mesmo código (ticker sem o "F", ex.: WEGE3) é ligado a ele em vez de criar outro | confirmada | Aprovada com a spec (usuário: "pode desenvolver") |
| ASM-017 | Ação da Pluggy (tipo EQUITY, subtipo STOCK) vai para Ações BR e renda fixa (FIXED_INCOME) vai para Renda fixa; os outros tipos (fundos, ETFs, FIIs, BDRs, previdência...) são ignorados com aviso | confirmada | Aprovada com a spec (usuário: "pode desenvolver") |
| ASM-018 | Renda fixa sem código na Pluggy usa o nome do investimento, cortado em 20 caracteres, como código do ativo | confirmada | Aprovada com a spec (usuário: "pode desenvolver") |
| ASM-019 | O valor usado é o saldo líquido da Pluggy (balance), em centavos, arredondado meio para cima | confirmada | Aprovada com a spec (usuário: "pode desenvolver") |
| ASM-020 | A sincronização é tudo ou nada: se a Pluggy falhar no meio, nenhum ativo é alterado | confirmada | Aprovada com a spec (usuário: "pode desenvolver") |

## Perguntas em aberto

<!-- O que ainda não sabemos. Status: aberta | respondida -->

| ID | Pergunta | Status | Resposta |
|---|---|---|---|
| Q-011 | Quando a carteira busca os valores da Pluggy? | respondida | Por um botão na Carteira (usuário: "Botão na Carteira") |
| Q-012 | O que fazer com um ativo que só existe na Pluggy? | respondida | Cadastrar sozinho na classe deduzida do tipo e avisar (usuário: "Cadastrar sozinho") |
| Q-013 | O que fazer com um ativo sincronizado que sumiu ou veio encerrado? | respondida | Manter o último valor e avisar (usuário: "Manter o último valor e avisar") |
| Q-014 | Ativo que vem da Pluggy pode ser editado à mão? | respondida | Pode; a próxima sincronização sobrescreve (usuário: "Pode, a sincronização sobrescreve") |
