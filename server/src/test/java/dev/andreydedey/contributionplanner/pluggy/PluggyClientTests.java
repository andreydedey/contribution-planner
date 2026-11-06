package dev.andreydedey.contributionplanner.pluggy;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.hamcrest.Matchers.allOf;
import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.client.ExpectedCount.once;
import static org.springframework.test.web.client.ExpectedCount.times;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.jsonPath;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

import java.math.BigDecimal;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.restclient.test.autoconfigure.RestClientTest;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.annotation.DirtiesContext.ClassMode;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.client.MockRestServiceServer;

@RestClientTest(PluggyClient.class)
@TestPropertySource(properties = {
		"pluggy.client-id=client-id",
		"pluggy.client-secret=client-secret",
		"pluggy.item-ids=item-1" })
// Each test gets a new client, so the API key cached by one test does not leak into the next.
@DirtiesContext(classMode = ClassMode.AFTER_EACH_TEST_METHOD)
class PluggyClientTests {

	private static final String BASE_URL = "https://api.pluggy.ai";

	@Autowired
	private PluggyClient client;

	@Autowired
	private MockRestServiceServer server;

	private static String investmentsPage(int page, int totalPages, String code) {
		return """
				{"page": %d, "total": %d, "totalPages": %d, "results": [
				  {"id": "inv-%s", "itemId": "item-1", "code": "%s", "name": "%s ON", "type": "EQUITY",
				   "subtype": "STOCK", "quantity": 10, "balance": 1234.56, "currencyCode": "BRL",
				   "status": "ACTIVE"}]}""".formatted(page, totalPages, totalPages, code, code, code);
	}

	private void expectAuth() {
		server.expect(once(), requestTo(BASE_URL + "/auth"))
				.andExpect(method(HttpMethod.POST))
				.andExpect(jsonPath("$.clientId").value("client-id"))
				.andExpect(jsonPath("$.clientSecret").value("client-secret"))
				.andRespond(withSuccess("{\"apiKey\": \"api-key\"}", MediaType.APPLICATION_JSON));
	}

	@Test
	void readsInvestmentsWithTheApiKey() {
		expectAuth();
		server.expect(requestTo(allOf(containsString("/investments?"), containsString("itemId=item-1"),
				containsString("page=1"))))
				.andExpect(method(HttpMethod.GET))
				.andExpect(header("X-API-KEY", "api-key"))
				.andRespond(withSuccess(investmentsPage(1, 1, "WEGE3"), MediaType.APPLICATION_JSON));

		assertThat(client.listInvestments("item-1")).singleElement().satisfies(investment -> {
			assertThat(investment.code()).isEqualTo("WEGE3");
			assertThat(investment.type()).isEqualTo("EQUITY");
			assertThat(investment.subtype()).isEqualTo("STOCK");
			assertThat(investment.balance()).isEqualByComparingTo(new BigDecimal("1234.56"));
		});
		server.verify();
	}

	@Test
	void readsEveryPage() {
		expectAuth();
		server.expect(requestTo(containsString("page=1")))
				.andRespond(withSuccess(investmentsPage(1, 2, "WEGE3"), MediaType.APPLICATION_JSON));
		server.expect(requestTo(containsString("page=2")))
				.andRespond(withSuccess(investmentsPage(2, 2, "ITUB3"), MediaType.APPLICATION_JSON));

		assertThat(client.listInvestments("item-1")).extracting(PluggyInvestment::code)
				.containsExactly("WEGE3", "ITUB3");
		server.verify();
	}

	@Test
	void reusesTheApiKeyAcrossRequests() {
		expectAuth();
		server.expect(times(2), requestTo(containsString("/investments?")))
				.andExpect(header("X-API-KEY", "api-key"))
				.andRespond(withSuccess(investmentsPage(1, 1, "WEGE3"), MediaType.APPLICATION_JSON));

		client.listInvestments("item-1");
		client.listInvestments("item-1");

		server.verify();
	}

	@Test
	void pluggyFailureBecomesUnavailable() {
		server.expect(requestTo(BASE_URL + "/auth")).andRespond(withStatus(HttpStatus.UNAUTHORIZED));

		assertThatThrownBy(() -> client.listInvestments("item-1"))
				.isInstanceOf(PluggyUnavailableException.class)
				.hasMessage("Não foi possível consultar a Pluggy");
	}

}
