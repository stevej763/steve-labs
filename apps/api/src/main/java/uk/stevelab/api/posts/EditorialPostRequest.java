package uk.stevelab.api.posts;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.Set;
import java.util.UUID;

record EditorialPostRequest(
	@NotBlank @Size(max = 160) @Pattern(regexp = "[a-z0-9]+(?:-[a-z0-9]+)*") String slug,
	@NotBlank @Size(max = 240) String title,
	@Size(max = 500) String excerpt,
	@NotBlank String body,
	UUID featuredMediaId,
	Set<@Pattern(regexp = "[a-z0-9]+(?:-[a-z0-9]+)*") @Size(max = 80) String> tags) {
}