package dev.andreydedey.contributionplanner.asset;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Corpo do POST e do PUT de ativos. Cada mensagem é o nome de um {@code ApiErrorCode}.
 * O client valida as mesmas regras, mas a API não confia nele.
 */
public record AssetRequest(
		@NotBlank(message = "CODE_REQUIRED")
		@Size(max = 20, message = "CODE_TOO_LONG")
		String code,

		@NotNull(message = "INVALID_CLASS")
		AssetClass assetClass,

		@NotNull(message = "VALUE_OUT_OF_RANGE")
		@Min(value = 0, message = "VALUE_OUT_OF_RANGE")
		@Max(value = AssetRequest.MAX_VALUE_CENTS, message = "VALUE_OUT_OF_RANGE")
		Long valueCents) {

	/** R$ 100.000.000,00 */
	public static final long MAX_VALUE_CENTS = 10_000_000_000L;

	/** "  wege3 " e "WEGE3" são o mesmo ativo (ASM-009). */
	public String normalizedCode() {
		return code.strip().toUpperCase();
	}

}
