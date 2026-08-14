package uk.stevelab.api.posts;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class PublicPostControllerTests {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private PostRepository postRepository;

	@BeforeEach
	void setUp() {
		postRepository.deleteAll();
		postRepository.save(new Post(
			UUID.randomUUID(), "published-note", "Published note", "A visible excerpt", "Published body",
			PostStatus.PUBLISHED, Instant.parse("2026-08-10T09:00:00Z")));
		postRepository.save(new Post(
			UUID.randomUUID(), "private-draft", "Private draft", "A hidden excerpt", "Draft body",
			PostStatus.DRAFT, null));
	}

	@Test
	void listsOnlyPublishedPosts() throws Exception {
		mockMvc.perform(get("/api/v1/posts"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.length()").value(1))
			.andExpect(jsonPath("$[0].slug").value("published-note"))
			.andExpect(jsonPath("$[0].body").value("Published body"));
	}

	@Test
	void returnsPublishedPostBySlug() throws Exception {
		mockMvc.perform(get("/api/v1/posts/published-note"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.title").value("Published note"))
			.andExpect(jsonPath("$.publishedAt").value("2026-08-10T09:00:00Z"));
	}

	@Test
	void doesNotExposeDrafts() throws Exception {
		mockMvc.perform(get("/api/v1/posts/private-draft"))
			.andExpect(status().isNotFound());
	}
}