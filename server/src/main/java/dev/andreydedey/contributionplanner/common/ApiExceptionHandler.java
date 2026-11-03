package dev.andreydedey.contributionplanner.common;

import java.util.Comparator;
import java.util.Map;
import java.util.Objects;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import tools.jackson.core.JacksonException;

/**
 * Converte toda falha da API em {@code {code, message}}, para o client mostrar o texto da spec.
 */
@RestControllerAdvice
public class ApiExceptionHandler {

	/** JSON com tipo errado num campo conhecido vira o erro de faixa daquele campo (ex.: meta 12.5). */
	private static final Map<String, ApiErrorCode> UNREADABLE_FIELD_CODES = Map.of(
			"assetClass", ApiErrorCode.INVALID_CLASS,
			"valueCents", ApiErrorCode.VALUE_OUT_OF_RANGE,
			"targetPercent", ApiErrorCode.TARGET_OUT_OF_RANGE,
			"contributionCents", ApiErrorCode.CONTRIBUTION_OUT_OF_RANGE);

	@ExceptionHandler(ApiException.class)
	ResponseEntity<ApiError> handleApiException(ApiException exception) {
		return ResponseEntity.status(exception.status()).body(ApiError.of(exception.code()));
	}

	/** Bean Validation: a mensagem de cada restrição é o nome do {@link ApiErrorCode}. */
	@ExceptionHandler(MethodArgumentNotValidException.class)
	ResponseEntity<ApiError> handleInvalidBody(MethodArgumentNotValidException exception) {
		ApiErrorCode code = exception.getBindingResult().getFieldErrors().stream()
				.map(FieldError::getDefaultMessage)
				.filter(Objects::nonNull)
				.map(ApiExceptionHandler::toErrorCode)
				.min(Comparator.naturalOrder())
				.orElse(ApiErrorCode.INVALID_REQUEST);
		return badRequest(code);
	}

	@ExceptionHandler(HttpMessageNotReadableException.class)
	ResponseEntity<ApiError> handleUnreadableBody(HttpMessageNotReadableException exception) {
		ApiErrorCode code = ApiErrorCode.INVALID_REQUEST;
		if (exception.getCause() instanceof JacksonException jackson && !jackson.getPath().isEmpty()) {
			String field = jackson.getPath().getLast().getPropertyName();
			code = UNREADABLE_FIELD_CODES.getOrDefault(field, ApiErrorCode.INVALID_REQUEST);
		}
		return badRequest(code);
	}

	private static ApiErrorCode toErrorCode(String name) {
		try {
			return ApiErrorCode.valueOf(name);
		}
		catch (IllegalArgumentException ignored) {
			return ApiErrorCode.INVALID_REQUEST;
		}
	}

	private static ResponseEntity<ApiError> badRequest(ApiErrorCode code) {
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiError.of(code));
	}

}
