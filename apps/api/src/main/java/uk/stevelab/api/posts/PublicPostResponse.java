package uk.stevelab.api.posts;

import java.time.Instant;
import java.util.UUID;

record PublicPostResponse(String slug, String title, String excerpt, String body, Instant publishedAt,
		UUID featuredMediaId, String featuredImageUrl) {

	static PublicPostResponse from(Post post, String featuredImageUrl) {
		return new PublicPostResponse(
			post.getSlug(),
			post.getTitle(),
			post.getExcerpt(),
			post.getBody(),
			post.getPublishedAt(),
			post.getFeaturedMediaId(),
			featuredImageUrl);
	}
}