package dev.andreydedey.contributionplanner.pluggy;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Assertions.tuple;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.List;

import org.junit.jupiter.api.Test;

class PluggyServiceTests {

	private final PluggyClient client = mock(PluggyClient.class);

	private static PluggyProperties properties(String clientId, String clientSecret, List<String> itemIds) {
		return new PluggyProperties("https://api.pluggy.ai", clientId, clientSecret, itemIds);
	}

	private static PluggyInvestment investment(String itemId, String code, String type, String balance) {
		return investment(itemId, code, type, "ACTIVE", balance);
	}

	private static PluggyInvestment investment(String itemId, String code, String type, String status,
			String balance) {
		return new PluggyInvestment("inv-" + code, itemId, code, code + " ON", type, "STOCK", status, BigDecimal.TEN,
				new BigDecimal(balance), "BRL");
	}

	@Test
	void joinsTheItemsAndConvertsTheBalanceToCents() {
		when(client.listInvestments("item-1")).thenReturn(List.of(investment("item-1", "WEGE3", "EQUITY", "1234.567")));
		when(client.listInvestments("item-2")).thenReturn(List.of(investment("item-2", "TD", "FIXED_INCOME", "500")));
		var service = new PluggyService(client, properties("id", "secret", List.of("item-1", " item-2 ")));

		assertThat(service.listPositions())
				.extracting(PluggyPositionDTO::code, PluggyPositionDTO::valueCents)
				.containsExactly(tuple("WEGE3", 123457L), tuple("TD", 50000L));
	}

	@Test
	void leavesOutClosedPositions() {
		when(client.listInvestments("item-1")).thenReturn(List.of(
				investment("item-1", "WEGE3", "EQUITY", "ACTIVE", "100"),
				investment("item-1", "ITUB3", "EQUITY", "TOTAL_WITHDRAWAL", "0")));
		var service = new PluggyService(client, properties("id", "secret", List.of("item-1")));

		assertThat(service.listPositions()).extracting(PluggyPositionDTO::code).containsExactly("WEGE3");
	}

	@Test
	void withoutCredentialsItDoesNotCallPluggy() {
		var service = new PluggyService(client, properties("", "secret", List.of("item-1")));

		assertThatThrownBy(service::listPositions)
				.isInstanceOf(PluggyNotConfiguredException.class)
				.hasMessage("Integração com a Pluggy não configurada");
		verifyNoInteractions(client);
	}

	@Test
	void withoutItemsItIsNotConfigured() {
		assertThat(properties("id", "secret", List.of()).isConfigured()).isFalse();
		assertThat(properties("id", "secret", List.of("")).isConfigured()).isFalse();
	}

}
