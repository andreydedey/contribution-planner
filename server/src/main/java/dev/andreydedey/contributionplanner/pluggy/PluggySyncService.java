package dev.andreydedey.contributionplanner.pluggy;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import dev.andreydedey.contributionplanner.asset.Asset;
import dev.andreydedey.contributionplanner.asset.AssetClass;
import dev.andreydedey.contributionplanner.asset.AssetRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PluggySyncService {

	private static final int MAX_CODE_LENGTH = 20;

	private final PluggyService pluggyService;
	private final AssetRepository assetRepository;

	@Transactional
	public PluggySyncResultDTO sync() {
		// Fetched before any write, so a Pluggy failure leaves the portfolio untouched.
		List<PluggyPositionDTO> positions = pluggyService.listPositions();

		List<String> updated = new ArrayList<>();
		List<String> created = new ArrayList<>();
		List<String> ignored = new ArrayList<>();
		Set<String> syncedIds = new HashSet<>();

		for (PluggyPositionDTO position : positions) {
			AssetClass assetClass = assetClassOf(position);
			if (assetClass == null) {
				ignored.add(position.name());
				continue;
			}
			String code = codeOf(position);
			Optional<Asset> existing = assetRepository.findByPluggyInvestmentId(position.id())
					.or(() -> assetRepository.findByCode(code).filter(asset -> asset.getPluggyInvestmentId() == null));
			// The code belongs to an asset linked to another investment; overwriting it would mix the two.
			if (existing.isEmpty() && assetRepository.existsByCode(code)) {
				ignored.add(position.name());
				continue;
			}

			Asset asset = existing.orElseGet(() -> Asset.builder().code(code).assetClass(assetClass).build());
			asset.setValueCents(position.valueCents());
			asset.setPluggyInvestmentId(position.id());
			assetRepository.save(asset);
			syncedIds.add(position.id());
			(existing.isPresent() ? updated : created).add(asset.getCode());
		}

		List<String> missing = assetRepository.findByPluggyInvestmentIdIsNotNull().stream()
				.filter(asset -> !syncedIds.contains(asset.getPluggyInvestmentId()))
				.map(Asset::getCode)
				.sorted()
				.toList();
		return new PluggySyncResultDTO(updated, created, missing, ignored);
	}

	// Only Brazilian stocks and fixed income are synced; bitcoin and US stocks stay typed by hand.
	private static AssetClass assetClassOf(PluggyPositionDTO position) {
		if ("EQUITY".equals(position.type()) && "STOCK".equals(position.subtype())) {
			return AssetClass.BR_STOCKS;
		}
		if ("FIXED_INCOME".equals(position.type())) {
			return AssetClass.FIXED_INCOME;
		}
		return null;
	}

	// Fixed income comes without a code, so its name stands in for it, cut to the column size.
	private static String codeOf(PluggyPositionDTO position) {
		String code = position.code() != null && !position.code().isBlank() ? position.code() : position.name();
		code = code.strip().toUpperCase();
		return code.length() > MAX_CODE_LENGTH ? code.substring(0, MAX_CODE_LENGTH).strip() : code;
	}

}
