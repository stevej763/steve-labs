package uk.stevelab.api.posts;

import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/posts")
class EditorialPostController {

	private final EditorialPostService editorialPostService;

	EditorialPostController(EditorialPostService editorialPostService) {
		this.editorialPostService = editorialPostService;
	}

	@GetMapping
	List<EditorialPostResponse> listPosts() {
		return editorialPostService.listPosts();
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	EditorialPostResponse createPost(@Valid @RequestBody EditorialPostRequest request) {
		return editorialPostService.createPost(request);
	}

	@PutMapping("/{id}")
	EditorialPostResponse updatePost(@PathVariable UUID id, @Valid @RequestBody EditorialPostRequest request) {
		return editorialPostService.updatePost(id, request);
	}

	@PostMapping("/{id}/publish")
	EditorialPostResponse publishPost(@PathVariable UUID id) {
		return editorialPostService.publishPost(id);
	}

	@PostMapping("/{id}/unpublish")
	EditorialPostResponse unpublishPost(@PathVariable UUID id) {
		return editorialPostService.unpublishPost(id);
	}
}