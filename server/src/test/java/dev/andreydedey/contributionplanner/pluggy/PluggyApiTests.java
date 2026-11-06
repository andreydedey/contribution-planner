package dev.andreydedey.contributionplanner.pluggy;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import dev.andreydedey.contributionplanner.ApiIntegrationTest;

class PluggyApiTests extends ApiIntegrationTest {

	@Test
	void withoutCredentialsTheEndpointSaysSo() {
		assertThat(get("/api/pluggy/positions"))
				.hasStatus(HttpStatus.SERVICE_UNAVAILABLE)
				.bodyJson()
				.extractingPath("$.message").isEqualTo("Integração com a Pluggy não configurada");
	}

}
