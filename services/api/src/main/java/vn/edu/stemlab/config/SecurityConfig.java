package vn.edu.stemlab.config;

import java.util.Arrays;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class SecurityConfig {
  @Bean
  PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder(12);
  }

  @Bean
  SecurityFilterChain security(HttpSecurity http) throws Exception {
    var csrf = CookieCsrfTokenRepository.withHttpOnlyFalse();
    csrf.setCookiePath("/");
    http.cors(Customizer.withDefaults())
        .csrf(
            c ->
                c.csrfTokenRepository(csrf)
                    .ignoringRequestMatchers(
                        "/api/v1/auth/register",
                        "/api/v1/auth/login",
                        "/api/v1/auth/logout"))
        .authorizeHttpRequests(
            a ->
                a.requestMatchers(
                        "/actuator/health/**",
                        "/api/v1/auth/register",
                        "/api/v1/auth/login",
                        "/api/v1/auth/csrf",
                        "/api/v1/lessons/**",
                        "/api/v1/modules/**",
                        "/api/v1/module-specs",
                        "/api/v1/board-profiles/**",
                        "/api/v1/circuits/validate",
                        "/api/v1/curriculum/projects",
                        "/api/v1/dashboard")
                    .permitAll()
                    .anyRequest()
                    .authenticated())
        .logout(
            l ->
                l.logoutUrl("/api/v1/auth/logout")
                    .deleteCookies("JSESSIONID")
                    .invalidateHttpSession(true)
                    .logoutSuccessHandler((req, res, auth) -> res.setStatus(204)))
        .httpBasic(h -> h.disable())
        .formLogin(f -> f.disable());
    return http.build();
  }

  @Bean
  CorsConfigurationSource cors(@Value("${app.cors-allowed-origins}") String origins) {
    var c = new CorsConfiguration();
    c.setAllowedOrigins(Arrays.stream(origins.split(",")).map(String::trim).toList());
    c.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
    c.setAllowedHeaders(List.of("Content-Type", "X-XSRF-TOKEN", "If-Match"));
    c.setAllowCredentials(true);
    var source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", c);
    return source;
  }
}
