package dev.andreydedey.contributionplanner.pluggy;

public class PluggyUnavailableException extends RuntimeException {

	public PluggyUnavailableException(Throwable cause) {
		super("Não foi possível consultar a Pluggy", cause);
	}

}
