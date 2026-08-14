package uk.stevelab.api.auth;

import java.security.Principal;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/session")
class AdminSessionController {

	@GetMapping
	SessionResponse currentSession(Principal principal) {
		return new SessionResponse(principal.getName());
	}

	private record SessionResponse(String username) {
	}
}