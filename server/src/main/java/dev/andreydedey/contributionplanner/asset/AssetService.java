package dev.andreydedey.contributionplanner.asset;

import java.util.List;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import dev.andreydedey.contributionplanner.common.ApiErrorCode;
import dev.andreydedey.contributionplanner.common.ApiException;

@Service
public class AssetService {

	private final AssetRepository repository;

	AssetService(AssetRepository repository) {
		this.repository = repository;
	}

	@Transactional(readOnly = true)
	public List<Asset> findAll() {
		return repository.findAllByOrderByCodeAsc();
	}

	@Transactional
	public Asset create(AssetRequest request) {
		String code = request.normalizedCode();
		if (repository.existsByCode(code)) {
			throw duplicateCode();
		}
		return saveOrFailOnDuplicate(new Asset(code, request.assetClass(), request.valueCents()));
	}

	@Transactional
	public Asset update(long id, AssetRequest request) {
		Asset asset = repository.findById(id).orElseThrow(AssetService::notFound);
		String code = request.normalizedCode();
		if (repository.existsByCodeAndIdNot(code, id)) {
			throw duplicateCode();
		}
		asset.update(code, request.assetClass(), request.valueCents());
		return saveOrFailOnDuplicate(asset);
	}

	@Transactional
	public void delete(long id) {
		if (!repository.existsById(id)) {
			throw notFound();
		}
		repository.deleteById(id);
	}

	/** A constraint única do banco cobre duas gravações simultâneas do mesmo código. */
	private Asset saveOrFailOnDuplicate(Asset asset) {
		try {
			return repository.saveAndFlush(asset);
		}
		catch (DataIntegrityViolationException exception) {
			throw duplicateCode();
		}
	}

	private static ApiException duplicateCode() {
		return new ApiException(HttpStatus.CONFLICT, ApiErrorCode.DUPLICATE_CODE);
	}

	private static ApiException notFound() {
		return new ApiException(HttpStatus.NOT_FOUND, ApiErrorCode.ASSET_NOT_FOUND);
	}

}
