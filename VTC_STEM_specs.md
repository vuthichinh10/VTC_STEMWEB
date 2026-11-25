# Đặc tả chức năng web VTC STEM

## 1. Tổng quan

VTC STEM là nền tảng học STEM dành cho học sinh, kế thừa nội dung và luồng học của STEM Lab V4 trên kiến trúc mới gồm React Native Web, Expo Router, Java Spring Boot và PostgreSQL. Hệ thống tập trung vào học liệu điện tử, thiết kế mạch, viết mã Arduino, lưu tiến độ và hỗ trợ học tập bằng AI.

Tài liệu này mô tả chức năng thực tế đang có trong mã nguồn. Các trạng thái được hiểu như sau:

- **Đã triển khai:** có giao diện và luồng xử lý/API tương ứng.
- **Triển khai một phần:** đã có một phần luồng thật nhưng chưa đủ pipeline hoặc kiểm thử để xác nhận hoàn chỉnh.
- **Giao diện nền:** mới có màn hình hoặc thao tác cục bộ, chưa có nghiệp vụ backend hoàn chỉnh.
- **Chưa triển khai:** chưa có pipeline thực thi đáp ứng đặc tả.

## 2. Kiến trúc và nền tảng

### 2.1 Frontend

- React Native, React Native Web và TypeScript.
- Expo Router quản lý điều hướng theo cấu trúc file.
- TanStack Query quản lý dữ liệu lấy từ server.
- Zustand quản lý phiên đăng nhập phía client.
- React Hook Form và Zod kiểm tra biểu mẫu xác thực.
- Giao diện responsive dùng chung design token, component thẻ, nút, trạng thái và shell điều hướng.

### 2.2 Backend

- Java 21 và Spring Boot theo kiến trúc modular monolith.
- Spring Security quản lý session, CSRF và phân quyền endpoint.
- PostgreSQL lưu tài khoản, học liệu, tiến độ, board profile và dự án Maker.
- Flyway quản lý schema và dữ liệu seed.
- OpenAI API được gọi từ backend cho trợ giảng AI; API key không được gửi xuống trình duyệt.

### 2.3 Hạ tầng

- Docker Compose định nghĩa web, API, PostgreSQL, Nginx và Mosquitto.
- Mosquitto hiện chỉ là hạ tầng phát triển nội bộ, chưa được API sử dụng làm pipeline điều khiển thiết bị.
- API base URL và thông tin kết nối được cấu hình bằng biến môi trường.

## 3. Điều hướng web

| Đường dẫn              | Chức năng                    | Trạng thái                           |
| ---------------------- | ---------------------------- | ------------------------------------ |
| `/`                    | Tổng quan và tiến độ học tập | Đã triển khai                        |
| `/auth/login`          | Đăng nhập                    | Đã triển khai                        |
| `/auth/register`       | Đăng ký tài khoản học sinh   | Đã triển khai                        |
| `/learn`               | Danh sách bài học STEM       | Đã triển khai                        |
| `/learn/:lessonId`     | Không gian học theo bốn bước | Đã triển khai, chưa có mô phỏng thật |
| `/projects`            | Danh sách dự án mở rộng      | Đã triển khai                        |
| `/projects/:projectId` | Không gian lắp mạch dự án    | Triển khai một phần                  |
| `/maker`               | Không gian tự sáng tạo       | Triển khai một phần                  |
| `/catalog`             | Thư viện module              | Đã triển khai                        |
| `/groups`              | Nhóm sáng tạo                | Giao diện nền                        |
| `/devices`             | Kết nối mạch thật            | BLE một phần; Wi-Fi chưa triển khai  |
| `/ai-study`            | Trợ giảng STEM bằng AI       | Đã triển khai khi backend có API key |
| `/profile`             | Hồ sơ người dùng             | Màn hình giữ chỗ                     |

## 4. Chức năng người dùng

### 4.1 Đăng ký và đăng nhập

Hệ thống cung cấp các chức năng:

- Đăng ký bằng tên hiển thị, tên đăng nhập và mật khẩu.
- Đăng nhập bằng session cookie.
- Khôi phục phiên hiện tại qua endpoint `auth/me`.
- Đăng xuất có bảo vệ CSRF.
- Gán vai trò `STUDENT` cho tài khoản đăng ký từ giao diện.
- Giới hạn các thao tác lưu tiến độ, lưu dự án, tạo nhóm và dùng AI khi chưa đăng nhập.

