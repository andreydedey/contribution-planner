package dev.andreydedey.contributionplanner.pluggy;

import java.util.Comparator;
import java.util.List;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PluggyService {

	private static final Comparator<String> NULLS_LAST = Comparator.nullsLast(Comparator.naturalOrder());

	private final PluggyClient pluggyClient;
	private final PluggyProperties properties;

	public List<PluggyPositionDTO> listPositions() {
		if (!properties.isConfigured()) {
			throw new PluggyNotConfiguredException();
		}
		return properties.configuredItemIds().stream()
				.flatMap(itemId -> pluggyClient.listInvestments(itemId).stream())
				.map(PluggyPositionMapper::toDTO)
				.sorted(Comparator.comparing(PluggyPositionDTO::type, NULLS_LAST)
						.thenComparing(PluggyPositionDTO::name, NULLS_LAST))
				.toList();
	}

}
