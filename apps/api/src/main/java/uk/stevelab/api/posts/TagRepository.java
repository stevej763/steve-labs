package uk.stevelab.api.posts;

import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

interface TagRepository extends JpaRepository<Tag, String> {

	List<Tag> findBySlugIn(Collection<String> slugs);
}