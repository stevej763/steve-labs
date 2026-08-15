package uk.stevelab.api.posts;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "tags")
class Tag {

	@Id
	@Column(nullable = false, updatable = false, length = 80)
	private String slug;

	protected Tag() {
	}

	Tag(String slug) {
		this.slug = slug;
	}

	String getSlug() {
		return slug;
	}
}