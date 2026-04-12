package project.TeamFive.ExLMS.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

        private final JwtAuthenticationFilter jwtAuthFilter;
        private final AuthenticationProvider authenticationProvider;

        @Bean
        public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
                http
                                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                                .csrf(AbstractHttpConfigurer::disable)
                                .authorizeHttpRequests(auth -> auth
                                                .requestMatchers("/api/auth/**", "/api/cke/resources/**",
                                                                "/api/files/download/**",
                                                                "/api/v1/collabs/internal/**",
                                                                "/api/ws/**", "/ws/**", "/error")
                                                .permitAll()
                                                .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/cke/upload").authenticated()
                                                .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
                                                .requestMatchers("/api/v1/instructor/**")
                                                .hasAnyRole("ADMIN", "INSTRUCTOR")

                                                // Forum restrictions
                                                .requestMatchers(org.springframework.http.HttpMethod.GET,
                                                                "/api/v1/forum/tags")
                                                .authenticated()
                                                .requestMatchers(org.springframework.http.HttpMethod.POST,
                                                                "/api/v1/forum/tags")
                                                .hasRole("ADMIN")
                                                .requestMatchers("/api/v1/forum/posts/*/pin")
                                                .hasAnyRole("ADMIN", "INSTRUCTOR")
                                                .requestMatchers("/api/v1/forum/**").authenticated()

                                                // Inventory - only for Instructors and Admins
                                                .requestMatchers("/api/v1/inventory/**")
                                                .hasAnyRole("ADMIN", "INSTRUCTOR")

                                                // Students can record attendance, ask questions and vote in polls
                                                .requestMatchers(org.springframework.http.HttpMethod.POST,
                                                                "/api/v1/meetings/*/attend",
                                                                "/api/v1/meetings/*/questions",
                                                                "/api/v1/meetings/polls/*/vote",
                                                                "/api/v1/collabs/*/track")
                                                .authenticated()

                                                // Student group interactions (Join/Leave)
                                                .requestMatchers(org.springframework.http.HttpMethod.POST,
                                                                "/api/groups/join/**",
                                                                "/api/groups/*/join-requests",
                                                                "/api/v1/groups/join/**",
                                                                "/api/v1/groups/*/join-requests")
                                                .authenticated()
                                                .requestMatchers(org.springframework.http.HttpMethod.DELETE,
                                                                "/api/groups/*/leave",
                                                                "/api/v1/groups/*/leave")
                                                .authenticated()

                                                // Student submissions and attempts
                                                .requestMatchers(org.springframework.http.HttpMethod.POST,
                                                                "/api/v1/assignments/*/submit",
                                                                "/api/v1/quizzes/*/attempts",
                                                                "/api/v1/quizzes/attempts/*/submit")
                                                .authenticated()

                                                // Management routes (POST, PUT, DELETE) - restricted to INSTRUCTOR and ADMIN
                                                .requestMatchers(org.springframework.http.HttpMethod.POST,
                                                                "/api/v1/courses/**", "/api/v1/quizzes/**",
                                                                "/api/v1/assignments/**", "/api/v1/groups/**",
                                                                "/api/v1/meetings/**",
                                                                "/api/courses/**", "/api/quizzes/**",
                                                                "/api/assignments/**", "/api/groups/**",
                                                                "/api/meetings/**")
                                                .hasAnyRole("ADMIN", "INSTRUCTOR")
                                                .requestMatchers(org.springframework.http.HttpMethod.PUT,
                                                                "/api/v1/courses/**", "/api/v1/quizzes/**",
                                                                "/api/v1/assignments/**", "/api/v1/groups/**",
                                                                "/api/v1/meetings/**",
                                                                "/api/courses/**", "/api/quizzes/**",
                                                                "/api/assignments/**", "/api/groups/**",
                                                                "/api/meetings/**")
                                                .hasAnyRole("ADMIN", "INSTRUCTOR")
                                                .requestMatchers(org.springframework.http.HttpMethod.DELETE,
                                                                "/api/v1/courses/**", "/api/v1/quizzes/**",
                                                                "/api/v1/assignments/**", "/api/v1/groups/**",
                                                                "/api/v1/meetings/**",
                                                                "/api/courses/**", "/api/quizzes/**",
                                                                "/api/assignments/**", "/api/groups/**",
                                                                "/api/meetings/**")
                                                .hasAnyRole("ADMIN", "INSTRUCTOR")

                                                // Allow GET for everyone authenticated
                                                .requestMatchers(org.springframework.http.HttpMethod.GET,
                                                                "/api/v1/courses/**", "/api/v1/quizzes/**",
                                                                "/api/v1/assignments/**", "/api/v1/groups/**",
                                                                "/api/v1/meetings/**",
                                                                "/api/courses/**", "/api/quizzes/**",
                                                                "/api/assignments/**", "/api/groups/**",
                                                                "/api/meetings/**")
                                                .authenticated()

                                                // Others
                                                .requestMatchers("/api/users/**").authenticated()
                                                .requestMatchers("/api/dashboard/**").authenticated()
                                                .requestMatchers("/api/v1/notifications/**").authenticated()
                                                .anyRequest().authenticated())
                                .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                                .authenticationProvider(authenticationProvider)
                                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                                .headers(headers -> headers.frameOptions(frame -> frame.disable()))
                                .exceptionHandling(ex -> ex
                                                .authenticationEntryPoint((request, response, authException) -> {
                                                        response.setStatus(
                                                                        jakarta.servlet.http.HttpServletResponse.SC_UNAUTHORIZED);
                                                        response.setContentType("application/json");
                                                        response.getWriter().write(
                                                                        "{\"error\": \"Unauthorized\", \"message\": \""
                                                                                        + authException.getMessage()
                                                                                        + "\"}");
                                                }));

                return http.build();
        }

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration configuration = new CorsConfiguration();
                configuration.setAllowedOriginPatterns(
                                List.of("http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001",
                                                "http://localhost:3030", "http://127.0.0.1:3030", "http://localhost:8082",
                                                "http://161.118.215.197:3000", "https://projectmf.id.vn",
                                                "https://www.projectmf.id.vn"));
                configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
                configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With"));
                configuration.setAllowCredentials(true);
                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", configuration);
                return source;
        }
}
