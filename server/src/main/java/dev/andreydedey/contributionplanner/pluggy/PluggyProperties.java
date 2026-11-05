package dev.andreydedey.contributionplanner.pluggy;

import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;
import org.springframework.util.StringUtils;

@ConfigurationProperties("pluggy")
public record PluggyProperties(
		@DefaultValue("https://api.pluggy.ai") String baseUrl,
		String clientId,
		String clientSecret,
		@DefaultValue List<String> itemIds) {

	public List<String> configuredItemIds() {
		return itemIds.stream().filter(StringUtils::hasText).map(String::strip).toList();
	}

	public boolean isConfigured() {
		return StringUtils.hasText(clientId) && StringUtils.hasText(clientSecret) && !configuredItemIds().isEmpty();
	}

}
