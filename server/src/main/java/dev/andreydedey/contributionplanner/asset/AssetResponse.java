package dev.andreydedey.contributionplanner.asset;

public record AssetResponse(long id, String code, AssetClass assetClass, long valueCents) {

	static AssetResponse from(Asset asset) {
		return new AssetResponse(asset.getId(), asset.getCode(), asset.getAssetClass(), asset.getValueCents());
	}

}
