package uk.stevelab.api.media;

import java.util.UUID;

record MediaResponse(UUID id, String filename, String contentType, long sizeBytes, String url) {

	static MediaResponse from(Media media, String url) {
		return new MediaResponse(media.getId(), media.getOriginalFilename(), media.getContentType(), media.getSizeBytes(), url);
	}
}