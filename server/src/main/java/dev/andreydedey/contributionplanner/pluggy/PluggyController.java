package dev.andreydedey.contributionplanner.pluggy;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/pluggy")
@RequiredArgsConstructor
public class PluggyController {

	private final PluggyService pluggyService;
	private final PluggySyncService pluggySyncService;

	@GetMapping("/positions")
	public List<PluggyPositionDTO> listPositions() {
		return pluggyService.listPositions();
	}

	@PostMapping("/sync")
	public PluggySyncResultDTO sync() {
		return pluggySyncService.sync();
	}

}
