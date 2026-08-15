package uk.stevelab.api.posts;

import java.time.Instant;
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "posts")
public class Post {

	@Id
	private UUID id;

	@Column(nullable = false, unique = true)
	private String slug;

	@Column(nullable = false)
	private String title;

	private String excerpt;

	@Column(nullable = false, columnDefinition = "TEXT")
	private String body;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private PostStatus status;

	private Instant publishedAt;

	@Column(name = "media_id")
	private UUID featuredMediaId;

	@ManyToMany
	@JoinTable(name = "post_tags", joinColumns = @JoinColumn(name = "post_id"), inverseJoinColumns = @JoinColumn(name = "tag_slug"))
	private Set<Tag> tags = new LinkedHashSet<>();

	@Column(nullable = false, updatable = false)
	private Instant createdAt;

	@Column(nullable = false)
	private Instant updatedAt;

	protected Post() {
	}

	public Post(UUID id, String slug, String title, String excerpt, String body, PostStatus status, Instant publishedAt) {
		this.id = id;
		this.slug = slug;
		this.title = title;
		this.excerpt = excerpt;
		this.body = body;
		this.status = status;
		this.publishedAt = publishedAt;
	}

	UUID getId() {
		return id;
	}

	String getSlug() {
		return slug;
	}

	String getTitle() {
		return title;
	}

	String getExcerpt() {
		return excerpt;
	}

	String getBody() {
		return body;
	}

	PostStatus getStatus() {
		return status;
	}

	Instant getPublishedAt() {
		return publishedAt;
	}

	UUID getFeaturedMediaId() {
		return featuredMediaId;
	}

	Set<Tag> getTags() {
		return tags;
	}

	void update(String slug, String title, String excerpt, String body, UUID featuredMediaId, Set<Tag> tags) {
		this.slug = slug;
		this.title = title;
		this.excerpt = excerpt;
		this.body = body;
		this.featuredMediaId = featuredMediaId;
		this.tags.clear();
		this.tags.addAll(tags);
	}

	void publish(Instant publishedAt) {
		this.status = PostStatus.PUBLISHED;
		this.publishedAt = publishedAt;
	}

	void unpublish() {
		this.status = PostStatus.DRAFT;
		this.publishedAt = null;
	}

	@PrePersist
	void onCreate() {
		var now = Instant.now();
		createdAt = now;
		updatedAt = now;
	}

	@PreUpdate
	void onUpdate() {
		updatedAt = Instant.now();
	}
}