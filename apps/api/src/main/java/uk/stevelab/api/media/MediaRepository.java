package uk.stevelab.api.media;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface MediaRepository extends JpaRepository<Media, UUID> {
}