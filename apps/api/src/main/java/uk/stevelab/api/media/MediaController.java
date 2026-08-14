package uk.stevelab.api.media;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/admin/media")
class MediaController {

	private final MediaService mediaService;

	MediaController(MediaService mediaService) {
		this.mediaService = mediaService;
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	MediaResponse upload(@RequestParam MultipartFile file) {
		return mediaService.upload(file);
	}

}