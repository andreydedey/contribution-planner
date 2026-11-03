package dev.andreydedey.contributionplanner.classtarget;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import dev.andreydedey.contributionplanner.ApiIntegrationTest;

class ClassTargetApiTests extends ApiIntegrationTest {

	private static final String INITIAL_TARGETS = """
			[{"assetClass": "BR_STOCKS", "targetPercent": 40},
			 {"assetClass": "US_STOCKS", "targetPercent": 30},
			 {"assetClass": "FIXED_INCOME", "targetPercent": 20},
			 {"assetClass": "BITCOIN", "targetPercent": 10}]""";

	private static String targets(Object brStocks, Object usStocks, Object fixedIncome, Object bitcoin) {
		return """
				[{"assetClass": "BR_STOCKS", "targetPercent": %s},
				 {"assetClass": "US_STOCKS", "targetPercent": %s},
				 {"assetClass": "FIXED_INCOME", "targetPercent": %s},
				 {"assetClass": "BITCOIN", "targetPercent": %s}]""".formatted(brStocks, usStocks, fixedIncome, bitcoin);
	}

	@Test
	@DisplayName("AC-056: metas iniciais @spec:AC-056")
	void initialTargets() {
		assertThat(get("/api/class-targets")).hasStatusOk().bodyJson().isStrictlyEqualTo(INITIAL_TARGETS);
	}

	@Test
	@DisplayName("AC-051: metas salvas continuam salvas @spec:AC-051")
	void savedTargetsArePersisted() {
		String saved = targets(50, 20, 20, 10);

		assertThat(put("/api/class-targets", saved)).hasStatusOk().bodyJson().isStrictlyEqualTo(saved);

		assertThat(get("/api/class-targets")).bodyJson().isStrictlyEqualTo(saved);
	}

	@Test
	@DisplayName("AC-052: metas que não somam 100% são recusadas @spec:AC-052")
	void targetsNotSummingTo100AreRejected() {
		assertThat(put("/api/class-targets", targets(30, 30, 20, 10)))
				.hasStatus(HttpStatus.BAD_REQUEST)
				.bodyJson()
				.extractingPath("$.message").isEqualTo("As metas devem somar 100%");

		assertThat(get("/api/class-targets")).bodyJson().isStrictlyEqualTo(INITIAL_TARGETS);
	}

	@Test
	@DisplayName("AC-053: o servidor recusa meta fora da faixa @spec:AC-053")
	void targetOutOfRangeIsRejected() {
		var expected = "Meta deve ser um número inteiro de 0% a 100%";

		assertThat(put("/api/class-targets", targets(110, -10, 0, 0)))
				.hasStatus(HttpStatus.BAD_REQUEST).bodyJson().extractingPath("$.message").isEqualTo(expected);
		assertThat(put("/api/class-targets", targets(12.5, 37.5, 40, 10)))
				.hasStatus(HttpStatus.BAD_REQUEST).bodyJson().extractingPath("$.message").isEqualTo(expected);
		assertThat(get("/api/class-targets")).bodyJson().isStrictlyEqualTo(INITIAL_TARGETS);
	}

	@Test
	@DisplayName("Metas com classe faltando ou repetida são recusadas")
	void incompleteTargetsAreRejected() {
		String repeated = """
				[{"assetClass": "BR_STOCKS", "targetPercent": 50},
				 {"assetClass": "BR_STOCKS", "targetPercent": 20},
				 {"assetClass": "FIXED_INCOME", "targetPercent": 20},
				 {"assetClass": "BITCOIN", "targetPercent": 10}]""";
		String missing = """
				[{"assetClass": "BR_STOCKS", "targetPercent": 70},
				 {"assetClass": "FIXED_INCOME", "targetPercent": 20},
				 {"assetClass": "BITCOIN", "targetPercent": 10}]""";

		assertThat(put("/api/class-targets", repeated))
				.hasStatus(HttpStatus.BAD_REQUEST).bodyJson().extractingPath("$.message").isEqualTo("Informe uma meta para cada uma das quatro classes");
		assertThat(put("/api/class-targets", missing))
				.hasStatus(HttpStatus.BAD_REQUEST).bodyJson().extractingPath("$.message").isEqualTo("Informe uma meta para cada uma das quatro classes");
	}

}
