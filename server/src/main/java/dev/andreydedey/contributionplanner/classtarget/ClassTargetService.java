package dev.andreydedey.contributionplanner.classtarget;

import java.util.Comparator;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import dev.andreydedey.contributionplanner.asset.AssetClass;
import dev.andreydedey.contributionplanner.common.ApiErrorCode;
import dev.andreydedey.contributionplanner.common.ApiException;

@Service
public class ClassTargetService {

	private final ClassTargetRepository repository;

	ClassTargetService(ClassTargetRepository repository) {
		this.repository = repository;
	}

	/** As quatro metas, na ordem das classes. */
	@Transactional(readOnly = true)
	public List<ClassTarget> findAll() {
		return repository.findAll().stream()
				.sorted(Comparator.comparing(ClassTarget::getAssetClass))
				.toList();
	}

	/** Troca as quatro metas de uma vez; nada é gravado se alguma regra falhar (AC-052, AC-053). */
	@Transactional
	public List<ClassTarget> replaceAll(List<ClassTargetDto> targets) {
		validate(targets);
		Map<AssetClass, Integer> percentByClass = targets.stream()
				.collect(Collectors.toMap(ClassTargetDto::assetClass, ClassTargetDto::targetPercent));
		Map<AssetClass, ClassTarget> saved = repository.findAll().stream()
				.collect(Collectors.toMap(ClassTarget::getAssetClass, Function.identity()));
		percentByClass.forEach((assetClass, percent) -> saved.get(assetClass).setTargetPercent(percent));
		return findAll();
	}

	private static void validate(List<ClassTargetDto> targets) {
		if (targets == null) {
			throw badRequest(ApiErrorCode.TARGETS_INCOMPLETE);
		}
		boolean outOfRange = targets.stream()
				.anyMatch(t -> t == null || t.targetPercent() == null || t.targetPercent() < 0 || t.targetPercent() > 100);
		if (outOfRange) {
			throw badRequest(ApiErrorCode.TARGET_OUT_OF_RANGE);
		}
		EnumSet<AssetClass> classes = EnumSet.noneOf(AssetClass.class);
		boolean complete = targets.size() == AssetClass.values().length
				&& targets.stream().allMatch(t -> t.assetClass() != null && classes.add(t.assetClass()));
		if (!complete) {
			throw badRequest(ApiErrorCode.TARGETS_INCOMPLETE);
		}
		if (targets.stream().mapToInt(ClassTargetDto::targetPercent).sum() != 100) {
			throw badRequest(ApiErrorCode.TARGETS_SUM_NOT_100);
		}
	}

	private static ApiException badRequest(ApiErrorCode code) {
		return new ApiException(HttpStatus.BAD_REQUEST, code);
	}

}
