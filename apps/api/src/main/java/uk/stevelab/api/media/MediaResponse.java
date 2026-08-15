package uk.stevelab.api.media;

import java.time.Instant;
import java.util.UUID;

record MediaResponse(UUID id, String filename, String contentType, long sizeBytes, String url, Instant uploadedAt) {

	static MediaResponse from(Media media, String url) {
		return new MediaResponse(media.getId(), media.getOriginalFilename(), media.getContentType(), media.getSizeBytes(), url, media.getCreatedAt());
	}
}