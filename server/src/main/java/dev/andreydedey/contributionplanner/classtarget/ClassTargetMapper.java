package dev.andreydedey.contributionplanner.classtarget;

public final class ClassTargetMapper {

	private ClassTargetMapper() {
	}

	public static ClassTargetDTO toDTO(ClassTarget entity) {
		return new ClassTargetDTO(entity.getAssetClass(), entity.getTargetPercent());
	}

}
