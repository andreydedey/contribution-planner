package dev.andreydedey.contributionplanner.asset;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/assets")
class AssetController {

	private final AssetService service;

	AssetController(AssetService service) {
		this.service = service;
	}

	@GetMapping
	List<AssetResponse> list() {
		return service.findAll().stream().map(AssetResponse::from).toList();
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	AssetResponse create(@Valid @RequestBody AssetRequest request) {
		return AssetResponse.from(service.create(request));
	}

	@PutMapping("/{id}")
	AssetResponse update(@PathVariable long id, @Valid @RequestBody AssetRequest request) {
		return AssetResponse.from(service.update(id, request));
	}

	@DeleteMapping("/{id}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	void delete(@PathVariable long id) {
		service.delete(id);
	}

}
