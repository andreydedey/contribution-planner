package dev.andreydedey.contributionplanner.asset;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "asset")
public class Asset {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, unique = true, length = 20)
	private String code;

	@Enumerated(EnumType.STRING)
	@Column(name = "asset_class", nullable = false, length = 20)
	private AssetClass assetClass;

	/** Valor atual em centavos (nunca ponto flutuante). */
	@Column(name = "value_cents", nullable = false)
	private long valueCents;

	protected Asset() {
	}

	public Asset(String code, AssetClass assetClass, long valueCents) {
		update(code, assetClass, valueCents);
	}

	public void update(String code, AssetClass assetClass, long valueCents) {
		this.code = code;
		this.assetClass = assetClass;
		this.valueCents = valueCents;
	}

	public Long getId() {
		return id;
	}

	public String getCode() {
		return code;
	}

	public AssetClass getAssetClass() {
		return assetClass;
	}

	public long getValueCents() {
		return valueCents;
	}

}
