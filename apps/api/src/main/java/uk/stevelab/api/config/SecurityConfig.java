package uk.stevelab.api.config;

import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import static org.springframework.http.HttpStatus.UNAUTHORIZED;

@Configuration
public class SecurityConfig {

	@Bean
	SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		return http
			.csrf(csrf -> csrf.disable())
			.cors(cors -> {})
			.authorizeHttpRequests(authorize -> authorize
				.requestMatchers("/actuator/health/**").permitAll()
				.requestMatchers("/api/v1/posts/**").permitAll()
				.requestMatchers("/api/v1/media/**").permitAll()
				.requestMatchers("/login").permitAll()
				.anyRequest().authenticated())
			.formLogin(login -> login
				.successHandler((request, response, authentication) -> response.setStatus(204))
				.failureHandler((request, response, exception) -> response.sendError(401)))
			.logout(logout -> logout
				.logoutRequestMatcher(request -> "DELETE".equals(request.getMethod())
					&& "/api/v1/admin/session".equals(request.getRequestURI()))
				.logoutSuccessHandler((request, response, authentication) -> response.setStatus(204)))
			.exceptionHandling(exceptions -> exceptions.authenticationEntryPoint(new HttpStatusEntryPoint(UNAUTHORIZED)))
			.build();
	}

	@Bean
	CorsConfigurationSource corsConfigurationSource(@Value("${app.cors.allowed-origins}") String allowedOrigins) {
		var configuration = new CorsConfiguration();
		configuration.setAllowedOrigins(Arrays.stream(allowedOrigins.split(",")).map(String::trim).toList());
		configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
		configuration.setAllowedHeaders(List.of("Content-Type", "Authorization"));
		configuration.setAllowCredentials(true);

		var source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", configuration);
		return source;
	}
}