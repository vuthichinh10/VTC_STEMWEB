# Acceptance status — 2026-10-15

## M0

- [x] Expo Router + React Native Web TypeScript workspace
- [x] Java 21 Spring Boot API, PostgreSQL/Flyway, health probes
- [ ] Docker Compose web/API/DB/internal dev broker (`compose config` pass; startup chưa kiểm chứng vì Docker daemon không chạy)
- [x] Environment configuration, design tokens, API client, error contract
- [x] Build/test/typecheck scripts and CI definition

## M1

- [x] Responsive V4 visual language and navigation
- [x] 10 lessons, 4 projects, 7 modules seeded in PostgreSQL
- [x] Full-screen student register/login/logout API with session and CSRF
- [x] Four-step lesson workspace; authenticated progress persists and resumes
- [x] Clear simulation/hardware unavailable states
- [ ] Browser E2E coverage (unit/API build checks exist)
- [ ] Password recovery (no email/teacher reset provider, intentionally not exposed)

## M2

- [x] Board profile và module capability được version hóa trong PostgreSQL
- [x] Maker thêm/gỡ module, gợi ý GPIO và báo input-only/xung đột
- [x] API xác thực lại circuit trước khi lưu revision 1
- [x] Unit test compatibility engine trên TypeScript và Java
- [ ] Mở/sửa dự án, optimistic concurrency/409, lịch sử/fork/import/export
- [ ] CircuitGraph đầy đủ cho nguồn, GND, I²C bus, điện áp và dòng tải

## Later milestones

- [ ] M3 real compiler, virtual HAL and all 10 simulation acceptance tests
- [ ] M4 groups/classroom/collaboration
- [ ] M5 MQTT device pipeline and HIL verification
- [ ] M6 BLE GATT adapters and compatible-device verification
- [ ] M7 hardening; OTA remains disabled until its complete signed pipeline exists
