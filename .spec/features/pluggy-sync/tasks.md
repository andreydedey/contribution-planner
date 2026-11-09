# Tasks: Sincronizar a carteira com a Pluggy

> feature: pluggy-sync

<!--
  Status: pendente | em-andamento | concluida
    (atalho: `onp-spec tarefa <feature> <T-xxx> <status>`)

  Desenho (inline, feature média):
  - O ativo ganha a coluna pluggy_investment_id (única, opcional). Preenchida = ativo ligado à Pluggy (ASM-016).
  - POST /api/pluggy/sync busca as posições ativas (PluggyService, que já tira as encerradas), cria ou
    atualiza os ativos numa transação e responde {updated, created, missing, ignored} com códigos/nomes.
    Se a Pluggy falhar, a exceção sai antes de qualquer escrita (ASM-020): 502 ou 503 como no GET /positions.
  - O client monta os avisos a partir dessa resposta e refaz a consulta de ativos.
-->

## T-002 — Ligar o ativo a um investimento da Pluggy [em-andamento]
- Refs: US-007, AC-065
- Arquivos: server/src/main/resources/db/migration/V2__add_pluggy_investment_id_to_asset.sql, server/src/main/java/dev/andreydedey/contributionplanner/asset/Asset.java, server/src/main/java/dev/andreydedey/contributionplanner/asset/AssetDTO.java, server/src/main/java/dev/andreydedey/contributionplanner/asset/AssetMapper.java, server/src/main/java/dev/andreydedey/contributionplanner/asset/AssetRepository.java, server/src/test/java/dev/andreydedey/contributionplanner/asset/AssetApiTests.java
- Notas: o DTO expõe pluggyInvestmentId só para leitura; criar e editar ativo ignoram o campo.

## T-003 — Sincronizar os ativos com as posições da Pluggy no server [pendente]

- Refs: US-007, US-008, AC-057, AC-058, AC-059, AC-060, AC-061, AC-062, AC-063, AC-064, AC-066, AC-067
- Arquivos: server/src/main/java/dev/andreydedey/contributionplanner/pluggy/PluggySyncService.java, server/src/main/java/dev/andreydedey/contributionplanner/pluggy/PluggySyncResultDTO.java, server/src/main/java/dev/andreydedey/contributionplanner/pluggy/PluggyController.java, server/src/test/java/dev/andreydedey/contributionplanner/pluggy/PluggySyncApiTests.java
- Notas: depende de T-002. Classes: EQUITY/STOCK → Ações BR, FIXED_INCOME → Renda fixa (ASM-017); código da renda fixa sem código = nome cortado em 20 (ASM-018).

## T-004 — Contrato e mock da sincronização no client [pendente]

- Refs: US-007
- Arquivos: client/src/types/api.ts, client/src/testing/mocks/db.ts, client/src/testing/mocks/handlers.ts, client/src/hooks/use-assets.ts, client/src/hooks/use-pluggy-sync.ts
- Notas: o mock do MSW repete as regras do server, como já faz com ativos e metas.

## T-005 — Botão "Sincronizar com a Pluggy" e avisos na Carteira [pendente]

- Refs: US-007, US-008, AC-057, AC-058, AC-059, AC-060, AC-061, AC-062, AC-063, AC-064, AC-066, AC-067, AC-068
- Arquivos: client/src/components/pluggy-sync-card.tsx, client/src/pages/portfolio-page.tsx, client/src/pages/__tests__/pluggy-sync.test.tsx
- Notas: depende de T-004.

## T-006 — Marca "Pluggy" nos ativos sincronizados [pendente]

- Refs: US-007, AC-065
- Arquivos: client/src/components/asset-list.tsx, client/src/pages/__tests__/portfolio-page.test.tsx
- Notas: depende de T-004.
