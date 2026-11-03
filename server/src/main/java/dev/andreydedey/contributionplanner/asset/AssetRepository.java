package dev.andreydedey.contributionplanner.asset;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface AssetRepository extends JpaRepository<Asset, Long> {

	List<Asset> findAllByOrderByCodeAsc();

	boolean existsByCode(String code);

	boolean existsByCodeAndIdNot(String code, Long id);

}
