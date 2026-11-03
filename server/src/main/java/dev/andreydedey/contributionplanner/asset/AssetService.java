package dev.andreydedey.contributionplanner.asset;

import java.util.List;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AssetService {

	private final AssetRepository assetRepository;

	@Transactional(readOnly = true)
	public List<AssetDTO> list() {
		return assetRepository.findAllByOrderByCodeAsc().stream().map(AssetMapper::toDTO).toList();
	}

	@Transactional
	public AssetDTO create(AssetDTO request) {
		String code = normalizeCode(request.code());
		if (assetRepository.existsByCode(code)) {
			throw new DuplicateAssetCodeException();
		}
		Asset asset = Asset.builder()
				.code(code)
				.assetClass(request.assetClass())
				.valueCents(request.valueCents())
				.build();
		return AssetMapper.toDTO(save(asset));
	}

	@Transactional
	public AssetDTO update(long id, AssetDTO request) {
		Asset asset = assetRepository.findById(id).orElseThrow(() -> new AssetNotFoundException(id));
		String code = normalizeCode(request.code());
		if (assetRepository.existsByCodeAndIdNot(code, id)) {
			throw new DuplicateAssetCodeException();
		}
		asset.setCode(code);
		asset.setAssetClass(request.assetClass());
		asset.setValueCents(request.valueCents());
		return AssetMapper.toDTO(save(asset));
	}

	@Transactional
	public void delete(long id) {
		if (!assetRepository.existsById(id)) {
			throw new AssetNotFoundException(id);
		}
		assetRepository.deleteById(id);
	}

	private static String normalizeCode(String code) {
		return code.strip().toUpperCase();
	}

	// The unique constraint still catches two concurrent saves of the same code.
	private Asset save(Asset asset) {
		try {
			return assetRepository.saveAndFlush(asset);
		}
		catch (DataIntegrityViolationException ex) {
			throw new DuplicateAssetCodeException();
		}
	}

}
