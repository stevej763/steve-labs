package uk.stevelab.api.media;

import java.util.UUID;

import org.springframework.stereotype.Component;

@Component
public class MediaUrlResolver {

	public String resolve(UUID mediaId) {
		return mediaId == null ? null : "/api/v1/media/" + mediaId;
	}
}