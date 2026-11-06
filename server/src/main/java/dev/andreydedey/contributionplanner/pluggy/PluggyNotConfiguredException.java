package dev.andreydedey.contributionplanner.pluggy;

public class PluggyNotConfiguredException extends RuntimeException {

	public PluggyNotConfiguredException() {
		super("Integração com a Pluggy não configurada");
	}

}
