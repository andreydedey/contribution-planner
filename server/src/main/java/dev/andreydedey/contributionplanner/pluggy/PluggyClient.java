package dev.andreydedey.contributionplanner.pluggy;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Component
@EnableConfigurationProperties(PluggyProperties.class)
public class PluggyClient {

	// Pluggy API keys last 2 hours; renew a little earlier so a request never goes out with an expired key.
	private static final Duration API_KEY_LIFETIME = Duration.ofMinutes(110);
	private static final int PAGE_SIZE = 500;
	private static final ParameterizedTypeReference<PluggyPage<PluggyInvestment>> INVESTMENT_PAGE =
			new ParameterizedTypeReference<>() {
			};

	private final RestClient restClient;
	private final PluggyProperties properties;

	private String apiKey;
	private Instant apiKeyExpiresAt = Instant.MIN;

	public PluggyClient(RestClient.Builder builder, PluggyProperties properties) {
		this.restClient = builder.baseUrl(properties.baseUrl()).build();
		this.properties = properties;
	}

	public List<PluggyInvestment> listInvestments(String itemId) {
		List<PluggyInvestment> investments = new ArrayList<>();
		int page = 1;
		PluggyPage<PluggyInvestment> response;
		do {
			response = get("/investments?itemId={itemId}&page={page}&pageSize={pageSize}", INVESTMENT_PAGE,
					itemId, page++, PAGE_SIZE);
			investments.addAll(response.results());
		} while (response.page() < response.totalPages());
		return investments;
	}

	private <T> T get(String uri, ParameterizedTypeReference<T> type, Object... uriVariables) {
		try {
			return restClient.get()
					.uri(uri, uriVariables)
					.header("X-API-KEY", apiKey())
					.retrieve()
					.body(type);
		}
		catch (RestClientException ex) {
			throw new PluggyUnavailableException(ex);
		}
	}

	private synchronized String apiKey() {
		if (Instant.now().isBefore(apiKeyExpiresAt)) {
			return apiKey;
		}
		try {
			AuthResponse response = restClient.post()
					.uri("/auth")
					.contentType(MediaType.APPLICATION_JSON)
					.body(Map.of("clientId", properties.clientId(), "clientSecret", properties.clientSecret()))
					.retrieve()
					.body(AuthResponse.class);
			apiKey = response.apiKey();
			apiKeyExpiresAt = Instant.now().plus(API_KEY_LIFETIME);
			return apiKey;
		}
		catch (RestClientException ex) {
			throw new PluggyUnavailableException(ex);
		}
	}

	private record AuthResponse(String apiKey) {

	}

}
