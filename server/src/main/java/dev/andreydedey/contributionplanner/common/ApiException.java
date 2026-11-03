package dev.andreydedey.contributionplanner.common;

import org.springframework.http.HttpStatus;

/** Erro de regra de negócio que vira resposta {@code {code, message}} com o status dado. */
public class ApiException extends RuntimeException {

	private final HttpStatus status;
	private final ApiErrorCode code;

	public ApiException(HttpStatus status, ApiErrorCode code) {
		super(code.message());
		this.status = status;
		this.code = code;
	}

	public HttpStatus status() {
		return status;
	}

	public ApiErrorCode code() {
		return code;
	}

}
