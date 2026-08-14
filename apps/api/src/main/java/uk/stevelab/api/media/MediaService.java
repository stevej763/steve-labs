package uk.stevelab.api.media;

import java.io.IOException;
import java.util.Set;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.CreateBucketRequest;
import software.amazon.awssdk.services.s3.model.HeadBucketRequest;
import software.amazon.awssdk.services.s3.model.NoSuchBucketException;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;

@Service
class MediaService {

	private static final Set<String> ACCEPTED_TYPES = Set.of("image/jpeg", "image/png", "image/webp", "image/gif");

	private final MediaRepository mediaRepository;
	private final S3Client s3Client;
	private final String bucket;
	private final String publicEndpoint;

	MediaService(MediaRepository mediaRepository, S3Client s3Client,
			@Value("${app.storage.bucket}") String bucket,
			@Value("${app.storage.public-endpoint:${app.storage.endpoint}}") String publicEndpoint) {
		this.mediaRepository = mediaRepository;
		this.s3Client = s3Client;
		this.bucket = bucket;
		this.publicEndpoint = publicEndpoint;
	}

	MediaResponse upload(MultipartFile file) {
		if (file.isEmpty() || !ACCEPTED_TYPES.contains(file.getContentType())) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Upload a JPEG, PNG, WebP, or GIF image.");
		}

		ensureBucketExists();
		var id = UUID.randomUUID();
		var filename = file.getOriginalFilename() == null ? "upload" : file.getOriginalFilename();
		var key = "uploads/%s/%s".formatted(id, filename.replaceAll("[^a-zA-Z0-9._-]", "-"));
		try {
			s3Client.putObject(PutObjectRequest.builder().bucket(bucket).key(key).contentType(file.getContentType()).build(),
				RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
		} catch (IOException exception) {
			throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not read upload.", exception);
		} catch (S3Exception exception) {
			if (exception.statusCode() == HttpStatus.INSUFFICIENT_STORAGE.value()) {
				throw new ResponseStatusException(HttpStatus.INSUFFICIENT_STORAGE,
					"Object storage is full. Free disk space before uploading media.", exception);
			}
			throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
				"Object storage is unavailable. Try again shortly.", exception);
		}

		var media = mediaRepository.save(new Media(id, key, filename, file.getContentType(), file.getSize()));
		return MediaResponse.from(media, "/api/v1/media/" + media.getId());
	}

	MediaContent download(UUID id) {
		var media = mediaRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
		var bytes = s3Client.getObjectAsBytes(GetObjectRequest.builder().bucket(bucket).key(media.getObjectKey()).build()).asByteArray();
		return new MediaContent(media.getContentType(), bytes);
	}

	private void ensureBucketExists() {
		try {
			s3Client.headBucket(HeadBucketRequest.builder().bucket(bucket).build());
		} catch (NoSuchBucketException exception) {
			s3Client.createBucket(CreateBucketRequest.builder().bucket(bucket).build());
		}
	}

	record MediaContent(String contentType, byte[] bytes) {
	}
}