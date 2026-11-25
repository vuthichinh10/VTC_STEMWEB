# STEM LAB — ĐẶC TẢ TRIỂN KHAI CHO CODEX

> **Loại tài liệu:** PRD + UX/UI Specification + Technical Architecture + Implementation Contract + Acceptance Criteria  
> **Phiên bản tài liệu:** 1.0 — 15/10/2026  
> **Tên sản phẩm:** STEM Lab (bản kiến trúc tiếp theo V4, tạm gọi V5)  
> **Ngôn ngữ giao diện:** tiếng Việt; chuẩn bị i18n để bổ sung tiếng Anh  
> **Frontend bắt buộc:** React Native + Expo Router + React Native Web + TypeScript  
> **Backend bắt buộc:** Java + Spring Boot  
> **Cơ sở dữ liệu bắt buộc:** PostgreSQL  
> **Messaging:** MQTT broker; Wi‑Fi và Bluetooth Low Energy (BLE) dùng các transport adapter khác nhau  
> **Nguồn giao diện:** `STEM_Lab_V4.html` do người dùng cung cấp trong cuộc hội thoại; đường dẫn `file:///C:/Users/ChinhVT/Downloads/STEM_Lab_V4.html` là đường dẫn trên máy người dùng, KHÔNG phải HTTP endpoint và không được hardcode vào mã nguồn.

## 0. CHỈ THỊ BẮT BUỘC CHO CODEX

Đóng vai Senior Full-stack Architect, Senior Embedded Engineer, Senior Frontend Developer và Product Designer cho hệ thống học STEM dành cho học sinh. **Hãy xây dựng source code thực sự chạy được**, không chỉ tạo mockup. Phân chia rõ những tính năng chưa có firmware/board/test fixture để không hiển thị trạng thái thành công giả.

1. **Đọc file V4 trước** nếu nó hiện diện trong workspace. Giữ ngôn ngữ thiết kế, luồng học 4 bước, các bài học/module/dự án, hành vi đăng nhập và nhóm làm việc đã có. Tài liệu này là yêu cầu **nâng cấp kiến trúc**, không phải yêu cầu sao chép cách viết HTML/JS đơn file.
2. Mọi tính năng phải nằm trong module có interface và contract rõ ràng. Không viết logic nghiệp vụ vào component giao diện, controller, hoặc một file `utils.ts`/`Service.java` khổng lồ.
3. Chạy bằng Docker Compose ở môi trường phát triển; cấu hình thông qua `.env` hoặc environment variables, **không hardcode** IP, domain, mật khẩu, broker URL, thiết bị.
4. Dữ liệu tài khoản, bài học đã hoàn thành, nhóm, dự án, phiên bản và kết quả thực hành phải lưu ở PostgreSQL. Local cache chỉ để tăng trải nghiệm offline.
5. **Một nguồn chân lý duy nhất cho mô phỏng:** code đang được chạy + bản đồ module/pin + trạng thái input ảo. Thay đổi code hợp lệ → chạy lại → mô phỏng thay đổi theo code. **Cấm** hardcode hiệu ứng theo ID bài học để giả lập việc chạy chương trình.
6. Mạch thật qua Wi‑Fi dùng MQTT. BLE dùng GATT và một adapter/gateway của frontend hoặc ứng dụng native; gateway chuyển cùng một `DeviceCommand`/`DeviceEvent` sang backend. **Không giả định MQTT hoạt động trực tiếp trên BLE.**
7. Không được giả vờ hỗ trợ nạp code/OTA nếu chưa xây pipeline biên dịch, xác thực thiết bị, ký firmware, phân quyền và kiểm chứng trên phần cứng. Phân biệt rõ `Simulation`, `Live Control`, `Firmware Deployment`.
8. Đặt an toàn học sinh và phần cứng lên trước: không tự kích hoạt thiết bị khi tải trang; xác nhận trước khi điều khiển thực; giới hạn quyền GPIO, điện áp, tải và thời gian; nút dừng khẩn cấp; không cho hai người cùng điều khiển mạch khi chưa có cơ chế lock.
9. Mỗi giai đoạn phải có test tự động, build, lint, format và `README.md` đủ để chạy lại. Không tuyên bố tính năng hoàn thành khi chỉ có giao diện.
10. Nếu thiếu **board profile/pinout thật**, dùng **hồ sơ demo ESP32-WROOM-32** và ghi rõ `DEMO PROFILE — VERIFY AGAINST PHYSICAL HARDWARE`; thiết kế profile dạng cấu hình để dễ thay board.

## 1. PHẠM VI GIAO DIỆN GỐC V4 ĐÃ ĐƯỢC RÀ SOÁT

### 1.1 Những gì thực sự có trong V4

- Menu chính: **Tổng quan**, **Bài học STEM**, **Dự án mở rộng**, **Tự sáng tạo**, **Thư viện module**, **Nhóm sáng tạo**, **Kết nối mạch thật**, **Góc giáo viên**.
- Tổng quan: banner xanh tím, thẻ tiến độ, gợi ý bắt đầu, thông tin nhóm.
- **10 bài học** (ID nguồn V4 được giữ để hỗ trợ migration):
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
- **4 dự án mở rộng:** `night` Đèn ngủ thông minh; `traffic` Đèn giao thông mini; `access` Nút bấm điều khiển đèn; `servo` Cánh tay servo mini.
- **7 loại module demo:** LED, nút nhấn, biến trở, cảm biến ánh sáng analog, còi chủ động qua driver, servo SG90, cảm biến BH1750 I²C.
- Maker: tên dự án, mô tả, thêm module, gợi ý chân, kiểm tra kết nối, lập trình/chạy thử, lưu/xuất/nhập JSON.
- Nhóm: tạo nhóm, tham gia bằng mã, thành viên, nhiệm vụ, thảo luận, chia sẻ dự án và kiểm tra xung đột phiên bản.
- Kết nối: Wi‑Fi, Web Bluetooth BLE, USB dự phòng, mã ghép nối và dừng đầu ra.
- Đăng ký/đăng nhập: modal trong V4, backend cũ FastAPI + SQLite.
- Góc giáo viên V4 mới là báo cáo **cục bộ**, chưa phải quản lý lớp nhiều tài khoản.

### 1.2 Các tồn tại cần sửa trong V5

- Phần trình diễn mô phỏng của V4 chủ yếu chạy logic định trước theo bài học, **chưa chạy lại chương trình Arduino tùy ý mà học sinh vừa sửa**.
- Chưa có compiler/simulator thật cho code Arduino; V4 chưa hỗ trợ OTA từ trình soạn thảo.
- Giao diện một file HTML, nhiều state nằm trong browser, rất khó nâng cấp theo module.
- Các thao tác nhóm chưa phải chỉnh sửa realtime cấp ký tự; tránh biến bản ghi dự án thành “last write wins”.
- Kết nối V4 dùng websocket relay theo IP và BLE trực tiếp; V5 phải thay đường Wi‑Fi bằng MQTT broker, vẫn có thể cung cấp adapter tương thích V4 nếu thật sự cần.
- Sơ đồ chân V4 là ESP32 demo, **không đại diện cho board custom**.

### 1.3 Visual design bắt buộc kế thừa

Tái hiện ở mức tương đương trải nghiệm V4, không cần pixel-perfect. Dùng design tokens:

| Token | Giá trị V4 tham chiếu | Mục đích |
|---|---|---|
| `background` | `#F5F7FC` | nền ứng dụng |
| `surface` | `#FFFFFF` | card, panel |
| `textPrimary` | `#1B2A48` | chữ chính |
| `textMuted` | `#72819C` | mô tả |
| `border` | `#E1E8F3` | đường viền |
| `primary` | `#526CF2` | hành động chính |
| `primarySoft` | `#EDF1FF` | nút/selection |
| `success` | `#15976E` | thành công |
| `warning` | `#9D6B20` | cảnh báo |
| `danger` | `#CC5361` | lỗi/dừng khẩn cấp |

- Desktop: sidebar cố định (khoảng 240–250 px), header với breadcrumb, trạng thái board, tài khoản; khu vực nội dung rộng và thoáng.
- Tablet: sidebar thu gọn; panel bài học chuyển 2 cột sang 1 cột khi cần.
- Mobile: bottom navigation hoặc drawer; thao tác cắm module, chạy code và đọc trạng thái không được phụ thuộc hover.
- Dùng component tái sử dụng: `AppShell`, `Sidebar`, `Topbar`, `StatusChip`, `Card`, `Button`, `ModuleCard`, `PinPicker`, `CodeEditor`, `CircuitCanvas`, `TelemetryChart`, `MemberAvatar`, `EmptyState`, `ConfirmDialog`.
- Thiết kế phù hợp học sinh: câu từ đơn giản, trợ giúp đúng ngữ cảnh, chọn sẵn mặc định hợp lệ, chỉ hiện lựa chọn nâng cao khi người học yêu cầu.
- A11y: hỗ trợ bàn phím, focus visible, aria trên web, screen reader, kích thước vùng chạm tối thiểu phù hợp, không truyền trạng thái chỉ qua màu.

## 2. CÔNG NGHỆ VÀ RANH GIỚI KIẾN TRÚC

### 2.1 Stack chính

