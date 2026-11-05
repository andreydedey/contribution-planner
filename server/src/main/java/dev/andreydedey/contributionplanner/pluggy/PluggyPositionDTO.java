package dev.andreydedey.contributionplanner.pluggy;

import java.math.BigDecimal;

public record PluggyPositionDTO(
		String id,
		String code,
		String name,
		String type,
		String subtype,
		BigDecimal quantity,
		long valueCents,
		String currencyCode) {

}
