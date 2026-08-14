package uk.stevelab.api.posts;

import java.util.List;

import uk.stevelab.api.media.MediaUrlResolver;
import org.springframework.stereotype.Service;

@Service
class PublicPostService {

	private final PostRepository postRepository;
	private final MediaUrlResolver mediaUrlResolver;

	PublicPostService(PostRepository postRepository, MediaUrlResolver mediaUrlResolver) {
		this.postRepository = postRepository;
		this.mediaUrlResolver = mediaUrlResolver;
	}

	List<PublicPostResponse> listPosts() {
		return postRepository.findByStatusOrderByPublishedAtDesc(PostStatus.PUBLISHED)
			.stream()
			.map(post -> PublicPostResponse.from(post, mediaUrlResolver.resolve(post.getFeaturedMediaId())))
			.toList();
	}

	PublicPostResponse findPost(String slug) {
		return postRepository.findBySlugAndStatus(slug, PostStatus.PUBLISHED)
			.map(post -> PublicPostResponse.from(post, mediaUrlResolver.resolve(post.getFeaturedMediaId())))
			.orElseThrow(PublishedPostNotFoundException::new);
	}
}