| Layer | Công nghệ yêu cầu | Lưu ý |
|---|---|---|
| Web/iOS/Android | **React Native, Expo, Expo Router, TypeScript, React Native Web** | Web là nền tảng ưu tiên, nhưng tách được adapter native |
| State/data | TanStack Query; Zustand hoặc state container tương đương | Server state tách UI state |
| Form/schema | React Hook Form + Zod | Dùng schema nhất quán với OpenAPI |
| Code editor web | Monaco Editor trong component `.web.tsx` | Không ép Monaco chạy native |
| Code editor native | Editor tương thích native, chức năng cốt lõi giống web | Có thể dùng WebView được giới hạn nếu cần |
| Sơ đồ mạch | React Native SVG/Skia hoặc canvas có platform adapter | Phải thể hiện pin, net, dây, trạng thái tín hiệu |
| Backend | **Java LTS + Spring Boot + Spring Web + Spring Security** | Modular monolith ưu tiên; chưa cần microservices |
| Database | **PostgreSQL** + Spring Data JPA/JDBC | Migration Flyway; transaction rõ ràng |
| Event realtime | Spring WebSocket/STOMP hoặc WebSocket JSON có schema | Nhóm, telemetry, trạng thái job |
| MQTT | Broker Eclipse Mosquitto hoặc EMQX; Java MQTT v5 client | Dùng adapter Spring Integration MQTT/Paho phù hợp version |
| Hardware | ESP32 demo firmware, Wi‑Fi + BLE GATT | Thêm `BoardProfile` cho MCU khác |
| Simulation | Arduino C++ subset compiler + virtual HAL + sandboxed WebAssembly runtime | Xem Mục 7 |
| Artifact/media | Local filesystem abstraction ở dev; có thể S3-compatible sau | Không nhét binary firmware trong DB |
| Build/deploy | Docker Compose, Gradle wrapper, pnpm workspace | Pipeline CI bắt buộc |

**Không áp dụng business logic frontend vào backend HTML templates.** Backend Java cung cấp API và event; web app được build riêng, có thể phục vụ qua Nginx hoặc proxy.

### 2.2 React Native dùng để làm WEB như thế nào

- Web build bằng **React Native Web**; route qua **Expo Router**.
- Tạo file `.web.tsx` cho code editor, Web Bluetooth, diagram canvas khi cần; `.native.tsx` hoặc `.android.tsx`/`.ios.tsx` cho chức năng riêng nền tảng. Business logic, type, API client và state dùng chung.
- Web Bluetooth chỉ chạy trên browser hỗ trợ và HTTPS/localhost; native mobile cần BLE plugin native (development build, không mặc định hoạt động trong Expo Go).
- Các API web-only (`navigator.bluetooth`, Monaco, File System Access) **không được import trực tiếp** vào module dùng chung nếu có thể làm lỗi native bundle.

### 2.3 Quy tắc chọn kiến trúc

Bắt đầu bằng **modular monolith** cho Java API để tránh phức tạp vận hành trong trường học; ranh giới module đủ rõ để tách service sau này. Broker MQTT là hạ tầng riêng. Compiler/simulation worker phải được sandbox; không chạy code người dùng trực tiếp trong tiến trình Spring Boot.

## 3. KIẾN TRÚC LOGICAL

```text
   [React Native Web / Expo Android / Expo iOS]
     ├─ Screens + reusable design system
     ├─ REST/HTTPS + Auth session
     ├─ WebSocket (collaboration, job state, telemetry)
     ├─ Circuit editor + code editor + simulation runtime
     └─ DeviceTransport interface
          ├─ WiFiTransport: API → Java backend → MQTT broker
          ├─ WebBleTransport: Browser Web Bluetooth GATT → bridge events → API
          └─ NativeBleTransport: Native BLE GATT → bridge events → API
                         │
                    [Spring Boot]
     ├─ iam / users / schools / classes
     ├─ curriculum / lessons / progress
     ├─ catalog / boards / module-compatibility
     ├─ projects / revisions / collaboration
     ├─ devices / enrollment / leases / commands
     ├─ simulation / compiler job orchestration
     ├─ telemetry / audit / notifications
     └─ PostgreSQL + migrations
                         │
                 [MQTT broker: TLS]
                         │
                 [ESP32 Wi‑Fi firmware]
            (BLE GATT → gateway, không gọi MQTT trực tiếp)
```

`DeviceTransport` trả về các event **cùng schema** cho mọi nền tảng. UI không phân biệt chi tiết transport khi render trạng thái `connected`, `gpioValue`, `sensorValue`, `ack`, `error`.

## 4. CHI TIẾT UX/UI VÀ LUỒNG NGƯỜI DÙNG

### 4.1 Cấu trúc điều hướng

```text
/                     Tổng quan
/auth/login           Đăng nhập
/auth/register        Đăng ký
/auth/recover         Quên mật khẩu (hoặc teacher-managed reset)
/learn                Danh sách bài học
/learn/:lessonId      Workspace bài học, gồm mô phỏng và code
/projects             Dự án mở rộng
/projects/:projectId  Workspace dự án
/maker                Tự sáng tạo (đang mở dự án cá nhân)
/maker/:projectId     Tự sáng tạo (dự án đã lưu)
/catalog              Thư viện module
/devices              Danh sách / thêm / ghép nối mạch
/devices/:deviceId    Trạng thái mạch, quyền điều khiển
/groups               Danh sách nhóm
/groups/:groupId      Không gian nhóm
/groups/:groupId/projects/:projectId  Dự án chung
/teacher              Tổng quan giáo viên
/teacher/classes/:classId  Lớp học, bài giao, báo cáo
/profile              Hồ sơ người dùng
/settings             Cài đặt
```

Khách chưa đăng nhập: xem học liệu, sử dụng mô phỏng demo nếu chính sách cho phép; để lưu cloud, tham gia nhóm, điều khiển board phải đăng nhập. Dự án nháp offline không được mất khi mở form đăng nhập; sau đăng nhập đề nghị đồng bộ.

### 4.2 Tổng quan

- Hero tương tự V4: “Học bằng cách tự tay khám phá”, nút “Tiếp tục bài học”.
- Thẻ tiến độ thực từ PostgreSQL: số bài hoàn thành / 10, dự án đã làm, nhóm tham gia, mạch đã ghép nối.
- Nút truy cập nhanh “Bài học”, “Dự án”, “Tự sáng tạo”, “Nhóm”.
- Khi chưa có phần cứng: hiển thị `Đang mô phỏng`, **không** hiển thị icon connected xanh giả.
- Các phần đang làm dở có thể resume vào đúng bài học, code, thiết lập module và bước cuối.

### 4.3 Workspace bài học — TRỌNG TÂM SẢN PHẨM

Bố cục desktop ưu tiên 3 vùng có thể co giãn:

```text
┌────────────────────────────────────────────────────────────────────────────┐
│ Bài 02 · LED nhấp nháy     [Mô phỏng ●] [Chọn mạch]   [Lưu] [Trợ giúp]    │
├──────────────────────┬────────────────────────┬────────────────────────────┤
│ HƯỚNG DẪN BÀI HỌC   │ SƠ ĐỒ / MẠCH MÔ PHỎNG │ CODE / BLOCK               │
│ 1. Hiểu bài         │ Board + GPIO23 → LED   │ Arduino C++ (có số dòng)   │
│ 2. Lắp module       │ LED đang nhấp nháy     │                            │
│ 3. Lập trình        │ Mức pin + đồng hồ     │ [Chạy] [Dừng] [Từng bước] │
│ 4. Kết luận         │ Nút/cảm biến ảo      │ Log, compile error        │
├──────────────────────┴────────────────────────┴────────────────────────────┤
│ Dữ liệu / Timeline / Gợi ý kiến thức / Nhật ký thí nghiệm                │
└────────────────────────────────────────────────────────────────────────────┘
```

Mobile: từng panel thành tab `Hướng dẫn | Mạch | Code | Kết quả`, cùng sử dụng **một session** để không mất state.

**Quy trình 4 bước trong mỗi bài:**

1. **Hiểu bài:** mục tiêu, kiến thức ngắn, ví dụ tương tác, câu hỏi dự đoán trước khi chạy, thời lượng.
2. **Lắp module:** hệ thống đề xuất module và GPIO, kiểm tra điện áp/chức năng/chân trùng/bus, sơ đồ dây; khi chọn chân khác cập nhật mapping và gợi ý code (không được tự ý ghi đè code đã sửa nếu chưa xác nhận).
3. **Lập trình & thử:** xem Blockly/thuật toán hoặc Arduino C++; `Chạy` → biên dịch / kiểm tra hợp lệ → thực thi; điều khiển input ảo (nhấn nút, xoay biến trở, thay ánh sáng); quan sát LED, PWM, servo và graph; lỗi phải chỉ đúng dòng. Chế độ thực chỉ khi firmware và thiết bị hỗ trợ, có xác nhận.
4. **Kết luận:** so sánh dự đoán với kết quả, lưu giải thích, bài kiểm tra ngắn, trạng thái hoàn thành; không đánh dấu hoàn thành nếu chưa đạt tiêu chí.

**Quy tắc quan trọng:** Học sinh thay `digitalWrite(23, HIGH)` thành `digitalWrite(23, LOW)` → LED demo active-high phải tắt; đổi thành GPIO khác mà chưa có dây → LED không sáng và UI cảnh báo mismatch; thay `delay(500)` thành `delay(1000)` → chu kỳ nhấp nháy tương ứng; sửa điều kiện ADC → mô phỏng phản ứng theo điều kiện mới. Tuyệt đối không luôn chạy hiệu ứng mặc định của bài học.

Bộ chọn chế độ lập trình:

