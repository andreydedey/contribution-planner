package dev.andreydedey.contributionplanner.classtarget;

import org.springframework.data.jpa.repository.JpaRepository;

import dev.andreydedey.contributionplanner.asset.AssetClass;

public interface ClassTargetRepository extends JpaRepository<ClassTarget, AssetClass> {

}
