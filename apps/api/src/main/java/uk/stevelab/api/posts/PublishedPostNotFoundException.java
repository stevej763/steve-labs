package uk.stevelab.api.posts;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
class PublishedPostNotFoundException extends RuntimeException {
}