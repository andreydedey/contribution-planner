package dev.andreydedey.contributionplanner.asset;

public final class AssetMapper {

	private AssetMapper() {
	}

	public static AssetDTO toDTO(Asset entity) {
		return new AssetDTO(entity.getId(), entity.getCode(), entity.getAssetClass(), entity.getValueCents(),
				entity.getPluggyInvestmentId());
	}

}
