package dev.andreydedey.contributionplanner;

import org.springframework.boot.SpringApplication;

public class TestContributionPlannerApplication {

	public static void main(String[] args) {
		SpringApplication.from(ContributionPlannerApplication::main).with(TestcontainersConfiguration.class).run(args);
	}

}