- **Khối lệnh:** Blockly hoặc block abstraction tương đương; có thể biên dịch ra cùng IR và Arduino code.
- **Arduino C++:** editor có highlight, formatter, snippets, inline compile diagnostics.
- Chuyển **Blocks → Code** có thể sinh code. **Code → Blocks** chỉ thực hiện nếu parse được subset hỗ trợ; nếu không, báo rõ “Đoạn code này chưa thể chuyển ngược sang khối lệnh” và giữ nguyên mã nguồn.
- Khi đổi pin: hiển thị diff/gợi ý sửa code, không âm thầm sửa code tùy chỉnh.
- Tạo checkpoint và nút `Khôi phục code mẫu`, có xác nhận trước khi ghi đè.

### 4.4 Mạch mô phỏng và kiểm tra tương thích

- Board có hình dạng và pin label theo `BoardProfile`, không vẽ tên pin tuỳ tiện.
- Thư viện module cung cấp `ports`, yêu cầu điện áp, loại tín hiệu, nguồn, dòng dự kiến và hướng dẫn dây.
- Kéo/chọn module vào board; chọn pin; hiển thị dây màu tùy chức năng (GND, 3V3, signal, bus). Có thể chọn “Tự chọn chân” hoặc “Đề xuất chân phù hợp”.
- Tương thích cần xác thực **cả cụm**: input/output, PWM timer, ADC channel, bus I²C gồm SDA/SCL, điện áp IO, giới hạn dòng, pin bị chiếm, pin reserved/bootstrapping, thiết bị khác cùng bus và địa chỉ I²C.
- Các cảnh báo phải có diễn giải dễ hiểu: “Chân GPIO34 chỉ nhận tín hiệu vào, không thể bật LED”; “Servo cần nguồn cấp riêng”; “Đầu AO 5V không thể nối trực tiếp ADC 3,3V”.
- Mạch ảo có chế độ `Run`, `Pause`, `Step`, `Reset`, tốc độ 0.25x/1x/2x/4x, log thời gian mô phỏng, sơ đồ dây và danh sách giá trị GPIO.
- Không mô phỏng sai thành mạch điện vật lý chính xác: đây là **functional logic simulation**, không phải SPICE/đo điện áp/công suất thực. Ghi rõ phạm vi.

### 4.5 10 bài học cần di chuyển dữ liệu từ V4

Giữ ID, tiêu đề, cấp độ, module, mục tiêu và câu hỏi từ file V4. Seed về DB, không hardcode trực tiếp trong component. Yêu cầu test tối thiểu:

| ID | Kỹ năng | Input/Output cần mô phỏng |
|---|---|---|
| `led-on` | GPIO output | LED ON/OFF theo code |
| `blink` | loop/delay | LED bật/tắt theo thời gian thực thi |
| `button` | digitalRead | nhấn/nhả nút, pull-up |
| `pwm` | PWM | duty thay đổi độ sáng LED |
| `pot` | analogRead | biến trở → giá trị ADC |
| `ldr` | analogRead + calibration | ánh sáng thay đổi → ADC |
| `buzzer` | GPIO + driver | còi ON/OFF qua virtual driver |
| `bh1750` | I²C | SDA/SCL, địa chỉ, lux giả lập |
| `button-led` | if/else | nút làm LED thay đổi |
| `night` | threshold + ADC | LDR vượt ngưỡng → LED |

### 4.6 Dự án mở rộng

- Thẻ dự án: mục tiêu, độ khó, danh sách module, thời gian, kết quả, ảnh/hình minh họa.
- Nhấn `Bắt đầu` → khởi tạo workspace cùng cơ chế với bài học, nhưng có nhiều module và tự do sửa code.
- 4 dự án gốc V4 phải là seed. Thêm metadata để mở rộng dự án do giáo viên xuất bản.
- Hỗ trợ dự án cá nhân hoặc clone sang nhóm; mỗi clone có ID và lịch sử riêng.

### 4.7 Khu vực Tự sáng tạo (Maker)

Luồng ưu tiên học sinh mới:

`Đặt tên ý tưởng` → `Chọn module` → `Hệ thống gợi ý chân` → `Lắp dây` → `Tạo thuật toán/code` → `Mô phỏng` → `Lưu / Chia sẻ nhóm / Thử trên board`.

- Chọn nhiều module, xem trạng thái dùng chân, gỡ/thay module, tự động đề xuất mapping hợp lệ.
- Quy tắc no-code `NẾU … THÌ …`; sinh code từ cùng AST/IR.
- Cho phép lưu snapshot `code + graph + pin assignments + virtual sensor state + simulation result metadata`.
- Import/export project JSON **có schemaVersion**, validate Zod + backend DTO; không tin mọi dữ liệu tải lên.
- `Save as new`, `Fork`, `Version history`, `Restore revision` và `Share to group`.
- Không dùng `localStorage` làm DB dự án chính; offline drafts cần hàng đợi sync + xử lý conflict.

### 4.8 Thư viện module

- List/filter/search theo chức năng: đầu vào số, đầu ra số, ADC, PWM, I²C, sensor, actuator.
- Chi tiết: ảnh minh họa, công dụng, điện áp, wiring, chân phù hợp theo board, code mẫu, cảnh báo, bài học dùng module đó.
- Admin/giáo viên được thêm module theo template được kiểm duyệt; chưa cho học sinh tự sửa thông số điện áp/dòng hệ thống.
- Một module có thể nhiều phiên bản PCB/pinout; manifest phải gắn version.

### 4.9 Nhóm sáng tạo

- Tạo nhóm; mã mời có hạn dùng và có thể thu hồi; nhóm có tên, mục tiêu, avatar, chủ nhóm.
- Thành viên với role `OWNER | EDITOR | VIEWER` (giáo viên `MENTOR` theo lớp nếu được cấp). Chỉ OWNER/MEN­TOR được quản lý thành viên; EDITOR sửa nội dung; VIEWER chỉ đọc.
- Khu vực nhóm có 4 tab: `Dự án`, `Nhiệm vụ`, `Thảo luận`, `Thành viên`.
- Dự án chung có optimistic concurrency (`version` / `If-Match`), revision history, thông báo khi người khác cập nhật; MVP **không** cần nhiều con trỏ realtime đồng biên tập từng ký tự.
- Bảng nhiệm vụ Kanban cơ bản `TODO / IN_PROGRESS / REVIEW / DONE`, người phụ trách, hạn hoàn thành.
- Tin nhắn được lưu database, realtime qua WebSocket, có quyền báo cáo/chặn nội dung phù hợp học sinh.
- **Quyền nhóm KHÔNG tự động cấp quyền điều khiển thiết bị vật lý.** Chủ thiết bị hoặc giáo viên phải cấp quyền riêng; dùng controller lease.

### 4.10 Đăng ký, đăng nhập và hồ sơ

- Trang đăng nhập/đăng ký **toàn màn hình** thân thiện học sinh (không chỉ modal); hỗ trợ deep link chuyển lại workflow trước khi đăng nhập.
- Tên hiển thị, email hoặc username theo chính sách, mật khẩu, xác nhận mật khẩu; thông báo lỗi dễ hiểu, không tiết lộ tài khoản tồn tại.
- Roles: `STUDENT`, `TEACHER`, `ADMIN`; kiểm tra ở backend từng endpoint. Không cho self-register làm TEACHER/ADMIN.
- JWT short-lived + refresh cookie HttpOnly **hoặc** server-side session HttpOnly; chọn **một** phương án, implement CSRF/CORS/session expiration đầy đủ. Ưu tiên cookie HttpOnly cho web, native có secure storage adapter.
- Reset mật khẩu qua email **nếu** tích hợp provider hoặc tài khoản do giáo viên quản lý; không hiển thị chức năng reset hoạt động nếu chưa có kênh cấp token.
- Không thu thập vượt mức cần thiết thông tin trẻ em; lớp học có chính sách đồng ý, retention và quyền truy cập của giáo viên.

### 4.11 Kết nối mạch thật — màn hình thống nhất

- Hiển thị `Chưa ghép nối`, `Đang ghép nối`, `Đang kết nối`, `Đã kết nối`, `Mất kết nối`, `Đang được người khác sử dụng`, `Lỗi firmware`, không tô xanh khi chỉ mới lưu thông tin board.
- `Thêm thiết bị`: quét QR/mã thiết bị hoặc thêm theo mã xác nhận; UI không buộc học sinh nhập MQTT broker, topic hoặc port.
- Chọn `Wi‑Fi / Bluetooth` bằng 2 tab, có trợ giúp cách chuẩn bị board; không nhập địa chỉ IP trên giao diện học sinh như yêu cầu bắt buộc.
- Wi‑Fi: board đã được provision tới broker bằng credentials giới hạn; backend nhận heartbeat, theo dõi online qua event/LWT; app chỉ gọi API, không public credential MQTT.
- BLE: browser hỗ trợ dùng Web Bluetooth; app Android/iOS dùng native BLE adapter. Khi BLE thiếu hỗ trợ, ẩn nút hoặc giải thích cách chuyển sang Wi‑Fi.
- Trước khi nhấn `Chạy trên mạch thật`: kiểm tra firmware, board profile, nguồn, pin mapping, quyền thiết bị, session lock; hiện màn hình xác nhận đơn giản.
- Phân biệt rõ hai tác vụ:
  - `Live Control`: gửi lệnh GPIO/ADC giới hạn đến **bridge firmware** đã có.
  - `Deploy Firmware`: chỉ có ở phase OTA đã triển khai đầy đủ (xem Mục 8); nếu chưa có, disable với giải thích.
- Luôn có `DỪNG MẠCH` nổi bật trong chế độ mạch thật. Backend + firmware cùng xử lý.

### 4.12 Góc giáo viên

