package dev.andreydedey.contributionplanner.asset;

import org.springframework.data.jpa.domain.Specification;

public final class AssetSpecification {

	private AssetSpecification() {
	}

	public static Specification<Asset> hasAssetClass(AssetClass assetClass) {
		return (root, query, cb) -> cb.equal(root.get("assetClass"), assetClass);
	}

	public static Specification<Asset> codeContains(String code) {
		return (root, query, cb) -> cb.like(root.get("code"), "%" + code.strip().toUpperCase() + "%");
	}

}
