package dev.andreydedey.contributionplanner.classtarget;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/class-targets")
@RequiredArgsConstructor
public class ClassTargetController {

	private final ClassTargetService classTargetService;

	@GetMapping
	public List<ClassTargetDTO> list() {
		return classTargetService.list();
	}

	@PutMapping
	public ResponseEntity<List<ClassTargetDTO>> replaceAll(@RequestBody List<ClassTargetDTO> targets) {
		return ResponseEntity.ok(classTargetService.replaceAll(targets));
	}

}