- Danh sách lớp học; tạo lớp; thêm học sinh bằng mã hoặc lời mời; giao bài, deadline, báo cáo.
- Xem tiến độ từng học sinh theo bài/dự án (có phân quyền lớp học); không trộn dữ liệu nhiều lớp.
- Giáo viên có thể quản lý board dùng chung trong lớp, cấp lại mã ghép nối, giám sát controller lease, dừng toàn bộ thiết bị thuộc lớp mình có quyền.
- Rubric: hiểu bài, đấu nối đúng, giải thích được code, kiểm chứng mô phỏng, hoàn thành dự án.
- Báo cáo CSV có filter theo lớp/bài/thời gian; không phát tán thông tin cá nhân qua public URL.

## 5. KIẾN TRÚC FRONTEND VÀ CODING CONVENTION

### 5.1 Monorepo đề xuất

```text
stem-lab/
├── AGENTS.md                         # chỉ dẫn Codex, trỏ về tài liệu này
├── README.md
├── .editorconfig
├── .gitignore
├── .env.example
├── pnpm-workspace.yaml
├── package.json
├── apps/
│   └── student-app/
│       ├── app.json
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           ├── app/                   # Expo Router: chỉ route composition
│           │   ├── _layout.tsx
│           │   ├── (public)/
│           │   ├── (auth)/
│           │   ├── (dashboard)/
│           │   ├── learn/[lessonId].tsx
│           │   ├── projects/[projectId].tsx
│           │   ├── maker/[projectId].tsx
│           │   ├── groups/[groupId].tsx
│           │   └── devices/[deviceId].tsx
│           ├── features/
│           │   ├── auth/
│           │   ├── dashboard/
│           │   ├── curriculum/
│           │   ├── lesson-workspace/
│           │   ├── circuit-editor/
│           │   ├── code-editor/
│           │   ├── simulation/
│           │   ├── maker/
│           │   ├── module-catalog/
│           │   ├── projects/
│           │   ├── collaboration/
│           │   ├── devices/
│           │   └── teacher/
│           ├── shared/
│           │   ├── api/
│           │   ├── components/
│           │   ├── design-system/
│           │   ├── hooks/
│           │   ├── i18n/
│           │   ├── lib/
│           │   └── types/
│           └── assets/
├── packages/
│   ├── domain-contracts/             # TypeScript types, Zod schemas
│   ├── board-profiles/               # JSON / TS board manifests
│   ├── module-manifests/             # versioned electronics manifest
│   ├── virtual-hal/                  # frontend simulation interface
│   └── eslint-config/
├── services/
│   └── api/                           # Java Spring Boot
├── firmware/
│   ├── esp32-stem-bridge/
│   └── docs/
├── simulator/
│   ├── arduino-compat/               # supported Arduino API/shim
│   ├── wasm-runtime/                 # virtual clock/HAL runner
│   └── compiler-image/              # sandboxed compiler toolchain
├── infra/
│   ├── compose.yaml
│   ├── mosquitto/
│   ├── nginx/
│   └── scripts/
├── docs/
│   ├── architecture/
│   ├── api/
│   ├── mqtt-protocol/
│   ├── board-profiles/
│   └── adr/
└── .github/workflows/
```

**Chú ý:** `simulator/compiler-image` là toolchain C/C++ chạy trong sandbox, **không** là web backend nghiệp vụ thứ hai viết Node/Python. Điều phối compile/job/quota vẫn ở Java backend.

### 5.2 Quy tắc TypeScript/React

- TypeScript `strict: true`, tránh `any`, ưu tiên discriminated union cho connection và simulator state.
- Components PascalCase (`CircuitCanvas.tsx`); hooks `use...`; functions/variables camelCase; constants UPPER_SNAKE_CASE khi thực sự bất biến; folders kebab-case.
- Mỗi `feature` gồm `components`, `screens`, `hooks`, `services`, `schemas`, `types`, `__tests__`; không import xuyên feature trừ public API/barrel có chủ đích.
- React component chỉ render và dispatch action; tính tương thích pin nằm ở pure domain service có unit test.
- Không trực tiếp gọi `fetch` trong component; dùng API client + hooks TanStack Query.
- Async state phải có loading/empty/error/success rõ; không toast “đã thành công” trước ACK.
- Các interface BLE/MQTT/WebSocket được cung cấp qua abstraction `DeviceTransport` và `DeviceSession`, không trộn với UI.
- ESLint, Prettier và import order; unit test Vitest/Jest theo môi trường; E2E Playwright Web, mobile bằng Detox hoặc tương đương khi đến giai đoạn.
- Cấm component trên 400 LOC nếu có thể tách logic; những file vượt ngưỡng cần ADR/lý do.

### 5.3 Interface lõi tham chiếu

```ts
type ConnectionMode = 'simulation' | 'wifi-mqtt' | 'ble-web' | 'ble-native';

type DeviceConnectionStatus =
  | 'disconnected' | 'pairing' | 'connecting' | 'connected'
  | 'busy' | 'reconnecting' | 'error';

type SimulationStatus =
  | 'idle' | 'compiling' | 'ready' | 'running' | 'paused'
  | 'stopped' | 'compile-error' | 'runtime-error' | 'timed-out';

interface DeviceCommand {
  commandId: string;       // UUID
  deviceId: string;
  sessionId: string;
  operation: 'gpio.write' | 'pwm.write' | 'sensor.read' | 'stop';
  pin?: number;
  payload: Record<string, unknown>;
  sentAt: string;
  expiresAt: string;
}

interface DeviceEvent {
  eventId: string;
  deviceId: string;
  commandId?: string;
  type: 'ack' | 'telemetry' | 'status' | 'error';
  occurredAt: string;
  payload: Record<string, unknown>;
}

interface DeviceTransport {
  connect(deviceId: string): Promise<void>;
  disconnect(): Promise<void>;
  send(command: DeviceCommand): Promise<DeviceEvent>;
  subscribe(onEvent: (event: DeviceEvent) => void): () => void;
  status(): DeviceConnectionStatus;
}
```

Phần mềm phải cung cấp ít nhất hai adapter `MqttApiTransport` (frontend không connect trực tiếp broker) và `BleGattTransport`. BLE adapter báo trạng thái lên backend để đồng bộ quyền/telemetry qua API/WS; đồng bộ trạng thái không được coi BLE peer là nguồn xác thực user.

## 6. KIẾN TRÚC JAVA BACKEND

### 6.1 Package-by-feature, modular monolith

```text
services/api/
├── build.gradle.kts
├── settings.gradle.kts
├── gradlew
├── src/main/java/com/stemlab/
│   ├── StemLabApplication.java
│   ├── shared/
│   │   ├── config/
│   │   ├── security/
│   │   ├── errors/
│   │   ├── events/
│   │   ├── persistence/
│   │   └── util/
│   ├── iam/
│   │   ├── api/            # controller + request/response DTO
│   │   ├── application/    # use cases/services
│   │   ├── domain/         # model, repository interface
│   │   └── infrastructure/ # JPA, auth adapters
│   ├── curriculum/
│   ├── catalog/
│   ├── board/
│   ├── project/
│   ├── collaboration/
│   ├── classroom/
│   ├── device/
│   ├── mqtt/
│   ├── simulation/
│   ├── telemetry/
│   └── audit/
├── src/main/resources/
│   ├── application.yaml
│   ├── db/migration/       # Flyway V1__, V2__ ...
│   └── seed/
├── src/test/java/com/stemlab/
└── Dockerfile
```

Có thể dùng Spring Modulith để kiểm soát ranh giới nếu tương thích stack hiện hành, nhưng **không bắt buộc**. Controller chỉ validate/dispatch; application service quản lý transaction, domain service giữ logic thuần, infrastructure chứa JPA/MQTT. Không trả entity JPA trực tiếp ra API.

### 6.2 Java coding convention

- Java LTS được Spring Boot hiện hành hỗ trợ (khuyến nghị Java 21 nếu không có ràng buộc khác). Dùng Gradle wrapper để tái lập build.
- Package lowercase, class `PascalCase`, method/field `camelCase`, constant `UPPER_SNAKE_CASE`; DTO dùng Java `record` khi phù hợp.
- Prefer constructor injection; **không** field injection.
- `@Transactional` tại application service; `readOnly=true` cho query khi thích hợp.
- Không log password, session token, pairing secret, MQTT credentials, private payload; audit log chỉ lưu metadata được phép.
- Spring Security policy mặc định deny; method/endpoint authorization rõ ràng; tất cả resource query scoped user/group/class.
- Global exception handler → RFC 9457 Problem Details hoặc JSON error schema nhất quán.
- Validate input Bean Validation; pagination/filter/sort, giới hạn request body và rate limit.
- PostgreSQL chỉ truy cập qua repository layer; không tạo SQL bằng nối chuỗi từ user input.
- OpenAPI 3.1 là API contract; cập nhật generated TypeScript client từ OpenAPI trong CI.
- Test: JUnit 5 + Mockito khi cần; Testcontainers PostgreSQL và MQTT broker cho integration; ArchUnit/module tests giữ dependency direction.

### 6.3 Authentication & Authorization

- Password băm Argon2id hoặc BCrypt với work factor cấu hình; không lưu plain-text.
- Session token/refresh token lưu dạng hash khi lưu DB. Web dùng Secure + HttpOnly + SameSite cookie và CSRF phù hợp; native dùng Keychain/Keystore.
- Endpoints login/register/logout/refresh/revoke; teacher provisioning và khóa tài khoản; rate limit login.
- Resource ownership check theo user/group/class/device; controller lease vật lý chỉ cấp khi thiết bị online và người dùng được phép.
- WebSocket phải xác thực và authorize từng subscribe destination/channel; không để học sinh subscribe `/groups/*` hay `/devices/*` tùy ý.

