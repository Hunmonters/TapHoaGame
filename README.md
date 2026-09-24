# 🛒 TẠP HÓA VIỆT — HỆ SINH THÁI BẢN DỊCH GAME PC TIẾNG VIỆT

[![License: MIT](https://img.shields.io/badge/License-MIT-orange.svg)](LICENSE)
[![Theme: Editorial Kem & Cam](https://img.shields.io/badge/Theme-Kem_%26_Cam_M%E1%BA%B7c_%C4%90%E1%BB%8Bnh-EA4828.svg)]()
[![Style: Neubrutalism](https://img.shields.io/badge/Style-Editorial_Neubrutalist-121316.svg)]()
[![Cloud: Supabase Realtime](https://img.shields.io/badge/Cloud-Supabase_Realtime-3ECF8E.svg)]()
[![Platform: PC Windows](https://img.shields.io/badge/Platform-PC_Windows-0078D6.svg)]()
[![Storage: Google Drive 1--Click](https://img.shields.io/badge/Storage-Google_Drive_Direct-4285F4.svg)]()

> **Tạp Hóa Việt** (`VietHoaGame Repository`) là nền tảng số lưu trữ, tra cứu và kết nối các bản Việt hóa game PC chuẩn mực dành cho cộng đồng game thủ Việt Nam. Website kết hợp triết lý thẩm mỹ **Editorial Neubrutalism Kem & Cam** độc bản với công nghệ đồng bộ thời gian thực (**Supabase Cloud Realtime**), mang đến trải nghiệm tải game tốc độ cao 1-chạm độc quyền qua **Google Drive**, theo dõi tiến độ dịch thuật 4 chặng minh bạch và vinh danh những nhóm dịch tâm huyết.

---

## 📑 MỤC LỤC

1. [🌟 Điểm Nhấn Bản Sắc & Giao Diện Kép](#-điểm-nhấn-bản-sắc--giao-diện-kép)
2. [🧭 Tổng Quan Kiến Trúc & Các Phân Khu Chức Năng](#-tổng-quan-kiến-trúc--các-phân-khu-chức-năng)
   - [A. Kho Sưu Tập Bản Dịch (Catalog)](#a-kho-sưu-tập-bản-dịch-catalog--tab-catalog)
   - [B. Xưởng Dịch Minh Bạch 4 Chặng (Progress Hub)](#b-xưởng-dịch-minh-bạch-4-chặng-progress-hub--tab-progress)
   - [C. Góc Việt Hóa Cộng Đồng (Community Hub)](#c-góc-việt-hóa-cộng-đồng-community-hub--tab-community)
   - [D. Sổ Đề Xuất & Bình Chọn Realtime (Requests Hub)](#d-sổ-đề-xuất--bình-chọn-realtime-requests-hub--tab-requests)
   - [E. Bộ Sưu Tập Cá Nhân (Personal Library)](#e-bộ-sưu-tập-cá-nhân-personal-library--tab-library)
3. [🖼️ Hồ Sơ Chi Tiết Game & Lightbox Điện Ảnh](#️-hồ-sơ-chi-tiết-game--lightbox-điện-ảnh)
4. [🛠️ Bảng Điều Khiển Quản Trị Studio (Admin Dashboard)](#️-bảng-điều-khiển-quản-trị-studio-admin-dashboard)
   - [Bảo Mật PIN & Quản Lý Kho Game](#bảo-mật-pin--quản-lý-kho-game)
   - [Quản Lý Album Ảnh Minh Họa In-Game](#quản-lý-album-ảnh-minh-họa-in-game)
   - [Điều Hành Đề Xuất: 1-Click Vào Xưởng & Dọn Bảng Xếp Hạng](#điều-hành-đề-xuất-1-click-vào-xưởng--dọn-bảng-xếp-hạng)
   - [📦 Sao Lưu & Phục Hồi Hệ Thống Toàn Diện (Full Backup & Restore JSON)](#-sao-lưu--phục-hồi-hệ-thống-toàn-diện-full-backup--restore-json)
5. [🤖 Bộ Công Cụ Tự Động Hóa Python (`tools/`)](#-bộ-công-cụ-tự-động-hóa-python-tools)
6. [📁 Cấu Trúc Thư Mục Toàn Dự Án](#-cấu-trúc-thư-mục-toàn-dự-án)
7. [🚀 Hướng Dẫn Vận Hành & Chạy Thử](#-hướng-dẫn-vận-hành--chạy-thử)
8. [☁️ Cấu Hình Đám Mây Supabase Cloud Realtime](#️-cấu-hình-đám-mây-supabase-cloud-realtime)
9. [🌐 Hướng Dẫn Triển Khai Miễn Phí (Deploy)](#-hướng-dẫn-triển-khai-miễn-phí-deploy)
10. [📜 Giấy Phép & Bản Quyền](#-giấy-phép--bản-quyền)

---

## 🌟 ĐIỂM NHẤN BẢN SẮC & GIAO DIỆN KÉP

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          TRIẾT LÝ THIẾT KẾ DỰ ÁN                            │
│                                                                             │
│   ☀️ NGÀY: Kem & Cam Vintage        🌙 ĐÊM: Obsidian & Cam Lửa              │
│   • Nền kem ấm: #F5F0E6             • Nền đen sâu: #111317                  │
│   • Cam nhiệt huyết: #EA4828        • Cam lửa: #FF5733                      │
│   • Viền mực đen: #121316           • Viền khối: #2D3442                    │
│   • Đổ bóng 3D: 4px 4px #121316     • Đổ bóng sâu: 4px 4px #08090C          │
│   • Mặc định 100% cho khách mới     • Bật/Tắt chủ động bằng nút 🌙/☀️       │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1. Giao Diện Kem & Cam Mặc Định (Brand Identity First)
- Toàn bộ khách truy cập mới hoặc chưa lưu tùy chọn đều được tiếp đón bằng giao diện **Editorial Kem & Cam** nguyên bản — gam màu đại diện cho tinh thần thủ công, ấm áp và hoài niệm của Tạp Hóa Việt.
- **Không ép Dark Mode:** Hệ thống không tự động ép người dùng vào chế độ tối chỉ vì cài đặt hệ điều hành, giữ trọn vẹn ấn tượng thị giác thương hiệu đầu tiên.

### 2. Chế Độ Ban Đêm (Dark Mode) Bảo Vệ Mắt
- Nút chuyển đổi nhanh dạng tròn Neubrutalist đặt ngay trên Header:
  - Khi ở giao diện Sáng: Biểu tượng **Mặt Trăng (`fa-moon`)** 🌙.
  - Khi ở giao diện Tối: Biểu tượng **Mặt Trời (`fa-sun`)** vàng rực ☀️.
- Gam màu **Đêm Obsidian (`#111317`) & Cam Lửa (`#FF5733`)** tối ưu độ tương phản, triệt tiêu ánh sáng xanh, êm mắt khi tra cứu đêm khuya.
- **Chống Chớp Nháy Màn Hình (Zero FOUC):** Script đồng bộ ngay trong thẻ `<head>` đọc bộ nhớ `localStorage` và định hình `data-theme` trước khi trình duyệt dựng khung giao diện, xóa bỏ 100% hiện tượng lóe sáng trắng.

### 3. Quy Chuẩn Đồ Họa Steam Capsule (460 × 215 px)
- Toàn bộ khung ảnh đại diện, banner Spotlight và thẻ game tuân thủ chính xác tỉ lệ vàng `460:215` của Steam Store quốc tế, đảm bảo hình ảnh sắc nét, không bị méo mó hay vỡ tỉ lệ.

---

## 🧭 TỔNG QUAN KIẾN TRÚC & CÁC PHÂN KHU CHỨC NĂNG

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             TẠP HÓA VIỆT HEADER                             │
│  [Logo]   [📦 Kho Sưu Tập]  [🛠️ Xưởng Dịch]  [🤝 Cộng Đồng]  [✈️ Đề Xuất]    │
│           [🌙 Theme]  [🔖 Bộ Sưu Tập (0)]  [🔧 Báo Lỗi]   [Discord]         │
└─────────────────────────────────────────────────────────────────────────────┘
```

### A. Kho Sưu Tập Bản Dịch (Catalog — Tab `#catalog`)
- **Spotlight Showcase & Tin Vắn Archive Wire:** Băng chuyền trình chiếu các siêu phẩm nổi bật nhất kèm thanh tin tức chạy chữ retro phong cách bản tin truyền hình thập niên 90.
- **Bộ Lọc Siêu Tốc:**
  - Lọc theo tình trạng: *Tất Cả*, *Hoàn Tất 100%*, *Đang Dịch*, *Ghim Nổi Bật*.
  - Lọc theo Game Engine: *Unreal Engine*, *Unity*, *Source Engine*, *CryEngine*, *Custom Engine*...
- **Tìm Kiếm Đa Ngôn Ngữ Tức Thì:** Tìm kiếm song song cả tên tiếng Việt đã biên dịch và tên gốc tiếng Anh của game.
- **Tải Nhanh 1-Chạm (Quick Download):** Nút tải trực tiếp link Google Drive tốc độ cao đặt ngay trên thẻ card, không cần thao tác mở modal rườm rà.

### B. Xưởng Dịch Minh Bạch 4 Chặng (Progress Hub — Tab `#progress`)
Công khai chi tiết lộ trình sản xuất từng dự án theo **4 chặng kỹ thuật thực tế**:
1. `Dịch thuật (Translation)` (0% - 100%): Khối lượng văn bản hội thoại và mô tả.
2. `Hiệu đính (Proofreading)` (0% - 100%): Chuốt mượt câu từ, thống nhất danh xưng nhân vật.
3. `Kỹ thuật Font & UI (Tech)` (0% - 100%): Việt hóa font chữ, xử lý tràn khung giao diện.
4. `Kiểm định QA & Chơi thử (Testing)` (0% - 100%): Rà soát lỗi hiển thị thực tế in-game.
- Vòng tròn phần trăm tổng quan trực quan và thông tin ngày phát hành dự kiến.

### C. Góc Việt Hóa Cộng Đồng (Community Hub — Tab `#community`)
- **Không Gian Mở Cho Các Nhóm Dịch:** Nơi hội tụ các bản dịch chất lượng từ các nhóm dịch độc lập, dịch giả tự do và game thủ nhiệt huyết.
- **Thẻ Card Vinh Danh Độc Lập:**
  - Gắn huy hiệu tím nổi bật `[🤝 CỘNG ĐỒNG]`.
  - Hộp thông tin ghi rõ `Dịch bởi: <Tên Nhóm / Tác Giả>` kèm đường dẫn trỏ thẳng về Fanpage hoặc Discord chính thức của nhóm dịch.
- **Biểu Mẫu Đóng Góp Bản Dịch An Toàn:**
  - Kiểm tra và ràng buộc nghiêm ngặt đường dẫn **Google Drive** chính chủ.
  - Tự động từ chối link rút gọn quảng cáo kiếm tiền, link web trung gian hoặc file rác độc hại.

### D. Sổ Đề Xuất & Bình Chọn Realtime (Requests Hub — Tab `#requests`)
- **Lắng Nghe Tiếng Nói Game Thủ:** Người chơi đề xuất tựa game mong muốn có tiếng Việt kèm link Steam Store và lý do đề xuất.
- **Hệ Thống Bình Chọn Chống Gian Lận (Upvote):** Cơ chế định danh chống spam phiếu bầu, đảm bảo mỗi người dùng chỉ được bỏ tối đa 1 phiếu cho 1 game.
- **Đồng Bộ Đám Mây Tức Thì (Supabase Realtime):** Số lượt vote và đề xuất mới tự động cập nhật ngay trên màn hình của mọi người dùng mà **không cần tải lại trang (No F5)**.
- **Bảng Xếp Hạng Gọn Gàng:** Tôn vinh Top 3 game được yêu thích nhất với huy hiệu Vàng 🥇, Bạc 🥈, Đồng 🥉 và ảnh thumbnail 16:9 nhỏ gọn 110x62px.

### E. Bộ Sưu Tập Cá Nhân (Personal Library — Tab `#library`)
- Tủ game cá nhân hoạt động dựa trên `localStorage`, lưu trữ danh sách các tựa game bạn quan tâm hoặc đã cài đặt để tiện theo dõi các bản vá cập nhật mới.

---

## 🖼️ HỒ SƠ CHI TIẾT GAME & LIGHTBOX ĐIỆN ẢNH

Khi nhấp vào bất kỳ tựa game nào, **Hồ Sơ Chi Tiết (Game Profile Modal)** sẽ mở ra với đầy đủ thông số kỹ thuật:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 🎮 TÊN GAME TIẾNG VIỆT (Tên Gốc Tiếng Anh)                      [✕ Đóng]    │
├─────────────────────────────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────┐  Dung lượng: 1.2 GB                │
│ │                                      │  Phiên bản Patch: v1.0.4           │
│ │        KHUNG ẢNH CHÍNH (16:9)        │  Game Engine: Unreal Engine        │
│ │   (Nhấp để phóng to toàn màn hình)   │  SHA-256: 7f83b165...             │
│ │                                      │  Tác giả: Tạp Hóa Việt             │
│ └──────────────────────────────────────┘                                    │
│ [Ảnh 1] [Ảnh 2] [Ảnh 3] [Ảnh 4] (Rê chuột hoặc click để chuyển ngay)        │
├─────────────────────────────────────────────────────────────────────────────┤
│ 📋 HƯỚNG DẪN CÀI ĐẶT 3 BƯỚC:                                                │
│   ☑ Bước 1: Tải về và giải nén tệp patch.                                  │
│   ☑ Bước 2: Chép đè thư mục vào đường dẫn cài game: [Sao chép đường dẫn]   │
│   ☑ Bước 3: Khởi động game và tận hưởng tiếng Việt!                         │
│                                                                             │
│ 🔄 Hướng Dẫn Hoàn Tác (Rollback): Bảo đảm an toàn tuyệt đối cho file game. │
│ 🐛 Báo Lỗi Bản Dịch: Gửi phản hồi kèm ảnh chụp lỗi font, tràn viền...       │
└─────────────────────────────────────────────────────────────────────────────┘
```

1. **Bộ Sưu Tập Ảnh Minh Họa In-Game (Screenshot Gallery):**
   - Khung chiếu chính 16:9 sắc nét thể hiện giao diện tiếng Việt thực tế trong game.
   - Dải ảnh thumbnail nhỏ phía dưới: **Rê chuột qua (`hover`) hoặc nhấp chuột (`click`)** là ảnh lớn chuyển đổi tức thì. Ảnh đang chọn có viền cam rực rỡ nổi bật.
2. **Cinema Lightbox Toàn Màn Hình:**
   - Nhấp vào ảnh lớn để phóng to toàn màn hình trên nền đen mờ điện ảnh (*Cinema Backdrop Blur*).
   - Hỗ trợ phím tắt điều hướng chuyên nghiệp: Phím `ESC` để đóng, phím `←` và `→` để lật ảnh liên tục.
3. **Quy Trình Cài Đặt 3 Bước Chuẩn Chỉ:** Tích hợp ô đánh dấu checklist từng bước kèm nút **Sao Chép Đường Dẫn** 1-chạm vào bộ nhớ tạm.
4. **Kiểm Tra Tính Toàn Vẹn Tệp Tin (SHA-256):** Cung cấp mã băm SHA-256 để người dùng so khớp file tải về, tránh mã độc và file hỏng.
5. **Kênh Tiếp Nhận Báo Lỗi (Bug Reporter):** Form tiếp nhận phản hồi lỗi font, lỗi câu chữ, crash game kèm hỗ trợ tải ảnh chụp minh họa.

---

## 🛠️ BẢNG ĐIỀU KHIỂN QUẢN TRỊ STUDIO (ADMIN DASHBOARD)

Mở Studio Quản Trị bằng tổ hợp phím tắt **`Ctrl + Shift + A`** hoặc gõ `#admin` trên thanh địa chỉ:

### Bảo Mật PIN & Quản Lý Kho Game
- Khung nhập mã PIN Neubrutalist an toàn với nút con mắt ẩn/hiện mật khẩu.
- **Thao Tác 1-Chạm:**
  - Bấm nút trạng thái để chuyển đổi ngay lập tức giữa `Hoàn tất 100%` và `Đang dịch`.
  - Bấm nút ngôi sao để bật/tắt chế độ ghim lên `Spotlight` trang chủ.
  - Sửa nhanh mọi trường dữ liệu: Tên game, nhà phát triển, phiên bản, link tải Google Drive, mã SHA-256...

### Quản Lý Album Ảnh Minh Họa In-Game
- Trực tiếp tải lên cùng lúc nhiều ảnh minh họa từ máy tính (tự động chuyển Base64 an toàn) hoặc dán danh sách URL ảnh trực tuyến.
- Xem trước trực quan và xóa từng ảnh thừa/hỏng chỉ bằng một cú click.

### Điều Hành Đề Xuất: 1-Click Vào Xưởng & Dọn Bảng Xếp Hạng
- **Nút `🚀 Vào Xưởng Dịch`:** Tự động lấy tên game, ảnh bìa và link Steam từ đề xuất cộng đồng chuyển thành một dự án game đang dịch hoàn chỉnh trong kho chỉ với 1 cú click!
- **Nút `🧹 Dọn Sạch Bảng Xếp Hạng`:** Xóa sạch toàn bộ đề xuất và lượt vote để mở mùa giải bình chọn mới cho cộng đồng mà không ảnh hưởng đến kho game.
- **Xóa Đề Xuất:** Loại bỏ các đề xuất spam, trùng lặp hoặc vi phạm nội quy.

### 📦 Sao Lưu & Phục Hồi Hệ Thống Toàn Diện (Full Backup & Restore JSON)
Giải quyết triệt để vấn đề: *"Khi đổi tên miền, chuyển hosting hoặc gặp sự cố thì dữ liệu bản dịch cộng đồng và các đề xuất có bị mất không?"*

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 HỆ THỐNG SAO LƯU & DI CHUYỂN DỮ LIỆU ĐỘC LẬP                │
│                                                                             │
│  [📦 Sao Lưu Toàn Bộ (Backup JSON)]   --->   Tải tệp taphoaviet_backup.json │
│  (Bao gồm: Games, Bản dịch cộng đồng, Đề xuất bình chọn, Báo cáo lỗi)       │
│                                                                             │
│  [📥 Phục Hồi Dữ Liệu (Restore JSON)] <---   Chọn tệp sao lưu từ máy tính   │
│  (Tự động nạp lại UI và đồng bộ thẳng lên Supabase Cloud hoặc LocalStorage) │
└─────────────────────────────────────────────────────────────────────────────┘
```

- **Xuất Sao Lưu 1-Click (`Backup JSON`):** Đóng gói toàn bộ cơ sở dữ liệu gồm Kho game, Bản dịch cộng đồng, Danh sách đề xuất kèm số phiếu vote và Báo cáo lỗi thành một file JSON tiêu chuẩn tải về máy.
- **Phục Hồi Siêu Tốc (`Restore JSON`):** Khi chuyển sang tên miền mới hoặc mở trang web trên máy khác, chỉ cần nạp tệp backup. Hệ thống sẽ tự động khôi phục toàn bộ và đồng bộ lên Supabase Cloud trong vài giây!

---

## 🤖 BỘ CÔNG CỤ TỰ ĐỘNG HÓA PYTHON (`tools/`)

Thư mục `tools/` chứa các kịch bản tự động hóa mạnh mẽ giúp vận hành kho dữ liệu dễ dàng:

### 1. `tools/sync_from_viethoagame.py` — Đồng Bộ & Quét Hash SHA-256
Kịch bản tự động quét thư mục dự án VietHoaGame từ máy tính:
- Đọc thông tin từ các tệp `manifest.json`.
- Quét tệp nén phát hành (`.rar`, `.zip`, `.7z`), tính toán chính xác dung lượng (MB) và mã băm `SHA-256`.
- **Cơ Chế Hợp Nhất Thông Minh:** Giữ nguyên dữ liệu cũ, không ghi đè làm mất metadata quan trọng (link Google Drive, ảnh bìa, tiến độ, changelog).
- Tự động xuất ra file `data/games.json` và cập nhật `data/data_bundle.js`.

### 2. `tools/fetch_screenshots.py` — Tự Động Thu Thập Ảnh In-Game Từ Steam
- Nhập AppID hoặc URL Steam Store của game.
- Kịch bản tự động kết nối Steam Web API, tải về album ảnh chụp màn hình 1080p sắc nét và lưu vào `assets/screenshots/<game-id>/`.

---

## 📁 CẤU TRÚC THƯ MỤC TOÀN DỰ ÁN

```plaintext
TapHoaViet/
├── index.html                   # Giao diện chính đơn trang (Single Page Application)
├── supabase_schema.sql          # Bản thiết kế CSDL Cloud PostgreSQL (Games, Requests, Reports)
├── README.md                    # Tài liệu hướng dẫn sử dụng và phát triển dự án
│
├── css/                         # Hệ thống Stylesheet Neubrutalist phân tầng
│   ├── portal.css               # Core layout, Header, Typography, CSS Variables
│   ├── themes.css               # Theme Sáng (Kem & Cam) và Tối (Ban Đêm Obsidian)
│   ├── catalog.css              # Giao diện kho game, Spotlight, Card 460x215
│   ├── progress.css             # Giao diện xưởng dịch, 4 thanh tiến độ kỹ thuật
│   ├── community.css            # Giao diện góc dịch cộng đồng & modal đóng góp
│   ├── requests.css             # Giao diện đề xuất & bảng xếp hạng bình chọn
│   ├── detail.css               # Modal hồ sơ game, Album ảnh minh họa & Lightbox
│   └── admin.css                # Bảng điều khiển Studio Admin Dashboard
│
├── js/                          # Logic điều khiển JavaScript ES6+ hiện đại
│   ├── app.js                   # Application Controller, Router Hash, Modal, Lightbox
│   ├── themes.js                # Quản lý chuyển đổi Theme Sáng / Tối
│   ├── config.js                # Cấu hình mã PIN admin & URL/Key Supabase
│   ├── supabase_client.js       # Kết nối Supabase Cloud SDK & Realtime Channels
│   ├── catalog.js               # Logic lọc, tìm kiếm, render thẻ game
│   ├── progress.js              # Logic hiển thị xưởng dịch 4 chặng
│   ├── community.js             # Logic cộng đồng đóng góp & kiểm tra Google Drive
│   ├── requests.js              # Logic gửi đề xuất & bình chọn chống gian lận
│   ├── bug_reporter.js          # Logic gửi phản hồi báo lỗi
│   ├── library.js               # Logic lưu trữ bộ sưu tập cá nhân (localStorage)
│   └── admin.js                 # Logic Studio Quản Trị, ảnh minh họa & Backup/Restore
│
├── data/                        # Dữ liệu tĩnh & Chế độ Offline độc lập
│   ├── games.json               # Cơ sở dữ liệu danh mục game tiếng Việt
│   ├── requests.json            # Danh sách đề xuất mặc định
│   └── data_bundle.js           # Bundle dữ liệu offline (Chạy file:// không cần server)
│
├── assets/                      # Tài nguyên hình ảnh & đa phương tiện
│   ├── covers/                  # Ảnh bìa Steam Capsule tỉ lệ 460x215
│   └── screenshots/             # Ảnh chụp minh họa in-game tiếng Việt
│
└── tools/                       # Bộ công cụ tự động hóa Python
    ├── sync_from_viethoagame.py # Quét thư mục VietHoaGame, hash SHA-256 & sync dữ liệu
    └── fetch_screenshots.py     # Tự động tải ảnh in-game độ phân giải cao từ Steam
```

---

## 🚀 HƯỚNG DẪN VẬN HÀNH & CHẠY THỬ

### Cách 1: Chạy bằng máy chủ Web cục bộ (Khuyến nghị)
Mở PowerShell hoặc Terminal tại thư mục `TapHoaViet` và khởi động web server:
```powershell
# Chạy với Python 3
python -m http.server 8000
```
Sau đó mở trình duyệt truy cập: **`http://localhost:8000`**

### Cách 2: Mở trực tiếp (Chế Độ Offline 100%)
Nhấp đúp chuột trực tiếp vào file **`index.html`** trong File Explorer (đường dẫn `file:///...`).
Nhờ tệp `data/data_bundle.js`, toàn bộ dữ liệu game và giao diện hoạt động mượt mà mà **hoàn toàn không bị trình duyệt chặn CORS**!

---

## ☁️ CẤU HÌNH ĐÁM MÂY SUPABASE CLOUD REALTIME

Tạp Hóa Việt hỗ trợ kết nối trực tiếp với dịch vụ **Supabase Cloud (PostgreSQL)** hoàn toàn miễn phí:

1. Đăng ký tài khoản miễn phí tại [supabase.com](https://supabase.com) và tạo một Project mới.
2. Trong trang quản trị Supabase, vào mục **SQL Editor**, mở tệp [supabase_schema.sql](file:///c:/Users/khat5/OneDrive/Máy%20tính/TapHoaViet/supabase_schema.sql), dán toàn bộ nội dung và bấm **Run**.
3. Mở tệp [js/config.js](file:///c:/Users/khat5/OneDrive/Máy%20tính/TapHoaViet/js/config.js) và điền URL và Anon Key của bạn:
   ```javascript
   const CONFIG = {
     supabaseUrl: "https://your-project-id.supabase.co",
     supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     adminPin: "020402" // Đổi thành mã PIN quản trị riêng của bạn
   };
   ```
4. Lưu tệp. Bây giờ mọi thao tác thêm/sửa game, upvote đề xuất và gửi báo lỗi sẽ tự động phát sóng Realtime đến mọi người dùng trên toàn cầu!

---

## 🌐 HƯỚNG DẪN TRIỂN KHAI MIỄN PHÍ (DEPLOY)

### 1. Triển khai bằng GitHub Pages:
1. Đưa mã nguồn lên kho chứa GitHub của bạn:
   ```bash
   git add .
   git commit -m "feat: cap nhat he sinh thai tap hoa viet"
   git push origin main
   ```
2. Vào **Settings** của repository trên GitHub -> Mục **Pages** bên menu trái.
3. Tại phần **Build and deployment** -> **Branch**, chọn nhánh `main` và thư mục `/(root)` -> Bấm **Save**.
4. Sau 1 phút, trang web của bạn sẽ trực tuyến tại địa chỉ:
   `https://<ten-tai-khoan>.github.io/<ten-repository>/`

### 2. Triển khai bằng Vercel:
1. Đăng nhập [vercel.com](https://vercel.com) bằng tài khoản GitHub.
2. Chọn **Add New Project** -> Chọn repository `TapHoaGame`.
3. Giữ nguyên các thiết lập mặc định và bấm **Deploy**. Vercel sẽ tự động cấp phát tên miền cực nhanh kèm chứng chỉ bảo mật HTTPS miễn phí trọn đời!

---

## 📜 GIẤY PHÉP & BẢN QUYỀN

- Toàn bộ mã nguồn giao diện và công cụ tự động hóa được phát hành theo giấy phép tự do **[MIT License](LICENSE)**.
- Bản quyền hình ảnh, thương hiệu và nội dung gốc của các tựa game thuộc về các nhà phát triển và hãng phát hành tương ứng.
- **Dự án được xây dựng với niềm tự hào và tình yêu dành cho cộng đồng game thủ Việt Nam! ❤️**
