package uk.stevelab.api.posts;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

record PublicPostResponse(String slug, String title, String excerpt, String body, Instant publishedAt,
		UUID featuredMediaId, String featuredImageUrl, List<String> tags) {

	static PublicPostResponse from(Post post, String featuredImageUrl) {
		return new PublicPostResponse(
			post.getSlug(),
			post.getTitle(),
			post.getExcerpt(),
			post.getBody(),
			post.getPublishedAt(),
			post.getFeaturedMediaId(),
			featuredImageUrl,
			post.getTags().stream().map(Tag::getSlug).sorted().toList());
	}
}