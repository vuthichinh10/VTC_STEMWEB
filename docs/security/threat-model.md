# Threat model (initial)

- Student accounts: collect only display name, username and password; BCrypt cost 12; generic registration/login errors; roles cannot be self-elevated.
- Web session: HttpOnly, SameSite cookie and CSRF double-submit cookie/header; explicit CORS allowlist.
- Curriculum/progress: validate size and step boundaries server-side; authorization derives user ID from session, never request JSON.
- Future compiler: untrusted code, no network/Docker socket, non-root, read-only base, strict CPU/wall/memory/output quotas.
- Future MQTT/BLE: unique device identity, scoped ACL, authenticated pairing, command ACK, exclusive lease, bounded GPIO allowlist and emergency stop.
- Privacy: teacher access and retention are not yet implemented; no teacher dashboard claims otherwise.
