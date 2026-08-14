package uk.stevelab.api.posts;

import java.time.Instant;
import java.util.UUID;

record EditorialPostResponse(UUID id, String slug, String title, String excerpt, String body,
		PostStatus status, Instant publishedAt, UUID featuredMediaId, String featuredImageUrl) {

	static EditorialPostResponse from(Post post, String featuredImageUrl) {
		return new EditorialPostResponse(
			post.getId(), post.getSlug(), post.getTitle(), post.getExcerpt(), post.getBody(),
			post.getStatus(), post.getPublishedAt(), post.getFeaturedMediaId(), featuredImageUrl);
	}
}