## 7. ENGINE MÔ PHỎNG CHẠY THEO CODE (P0 — KHÔNG ĐƯỢC BỎ)

### 7.1 Yêu cầu đúng bản chất

- Học sinh sửa Arduino C++ (đặc biệt `setup()`, `loop()`, `pinMode`, `digitalWrite`, `digitalRead`, `analogRead`, `delay`, `millis`, PWM, `if/else`) rồi bấm `Chạy`.
- Engine phải kiểm tra cú pháp, đối chiếu pin mapping và **thực thi ngữ nghĩa của chương trình đã sửa** trong virtual MCU runtime, không dựng animation độc lập theo bài ID.
- Cùng một snapshot code và input phải cho cùng một trace trong chế độ deterministic (bỏ qua randomness không seeded).
- Đầu ra phải là event trace chuẩn: GPIO, PWM, read/ADC, simulated time, logs, errors; `CircuitCanvas` chỉ subscribe trace để render.

### 7.2 Thiết kế kỹ thuật khả thi

**Đề xuất phase 1:** Compile **Arduino C++ subset** bằng toolchain LLVM/Clang → WebAssembly, link với `VirtualArduinoHAL` (shim `pinMode`, `digitalWrite`, `digitalRead`, `analogRead`, `delay`, `millis`…). Chạy artifact WASM trong **Web Worker sandbox** cùng virtual clock cooperative scheduling. Java API quản lý compiler job và cung cấp artifact theo hash; compiler chạy trong container cô lập, không có network, unprivileged, CPU/memory/time/disk quotas. Có thể bổ sung WebAssembly runtime riêng cho mobile, hoặc chạy từ backend sandbox khi native runtime chưa sẵn sàng, nhưng không đổi semantic trace contract.

Để `delay()` không khóa UI, scheduler hỗ trợ yield theo simulated time; `loop()` được giới hạn instruction/fuel/time. Không chạy infinite loop trên main thread. Cấu hình simulated sensor input từ UI được đưa vào virtual HAL. Các API chưa hỗ trợ phải báo lỗi/diagnostic rõ, **không im lặng cho qua**.

Không dựa vào regex để “chạy” C++ tùy ý; parser AST/bộ biên dịch chính thức là bắt buộc. Nếu chưa có compiler thật, phase ban đầu chỉ được đánh dấu `preview`, chưa được gọi là hoàn thiện simulation editor.

### 7.3 API shim tối thiểu

```text
pinMode(pin, INPUT | OUTPUT | INPUT_PULLUP)
digitalWrite(pin, HIGH | LOW)
digitalRead(pin)
analogRead(pin)
delay(milliseconds)
millis()
ledcAttach(pin, freq, resolution) / ledcWrite(pin, duty)  (ESP32 demo API versioned)
Serial.begin(...) / Serial.print(...) / Serial.println(...)
I²C BH1750 mock qua VirtualWire, có hạn chế ghi rõ
Servo angle / pulse adapter riêng (không dùng PWM LED thường để giả servo)
```

Định nghĩa hỗ trợ theo `simulatorApiVersion` và `boardProfileVersion`; API không hỗ trợ phải có message chỉ rõ cách khắc phục.

### 7.4 Contract mô phỏng

```json
{
  "runId": "uuid",
  "sourceHash": "sha256:...",
  "boardProfileId": "esp32-wroom32-demo",
  "boardProfileVersion": 1,
  "pinAssignments": [{"moduleId":"led-1","port":"signal","gpio":23}],
  "inputEvents": [{"atMs":200,"moduleId":"button-1","value":true}],
  "maxSimulatedMs": 10000,
  "maxWallClockMs": 3000,
  "simulatorApiVersion": "1"
}
```

Kết quả mẫu:

```json
{
  "runId": "uuid",
  "status": "completed",
  "sourceHash": "sha256:...",
  "events": [
    {"simTimeMs":0,"kind":"gpio.write","pin":23,"value":1},
    {"simTimeMs":500,"kind":"gpio.write","pin":23,"value":0}
  ],
  "diagnostics": []
}
```

Compiler error bắt buộc trả `line`, `column`, `severity`, `code`, `message`. Khi source hash thay đổi trong lúc run, UI hiển thị `Code đã sửa — cần Chạy lại`; **không** cập nhật simulation âm thầm nếu học sinh đang viết dở.

### 7.5 Đồng bộ pin, dây và code

- `BoardProfile` chứa capability GPIO; `CircuitGraph` chứa module, port, net và pin assignment; `CodeSnapshot` chứa source + version + hash.
- Simulator đọc **đúng** `CircuitGraph` tại thời điểm bấm chạy. GPIO không nối tới LED thì `digitalWrite` chỉ đổi trạng thái GPIO, LED không sáng.
- Nếu code dùng GPIO không tồn tại, bị reserve, hoặc không hỗ trợ mode: báo warning/error theo tính nghiêm trọng.
- Nếu học sinh thay dây nhưng chưa rerun: đánh dấu simulation stale; không tiếp tục hiển thị kết quả cũ như thể hợp lệ.
- Test assert trace, không chỉ test text/icon.

### 7.6 Bộ test nghiệm thu bắt buộc

1. LED nối GPIO23, code HIGH → sáng, LOW → tắt.
2. LED nối GPIO23, code viết GPIO25 → không sáng và cảnh báo sai chân.
3. `delay(500)` → chu kỳ 500ms; sửa thành `delay(1000)` → trace tương ứng.
4. Nút `INPUT_PULLUP` nhấn → LOW; điều kiện `if` tự viết thay đổi LED tương ứng.
5. LDR input biến thiên 300/2500 → nhánh điều kiện thay đổi theo threshold học sinh sửa.
6. PWM 10% vs 90% cho duty trace tương ứng; servo frequency/pulse riêng.
7. Lỗi `digitalWrit(` → báo compile error có dòng/vị trí; không chạy animation cũ.
8. Code `while(true){}` → timeout/quota, UI vẫn phản hồi, không làm sập server.
9. Hai tab/browser chạy cùng mã và cùng chuỗi input → trace logic xác định.
10. Code chạy trên mô phỏng **không tự động gửi lệnh tới board thật**.

## 8. THIẾT BỊ THẬT, WIFI/MQTT, BLUETOOTH VÀ FIRMWARE

### 8.1 Quy tắc luồng dữ liệu

**Wi‑Fi (đường mặc định):**

```text
React Native/Web ─ HTTPS ─► Java API ─ TLS MQTT ─► Broker ◄─ TLS MQTT ─ ESP32
        ▲                   │                  ▲
        └── WS telemetry ◄─┘ ◄──── ACK/state ─┘
```

Frontend tuyệt đối không nhúng broker password, device private key, hoặc quyền publish điều khiển rộng. Thiết bị không được subscribe topic của thiết bị khác.

**Bluetooth LE (không có Wi‑Fi):**

```text
Browser Web Bluetooth hoặc Native BLE GATT
      ⇅
ESP32 BLE service (gói lệnh chia frame, ACK, reconnect)
      ⇅                   
Frontend DeviceTransport/DeviceGateway
      ├── hiển thị trạng thái / xác nhận hardware response
      └── HTTPS/WS (đăng nhập) → Java API → audit + optional MQTT event bridge
```

Backend có thể publish **event chuẩn hóa từ gateway** lên broker để subscriber nhận trạng thái thống nhất, nhưng backend không có khả năng mở kết nối BLE trực tiếp với một board chỉ ở gần laptop học sinh. Khi người dùng ngắt BLE/đóng app, gateway offline; UI phải thể hiện.

### 8.2 MQTT topic namespace

Namespace versioned, tenant/isolation:

```text
stem/v1/{tenantId}/devices/{deviceId}/cmd
stem/v1/{tenantId}/devices/{deviceId}/ack
stem/v1/{tenantId}/devices/{deviceId}/telemetry
stem/v1/{tenantId}/devices/{deviceId}/state
stem/v1/{tenantId}/devices/{deviceId}/event
```

`tenantId` có thể là trường/lab; quy tắc ACL bắt buộc ở broker. `cmd` chỉ backend publish, device subscribe; `ack/telemetry/state/event` chỉ device publish, backend subscribe. Pairing bootstrap đi qua một luồng riêng, tạm thời và bị giới hạn.

**Giao thức:** JSON phiên bản `protocolVersion`, `messageId`, `correlationId`, `deviceId`, `timestamp`, `expiresAt`, `leaseId`, `operation`, `payload`. Giới hạn payload và whitelist operation. Khi firmware nhỏ có thể dùng CBOR, nhưng cần duy trì JSON contract cho debug và tài liệu.

```json
{
  "protocolVersion": 1,
  "messageId": "uuid",
  "deviceId": "board-0123",
  "leaseId": "uuid",
  "operation": "gpio.write",
  "payload": {"pin":23,"value":1},
  "expiresAt": "2026-10-15T12:00:05Z"
}
```

**ACK:** `messageId`, `correlationId`, `status` (`accepted | applied | rejected | expired`), `errorCode`, `actualState`, `firmwareVersion`. QoS 1 cho command/ACK, idempotency theo `messageId` và expiry; event telemetry có thể QoS 0 khi phù hợp. **Không retain command.** Device bỏ qua command đã hết hạn hoặc lease không hợp lệ. Dùng MQTT Last Will/broker presence kết hợp heartbeat có TTL, tránh online giả.

### 8.3 Quản lý phiên điều khiển

