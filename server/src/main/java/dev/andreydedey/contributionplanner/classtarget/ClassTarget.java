package dev.andreydedey.contributionplanner.classtarget;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import dev.andreydedey.contributionplanner.asset.AssetClass;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "class_target")
@Getter
@Setter
@NoArgsConstructor
public class ClassTarget {

	@Id
	@Enumerated(EnumType.STRING)
	@Column(name = "asset_class", length = 20)
	private AssetClass assetClass;

	@JdbcTypeCode(SqlTypes.SMALLINT)
	@Column(name = "target_percent", nullable = false)
	private int targetPercent;

}
