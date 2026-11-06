package dev.andreydedey.contributionplanner.pluggy;

import java.math.BigDecimal;

/** An investment as returned by Pluggy's {@code GET /investments}; only the fields the app uses. */
public record PluggyInvestment(
		String id,
		String itemId,
		String code,
		String name,
		String type,
		String subtype,
		String status,
		BigDecimal quantity,
		BigDecimal balance,
		String currencyCode) {

}