- **Device lease:** tại một thời điểm chỉ một controller hợp lệ cho thiết bị dùng chung, có TTL/renew và quyền giáo viên thu hồi.
- Khi mất lease, timeout, mất backend hoặc Wi‑Fi: firmware về trạng thái output an toàn theo board profile. Hành vi an toàn cần được định nghĩa cụ thể cho từng module; servo/motor không thể giả định “tất cả chân LOW” luôn an toàn.
- Board firmware chỉ chấp nhận whitelist GPIO/module/operation; không chấp nhận arbitrary C++ từ MQTT.
- Có `STOP` ưu tiên cao; backend audit người gửi và firmware xác nhận. Không coi MQTT stop là thay thế công tắc an toàn vật lý khi thiết bị có motor/tải nguy hiểm.
- Throttle lệnh từ UI; limit số lệnh/giây, session TTL, retry backoff và ack timeout.

### 8.4 Wi‑Fi provisioning và nhận dạng board

- Giao diện học sinh: quét QR/mã ngắn → xác nhận board name → chọn Wi‑Fi/BLE provisioning nếu cần.
- Đề xuất BLE chỉ dùng **onboarding Wi‑Fi credentials** với pairing/bonding bảo vệ (không log secrets). Nếu chưa thực hiện provisioning bằng BLE, tài liệu nêu rõ phải nạp Wi‑Fi credentials qua chế độ giáo viên/USB một lần.
- Mỗi board có định danh riêng, credentials/token riêng, thiết bị có thể bị revoke; không dùng **một mật khẩu MQTT chung** cho toàn trường.
- TLS cho MQTT Wi‑Fi (8883 hoặc cổng cấu hình khác), tránh broker/public port không xác thực; certificate pinning/trust-anchor và reconnect phù hợp MCU.

### 8.5 BLE protocol

- GATT service UUID riêng `STEM_LAB_SERVICE_UUID` (không reuse bừa từ V4 nếu chưa kiểm thử), characteristics `command/write`, `event/notify`, `capabilities/read`.
- Framing có `protocolVersion`, `messageId`, `sequence`, `chunkIndex`, `chunkCount`, `length`, checksum/CRC và ACK ứng dụng nếu payload dài hơn MTU negotiated.
- BLE pairing/bonding và session authorization theo khả năng board; không coi tên BLE device hoặc mã ngắn làm xác thực mạnh.
- Web BLE: user gesture để chọn thiết bị, secure context, khả năng browser không đồng nhất.
- Native BLE: quyền Bluetooth, permission requests, reconnect behavior trong app lifecycle, cần Expo development build khi dùng native module.
- Gateway kiểm tra session user/lease trước khi gửi command; backend ghi nhận audit; khi offline chỉ có local control giới hạn theo quyền đã cấp và chính sách rõ ràng.

### 8.6 Firmware OTA — phase riêng, không tự giả lập

Nếu người dùng muốn code học sinh được nạp và **chạy trực tiếp trên board** thay vì chỉ gửi lệnh qua STEMBridge:

1. Phân tích/compile code với toolchain tương ứng board, khóa thư viện/target.
2. Validate board profile, partition OTA, đủ flash/RAM, whitelist package dependency.
3. Build trong sandbox; lưu artifact theo hash; scan/verify kết quả và metadata.
4. Ký firmware và kiểm tra chữ ký tại bootloader/OTA agent khi nền tảng hỗ trợ; phân quyền thiết bị + owner consent.
5. OTA qua kênh bảo mật với progress, ACK, timeout, rollback, recovery và ghi audit.
6. Cảnh báo rõ: compile Arduino C++ tùy ý sang firmware ≠ gửi lệnh GPIO qua MQTT.

**MVP không được bật nút “Nạp code thành công” nếu chưa tích hợp đầy đủ pipeline này.**

## 9. BOARD PROFILE VÀ AN TOÀN ĐIỆN TỬ

### 9.1 Manifest versioned

```json
{
  "id": "esp32-wroom32-demo",
  "version": 1,
  "displayName": "ESP32-WROOM-32 DEMO — cần kiểm chứng board thật",
  "logicVoltage": 3.3,
  "digitalIoVoltageMax": 3.3,
  "pins": [
    {"gpio": 23, "functions": ["digital-in", "digital-out", "pwm"], "reserved": false},
    {"gpio": 34, "functions": ["digital-in", "adc"], "inputOnly": true, "internalPullup": false},
    {"gpio": 35, "functions": ["digital-in", "adc"], "inputOnly": true, "internalPullup": false}
  ],
  "buses": [{"id":"i2c0", "type":"i2c", "defaultPins":{"sda":21,"scl":22}}],
  "warnings": ["Kiểm tra chân bootstrapping và flash trên đúng bo mạch"]
}
```

Danh sách trên chỉ là **ví dụ rút gọn**, không phải toàn bộ ESP32 pinout. Codex phải tạo profile đầy đủ dựa trên datasheet/pinout của board mẫu thực tế. Với Wi‑Fi ESP32 classic, ưu tiên ADC1 cho bài analog vì ADC2 có hạn chế sử dụng khi Wi‑Fi hoạt động. Không cho GPIO34/35 làm output hoặc dùng pull-up nội. Chân bootstrapping/reserved và dòng tối đa GPIO phải tra cứu thay vì tự đoán.

### 9.2 Module manifest

Mỗi module cần: `id`, `version`, `displayName`, `type`, `ports[]`, `requiredCapabilities[]`, `voltageRange`, `currentEstimate`, `needsExternalDriver`, `needsExternalPower`, `wiringGuide`, `codeTemplate`, `simulationModel`, `safetyWarnings`, `supportedBoardProfiles`.

Ví dụ servo **không** nối nguồn motor thẳng GPIO; buzzer có driver; LED có điện trở hạn dòng; mọi module ngoại vi dùng điện áp phù hợp.

### 9.3 Compatibility engine API

`POST /api/v1/circuits/validate` nhận `boardProfileId`, `boardProfileVersion`, module instances, netlist/pin assignments. Trả:

```json
{
  "valid": false,
  "issues": [
    {
      "severity": "ERROR",
      "code": "PIN_INPUT_ONLY",
      "moduleInstanceId": "led-1",
      "pin": 34,
      "message": "GPIO34 chỉ là đầu vào, không thể điều khiển LED.",
      "suggestedPins": [23, 25, 26]
    }
  ]
}
```

Client nên validate tức thì bằng shared manifest; server xác thực lại khi lưu project hoặc điều khiển thiết bị thật. Không cho thiết bị thật chạy circuit có lỗi mức `ERROR`.

## 10. POSTGRESQL — DATA MODEL

### 10.1 Các bảng tối thiểu

| Table | Cột chính | Quan hệ / constraint |
|---|---|---|
| `users` | id(UUID PK), username unique, email nullable unique, password_hash, display_name, status, created_at | user |
| `user_roles` | user_id, role | `STUDENT/TEACHER/ADMIN` |
| `sessions`/`refresh_tokens` | id, user_id, token_hash, expires_at, revoked_at | bảo mật |
| `schools` | id, name, settings JSONB | tenant nếu cần |
| `classes` | id, school_id, teacher_id, name, join_code_hash | lớp |
| `class_memberships` | class_id, user_id, role, joined_at | unique |
| `lessons` | id text PK, title, level, duration_minutes, content JSONB, published_version | seed 10 bài V4 |
| `lesson_progress` | user_id, lesson_id, status, current_step, score, last_workspace_id, updated_at | unique user/lesson |
| `lesson_submissions` | id, user_id, lesson_id, prediction, conclusion, result JSONB, submitted_at | audit kết quả |
| `modules` | id, manifest_version, manifest JSONB, is_published | versioned |
| `board_profiles` | id, version, manifest JSONB, is_published | immutable published version |
| `projects` | id, owner_user_id, group_id nullable, title, description, current_revision, status, created_at | owner OR group scope |
| `project_revisions` | id, project_id, revision_no, code, circuit JSONB, metadata JSONB, created_by, created_at | unique(project,revision) |
| `groups` | id, name, description, owner_id, created_at | nhóm |
| `group_memberships` | group_id, user_id, role, joined_at | unique |
| `group_invites` | id, group_id, invite_code_hash, expires_at, max_uses, used_count, revoked_at | không lưu invite plain |
| `group_messages` | id, group_id, sender_id, body, created_at, removed_at | quyền xem nhóm |
| `group_tasks` | id, group_id, project_id nullable, title, status, assignee_id, due_at | Kanban |
| `devices` | id, board_profile_id, owner_user_id, name, firmware_version, last_seen_at, status | identity |
| `device_grants` | device_id, user_id/group_id/class_id, permission, expires_at | cấp quyền |
| `device_credentials` | id, device_id, credential_ref/hash, revoked_at | **không plaintext secrets** |
| `device_leases` | id, device_id, controller_user_id, expires_at, revoked_at | 1 active lease/device |
| `device_commands` | id, device_id, lease_id, operation, state, requested_by, sent_at, ack_at, error_code | audit |
| `device_telemetry` | id, device_id, occurred_at, type, payload JSONB | partition/retention nếu lớn |
| `simulation_runs` | id, user_id, project_revision_id, source_hash, status, diagnostics JSONB, metrics JSONB, created_at | trace có thể nằm object storage |
| `audit_events` | id, actor_id, action, resource_type, resource_id, created_at, metadata JSONB | có retention |

### 10.2 Cấu trúc database và migration