Chưa có chức năng quên mật khẩu hoặc quy trình giáo viên đặt lại mật khẩu.

### 4.2 Tổng quan học tập

Trang tổng quan hiển thị:

- Số bài học đã hoàn thành trên tổng số 10 bài.
- Số dự án đã hoàn thành.
- Số nhóm đã tham gia.
- Số mạch đã ghép nối.
- Bài học gần nhất để tiếp tục.
- Liên kết nhanh đến bài học, dự án và Maker.

Các số liệu lấy từ backend. Những chỉ số chưa có module nghiệp vụ hoàn chỉnh có thể giữ giá trị mặc định.

## 5. Học liệu STEM

### 5.1 Danh sách bài học

PostgreSQL được seed 10 bài học và giữ nguyên ID nội dung V4:

1. `led-on` — Thắp sáng LED đầu tiên.
2. `blink` — LED nhấp nháy.
3. `button` — Đọc nút nhấn.
4. `pwm` — Điều chỉnh độ sáng LED.
5. `pot` — Đọc biến trở bằng ADC.
6. `ldr` — Đo ánh sáng môi trường.
7. `buzzer` — Tạo âm báo cảnh báo.
8. `bh1750` — Đọc BH1750 qua I²C.
9. `button-led` — Nhấn nút bật LED.
10. `night` — Đèn ngủ theo ánh sáng.

Mỗi thẻ bài học hiển thị tiêu đề, chủ đề, cấp độ, thời lượng, mô tả và module cần dùng.

### 5.2 Không gian bài học bốn bước

Mỗi bài học có bốn bước:

1. Khám phá câu hỏi và đưa ra dự đoán.
2. Lắp mạch theo hướng dẫn và thông tin module.
3. Đọc hoặc chỉnh sửa mã Arduino mẫu.
4. Ghi lại quan sát, kết luận và đánh dấu hoàn thành.

Khi đã đăng nhập, hệ thống lưu `step`, dự đoán, quan sát, kết luận và trạng thái hoàn thành vào PostgreSQL. Người học có thể tải lại trang và tiếp tục từ tiến độ đã lưu.

Nút chạy mô phỏng đang bị vô hiệu hóa. Mã Arduino hiện là nội dung học tập, chưa được compiler và virtual HAL thực thi.

## 6. Dự án mở rộng

Hệ thống có bốn dự án giữ ID V4:

- `night` — Đèn ngủ thông minh.
- `traffic` — Đèn giao thông mini.
- `access` — Nút bấm điều khiển đèn.
- `servo` — Cánh tay servo mini.

Trang danh sách hiển thị độ khó, thời lượng, mô tả và module yêu cầu. Workspace dự án cho phép:

- Xem mục tiêu và danh sách module.
- Tải board profile và quy tắc tương thích từ backend.
- Thêm module vào sơ đồ mạch.
- Chọn GPIO và nhận cảnh báo chân không phù hợp hoặc xung đột.

Workspace chưa lưu trạng thái dự án mở rộng, chưa chạy code và chưa xác minh hành vi trên phần cứng.

## 7. Maker tự sáng tạo

Maker cho phép học sinh:

- Đặt tên và mô tả ý tưởng.
- Thêm hoặc gỡ module.
- Nhận gợi ý GPIO từ board profile.
- Thay đổi GPIO cho từng module.
- Phát hiện chân input-only, chân dành riêng, thiếu capability hoặc nhiều module dùng cùng một chân.
- Viết và chỉnh sửa mã Arduino dạng văn bản.
- Lưu đồng thời code và wiring thành revision đầu tiên trong PostgreSQL.

Backend xác thực lại circuit trước khi lưu, không chỉ tin kết quả kiểm tra phía trình duyệt. Profile hiện dùng `esp32-wroom32-demo`, version 1 và mang trạng thái demo cần đối chiếu với phần cứng thật.

Maker chưa hỗ trợ:

- Mở và chỉnh sửa dự án đã lưu.
- Lịch sử revision, fork và xử lý xung đột phiên bản.
- Import hoặc export JSON.
- Mô hình đầy đủ cho nguồn, GND, I²C bus, điện áp và dòng tải.
- Biên dịch, mô phỏng hoặc nạp firmware.

## 8. Thư viện module

Thư viện lấy dữ liệu module từ PostgreSQL và hiển thị:

