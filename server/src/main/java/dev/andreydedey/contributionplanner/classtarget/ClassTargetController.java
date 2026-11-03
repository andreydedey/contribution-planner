package dev.andreydedey.contributionplanner.classtarget;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/class-targets")
class ClassTargetController {

	private final ClassTargetService service;

	ClassTargetController(ClassTargetService service) {
		this.service = service;
	}

	@GetMapping
	List<ClassTargetDto> list() {
		return service.findAll().stream().map(ClassTargetDto::from).toList();
	}

	@PutMapping
	List<ClassTargetDto> replaceAll(@RequestBody List<ClassTargetDto> targets) {
		return service.replaceAll(targets).stream().map(ClassTargetDto::from).toList();
	}

}
