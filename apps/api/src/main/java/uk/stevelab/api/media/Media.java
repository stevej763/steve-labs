package uk.stevelab.api.media;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "media")
class Media {

	@Id
	private UUID id;

	@Column(name = "object_key", nullable = false, unique = true)
	private String objectKey;

	@Column(name = "original_filename", nullable = false)
	private String originalFilename;

	@Column(name = "content_type", nullable = false)
	private String contentType;

	@Column(name = "size_bytes", nullable = false)
	private long sizeBytes;

	@Column(name = "created_at", nullable = false, updatable = false)
	private Instant createdAt;

	protected Media() {
	}

	Media(UUID id, String objectKey, String originalFilename, String contentType, long sizeBytes) {
		this.id = id;
		this.objectKey = objectKey;
		this.originalFilename = originalFilename;
		this.contentType = contentType;
		this.sizeBytes = sizeBytes;
	}

	@PrePersist
	void onCreate() {
		createdAt = Instant.now();
	}

	UUID getId() { return id; }
	String getObjectKey() { return objectKey; }
	String getOriginalFilename() { return originalFilename; }
	String getContentType() { return contentType; }
	long getSizeBytes() { return sizeBytes; }
}