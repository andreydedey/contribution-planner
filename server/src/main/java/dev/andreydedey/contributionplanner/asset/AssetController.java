package dev.andreydedey.contributionplanner.asset;

import jakarta.validation.Valid;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import dev.andreydedey.contributionplanner.common.PageResponse;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/assets")
@RequiredArgsConstructor
public class AssetController {

	private final AssetService assetService;

	@GetMapping
	public PageResponse<AssetDTO> list(
			@RequestParam(required = false) AssetClass assetClass,
			@RequestParam(required = false) String code,
			@PageableDefault(size = 50, sort = "code", direction = Sort.Direction.ASC) Pageable pageable) {
		return PageResponse.from(assetService.list(assetClass, code, pageable));
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