- Flyway SQL `V1__create_core.sql`, `V2__curriculum.sql`, `V3__projects_and_groups.sql`, `V4__devices.sql`, `V5__simulation.sql`...; seed bài V4 trong migration/versioned seed tách biệt.
- PostgreSQL UTC `timestamptz`, UUID, foreign key, indexes trên owner/group/member, composite unique, optimistic lock/version.
- `project_revisions` append-only; cập nhật `projects.current_revision` phải atomic trong transaction (conditional update để trả HTTP 409).
- `group_invites` token chỉ hiển thị lúc tạo; server giữ hash, không trả secret trong list mặc định.
- Dùng pagination cursor hoặc offset có giới hạn; telemetry high-volume có retention/index/partition phù hợp.
- Không tạo bảng “mọi thứ lưu JSONB” cho user/ownership; JSONB chỉ dùng manifest, circuit graph, snapshot, telemetry có schema version.
- Không tự động migrate dữ liệu SQLite V4 giả định. Nếu cần chuyển dữ liệu V4, viết tool migration tách biệt có dry-run, mapping account/ID và báo cáo.

## 11. BACKEND REST & WEBSOCKET API CONTRACT

Prefix `/api/v1`, content type JSON; response success/error nhất quán. Codegen TypeScript từ OpenAPI; không duplicate thủ công DTO theo nhiều chỗ.

| Method | Endpoint | Ý nghĩa | Quyền |
|---|---|---|---|
| `POST` | `/auth/register` | tạo tài khoản học sinh | public có throttle |
| `POST` | `/auth/login` | đăng nhập | public |
| `POST` | `/auth/logout` | đăng xuất | signed-in |
| `GET` | `/auth/me` | tài khoản hiện tại | signed-in |
| `GET` | `/lessons` | danh sách bài | public |
| `GET` | `/lessons/{id}` | nội dung bài/version | public |
| `PUT` | `/lessons/{id}/progress` | cập nhật bước/hồ sơ | self |
| `POST` | `/lessons/{id}/submissions` | kết luận/bài nộp | self |
| `GET` | `/modules` | danh mục module | public |
| `GET` | `/board-profiles/{id}` | pinout/manifest | public |
| `POST` | `/circuits/validate` | validate tương thích | authenticated hoặc demo hạn chế |
| `GET/POST` | `/projects` | list/tạo project | authenticated |
| `GET` | `/projects/{id}` | mở project | owner/group ACL |
| `POST` | `/projects/{id}/revisions` | lưu revision | editor + expectedVersion |
| `GET` | `/projects/{id}/revisions` | lịch sử | viewer |
| `POST` | `/projects/{id}/fork` | nhân bản | viewer + policy |
| `GET/POST` | `/groups` | list/tạo nhóm | authenticated |
| `POST` | `/groups/join` | tham gia mã mời | authenticated |
| `GET` | `/groups/{id}` | chi tiết nhóm | member |
| `GET/POST` | `/groups/{id}/messages` | chat | member |
| `GET/POST/PATCH` | `/groups/{id}/tasks` | nhiệm vụ | role đúng |
| `GET/POST` | `/devices` | danh sách/đăng ký | authenticated |
| `POST` | `/devices/{id}/pair` | xác nhận sở hữu | owner/provisioning |
| `POST` | `/devices/{id}/leases` | xin quyền điều khiển | controller permission |
| `DELETE` | `/devices/{id}/leases/{leaseId}` | trả lease | controller |
| `POST` | `/devices/{id}/commands` | điều khiển có ACK | active lease |
| `POST` | `/devices/{id}/stop` | dừng an toàn | controller/teacher/owner |
| `GET` | `/devices/{id}/telemetry` | lịch sử dữ liệu | granted viewer |
| `POST` | `/simulation/compilations` | compile sketch subset | authenticated/limited demo |
| `POST` | `/simulation/runs` | chạy mô phỏng/metadata | authenticated/limited demo |
| `GET` | `/simulation/runs/{id}` | trạng thái run + diagnostics | owner |
| `GET/POST` | `/teacher/classes` | quản lý lớp | teacher |
| `GET` | `/teacher/classes/{id}/reports` | báo cáo | assigned teacher |

Realtime authenticated WS endpoints (hoặc STOMP destinations có cùng ý nghĩa):

- `/ws/groups/{groupId}` — message, task, member, project revision changed (authorize on subscribe).
- `/ws/devices/{deviceId}` — telemetry, presence, command ACK, lease events.
- `/ws/simulations/{runId}` — compile progress/trace if remote-run.

Định nghĩa error codes: `AUTH_REQUIRED`, `FORBIDDEN`, `PROJECT_VERSION_CONFLICT` (409), `DEVICE_OFFLINE`, `LEASE_REQUIRED`, `PIN_INCOMPATIBLE`, `COMMAND_TIMED_OUT`, `UNSUPPORTED_PLATFORM`, `SIM_COMPILE_ERROR`, `SIM_RUNTIME_LIMIT`.

## 12. CÁC TÌNH HUỐNG NGHIỆP VỤ BẮT BUỘC

### 12.1 Học sinh mới, chưa có board

Mở `/` → chọn bài `led-on` → hệ thống hiển thị module LED và GPIO phù hợp → bấm `Chạy mô phỏng` → thấy LED sáng đúng theo code → sửa HIGH/LOW → chạy lại → LED đổi → lưu dự đoán/kết luận → tạo tài khoản để đồng bộ.

### 12.2 Học sinh có board Wi‑Fi

Đăng nhập → thêm/ghép nối board → board xuất hiện online nhờ MQTT heartbeat → mở bài và chọn đúng board profile → mô phỏng trước → xác nhận `Live Control` → xin lease → gửi lệnh backend → MQTT → firmware → ACK → UI hiển thị trạng thái **sau ACK** → stop/release lease.

### 12.3 Học sinh có board BLE

Bật BLE → chọn board bằng Web Bluetooth hoặc native scanner → GATT connect + authenticate/bond → sử dụng same DeviceTransport contract → thực thi lệnh có ACK/timeout → nếu cần lưu telemetry nhóm thì gateway gửi qua API/WS sau khi xác thực → khi đóng app disconnect và xử lý an toàn.

### 12.4 Nhóm cùng tạo sản phẩm

A tạo nhóm, mời B → A tạo project Maker → B mở và sửa → lưu tạo revision 2 → A đang ở revision 1 bấm lưu thì nhận 409, thấy diff/tùy chọn fork/merge, không ghi đè silent → giáo viên có thể review.

### 12.5 Thiết bị đang do người khác sử dụng

A giữ lease board; B trong cùng nhóm mở board chỉ xem telemetry, nút điều khiển bị disable và có trạng thái `Đang được A sử dụng` (tuân thủ quyền riêng tư hiển thị tên phù hợp). B xin quyền; A release hoặc giáo viên thu hồi; hai người không bắn command đè nhau.

## 13. BẢO MẬT, VẬN HÀNH VÀ TIÊU CHÍ CHẤT LƯỢNG

### 13.1 Bảo mật

- TLS HTTPS/WSS/MQTT TLS; không dùng MQTT anonymous; ACL riêng cho từng thiết bị.
- Domain-scoped user permissions, tenant/school isolation, CSRF với cookie, CORS allowlist, rate limiting auth/device/compile, max payload, audit.
- Input người dùng (chat, code, project JSON) đều untrusted; chống XSS, file upload path traversal, command injection.
- Compiler sandbox không network, non-root, read-only base filesystem, resource limits; không mount Docker socket vào runtime nhận code người dùng.
- Secrets từ `.env`/secret store, không commit secrets. `.env.example` chỉ placeholder.
- Backup PostgreSQL định kỳ + diễn tập restore; dữ liệu lớp học có retention và quyền xóa phù hợp.
- Device STOP không bị che bởi modal, hoạt động ngay cả khi compile chạy nền; lỗi mạng phải được biểu thị, không cam kết lệnh đã đến board nếu chưa có ACK.

### 13.2 Hiệu năng/UX

- Tại dev: trang đầu phản hồi mượt, có skeleton; route lazy loading cho editor/canvas.
- Thao tác chọn chân/module cập nhật ngay trên client; save server async với conflict rõ.
- Telemetry realtime phải throttle/render batch, không rerender toàn bộ app mỗi mẫu đo.
- Auto-save local draft hợp lý và debounce; badge `Đã lưu / Đang lưu / Lưu lỗi / Bản offline`.
- Circuit workspace không mất state khi chuyển `Mạch / Code / Kết quả`.

### 13.3 Observability

- Log JSON có `traceId`, `requestId`, `deviceId`, `commandId` (không log secrets).
- Health/readiness endpoints Java, DB, MQTT connection; metrics command latency, ACK timeout, simulation build latency, compilation failures.
- Error reporting frontend có context đã làm sạch PII, exception handler backend, retention.

## 14. DEVOPS, CONFIG VÀ TÀI LIỆU

### 14.1 Docker Compose tối thiểu

`postgres`, `mqtt-broker`, `api`, `web`, `compiler-worker` (compiler có thể chỉ start khi test simulation); healthcheck, restart policy, volumes, no privileged, network segmentation. Mọi credential cấu hình qua env/secret, không dùng mật khẩu ví dụ cho môi trường thật.

`.env.example` tối thiểu:

```dotenv
POSTGRES_DB=stemlab
POSTGRES_USER=stemlab
POSTGRES_PASSWORD=CHANGE_ME
SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/stemlab
SPRING_DATASOURCE_USERNAME=stemlab
SPRING_DATASOURCE_PASSWORD=CHANGE_ME
MQTT_URL=ssl://mqtt-broker:8883
MQTT_CLIENT_ID=stemlab-api-dev
MQTT_USERNAME=CHANGE_ME
MQTT_PASSWORD=CHANGE_ME
APP_PUBLIC_URL=http://localhost:8080
EXPO_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
SIMULATOR_MAX_WALL_MS=3000
SIMULATOR_MAX_MEMORY_MB=128
```