- Tên và biểu tượng module.
- Loại tín hiệu.
- Mô tả cách sử dụng.
- Thông tin an toàn.

Bảy loại module seed gồm LED, nút nhấn, biến trở, cảm biến ánh sáng analog, còi chủ động qua driver, servo SG90 và BH1750 I²C.

## 9. Kết nối mạch thật

### 9.1 Bluetooth Low Energy

Trên trình duyệt web hỗ trợ Web Bluetooth, khi nhấn **Kết nối Bluetooth**, hệ thống:

- Kiểm tra trang đang chạy trong secure context bằng HTTPS hoặc localhost.
- Mở bộ chọn thiết bị Bluetooth theo thao tác trực tiếp của người dùng.
- Có thể lọc theo `EXPO_PUBLIC_BLE_SERVICE_UUID` nếu UUID service được cấu hình.
- Kết nối đến GATT server của thiết bị đã chọn.
- Hiển thị trạng thái chưa kết nối, đang kết nối hoặc đã kết nối.
- Hiển thị tên thiết bị đã kết nối.
- Cho phép chủ động ngắt kết nối.
- Phát hiện sự kiện thiết bị mất kết nối và cập nhật lại giao diện.
- Hiển thị lỗi khi trình duyệt không hỗ trợ, trang không an toàn, người dùng hủy chọn hoặc GATT connect thất bại.

Phạm vi BLE hiện chỉ dừng ở thiết lập kết nối GATT. Chưa có characteristic `command`, `event`, `capabilities`, giao thức frame/ACK, xác thực phiên, gateway đồng bộ backend, reconnect có kiểm soát hoặc kiểm thử trên board tương thích. Vì vậy BLE chưa được xem là pipeline điều khiển mạch hoàn chỉnh.

Ứng dụng native chưa có BLE module. Expo Go sẽ báo không hỗ trợ thay vì hiển thị kết nối thành công giả.

### 9.2 Wi-Fi và MQTT

Màn hình có nút **Kết nối Wi-Fi**, nhưng nút chưa nối với pipeline thiết bị. Broker Mosquitto trong Docker Compose chưa có TLS, ACL, provisioning, credential riêng cho thiết bị hoặc adapter API-to-MQTT.

Chưa có bằng chứng HIL để xác nhận điều khiển ESP32 qua MQTT.

### 9.3 Firmware và OTA

Web không hỗ trợ nạp firmware hoặc OTA. Chưa có compiler firmware, chữ ký artifact, xác thực thiết bị, phân quyền triển khai, rollback hoặc kiểm thử phần cứng.

## 10. Trợ giảng AI

Trang **Học tập cùng AI** cung cấp:

- Kiểm tra trạng thái cấu hình AI từ backend.
- Các câu hỏi gợi ý về ESP32, Arduino, GPIO, ADC, PWM, I²C, cảm biến và tìm lỗi mạch.
- Giao diện hội thoại người dùng và trợ giảng.
- Trạng thái đang xử lý và thông báo lỗi.
- Giới hạn câu hỏi 4.000 ký tự.
- Gửi tối đa tám tin nhắn lịch sử gần nhất làm ngữ cảnh.
- Chỉ cho phép người dùng đã đăng nhập gửi câu hỏi.

Backend đọc `OPENAI_API_KEY` và `OPENAI_MODEL` từ môi trường. Tính năng chỉ hoạt động khi API key hợp lệ được cấu hình ở backend.

Trợ giảng cung cấp hướng dẫn học tập; không tự điều khiển board và không xác nhận mạch vật lý đã an toàn.

## 11. Nhóm sáng tạo

Màn hình nhóm hiện có:

- Form nhập tên nhóm.
- Form tham gia bằng mã mời.
- Các tab Dự án, Nhiệm vụ, Thảo luận và Thành viên.
- Khóa thao tác khi chưa đăng nhập.
- Empty state theo tab đang chọn.

Đây mới là giao diện nền. Nút tạo và tham gia nhóm chưa gọi backend; chưa có lưu nhóm, thành viên, nhiệm vụ, thảo luận, chia sẻ dự án, realtime collaboration hoặc controller lease cho mạch thật.

## 12. API đang có

