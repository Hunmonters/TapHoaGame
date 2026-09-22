# 🛒 TẠP HÓA VIỆT — HỆ SINH THÁI BẢN DỊCH GAME PC TIẾNG VIỆT

[![License: MIT](https://img.shields.io/badge/License-MIT-orange.svg)](LICENSE)
[![Style: Neubrutalism](https://img.shields.io/badge/Style-Kem_%26_Cam_Neubrutalist-EA4828.svg)]()
[![Database: Supabase](https://img.shields.io/badge/Cloud-Supabase_Realtime-3ECF8E.svg)]()
[![Platform: PC Windows](https://img.shields.io/badge/Platform-PC_Windows-0078D6.svg)]()

**Tạp Hóa Việt** (`VietHoaGame Repository`) là nền tảng tra cứu, lưu trữ và kết nối các bản Việt hóa game PC chuẩn mực dành cho cộng đồng game thủ Việt Nam. Website kết hợp triết lý thiết kế **Editorial Neubrutalism Kem & Cam** độc bản với công nghệ đồng bộ thời gian thực (**Supabase Cloud Realtime**), mang đến trải nghiệm tải game tốc độ cao độc quyền qua **Google Drive**, minh bạch tiến độ và vinh danh những nhóm dịch tâm huyết.

---

## 🌟 Tính Năng Nổi Bật

### 1. Bản Sắc Thiết Kế & Chế Độ Giao Diện Kép (Light & Dark Mode)
- **Phong Cách Kem & Cam Neubrutalist:** Kết hợp vẻ hoài niệm của giấy in báo cổ điển (`#F5F0E6`), màu cam rực rỡ nhiệt huyết (`#EA4828`), viền mực đen dày dặn (`#121316`) cùng bóng đổ 3D góc cạnh dứt khoát.
- **🌙 Chuyển Đổi Giao Diện Ban Đêm (Dark Mode):** 
  - Nút chuyển đổi nhanh dạng mặt trăng/mặt trời ngay trên thanh Header.
  - Tông màu **Đêm Obsidian (`#111317`) & Cam Lửa** giảm chói mắt khi chơi game đêm.
  - Tự động nhận diện thiết lập hệ điều hành (`prefers-color-scheme`) và lưu cache vào `localStorage`. Tích hợp script chống giật nhấp nháy màn hình (FOUC).
- **Quy Chuẩn Banner Steam Capsule 460 × 215:** Toàn bộ thẻ card và khung bìa tuân thủ đúng tỉ lệ vàng 460x215 chuẩn Steam Store quốc tế.

---

### 2. Các Phân Khu Chức Năng Chính

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             TẠP HÓA VIỆT HEADER                             │
│  [Logo]   [📦 Kho Sưu Tập]  [🛠️ Xưởng Dịch]  [🤝 Cộng Đồng]  [✈️ Đề Xuất]    │
│           [🌙 Theme]  [🔖 Bộ Sưu Tập (0)]  [🔧 Báo Lỗi]   [Discord]         │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### 📦 A. Kho Sưu Tập (Catalog — Tab `#catalog`)
- **Spotlight Showcase & Archive Wire:** Băng chuyền trình chiếu các tựa game nổi bật nhất kèm thanh chạy tin tức chữ vắn cổ điển.
- **Bộ Lọc Game Nhanh:** Tất Cả, Hoàn Tất 100%, Đang Dịch, Nổi Bật, và lọc theo công nghệ Game Engine (Unreal Engine, Unity, Source, CryEngine...).
- **Tìm Kiếm Tức Thì:** Gõ tìm theo tên tiếng Việt hoặc tên gốc tiếng Anh.
- **Tải Nhanh 1-Chạm:** Tải trực tiếp file patch Google Drive từ thẻ card mà không bắt buộc phải mở popup.

#### 🛠️ B. Xưởng Dịch Minh Bạch (Progress — Tab `#progress`)
- Công khai chi tiết tiến độ sản xuất theo **4 chặng kỹ thuật thực tế**:
  1. `Dịch thuật` (0 - 100%)
  2. `Hiệu đính câu chữ` (0 - 100%)
  3. `Kỹ thuật Font & UI` (0 - 100%)
  4. `Kiểm định QA & Chơi thử` (0 - 100%)
- Vòng tròn % tổng thể và ngày dự kiến xuất xưởng.

#### 🤝 C. Góc Việt Hóa Cộng Đồng (Community Hub — Tab `#community`)
- Không gian mở kết nối và vinh danh những bản dịch từ mọi nhóm dịch độc lập, dịch giả tự do và cộng đồng game thủ:
  - Thẻ card chuẩn 460x215 gắn huy hiệu tím `[🤝 CỘNG ĐỒNG]`.
  - Hộp vinh danh: `Dịch bởi: <Tên Nhóm>` kèm link trỏ thẳng về Fanpage / Discord chính thức của nhóm dịch.
- **Biểu Mẫu "Chia Sẻ Bản Dịch Của Bạn":** Bất kỳ ai cũng có thể đóng góp bản dịch mới. Hệ thống ràng buộc nghiêm ngặt đường dẫn **Google Drive** chính chủ, từ chối link rút gọn hoặc web rác độc hại.

#### ✈️ D. Sổ Đề Xuất & Bình Chọn Realtime (Requests — Tab `#requests`)
- **Tín Hiệu Cộng Đồng:** Nơi game thủ đề xuất những tựa game khao khát được dịch kèm link Steam Store và lý do đề xuất.
- **Bình Chọn Chống Gian Lận (Upvote):** Mỗi người dùng được bỏ tối đa 1 phiếu cho 1 tựa game.
- **Supabase Cloud Realtime:** Số lượt vote và đề xuất mới tự động nhảy số tức thì trên màn hình của mọi người dùng mà **không cần F5**.
- **Bảng Xếp Hạng Gọn Gàng:** Vinh danh Top 3 Huy hiệu Vàng, Bạc, Đồng với ảnh thumbnail 16:9 nhỏ gọn 110x62px.

#### 🔖 E. Bộ Sưu Tập Cá Nhân (Library — `#library`)
- Lưu trữ danh sách các tựa game yêu thích để tiện theo dõi bản cập nhật mới và tải lại khi cài lại máy.

---

### 3. Hồ Sơ Chi Tiết Game (Game Profile Modal)

- **📸 Bộ Sưu Tập Ảnh Minh Họa Việt Hóa (Screenshot Gallery & Lightbox):**
  - Khung chiếu chính tỉ lệ điện ảnh 16:9 sắc nét.
  - Dải thumbnail nhỏ phía dưới: **Rê chuột qua (`hover`) hoặc nhấp chuột (`click`)** là ảnh lớn chuyển ngay lập tức. Ảnh đang chọn có viền cam rực rỡ nổi bật.
  - **Fullscreen Lightbox:** Bấm vào ảnh lớn để phóng to toàn màn hình với nền làm mờ Cinema Blur. Hỗ trợ phím tắt `ESC` để đóng và phím `←` / `→` để lật ảnh liên tục.
- **Quy Trình Cài Đặt 3 Bước Tương Tác:** Checklist đánh dấu hoàn thành từng bước, kèm nút 1-chạm sao chép đường dẫn cài đặt game.
- **Hướng Dẫn Hoàn Tác (Rollback):** Đảm bảo an toàn không làm hỏng file game gốc.
- **Báo Lỗi Kỹ Thuật (Bug Reporter):** Form báo lỗi font, tràn viền, crash kèm chức năng tải ảnh chụp lỗi.

---

### 4. Bảng Điều Khiển Quản Trị Studio (Admin Dashboard — `#admin`)

Mở bảng quản trị bằng phím tắt **`Ctrl + Shift + A`** hoặc gõ `#admin` trên thanh địa chỉ:
- **Bảo mật PIN:** Khung nhập PIN Neubrutalist nền trắng viền đen với nút con mắt ẩn/hiện mật khẩu.
- **Quản lý Kho Game:** Thêm mới, chỉnh sửa thông tin, đổi trạng thái 1-chạm (Hoàn tất 100% <-> Đang dịch), ghim game lên Spotlight trang chủ.
- **Quản lý Ảnh Minh Họa In-Game:** Tải lên cùng lúc nhiều ảnh từ máy tính hoặc dán link ảnh trực tuyến, xóa ảnh lỗi trực quan.
- **Quản lý Đề Xuất Cộng Đồng:**
  - Theo dõi bảng xếp hạng bình chọn.
  - **Nút `🚀 Vào Xưởng Dịch`:** 1-click tự động chuyển đề xuất thành dự án game mới với tên, link Steam, ảnh bìa đã điền sẵn.
  - Xóa đề xuất vi phạm / spam, dọn sạch bảng xếp hạng theo mùa giải.
- **Quản lý Báo Lỗi & Xuất File `games.json`:** Xuất file dữ liệu chỉ với 1 cú click chuột.

---

## 📁 Cấu Trúc Thư Mục Dự Án

```plaintext
TapHoaViet/
├── index.html                   # Giao diện chính đơn trang (Single Page App)
├── supabase_schema.sql          # Bản thiết kế CSDL Cloud PostgreSQL (Games & Requests)
├── README.md                    # Tài liệu hướng dẫn sử dụng và phát triển
│
├── css/                         # Hệ thống Stylesheet Neubrutalist phân tầng
│   ├── portal.css               # Core layout, Header, Typography, CSS Variables
│   ├── themes.css               # Theme Sáng (Kem & Cam) và Tối (Dark Mode)
│   ├── catalog.css              # Giao diện kho game, Spotlight, Card 460x215
│   ├── progress.css             # Giao diện xưởng dịch, 4 thanh tiến độ
│   ├── community.css            # Giao diện góc dịch cộng đồng & modal chia sẻ
│   ├── requests.css             # Giao diện đề xuất & bảng xếp hạng bình chọn
│   ├── detail.css               # Modal hồ sơ game, Album ảnh minh họa & Lightbox
│   └── admin.css                # Bảng điều khiển Studio Admin Dashboard
│
├── js/                          # Logic điều khiển JavaScript ES6+
│   ├── app.js                   # Application Controller, Router Hash, Modal, Lightbox
│   ├── themes.js                # Quản lý chuyển đổi Theme Sáng / Tối
│   ├── config.js                # Cấu hình mã PIN admin & URL/Key Supabase
│   ├── supabase_client.js       # Kết nối Supabase Cloud SDK & Realtime Channels
│   ├── catalog.js               # Logic lọc, tìm kiếm, render thẻ game
│   ├── progress.js              # Logic hiển thị xưởng dịch
│   ├── community.js             # Logic cộng đồng đóng góp & kiểm tra Google Drive
│   ├── requests.js              # Logic gửi đề xuất & bình chọn chống spam
│   ├── bug_reporter.js          # Logic gửi phản hồi báo lỗi
│   ├── library.js               # Logic lưu trữ bộ sưu tập cá nhân (localStorage)
│   └── admin.js                 # Logic Studio Quản Trị, ảnh minh họa & duyệt đề xuất
│
├── data/                        # Dữ liệu tĩnh & Chạy Offline
│   ├── games.json               # Cơ sở dữ liệu danh mục game tiếng Việt
│   ├── requests.json            # Danh sách đề xuất mặc định
│   └── data_bundle.js           # Bundle dữ liệu offline (Chạy file:// không cần server)
│
├── assets/                      # Tài nguyên đa phương tiện
│   ├── covers/                  # Ảnh bìa Steam Capsule (460x215)
│   └── screenshots/             # Ảnh chụp minh họa in-game tiếng Việt
│
└── tools/                       # Bộ công cụ tự động hóa Python
    ├── sync_from_viethoagame.py # Quét thư mục VietHoaGame, hash SHA-256 & sync dữ liệu
    └── fetch_screenshots.py     # Tự động tải ảnh in-game độ phân giải cao từ Steam
```

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Thử

### Cách 1: Chạy bằng máy chủ Web cục bộ (Khuyến nghị)
Mở cửa sổ PowerShell hoặc Terminal tại thư mục `TapHoaViet` và chạy:
```powershell
python -m http.server 8000
```
Sau đó mở trình duyệt truy cập: **`http://localhost:8000`**

### Cách 2: Mở trực tiếp (Offline Mode 100%)
Nhấp đúp chuột trực tiếp vào file **`index.html`**. Nhờ có file `data/data_bundle.js`, trang web hoạt động hoàn hảo mà **không bị lỗi chặn CORS** của trình duyệt!

---

## ☁️ Cấu Hình Kết Nối Supabase Cloud Realtime (Tùy Chọn)

Website hỗ trợ đồng bộ dữ liệu thời gian thực lên Cloud thông qua Supabase:
1. Tạo một dự án miễn phí tại [supabase.com](https://supabase.com).
2. Vào mục **SQL Editor** trên Supabase Dashboard, dán toàn bộ nội dung file `supabase_schema.sql` và bấm **Run**.
3. Mở file `js/config.js` và điền thông tin:
```javascript
const CONFIG = {
  supabaseUrl: "https://your-project.supabase.co",
  supabaseAnonKey: "your-anon-key-here",
  adminPin: "020402" // Mã PIN quản trị của bạn
};
```
4. Khi cấu hình xong, mọi thao tác Thêm game, Bình chọn và Báo lỗi sẽ được đồng bộ trực tiếp giữa mọi người dùng trên toàn thế giới!

---

## 🌐 Triển Khai Lên Mạng Miễn Phí (Deploy)

Bạn có thể xuất bản website lên mạng hoàn toàn miễn phí trọn đời qua:

### 1. GitHub Pages:
1. Đẩy mã nguồn lên kho chứa GitHub của bạn:
   ```bash
   git add .
   git commit -m "feat: cap nhat tap hoa viet"
   git push origin main
   ```
2. Vào **Settings** -> **Pages** -> Tại mục *Branch*, chọn nhánh `main` và thư mục `/(root)` -> Bấm **Save**.
3. Trang web sẽ trực tuyến tại: `https://<ten-user>.github.io/<ten-repo>/`

### 2. Vercel hoặc Netlify:
- Đăng nhập [vercel.com](https://vercel.com) -> Chọn **Add New Project** -> Chọn kho GitHub -> Bấm **Deploy**. Website sẽ được cấp chứng chỉ SSL miễn phí và tên miền tốc độ cao tức thì!

---

## 📜 Giấy Phép & Bản Quyền
- Mã nguồn được phân phối theo giấy phép tự do **MIT License**.
- Bản quyền hình ảnh, thương hiệu và nội dung gốc của các tựa game thuộc về các nhà phát triển và phát hành tương ứng.
- **Tự hào xây dựng vì cộng đồng game thủ Việt Nam!**
