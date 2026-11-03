package dev.andreydedey.contributionplanner.asset;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import org.hibernate.validator.constraints.Range;

public record AssetDTO(
		Long id,

		@NotBlank(message = "Informe o código do ativo")
		@Size(max = 20, message = "O código deve ter até 20 caracteres")
		String code,

		@NotNull(message = "Classe inválida")
		AssetClass assetClass,

		@NotNull(message = VALUE_OUT_OF_RANGE)
		@Range(min = 0, max = 10_000_000_000L, message = VALUE_OUT_OF_RANGE)
		Long valueCents) {

	private static final String VALUE_OUT_OF_RANGE = "Valor deve estar entre R$ 0,00 e R$ 100.000.000,00";

}
