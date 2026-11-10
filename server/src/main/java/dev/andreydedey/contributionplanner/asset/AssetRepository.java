package dev.andreydedey.contributionplanner.asset;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface AssetRepository extends JpaRepository<Asset, Long>, JpaSpecificationExecutor<Asset> {

	boolean existsByCode(String code);

	boolean existsByCodeAndIdNot(String code, Long id);

	Optional<Asset> findByCode(String code);

	Optional<Asset> findByPluggyInvestmentId(String pluggyInvestmentId);

	List<Asset> findByPluggyInvestmentIdIsNotNull();

}
