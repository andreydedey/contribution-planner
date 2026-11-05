package dev.andreydedey.contributionplanner.pluggy;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/pluggy")
@RequiredArgsConstructor
public class PluggyController {

	private final PluggyService pluggyService;

	@GetMapping("/positions")
	public List<PluggyPositionDTO> listPositions() {
		return pluggyService.listPositions();
	}

}
