package uk.stevelab.api.auth;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AdminSessionControllerTests {

	@Autowired
	private MockMvc mockMvc;

	@Test
	void createsSessionForConfiguredAdministrator() throws Exception {
		var login = mockMvc.perform(post("/login").param("username", "editor").param("password", "test-password"))
			.andExpect(status().isNoContent())
			.andReturn();
		var session = (MockHttpSession) login.getRequest().getSession(false);

		mockMvc.perform(get("/api/v1/admin/session").session(session))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.username").value("editor"));
	}
}