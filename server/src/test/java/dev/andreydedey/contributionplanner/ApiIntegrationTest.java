package dev.andreydedey.contributionplanner;

import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.assertj.MockMvcTester;
import org.springframework.test.web.servlet.assertj.MvcTestResult;

/**
 * Base dos testes de integração da API: Postgres real (Testcontainers), migrações do Flyway e MockMvc.
 * Cada teste começa sem ativos e com as metas iniciais.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Import(TestcontainersConfiguration.class)
public abstract class ApiIntegrationTest {

	@Autowired
	protected MockMvcTester mvc;

	@Autowired
	private JdbcTemplate jdbc;

	@BeforeEach
	void resetDatabase() {
		jdbc.update("delete from asset");
		jdbc.update("""
				update class_target set target_percent = case asset_class
				    when 'BR_STOCKS' then 40 when 'US_STOCKS' then 30
				    when 'FIXED_INCOME' then 20 else 10 end""");
	}

	protected MvcTestResult get(String uri) {
		return mvc.get().uri(uri).exchange();
	}

	protected MvcTestResult post(String uri, String json) {
		return mvc.post().uri(uri).contentType(MediaType.APPLICATION_JSON).content(json).exchange();
	}

	protected MvcTestResult put(String uri, String json) {
		return mvc.put().uri(uri).contentType(MediaType.APPLICATION_JSON).content(json).exchange();
	}

	protected MvcTestResult delete(String uri) {
		return mvc.delete().uri(uri).exchange();
	}

}
