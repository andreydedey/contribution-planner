package dev.andreydedey.contributionplanner.pluggy;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.List;

import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.assertj.MvcTestResult;

import dev.andreydedey.contributionplanner.ApiIntegrationTest;

class PluggySyncApiTests extends ApiIntegrationTest {

	@MockitoBean
	private PluggyService pluggyService;

	private static PluggyPositionDTO stock(String code, long valueCents) {
		return new PluggyPositionDTO("inv-" + code, code, code, "EQUITY", "STOCK", "ACTIVE", BigDecimal.TEN,
				valueCents, "BRL");
	}

	private long createAsset(String code, String assetClass, long valueCents) throws Exception {
		var body = """
				{"code": "%s", "assetClass": "%s", "valueCents": %d}""".formatted(code, assetClass, valueCents);
		return JsonPath.<Number>read(post("/api/assets", body).getResponse().getContentAsString(), "$.id")
				.longValue();
	}

	private void syncWith(PluggyPositionDTO... positions) {
		when(pluggyService.listPositions()).thenReturn(List.of(positions));
		assertThat(sync()).hasStatusOk();
	}

	private MvcTestResult sync() {
		return post("/api/pluggy/sync", "");
	}

	@Test
	@DisplayName("AC-057: ativo já cadastrado recebe o valor da Pluggy @spec:AC-057")
	void registeredAssetGetsThePluggyValue() throws Exception {
		createAsset("WEGE3", "BR_STOCKS", 100_000);
		when(pluggyService.listPositions()).thenReturn(List.of(stock("WEGE3", 202_398)));

		assertThat(sync())
				.hasStatusOk()
				.bodyJson()
				.isLenientlyEqualTo("""
						{"updated": ["WEGE3"], "created": [], "missing": [], "ignored": []}""");
		assertThat(get("/api/assets"))
				.bodyJson()
				.isLenientlyEqualTo("""
						{"content": [{"code": "WEGE3", "valueCents": 202398}], "totalElements": 1}""");
	}

	@Test
	@DisplayName("AC-058: ação que só existe na Pluggy é cadastrada em Ações BR @spec:AC-058")
	void stockOnlyInPluggyIsCreated() {
		when(pluggyService.listPositions()).thenReturn(List.of(stock("ITUB3", 210_466)));

		assertThat(sync()).bodyJson().extractingPath("$.created").isEqualTo(List.of("ITUB3"));
		assertThat(get("/api/assets"))
				.bodyJson()
				.isLenientlyEqualTo("""
						{"content": [{"code": "ITUB3", "assetClass": "BR_STOCKS", "valueCents": 210466}]}""");
	}

	@Test
	@DisplayName("AC-059: renda fixa que só existe na Pluggy é cadastrada em Renda fixa @spec:AC-059")
	void fixedIncomeOnlyInPluggyIsCreated() {
		syncWith(new PluggyPositionDTO("inv-cdb", null, "CDB - BANCO INTER S.A", "FIXED_INCOME", "CDB", "ACTIVE",
				BigDecimal.ONE, 50_000, "BRL"));

		assertThat(get("/api/assets"))
				.bodyJson()
				.isLenientlyEqualTo("""
						{"content": [{"code": "CDB - BANCO INTER S.", "assetClass": "FIXED_INCOME", "valueCents": 50000}]}""");
	}

	@Test
	@DisplayName("AC-060: ativo digitado à mão não é alterado @spec:AC-060")
	void handTypedAssetIsLeftAlone() throws Exception {
		createAsset("BTC", "BITCOIN", 300_000);
		when(pluggyService.listPositions()).thenReturn(List.of(stock("WEGE3", 202_398)));

		assertThat(sync()).bodyJson().extractingPath("$.missing").isEqualTo(List.of());
		assertThat(get("/api/assets?code=BTC")).bodyJson().extractingPath("$.content[0].valueCents").isEqualTo(300_000);
	}

	@Test
	@DisplayName("AC-061: ativo que sumiu da Pluggy mantém o último valor @spec:AC-061")
	void assetMissingFromPluggyKeepsItsValue() {
		syncWith(stock("LREN3", 198_600));
		when(pluggyService.listPositions()).thenReturn(List.of());

		assertThat(sync()).bodyJson().extractingPath("$.missing").isEqualTo(List.of("LREN3"));
		assertThat(get("/api/assets")).bodyJson().extractingPath("$.content[0].valueCents").isEqualTo(198_600);
	}