| Nhóm      | Endpoint chính                  | Chức năng                           |
| --------- | ------------------------------- | ----------------------------------- |
| Xác thực  | `/api/v1/auth/csrf`             | Cấp hoặc làm mới CSRF token         |
| Xác thực  | `/api/v1/auth/register`         | Đăng ký tài khoản                   |
| Xác thực  | `/api/v1/auth/login`            | Đăng nhập                           |
| Xác thực  | `/api/v1/auth/logout`           | Đăng xuất                           |
| Xác thực  | `/api/v1/auth/me`               | Lấy người dùng hiện tại             |
| Học liệu  | `/api/v1/lessons`               | Danh sách bài học                   |
| Học liệu  | `/api/v1/lessons/{id}`          | Chi tiết bài học                    |
| Tiến độ   | `/api/v1/lessons/{id}/progress` | Đọc và lưu tiến độ                  |
| Danh mục  | `/api/v1/modules`               | Danh sách module                    |
| Dự án mẫu | `/api/v1/curriculum/projects`   | Danh sách dự án mở rộng             |
| Tổng quan | `/api/v1/dashboard`             | Thống kê học tập                    |
| Board     | `/api/v1/board-profiles/{id}`   | Board profile và danh sách chân     |
| Board     | `/api/v1/module-specs`          | Capability và chân gợi ý của module |
| Board     | `/api/v1/circuits/validate`     | Kiểm tra circuit phía server        |
| Maker     | `/api/v1/projects`              | Tạo và đọc dự án Maker              |
| AI        | `/api/v1/ai/tutor/status`       | Kiểm tra cấu hình AI                |
| AI        | `/api/v1/ai/tutor`              | Gửi câu hỏi đến trợ giảng           |

## 13. An toàn và bảo mật

- Phiên đăng nhập dùng cookie và CSRF protection.
- Mật khẩu được xử lý ở backend, không lưu trong frontend.
- OpenAI API key chỉ tồn tại ở backend environment.
- Circuit được kiểm tra lại phía server trước khi lưu.
- Không tự kích hoạt thiết bị khi tải trang.
- Kết nối Bluetooth chỉ bắt đầu sau thao tác người dùng.
- Không hiển thị mô phỏng, MQTT, firmware hoặc OTA là thành công khi chưa có pipeline thật.
- Board profile hiện là hồ sơ demo, không thay thế schematic hoặc xác minh điện áp trên phần cứng sản xuất.

## 14. Trạng thái triển khai tổng hợp

| Phạm vi                               | Trạng thái hiện tại                       |
| ------------------------------------- | ----------------------------------------- |
| Khung React Native Web và điều hướng  | Đã triển khai                             |
| Spring Boot, PostgreSQL và Flyway     | Đã triển khai                             |
| Đăng ký, đăng nhập, đăng xuất         | Đã triển khai                             |
| 10 bài học và tiến độ bốn bước        | Đã triển khai phần cốt lõi                |
| 4 dự án và 7 module V4                | Đã seed và hiển thị                       |
| Board profile và kiểm tra GPIO        | Đã triển khai nền tảng                    |
| Maker lưu revision đầu tiên           | Đã triển khai                             |
| Trợ giảng AI                          | Đã triển khai, phụ thuộc cấu hình backend |
| Nhóm và cộng tác                      | Giao diện nền                             |
| Web Bluetooth GATT connect/disconnect | Triển khai một phần                       |
| BLE command, event, ACK và gateway    | Chưa triển khai                           |
| Wi-Fi/MQTT điều khiển mạch            | Chưa triển khai                           |
| Compiler và mô phỏng theo code        | Chưa triển khai                           |
| Firmware deployment và OTA            | Chưa triển khai                           |
| Kiểm thử end-to-end trình duyệt       | Chưa hoàn chỉnh                           |
| Hardware-in-the-loop                  | Chưa có                                   |

## 15. Điều kiện để xác nhận hoàn chỉnh

Các tính năng sau chỉ được đánh dấu hoàn chỉnh khi có pipeline và kiểm thử tương ứng:

- Mô phỏng phải biên dịch tập Arduino C++ được hỗ trợ và điều khiển virtual HAL từ trace thực thi.
- MQTT phải có provisioning, TLS, ACL, device identity, command ACK, timeout và HIL test.
- BLE phải có service/characteristic đã chốt, protocol frame, ACK, session authorization, gateway và kiểm thử thiết bị tương thích.
- Firmware deployment phải có compiler, artifact signing, quyền triển khai, xác minh board, rollback và HIL test.
- Điều khiển mạch thật phải có lease, giới hạn an toàn, dừng khẩn cấp và audit trail.
