package uk.stevelab.api.media;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class PublicMediaControllerTests {

	@Autowired
	private MockMvc mockMvc;

	@Test
	void returnsNotFoundForUnknownMedia() throws Exception {
		mockMvc.perform(get("/api/v1/media/{id}", UUID.randomUUID()))
			.andExpect(status().isNotFound());
	}
}