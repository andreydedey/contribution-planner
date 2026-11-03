package dev.andreydedey.contributionplanner.asset;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface AssetRepository extends JpaRepository<Asset, Long>, JpaSpecificationExecutor<Asset> {

	boolean existsByCode(String code);

	boolean existsByCodeAndIdNot(String code, Long id);

}
