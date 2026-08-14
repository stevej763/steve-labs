package uk.stevelab.api.posts;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

interface PostRepository extends JpaRepository<Post, UUID> {

	List<Post> findAllByOrderByUpdatedAtDesc();

	List<Post> findByStatusOrderByPublishedAtDesc(PostStatus status);

	Optional<Post> findBySlugAndStatus(String slug, PostStatus status);

	Optional<Post> findBySlug(String slug);
}