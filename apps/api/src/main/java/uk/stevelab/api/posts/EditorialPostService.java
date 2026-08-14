package uk.stevelab.api.posts;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import uk.stevelab.api.media.MediaUrlResolver;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
class EditorialPostService {

	private final PostRepository postRepository;
	private final MediaUrlResolver mediaUrlResolver;

	EditorialPostService(PostRepository postRepository, MediaUrlResolver mediaUrlResolver) {
		this.postRepository = postRepository;
		this.mediaUrlResolver = mediaUrlResolver;
	}

	@Transactional(readOnly = true)
	List<EditorialPostResponse> listPosts() {
		return postRepository.findAllByOrderByUpdatedAtDesc().stream()
			.map(post -> EditorialPostResponse.from(post, mediaUrlResolver.resolve(post.getFeaturedMediaId()))).toList();
	}

	@Transactional
	EditorialPostResponse createPost(EditorialPostRequest request) {
		ensureSlugIsAvailable(request.slug(), null);
		var post = new Post(UUID.randomUUID(), request.slug(), request.title(), request.excerpt(), request.body(),
			PostStatus.DRAFT, null);
		post.update(request.slug(), request.title(), request.excerpt(), request.body(), request.featuredMediaId());
		return response(postRepository.save(post));
	}

	@Transactional
	EditorialPostResponse updatePost(UUID id, EditorialPostRequest request) {
		var post = findPost(id);
		ensureSlugIsAvailable(request.slug(), id);
		post.update(request.slug(), request.title(), request.excerpt(), request.body(), request.featuredMediaId());
		return response(post);
	}

	@Transactional
	EditorialPostResponse publishPost(UUID id) {
		var post = findPost(id);
		if (post.getStatus() == PostStatus.DRAFT) {
			post.publish(Instant.now());
		}
		return response(post);
	}

	@Transactional
	EditorialPostResponse unpublishPost(UUID id) {
		var post = findPost(id);
		post.unpublish();
		return response(post);
	}

	private Post findPost(UUID id) {
		return postRepository.findById(id).orElseThrow(EditorialPostNotFoundException::new);
	}

	private void ensureSlugIsAvailable(String slug, UUID postId) {
		postRepository.findBySlug(slug).ifPresent(post -> {
			if (!post.getId().equals(postId)) {
				throw new DuplicatePostSlugException();
			}
		});
	}

	private EditorialPostResponse response(Post post) {
		return EditorialPostResponse.from(post, mediaUrlResolver.resolve(post.getFeaturedMediaId()));
	}
}