package dev.andreydedey.contributionplanner.common;

/**
 * Códigos estáveis de erro da API, com o texto da spec que o client mostra.
 * A ordem define a prioridade quando uma requisição tem mais de um erro.
 */
public enum ApiErrorCode {

	CODE_REQUIRED("Informe o código do ativo"),
	CODE_TOO_LONG("O código deve ter até 20 caracteres"),
	INVALID_CLASS("Classe inválida"),
	VALUE_OUT_OF_RANGE("Valor deve estar entre R$ 0,00 e R$ 100.000.000,00"),
	DUPLICATE_CODE("Ativo já cadastrado"),
	ASSET_NOT_FOUND("Ativo não encontrado"),
	TARGET_OUT_OF_RANGE("Meta deve ser um número inteiro de 0% a 100%"),
	TARGETS_INCOMPLETE("Informe uma meta para cada uma das quatro classes"),
	TARGETS_SUM_NOT_100("As metas devem somar 100%"),
	CONTRIBUTION_OUT_OF_RANGE("Valor do aporte deve ser maior que R$ 0,00 e até R$ 1.000.000,00"),
	INVALID_REQUEST("Requisição inválida");

	private final String message;

	ApiErrorCode(String message) {
		this.message = message;
	}

	public String message() {
		return message;
	}

}
