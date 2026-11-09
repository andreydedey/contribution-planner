package dev.andreydedey.contributionplanner.pluggy;

import java.util.List;

/**
 * What a sync changed: codes of the assets updated, created and kept because they did not come from
 * Pluggy, plus the names of the Pluggy investments the portfolio does not use.
 */
public record PluggySyncResultDTO(
		List<String> updated,
		List<String> created,
		List<String> missing,
		List<String> ignored) {

}
