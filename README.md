# STEM Lab V5 — M0 + M1 + M2 foundation

Kiến trúc kế tiếp của `STEM_Lab_V4.html`: frontend React Native/Expo Router chạy Web, API Java Spring Boot và PostgreSQL. Bản hiện tại có khung M0, phần cốt lõi M1 và lát cắt đầu tiên của M2: Maker, board profile, gợi ý/kiểm tra chân và lưu revision dự án. Ứng dụng không giả lập kết quả mô phỏng hay trạng thái phần cứng.

## Chạy bằng Docker

Yêu cầu Docker Desktop có Compose v2.

```powershell
Copy-Item .env.example .env
# Đổi các giá trị CHANGE_ME trong .env chỉ khi cần expose môi trường ngoài máy dev.
docker compose --env-file .env -f infra/compose.yaml up --build
```

Mở <http://localhost:8080>. Health API: <http://localhost:8080/actuator/health>. Database được Flyway seed 10 bài, 4 dự án và 7 module từ V4. Không có tài khoản mặc định; dùng trang Đăng ký để tạo tài khoản `STUDENT`.

Lưu ý: cấu hình Mosquitto hiện là **local development only**, chỉ nằm trên internal Docker network và chưa được API sử dụng. M5 phải bổ sung TLS, ACL và credentials riêng từng thiết bị trước khi mở cổng broker.

## Chạy local

Yêu cầu Node 22+, npm 10+, Java 21, Maven 3.9+, PostgreSQL 16+.

```powershell
npm install
$env:SPRING_DATASOURCE_URL='jdbc:postgresql://localhost:5432/stemlab'
$env:SPRING_DATASOURCE_USERNAME='stemlab'
$env:SPRING_DATASOURCE_PASSWORD='your-local-password'
mvn -f services/api/pom.xml spring-boot:run
npm run dev:web
```

Expo web mặc định ở `http://localhost:8081`; API ở `http://localhost:8080`.

### Cấu hình trợ giảng AI

Tạo project API key trên OpenAI Platform và đặt ở **backend environment**. Không đưa key vào `EXPO_PUBLIC_*` hoặc source frontend.

```powershell
$env:OPENAI_API_KEY='your-project-key'
$env:OPENAI_MODEL='gpt-5.2'
mvn -f services/api/pom.xml spring-boot:run
```

Với Docker, điền `OPENAI_API_KEY` trong file `.env` cục bộ rồi rebuild riêng service `api`. Endpoint `/api/v1/ai/tutor` yêu cầu đăng nhập, giới hạn câu hỏi/lịch sử và chỉ hướng dẫn chủ đề mạch nhúng. Không commit file `.env`.

## Kiểm tra

```powershell
npm run typecheck
npm test
npm run build:web
mvn -f services/api/pom.xml test
mvn -f services/api/pom.xml package
docker compose -f infra/compose.yaml config
```

## Trạng thái milestone

- M0 — **Implemented, runtime verification pending:** monorepo, Expo web, Spring Boot, PostgreSQL/Flyway, broker dev cô lập, Compose, healthcheck, config env, docs và CI. `compose config` đã pass; daemon Docker của máy kiểm tra chưa chạy nên chưa xác nhận startup toàn stack.
- M1 — **Core implemented, not milestone-complete:** giao diện kế thừa V4; session auth; 10 bài/4 dự án/7 module từ DB; tiến độ bài học lưu PostgreSQL và resume. Còn thiếu E2E browser và kiểm tra reload trên stack Docker thật.
- M2 — **Foundation implemented, not milestone-complete:** Maker tạo code + wiring, validation client/server và lưu revision 1 vào PostgreSQL. Còn thiếu mở/sửa revision, optimistic conflict, import/export và workspace dự án.
- M3–M7 — **Not done:** Không có tuyên bố simulator, MQTT device, BLE, firmware hay OTA hoạt động.

Xem [kiến trúc](docs/architecture/overview.md), [OpenAPI](docs/api/openapi.yaml), [board demo](docs/board-profiles/esp32-wroom32-demo.md), [phạm vi mô phỏng](docs/simulation/supported-arduino-api.md), và [checklist](docs/milestones.md).
