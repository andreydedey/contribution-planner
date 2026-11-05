package dev.andreydedey.contributionplanner.asset;

public class DuplicateAssetCodeException extends RuntimeException {

	public DuplicateAssetCodeException() {
		super("Ativo já cadastrado");
	}

}
