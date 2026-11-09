package dev.andreydedey.contributionplanner.asset;

import static org.assertj.core.api.Assertions.assertThat;

import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import dev.andreydedey.contributionplanner.ApiIntegrationTest;

class AssetApiTests extends ApiIntegrationTest {

	private static String asset(String code, String assetClass, long valueCents) {
		return """
				{"code": "%s", "assetClass": "%s", "valueCents": %d}""".formatted(code, assetClass, valueCents);
	}

	private long createAsset(String code, String assetClass, long valueCents) throws Exception {
		var result = post("/api/assets", asset(code, assetClass, valueCents));
		assertThat(result).hasStatus(HttpStatus.CREATED);
		return JsonPath.<Number>read(result.getResponse().getContentAsString(), "$.id").longValue();
	}

	@Test
	@DisplayName("AC-001: ativo cadastrado fica salvo na classe certa @spec:AC-001")
	void createdAssetIsPersisted() {
		assertThat(post("/api/assets", asset("  wege3 ", "BR_STOCKS", 100_000)))
				.hasStatus(HttpStatus.CREATED)
				.bodyJson()
				.isLenientlyEqualTo("""
						{"code": "WEGE3", "assetClass": "BR_STOCKS", "valueCents": 100000}""");

		assertThat(get("/api/assets"))
				.hasStatusOk()
				.bodyJson()
				.isLenientlyEqualTo("""
						{"content": [{"code": "WEGE3", "assetClass": "BR_STOCKS", "valueCents": 100000}], "totalElements": 1}""");
	}

	@Test
	@DisplayName("AC-002: valor editado fica salvo @spec:AC-002")
	void updatedValueIsPersisted() throws Exception {
		long id = createAsset("WEGE3", "BR_STOCKS", 100_000);

		assertThat(put("/api/assets/" + id, asset("WEGE3", "BR_STOCKS", 150_000))).hasStatusOk();

		assertThat(get("/api/assets")).bodyJson().extractingPath("$.content[0].valueCents").isEqualTo(150_000);
	}

	@Test
	@DisplayName("AC-003: ativo removido sai da lista @spec:AC-003")
	void deletedAssetLeavesTheList() throws Exception {
		long id = createAsset("LREN3", "BR_STOCKS", 0);

		assertThat(delete("/api/assets/" + id)).hasStatus(HttpStatus.NO_CONTENT);

		assertThat(get("/api/assets")).bodyJson().extractingPath("$.totalElements").isEqualTo(0);
		assertThat(delete("/api/assets/" + id)).hasStatus(HttpStatus.NOT_FOUND);
	}

	@Test
	@DisplayName("AC-004: código vazio é recusado @spec:AC-004")
	void blankCodeIsRejected() {
		assertThat(post("/api/assets", asset("  ", "BR_STOCKS", 0)))
				.hasStatus(HttpStatus.BAD_REQUEST)
				.bodyJson()
				.extractingPath("$.message").isEqualTo("Informe o código do ativo");
	}

	@Test
	@DisplayName("AC-005: valor fora da faixa é recusado @spec:AC-005")
	void valueOutOfRangeIsRejected() {
		var expected = "Valor deve estar entre R$ 0,00 e R$ 100.000.000,00";

		assertThat(post("/api/assets", asset("WEGE3", "BR_STOCKS", -1)))
				.hasStatus(HttpStatus.BAD_REQUEST).bodyJson().extractingPath("$.message").isEqualTo(expected);
		assertThat(post("/api/assets", asset("WEGE3", "BR_STOCKS", 10_000_000_001L)))
				.hasStatus(HttpStatus.BAD_REQUEST).bodyJson().extractingPath("$.message").isEqualTo(expected);
		assertThat(get("/api/assets")).bodyJson().extractingPath("$.totalElements").isEqualTo(0);
	}

	@Test
	@DisplayName("AC-006: código repetido é recusado @spec:AC-006")
	void duplicateCodeIsRejected() throws Exception {
		createAsset("WEGE3", "BR_STOCKS", 0);

		assertThat(post("/api/assets", asset("wege3", "BR_STOCKS", 10)))
				.hasStatus(HttpStatus.CONFLICT)
				.bodyJson()
				.extractingPath("$.message").isEqualTo("Ativo já cadastrado");
	}

	@Test
	@DisplayName("AC-007: o servidor recusa classe desconhecida @spec:AC-007")
	void unknownClassIsRejected() {
		assertThat(post("/api/assets", asset("VALE3", "FII", 0)))
				.hasStatus(HttpStatus.BAD_REQUEST)
				.bodyJson()
				.extractingPath("$.message").isEqualTo("Classe inválida");
	}

	@Test
	@DisplayName("AC-065: ativo digitado à mão não fica ligado à Pluggy @spec:AC-065")
	void handTypedAssetIsNotLinkedToPluggy() throws Exception {
		var body = """
				{"code": "BTC", "assetClass": "BITCOIN", "valueCents": 300000, "pluggyInvestmentId": "inv-1"}""";
		long id = JsonPath.<Number>read(post("/api/assets", body).getResponse().getContentAsString(), "$.id")
				.longValue();
		assertThat(put("/api/assets/" + id, body)).hasStatusOk();

		assertThat(get("/api/assets"))
				.bodyJson()
				.extractingPath("$.content[0].pluggyInvestmentId").isNull();
	}

	@Test
	@DisplayName("Editar para um código que já existe é recusado")
	void updatingToExistingCodeIsRejected() throws Exception {
		createAsset("WEGE3", "BR_STOCKS", 0);
		long id = createAsset("ITUB3", "BR_STOCKS", 0);

		assertThat(put("/api/assets/" + id, asset("WEGE3", "BR_STOCKS", 0))).hasStatus(HttpStatus.CONFLICT);
		assertThat(put("/api/assets/999999", asset("PETR3", "BR_STOCKS", 0))).hasStatus(HttpStatus.NOT_FOUND);
	}

	@Test
	@DisplayName("A lista de ativos é paginada e ordenada pelo código")
	void listIsPaginatedAndSortedByCode() throws Exception {
		createAsset("WEGE3", "BR_STOCKS", 0);
		createAsset("EGIE3", "BR_STOCKS", 0);
		createAsset("ITUB3", "BR_STOCKS", 0);

		assertThat(get("/api/assets?page=0&size=2"))
				.hasStatusOk()
				.bodyJson()
				.isLenientlyEqualTo("""
						{"content": [{"code": "EGIE3"}, {"code": "ITUB3"}],
						 "page": 0, "size": 2, "totalElements": 3, "totalPages": 2}""");
		assertThat(get("/api/assets?page=1&size=2"))
				.bodyJson()
				.isLenientlyEqualTo("""
						{"content": [{"code": "WEGE3"}], "page": 1}""");
	}

	@Test
	@DisplayName("A lista de ativos filtra por classe e por código")
	void listFiltersByClassAndCode() throws Exception {
		createAsset("WEGE3", "BR_STOCKS", 0);
		createAsset("BTC", "BITCOIN", 0);

		assertThat(get("/api/assets?assetClass=BITCOIN"))
				.bodyJson()
				.isLenientlyEqualTo("""
						{"content": [{"code": "BTC"}], "totalElements": 1}""");
		assertThat(get("/api/assets?code=weg"))
				.bodyJson()
				.isLenientlyEqualTo("""
						{"content": [{"code": "WEGE3"}], "totalElements": 1}""");
		assertThat(get("/api/assets?assetClass=FII")).hasStatus(HttpStatus.BAD_REQUEST);
	}

}