Không được đưa `MQTT_PASSWORD` lên biến `EXPO_PUBLIC_*`. Docker Compose local cần tài liệu phát sinh dev certificates/broker ACL (hoặc local transport tạm thời trong môi trường dev được tách biệt và ghi rõ, không giả là production).

### 14.2 Tài liệu phải có khi bàn giao

- `README.md`: prerequisites, lệnh cài/chạy Docker và local, dev account bootstrap bằng migration/CLI an toàn.
- `docs/architecture/overview.md`: sơ đồ và ranh giới module.
- `docs/api/openapi.yaml` hoặc endpoint docs được build tự động.
- `docs/mqtt-protocol/v1.md`: topics, payload, ACL, ACK/retry/QoS, LWT.
- `docs/board-profiles/esp32-wroom32-demo.md`: pinout, hạn chế, wiring, điện áp.
- `docs/simulation/supported-arduino-api.md`: những gì mô phỏng đúng/chưa hỗ trợ.
- `docs/security/threat-model.md`: risk tài khoản học sinh, compile, MQTT, BLE, device lease.
- `docs/adr/`: quyết định React Native Web, modular monolith, simulation architecture, BLE gateway.

## 15. LỘ TRÌNH CODEX TRIỂN KHAI THEO MILESTONE

**Không cố implement tất cả trong một commit. Mỗi milestone phải có app chạy được và test.**

### M0 — Khung repo và kiến trúc

- Tạo workspace React Native Expo Web + Spring Boot + PostgreSQL + MQTT broker Docker.
- Tạo CI lint/test/build; design tokens, layout, navigation, API client, error handling.
- `/health` / readiness, migration DB, OpenAPI, `.env.example`, README.
- **Done khi:** `docker compose up --build` đưa được web/API/DB/broker lên; startup không yêu cầu sửa IP trong source.

### M1 — Tái hiện V4 + auth + curriculum

- UI desktop/mobile responsive từ V4 (có ảnh/mã nguồn V4 làm tham chiếu).
- Đăng ký/đăng nhập/đăng xuất thật; 10 bài/4 dự án/7 module seeded; profile học tập DB.
- **Done khi:** E2E học sinh đăng nhập, mở từng bài, xem đúng nội dung, lưu bước và reload vẫn còn.

### M2 — Maker, pin validation, shared workspace

- CircuitGraph + BoardProfile, module picker, pin suggestion, live compatibility validation, save/revision/fork/import/export.
- **Done khi:** chân sai báo lỗi, mapping code/sơ đồ nhất quán, reload giữ trạng thái.

### M3 — Simulation engine chạy code (GATE QUAN TRỌNG)

- Compiler sandbox + Arduino subset + virtual HAL + worker trace + circuit rendering + diagnostics.
- Không đóng milestone nếu simulator vẫn chạy hiệu ứng theo tên bài.
- **Done khi:** tất cả 10 acceptance test ở §7.6 pass; đổi source code tạo hành vi mới đúng trace.

### M4 — Groups / classroom / collaboration

- Nhóm, role, invite, task, chat WS, dự án nhóm có revision conflict, lớp/teacher module.
- **Done khi:** hai user thực có thể cộng tác và API từ chối truy cập trái quyền.

### M5 — Wi‑Fi MQTT + thiết bị thật

- Device identity, pairing/provisioning, MQTT ACL topics, command/ACK, telemetry, lease, heartbeat/LWT, STOP, firmware ESP32 sample.
- **Done khi:** integration test broker bằng fake device + hardware-in-loop trên board được cung cấp (nếu chưa có board thật, trạng thái `chưa HIL verified`).

### M6 — BLE + unified device experience

- WebBLE adapter, native BLE adapter theo nền tảng, gateway/API audit, capability detection, permissions, reconnect.
- **Done khi:** BLE test trên thiết bị tương thích, không báo thành công khi mất ACK; unsupported browser giải thích rõ.

### M7 — Production hardening và OTA tùy chọn

- Security review, pen-test cơ bản, backup/restore, monitoring, rate limiting, load test; OTA chỉ triển khai khi có tài liệu board bootloader/hardware và tiêu chí riêng.
- **Done khi:** release checklist, các nguy cơ còn lại được đánh dấu, không có secret cứng trong repo.

## 16. CHECKLIST NGHIỆM THU TỔNG THỂ

- [ ] V4 được đối chiếu, danh sách màn hình và bài học không bị mất.
- [ ] Frontend chạy bằng React Native + React Native Web, build Android/iOS không import web-only sai nền tảng.
- [ ] Backend là Java/Spring Boot, không còn FastAPI là backend chính.
- [ ] PostgreSQL + Flyway, không còn SQLite làm database chính.
- [ ] Source chia module rõ; lint, format, typecheck, unit/integration/E2E chạy được.
- [ ] Chọn module và chân I/O theo manifest, tương thích được kiểm tra cả client và server.
- [ ] Blockly/Arduino code nằm **trong bài học và Maker**, không buộc qua trang code riêng.
- [ ] Code sửa chạy thật trong simulator subset; kết quả không phụ thuộc prebuilt lesson animation.
- [ ] Compiler error đúng dòng, runtime timeout không làm treo UI/server.
- [ ] Mỗi bài có mục tiêu/dự đoán/thực nghiệm/kết luận và lưu cloud.
- [ ] Group permissions, task, chat, revisions và 409 conflict hoạt động.
- [ ] Wi‑Fi thực thi command qua MQTT broker, có ACL, ACK, timeout, heartbeat, stop.
- [ ] BLE qua GATT/gateway, không nhầm BLE với MQTT transport nguyên bản.
- [ ] Một board có lease điều khiển độc quyền; nhóm không tự có quyền hardware.
- [ ] Mất mạng/lease thực hiện trạng thái an toàn trên firmware, UI báo rõ.
- [ ] OTA disabled nếu chưa có pipeline compile/build/sign/deploy/rollback.
- [ ] Không hardcode secrets, domain, IP, MQTT credentials, board model production.
- [ ] Tài liệu có chính xác các lệnh để người mới clone repo chạy hệ thống.

## 17. CÂU LỆNH GIAO CHO CODEX (COPY VÀO CODEX)

```text
Đọc STEM_Lab_Codex_Implementation_Spec.md và STEM_Lab_V4.html (nếu có) trong repo.
Triển khai hệ thống STEM Lab theo đầy đủ yêu cầu, sử dụng React Native + Expo Router + React Native Web (TypeScript), Java Spring Boot, PostgreSQL, MQTT broker, BLE adapters.
Bắt đầu bằng M0 và M1. Không giả lập thành công của backend, MQTT, compile, simulation hay firmware nếu chưa implement thật.
Giữ UX V4, tổ chức source theo feature/module, bảo mật và kiểm tra phân quyền từ server. Mỗi milestone tạo mã nguồn, tests, README và cập nhật checklist Done/Not Done. Trước khi chuyển milestone phải chạy test/build. Đề xuất quyết định kỹ thuật còn thiếu bằng ADR ngắn, không tự hardcode các giá trị phụ thuộc board thực tế.
Ưu tiên quan trọng nhất của product: mọi lần sửa Arduino code phải thay đổi logic mạch mô phỏng khi nhấn Chạy, dựa trên code thật và wiring thật.
```

## 18. GIỚI HẠN VÀ NHỮNG THỨ CẦN NGƯỜI DÙNG XÁC NHẬN

- **MCU/bo STEM thật:** hiện chỉ có demo ESP32-WROOM-32 của V4; cần sơ đồ pin, điện áp, module, chipset Wi‑Fi/BLE và bootloader để triển khai hardware production.
- **Nền tảng đầu tiên:** mặc định ưu tiên web desktop/laptop trong lớp học; React Native hỗ trợ mở rộng app mobile sau. Xác nhận nếu Android/iOS là yêu cầu phát hành ngay từ đầu.
- **Nạp firmware từ browser/OTA:** là milestone riêng, không được hiểu là tính năng đã có chỉ nhờ MQTT.
- **Tài khoản trẻ em:** lựa chọn đăng ký tự do hay do giáo viên cấp phụ thuộc chính sách nhà trường, độ tuổi và yêu cầu bảo vệ dữ liệu.
- **Simulator:** phiên bản 1 hỗ trợ tập Arduino C++/module giới hạn có tài liệu; không tuyên bố mô phỏng toàn bộ framework ESP32, BLE, Wi‑Fi, analog/electrical behavior trong browser.

## 19. TÀI LIỆU KỸ THUẬT THAM KHẢO

- Expo: web apps và React Native Web — https://docs.expo.dev/workflow/web/
- Expo Router platform-specific modules — https://docs.expo.dev/router/advanced/platform-specific-modules/
- Spring Integration MQTT — https://docs.spring.io/spring-integration/reference/mqtt.html
- Web Bluetooth API và hạn chế trình duyệt — https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API

**Kết luận kiến trúc:** Tạo một hệ sinh thái STEM duy nhất có frontend dùng chung, Java modular monolith, PostgreSQL, MQTT broker, hai transport Wi‑Fi/BLE, board manifests phiên bản hóa và một simulator thực thi theo code. Tất cả màn hình bài học, Maker, nhóm, mạch thật đều sử dụng chung định dạng project/circuit/code và khả năng kiểm tra/ghi nhận kết quả. Đây là nền tảng quan trọng để mở rộng thêm board, module, lớp học và thiết bị trong tương lai mà không phải viết lại toàn bộ hệ thống.
