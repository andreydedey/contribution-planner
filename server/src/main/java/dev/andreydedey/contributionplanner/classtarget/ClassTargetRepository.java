package dev.andreydedey.contributionplanner.classtarget;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import dev.andreydedey.contributionplanner.asset.AssetClass;

public interface ClassTargetRepository extends JpaRepository<ClassTarget, AssetClass> {

	List<ClassTargetDTO> findAllBy();

}
