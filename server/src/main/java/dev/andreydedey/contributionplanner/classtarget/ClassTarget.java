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

/** Meta percentual de uma classe; existe sempre uma linha por classe (migração V1). */
@Entity
@Table(name = "class_target")
public class ClassTarget {

	@Id
	@Enumerated(EnumType.STRING)
	@Column(name = "asset_class", length = 20)
	private AssetClass assetClass;

	@JdbcTypeCode(SqlTypes.SMALLINT)
	@Column(name = "target_percent", nullable = false)
	private int targetPercent;

	protected ClassTarget() {
	}

	public AssetClass getAssetClass() {
		return assetClass;
	}

	public int getTargetPercent() {
		return targetPercent;
	}

	void setTargetPercent(int targetPercent) {
		this.targetPercent = targetPercent;
	}

}
