# ADR-003: Usar shadcn/ui no frontend, com as telas desenhadas no Pencil

- **Data**: 2026-11-02
- **Status**: Accepted
- **Decidida por**: Andrey
- **Tags**: frontend, design, ui

## Contexto e problema

O frontend é React + Vite + TypeScript e o app precisa ser bonito, com uma paleta que faça sentido para um app de investimento de longo prazo. São poucas telas (Carteira e Plano, na feature contribution-plan) e uma pessoa decidindo. É preciso escolher a base de componentes e onde o visual é desenhado antes de virar código, sem criar duas fontes da verdade.

## Motivadores

- Visual bonito e coerente, com paleta própria e modo escuro.
- O que é aprovado no desenho é o que vai para o código, sem tradução manual.
- Código dos componentes sob controle do projeto.
- Custo zero.

## Opções avaliadas

- shadcn/ui no código, com as telas desenhadas no Pencil usando componentes equivalentes
- Claude Design para o visual, copiado depois para o Pencil
- shadcn/ui direto no código, sem desenho prévio

## Decisão

Opção escolhida: **"shadcn/ui no código, com as telas desenhadas no Pencil"**. O shadcn já tem os componentes de que as telas precisam (tabela, formulário, select, diálogo, card, alerta), e o código deles fica no repositório. A paleta é um conjunto de variáveis CSS do tema, então definir ou trocar a identidade visual é editar essas variáveis. O arquivo do Pencil fica no projeto, ao lado do código, e o agente consegue ler e editar esse arquivo. Desenhar com componentes equivalentes aos do shadcn deixa o desenho e o código falando a mesma língua.

### Consequências positivas

- Uma só fonte da verdade visual, versionada no projeto.
- A paleta vira variáveis do tema shadcn, com modo claro e escuro.
- Os estados que a spec exige (vazio, erro, aviso) são desenhados antes de virar código.

### Consequências negativas

- Ainda é preciso verificar quais kits de componentes o Pencil oferece e o quanto eles batem com o shadcn. Se não baterem, o desenho vira referência visual e os componentes são ajustados no código.
- O shadcn depende de Tailwind, que entra na stack do frontend.
- Os componentes copiados do shadcn não se atualizam sozinhos. Atualizar é trabalho manual.
- A paleta ainda não está definida. Ela será escolhida entre propostas e registrada na seção "Telas" do design de cada feature.

## Prós e contras das opções

### shadcn/ui + Pencil ✅ Escolhida

- ✅ Desenho e código com os mesmos componentes
- ✅ Design versionado junto do código e editável pelo agente
- ❌ Depende da cobertura dos kits do Pencil (a verificar)

### Claude Design → Pencil

- ✅ Bom para explorar visuais rapidamente
- ❌ Copiar para o Pencil é refazer à mão
- ❌ Duas fontes da verdade que divergem no primeiro ajuste

### shadcn/ui direto, sem desenho

- ✅ Menos etapas
- ❌ O visual é decidido no código, com mais retrabalho para ajustar paleta e layout

## Links

- https://ui.shadcn.com
- [Design da feature contribution-plan](../../.spec/features/contribution-plan/design.md)
