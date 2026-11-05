package dev.andreydedey.contributionplanner.pluggy;

import java.math.BigDecimal;
import java.math.RoundingMode;

public final class PluggyPositionMapper {

	private PluggyPositionMapper() {
	}

	public static PluggyPositionDTO toDTO(PluggyInvestment investment) {
		return new PluggyPositionDTO(investment.id(), investment.code(), investment.name(), investment.type(),
				investment.subtype(), investment.quantity(), toCents(investment.balance()),
				investment.currencyCode());
	}

	// Pluggy sends amounts in reais with decimals; the app always works in integer cents.
	private static long toCents(BigDecimal amount) {
		if (amount == null) {
			return 0;
		}
		return amount.movePointRight(2).setScale(0, RoundingMode.HALF_UP).longValueExact();
	}

}
