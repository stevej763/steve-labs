package uk.stevelab.api.posts;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class EditorialPostControllerTests {

	private static final String JSON = """
		{"slug":"first-post","title":"First post","excerpt":"A short note","body":"The full draft."}
		""";

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private PostRepository postRepository;

	@BeforeEach
	void setUp() {
		postRepository.deleteAll();
	}

	@Test
	void requiresAuthentication() throws Exception {
		mockMvc.perform(get("/api/v1/admin/posts"))
			.andExpect(status().isUnauthorized());
	}

	@Test
	@WithMockUser
	void listsDraftsForAuthenticatedEditors() throws Exception {
		mockMvc.perform(post("/api/v1/admin/posts").contentType(MediaType.APPLICATION_JSON).content(JSON))
			.andExpect(status().isCreated());

		mockMvc.perform(get("/api/v1/admin/posts"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.length()").value(1))
			.andExpect(jsonPath("$[0].status").value("DRAFT"));
	}

	@Test
	@WithMockUser
	void createsEditsPublishesAndUnpublishesPost() throws Exception {
		var createResult = mockMvc.perform(post("/api/v1/admin/posts")
				.contentType(MediaType.APPLICATION_JSON).content(JSON))
			.andExpect(status().isCreated())
			.andExpect(jsonPath("$.status").value("DRAFT"))
			.andReturn();
		var id = UUID.fromString(com.jayway.jsonpath.JsonPath.read(createResult.getResponse().getContentAsString(), "$.id"));

		mockMvc.perform(put("/api/v1/admin/posts/{id}", id)
				.contentType(MediaType.APPLICATION_JSON)
				.content("{\"slug\":\"edited-post\",\"title\":\"Edited post\",\"excerpt\":\"Edited excerpt\",\"body\":\"Edited body.\"}"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.slug").value("edited-post"));

		mockMvc.perform(post("/api/v1/admin/posts/{id}/publish", id))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.status").value("PUBLISHED"))
			.andExpect(jsonPath("$.publishedAt").isNotEmpty());

		mockMvc.perform(post("/api/v1/admin/posts/{id}/unpublish", id))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.status").value("DRAFT"))
			.andExpect(jsonPath("$.publishedAt").doesNotExist());
	}

	@Test
	@WithMockUser
	void rejectsInvalidAndDuplicateSlugs() throws Exception {
		mockMvc.perform(post("/api/v1/admin/posts").contentType(MediaType.APPLICATION_JSON)
				.content("{\"slug\":\"Not a slug\",\"title\":\"Title\",\"body\":\"Body\"}"))
			.andExpect(status().isBadRequest());

		mockMvc.perform(post("/api/v1/admin/posts").contentType(MediaType.APPLICATION_JSON).content(JSON))
			.andExpect(status().isCreated());
		mockMvc.perform(post("/api/v1/admin/posts").contentType(MediaType.APPLICATION_JSON).content(JSON))
			.andExpect(status().isConflict());
	}
}