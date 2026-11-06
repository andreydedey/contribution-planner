package dev.andreydedey.contributionplanner.common;

import java.util.Map;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.data.core.PropertyReferenceException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.ObjectError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import dev.andreydedey.contributionplanner.asset.AssetNotFoundException;
import dev.andreydedey.contributionplanner.asset.DuplicateAssetCodeException;
import dev.andreydedey.contributionplanner.classtarget.InvalidClassTargetsException;
import dev.andreydedey.contributionplanner.pluggy.PluggyNotConfiguredException;
import dev.andreydedey.contributionplanner.pluggy.PluggyUnavailableException;
import lombok.extern.slf4j.Slf4j;
import tools.jackson.core.JacksonException;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

	private static final String INVALID_REQUEST = "Requisição inválida";

	// A body that cannot be parsed (e.g. 12.5 in an integer field) gets the message of the field's range rule.
	private static final Map<String, String> UNREADABLE_FIELD_MESSAGES = Map.of(
			"assetClass", "Classe inválida",
			"valueCents", "Valor deve estar entre R$ 0,00 e R$ 100.000.000,00",
			"targetPercent", "Meta deve ser um número inteiro de 0% a 100%");

	@ExceptionHandler(InvalidClassTargetsException.class)
	public ResponseEntity<ErrorResponse> handleBadRequest(RuntimeException ex, HttpServletRequest request) {
		return buildResponse(HttpStatus.BAD_REQUEST, ex.getMessage(), request);
	}

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<ErrorResponse> handleInvalidBody(MethodArgumentNotValidException ex,
			HttpServletRequest request) {
		String message = ex.getBindingResult().getAllErrors().stream()
				.map(ObjectError::getDefaultMessage)
				.findFirst()
				.orElse(INVALID_REQUEST);
		return buildResponse(HttpStatus.BAD_REQUEST, message, request);
	}

	@ExceptionHandler(HttpMessageNotReadableException.class)
	public ResponseEntity<ErrorResponse> handleUnreadableBody(HttpMessageNotReadableException ex,
			HttpServletRequest request) {
		String message = INVALID_REQUEST;
		if (ex.getCause() instanceof JacksonException jackson && !jackson.getPath().isEmpty()) {
			String field = jackson.getPath().getLast().getPropertyName();
			message = UNREADABLE_FIELD_MESSAGES.getOrDefault(field, INVALID_REQUEST);
		}
		return buildResponse(HttpStatus.BAD_REQUEST, message, request);
	}

	@ExceptionHandler({ MethodArgumentTypeMismatchException.class, PropertyReferenceException.class })
	public ResponseEntity<ErrorResponse> handleInvalidParameter(Exception ex, HttpServletRequest request) {
		return buildResponse(HttpStatus.BAD_REQUEST, INVALID_REQUEST, request);
	}

	@ExceptionHandler({ AssetNotFoundException.class, NoResourceFoundException.class })
	public ResponseEntity<ErrorResponse> handleNotFound(Exception ex, HttpServletRequest request) {
		return buildResponse(HttpStatus.NOT_FOUND, ex.getMessage(), request);
	}

	@ExceptionHandler(DuplicateAssetCodeException.class)
	public ResponseEntity<ErrorResponse> handleConflict(RuntimeException ex, HttpServletRequest request) {
		return buildResponse(HttpStatus.CONFLICT, ex.getMessage(), request);
	}

	@ExceptionHandler(PluggyNotConfiguredException.class)
	public ResponseEntity<ErrorResponse> handleNotConfigured(RuntimeException ex, HttpServletRequest request) {
		return buildResponse(HttpStatus.SERVICE_UNAVAILABLE, ex.getMessage(), request);
	}

	@ExceptionHandler(PluggyUnavailableException.class)
	public ResponseEntity<ErrorResponse> handleBadGateway(RuntimeException ex, HttpServletRequest request) {
		log.warn("Pluggy request failed on {} {}", request.getMethod(), request.getRequestURI(), ex);
		return buildResponse(HttpStatus.BAD_GATEWAY, ex.getMessage(), request);
	}

	@ExceptionHandler(Exception.class)
	public ResponseEntity<ErrorResponse> handleUnexpected(Exception ex, HttpServletRequest request) {
		log.error("Unexpected error on {} {}", request.getMethod(), request.getRequestURI(), ex);
		return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Erro interno no servidor", request);
	}

	private ResponseEntity<ErrorResponse> buildResponse(HttpStatus status, String message,
			HttpServletRequest request) {
		ErrorResponse body = ErrorResponse.of(status.value(), status.getReasonPhrase(), message,
				request.getRequestURI());
		return ResponseEntity.status(status).body(body);
	}

}
