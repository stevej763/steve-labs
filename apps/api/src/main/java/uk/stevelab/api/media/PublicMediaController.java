package uk.stevelab.api.media;

import java.util.UUID;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/media")
class PublicMediaController {

	private final MediaService mediaService;

	PublicMediaController(MediaService mediaService) {
		this.mediaService = mediaService;
	}

	@GetMapping("/{id}")
	ResponseEntity<byte[]> download(@PathVariable UUID id) {
		var media = mediaService.download(id);
		return ResponseEntity.ok().contentType(MediaType.parseMediaType(media.contentType())).body(media.bytes());
	}
}