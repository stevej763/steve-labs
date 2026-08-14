package uk.stevelab.api.posts;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/posts")
class PublicPostController {

	private final PublicPostService publicPostService;

	PublicPostController(PublicPostService publicPostService) {
		this.publicPostService = publicPostService;
	}

	@GetMapping
	List<PublicPostResponse> listPosts() {
		return publicPostService.listPosts();
	}

	@GetMapping("/{slug}")
	PublicPostResponse findPost(@PathVariable String slug) {
		return publicPostService.findPost(slug);
	}
}