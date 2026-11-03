package dev.andreydedey.contributionplanner.asset;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/assets")
@RequiredArgsConstructor
public class AssetController {

	private final AssetService assetService;

	@GetMapping
	public List<AssetDTO> list() {
		return assetService.list();
	}

	@PostMapping
	public ResponseEntity<AssetDTO> create(@Valid @RequestBody AssetDTO request) {
		return ResponseEntity.status(HttpStatus.CREATED).body(assetService.create(request));
	}

	@PutMapping("/{id}")
	public ResponseEntity<AssetDTO> update(@PathVariable long id, @Valid @RequestBody AssetDTO request) {
		return ResponseEntity.ok(assetService.update(id, request));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> delete(@PathVariable long id) {
		assetService.delete(id);
		return ResponseEntity.noContent().build();
	}

}
