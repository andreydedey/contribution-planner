package dev.andreydedey.contributionplanner.asset;

public class AssetNotFoundException extends RuntimeException {

	public AssetNotFoundException(long id) {
		super("Ativo não encontrado: " + id);
	}

}
