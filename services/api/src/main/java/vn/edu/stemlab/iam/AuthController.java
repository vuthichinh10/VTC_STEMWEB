package vn.edu.stemlab.iam;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.security.Principal;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.*;
import vn.edu.stemlab.shared.ApiException;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
  private final JdbcClient db;
  private final PasswordEncoder passwords;

  public AuthController(JdbcClient db, PasswordEncoder passwords) {
    this.db = db;
    this.passwords = passwords;
  }

  record Register(
      @NotBlank @Size(min = 2, max = 50) String displayName,
      @NotBlank @Size(min = 3, max = 50) String username,
      @NotBlank @Size(min = 8, max = 100) String password) {}

  record Login(@NotBlank String username, @NotBlank String password) {}

  record UserView(UUID id, String displayName, String username, String role) {}

  record Account(UUID id, String displayName, String username, String passwordHash, String role) {}

  @GetMapping("/csrf")
  public Map<String, String> csrf(CsrfToken token) {
    return Map.of("headerName", token.getHeaderName());
  }

  @PostMapping("/register")
  @ResponseStatus(HttpStatus.CREATED)
  UserView register(@Valid @RequestBody Register input, HttpServletRequest request) {
    var username = normalize(input.username());
    if (db.sql("select count(*) from users where username=:u")
            .param("u", username)
            .query(Integer.class)
            .single()
        > 0)
      throw new ApiException(
          HttpStatus.BAD_REQUEST,
          "REGISTRATION_FAILED",
          "Không thể tạo tài khoản với thông tin này.");
    UUID id = UUID.randomUUID();
    db.sql(
            "insert into users(id,display_name,username,password_hash,role) values(:id,:d,:u,:p,'STUDENT')")
        .param("id", id)
        .param("d", input.displayName().trim())
        .param("u", username)
        .param("p", passwords.encode(input.password()))
        .update();
    var view = new UserView(id, input.displayName().trim(), username, "STUDENT");
    signIn(view, request);
    return view;
  }

  @PostMapping("/login")
  UserView login(@Valid @RequestBody Login input, HttpServletRequest request) {
    var a = find(normalize(input.username()));
    if (a == null || !passwords.matches(input.password(), a.passwordHash()))
      throw new ApiException(
          HttpStatus.UNAUTHORIZED, "AUTH_INVALID", "Tên đăng nhập hoặc mật khẩu chưa đúng.");
    var view = new UserView(a.id(), a.displayName(), a.username(), a.role());
    signIn(view, request);
    return view;
  }

  @GetMapping("/me")
  UserView me(Principal principal) {
    if (principal == null)
      throw new ApiException(
          HttpStatus.UNAUTHORIZED, "AUTH_REQUIRED", "Em cần đăng nhập để tiếp tục.");
    var a = find(principal.getName());
    return new UserView(a.id(), a.displayName(), a.username(), a.role());
  }

  private Account find(String username) {
    return db.sql(
            "select id,display_name,username,password_hash,role from users where username=:u and active=true")
        .param("u", username)
        .query(
            (rs, n) ->
                new Account(
                    rs.getObject("id", UUID.class),
                    rs.getString("display_name"),
                    rs.getString("username"),
                    rs.getString("password_hash"),
                    rs.getString("role")))
        .optional()
        .orElse(null);
  }

  private void signIn(UserView user, HttpServletRequest request) {
    var auth =
        UsernamePasswordAuthenticationToken.authenticated(
            user.username(),
            null,
            java.util.List.of(new SimpleGrantedAuthority("ROLE_" + user.role())));
    var context = SecurityContextHolder.createEmptyContext();
    context.setAuthentication(auth);
    SecurityContextHolder.setContext(context);
    request
        .getSession(true)
        .setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, context);
  }

  private String normalize(String username) {
    return username.trim().toLowerCase(java.util.Locale.ROOT);
  }
}
