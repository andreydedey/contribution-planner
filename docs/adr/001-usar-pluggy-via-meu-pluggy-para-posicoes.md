# ADR-001: Usar a Pluggy via MeuPluggy para buscar as posições da carteira

- **Data**: 2026-11-02
- **Status**: Accepted
- **Decidida por**: Andrey
- **Tags**: integração, dados, custo

## Contexto e problema

O contribution-planner calcula onde vai o aporte mensal pela regra "Onde Aportar", e para isso precisa do valor atual de cada ativo da carteira. Digitar esses valores todo mês dá trabalho e abre espaço para erro. As ações BR ficarão no Banco Inter, que está no Open Finance. O projeto tem uma restrição dura: custo zero de hospedagem e de APIs. Na feature contribution-plan os valores ainda são digitados (ASM-004). A busca automática fica para a feature pluggy-sync, que vem depois da primeira compra de ações.

## Motivadores

- Custo zero.
- Não digitar valores todo mês.
- Conectar o Banco Inter, onde ficarão as ações BR, via Open Finance.

## Opções avaliadas

- API da Pluggy com o conector MeuPluggy (id 200), do plano pessoal gratuito
- Conexão direta da Pluggy com as instituições (plano pago)
- Digitação manual dos valores

## Decisão

Opção escolhida: **"API da Pluggy com o conector MeuPluggy (id 200)"**, porque é a única que conecta o Inter sem digitação e sem custo. A conexão direta faz o mesmo, mas é paga. A digitação manual é gratuita, mas é o trabalho que se quer eliminar.

### Consequências positivas

- O Inter fica conectado sem digitação.
- Os dados são atualizados a cada 24h.
- Não há custo.
- Um spike descartável em 2026-11-02 confirmou que o item do Inter traz conta, cartão e investimentos.

### Consequências negativas

- Só serve para uso pessoal: no máximo 5 conexões do mesmo titular e nenhum uso comercial.
- A conta de teste do dashboard da Pluggy só conecta bancos via MeuPluggy.
- O formato dos dados de ações (código e quantidade) ainda não foi verificado, porque ainda não houve compra de ações. Isso precisa ser confirmado antes da feature pluggy-sync.
- O plano grátis pode mudar. A digitação manual continua como alternativa, e o bitcoin já será digitado manualmente.
- O Client Secret fica só no backend e nunca vai para o frontend nem para o repositório.
- O suporte é só pelo Discord da comunidade.

## Prós e contras das opções

### API da Pluggy via MeuPluggy ✅ Escolhida

- ✅ Gratuita
- ✅ Conecta o Inter via Open Finance, com atualização a cada 24h
- ❌ Restrita a uso pessoal (máx. 5 conexões do mesmo titular)
- ❌ Plano grátis sem garantia de continuidade; suporte só pela comunidade

### Conexão direta da Pluggy (paga)

- ✅ Sem as restrições do plano pessoal
- ❌ Paga, viola a restrição de custo zero

### Digitação manual

- ✅ Gratuita e sem dependência externa
- ❌ Trabalhosa todo mês
- ❌ Sujeita a erro de digitação

## Links

- https://www.pluggy.ai/meu-pluggy
- [Spec da feature contribution-plan](../../.spec/features/contribution-plan/spec.md)
