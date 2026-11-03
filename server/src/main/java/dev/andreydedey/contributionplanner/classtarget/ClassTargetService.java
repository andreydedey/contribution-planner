package dev.andreydedey.contributionplanner.classtarget;

import java.util.Comparator;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import dev.andreydedey.contributionplanner.asset.AssetClass;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ClassTargetService {

	private static final String TARGET_OUT_OF_RANGE = "Meta deve ser um número inteiro de 0% a 100%";
	private static final String TARGETS_INCOMPLETE = "Informe uma meta para cada uma das quatro classes";
	private static final String TARGETS_SUM_NOT_100 = "As metas devem somar 100%";

	private final ClassTargetRepository classTargetRepository;

	@Transactional(readOnly = true)
	public List<ClassTargetDTO> list() {
		return classTargetRepository.findAll().stream()
				.sorted(Comparator.comparing(ClassTarget::getAssetClass))
				.map(ClassTargetMapper::toDTO)
				.toList();
	}

	@Transactional
	public List<ClassTargetDTO> replaceAll(List<ClassTargetDTO> targets) {
		validate(targets);
		Map<AssetClass, ClassTarget> saved = classTargetRepository.findAll().stream()
				.collect(Collectors.toMap(ClassTarget::getAssetClass, Function.identity()));
		targets.forEach(target -> saved.get(target.assetClass()).setTargetPercent(target.targetPercent()));
		return list();
	}

	private static void validate(List<ClassTargetDTO> targets) {
		if (targets == null) {
			throw new InvalidClassTargetsException(TARGETS_INCOMPLETE);
		}
		boolean outOfRange = targets.stream().anyMatch(target -> target == null
				|| target.targetPercent() == null
				|| target.targetPercent() < 0
				|| target.targetPercent() > 100);
		if (outOfRange) {
			throw new InvalidClassTargetsException(TARGET_OUT_OF_RANGE);
		}
		EnumSet<AssetClass> classes = EnumSet.noneOf(AssetClass.class);
		boolean complete = targets.size() == AssetClass.values().length
				&& targets.stream().allMatch(target -> target.assetClass() != null && classes.add(target.assetClass()));
		if (!complete) {
			throw new InvalidClassTargetsException(TARGETS_INCOMPLETE);
		}
		if (targets.stream().mapToInt(ClassTargetDTO::targetPercent).sum() != 100) {
			throw new InvalidClassTargetsException(TARGETS_SUM_NOT_100);
		}
	}

}