	@Test
	@DisplayName("AC-062: tipo de investimento que a carteira não usa é ignorado @spec:AC-062")
	void unusedInvestmentTypeIsIgnored() {
		when(pluggyService.listPositions()).thenReturn(List.of(new PluggyPositionDTO("inv-fund", null, "Fundo XYZ",
				"MUTUAL_FUND", "INVESTMENT_FUND", "ACTIVE", BigDecimal.ONE, 10_000, "BRL")));

		assertThat(sync()).bodyJson().extractingPath("$.ignored").isEqualTo(List.of("Fundo XYZ"));
		assertThat(get("/api/assets")).bodyJson().extractingPath("$.totalElements").isEqualTo(0);
	}

	@Test
	@DisplayName("AC-063: sincronizar de novo não duplica ativos @spec:AC-063")
	void syncingAgainDoesNotDuplicate() {
		syncWith(stock("WEGE3", 1), stock("ITUB3", 2), stock("LREN3", 3));
		syncWith(stock("WEGE3", 1), stock("ITUB3", 2), stock("LREN3", 3));

		assertThat(get("/api/assets")).bodyJson().extractingPath("$.totalElements").isEqualTo(3);
	}

	@Test
	@DisplayName("AC-064: valor digitado à mão é substituído pelo da Pluggy @spec:AC-064")
	void handEditedValueIsReplaced() throws Exception {
		syncWith(stock("WEGE3", 202_398));
		long id = JsonPath.<Number>read(get("/api/assets").getResponse().getContentAsString(), "$.content[0].id")
				.longValue();
		put("/api/assets/" + id, """
				{"code": "WEGE3", "assetClass": "BR_STOCKS", "valueCents": 50000}""");

		syncWith(stock("WEGE3", 202_398));

		assertThat(get("/api/assets")).bodyJson().extractingPath("$.content[0].valueCents").isEqualTo(202_398);
	}

	@Test
	@DisplayName("AC-065: ativo que vem da Pluggy fica ligado a ela @spec:AC-065")
	void syncedAssetIsLinkedToPluggy() {
		syncWith(stock("WEGE3", 202_398));

		assertThat(get("/api/assets"))
				.bodyJson()
				.extractingPath("$.content[0].pluggyInvestmentId").isEqualTo("inv-WEGE3");
	}

	@Test
	@DisplayName("Ativo ligado a outro investimento não é sobrescrito por um código igual")
	void codeLinkedToAnotherInvestmentIsNotOverwritten() {
		syncWith(stock("WEGE3", 100));
		when(pluggyService.listPositions()).thenReturn(List.of(stock("WEGE3", 100),
				new PluggyPositionDTO("inv-other", "WEGE3", "WEGE3", "EQUITY", "STOCK", "ACTIVE", BigDecimal.ONE, 999,
						"BRL")));

		assertThat(sync()).bodyJson().extractingPath("$.ignored").isEqualTo(List.of("WEGE3"));
		assertThat(get("/api/assets")).bodyJson().extractingPath("$.content[0].valueCents").isEqualTo(100);
	}

	@Test
	@DisplayName("AC-066: falha na Pluggy não altera a carteira @spec:AC-066")
	void pluggyFailureLeavesThePortfolioAlone() throws Exception {
		createAsset("WEGE3", "BR_STOCKS", 100_000);
		when(pluggyService.listPositions()).thenThrow(new PluggyUnavailableException(new RuntimeException("401")));

		assertThat(sync())
				.hasStatus(HttpStatus.BAD_GATEWAY)
				.bodyJson()
				.extractingPath("$.message").isEqualTo("Não foi possível consultar a Pluggy");
		assertThat(get("/api/assets")).bodyJson().extractingPath("$.content[0].valueCents").isEqualTo(100_000);
	}

	@Test
	@DisplayName("AC-067: sem credenciais da Pluggy o servidor avisa @spec:AC-067")
	void withoutCredentialsTheSyncSaysSo() {
		when(pluggyService.listPositions()).thenThrow(new PluggyNotConfiguredException());

		assertThat(sync())
				.hasStatus(HttpStatus.SERVICE_UNAVAILABLE)
				.bodyJson()
				.extractingPath("$.message").isEqualTo("Integração com a Pluggy não configurada");
	}

}
