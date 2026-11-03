package dev.andreydedey.contributionplanner.common;

/** Corpo de toda resposta de erro: {@code {code, message}}. */
public record ApiError(ApiErrorCode code, String message) {

	public static ApiError of(ApiErrorCode code) {
		return new ApiError(code, code.message());
	}

}
