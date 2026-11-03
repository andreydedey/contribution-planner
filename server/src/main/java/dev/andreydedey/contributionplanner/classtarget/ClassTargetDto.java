package dev.andreydedey.contributionplanner.classtarget;

import dev.andreydedey.contributionplanner.asset.AssetClass;

/** Uma meta no GET e no PUT de {@code /api/class-targets}. */
public record ClassTargetDto(AssetClass assetClass, Integer targetPercent) {

	static ClassTargetDto from(ClassTarget target) {
		return new ClassTargetDto(target.getAssetClass(), target.getTargetPercent());
	}

}
