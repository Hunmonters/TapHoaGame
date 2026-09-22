# TẠP HÓA VIỆT — THƯ VIỆN BẢN DỊCH GAME PC

Website chia sẻ và tra cứu các bản Việt hóa game PC chuẩn mực, được xây dựng theo phong cách **Gaming Portal hiện đại** kết hợp các ưu điểm hàng đầu từ **VietPatch** (`vietpatch.online`), **The Red Team** (`theredteam.vn`) và **Cánh Cụt Team** (`canhcutteam.com`), kết nối trực tiếp với hệ sinh thái **VietHoaGame Repository**.

---

## 🎮 Các tính năng nổi bật

1. **Hiệu ứng Mở Màn Thương Hiệu (Brand Entry Intro & Booting Screen):**
   - Vòng quay quỹ đạo neon công nghệ cao và thanh tiến trình khởi động nạp cơ sở dữ liệu.
   - Tự động ghi nhớ vào `sessionStorage` để chỉ hiển thị 1 lần trong phiên duyệt web.

2. **Hệ thống 4 Tab Chuyên Nghiệp:**
   - **Kho Sưu Tập (Catalog):** Hero Slider trình chiếu bản dịch nổi bật, Live Stats thống kê thời gian thực, bộ lọc theo Engine (Unreal, Unity, GameMaker...), tìm kiếm tức thời tiếng Việt không dấu, card game chuẩn tỉ lệ poster dọc 3:4.
   - **Xưởng Dịch (Production Progress):** Phân chia tiến độ minh bạch theo 4 công đoạn thực tế: *Dịch thuật -> Hiệu đính -> Giao diện & Font -> Kiểm định QA in-game*.
   - **Đề Xuất Cộng Đồng (Requests):** Gửi đề xuất game muốn dịch và bình chọn (Upvote) lưu trữ an toàn trên trình duyệt.
   - **Bộ Sưu Tập Của Tôi (Library):** Đánh dấu lưu trữ các game đang chơi để cập nhật nhanh.

3. **Hồ Sơ Chi Tiết Game (Game Profile Modal & Deep-Link):**
   - Thông tin tương thích game (Phiên bản hỗ trợ, Steam AppID, Engine, Dung lượng).
   - Nút Tải Về đa server (Google Drive, Mega, MediaFire, Fshare).
   - **Công cụ kiểm định mã SHA-256 trực tiếp:** Nút 1-click sao chép mã và khu vực kéo-thả tệp vừa tải về để trình duyệt (Web Crypto API) tự tính toán và xác thực tính toàn vẹn 100%.
   - Quy trình cài đặt chuẩn mực & Hướng dẫn hoàn tác (Rollback an toàn).
   - Hỗ trợ đường dẫn trực tiếp (Deep-link URL hash như `index.html#together-moon-escape`, `index.html#loop-hero`) để dễ dàng chia sẻ lên Facebook/Discord.

4. **Pipeline Tự Động Hóa Đồng Bộ:**
   - Script `tools/sync_from_viethoagame.py` tự động quét kho `C:\Users\khat5\OneDrive\Máy tính\VietHoaGame`, đọc các `manifest.json`, file `.rar`, `.zip`, tính toán mã SHA-256 và xuất ra `data/games.json`.

---

## 🚀 Hướng dẫn Chạy Thử Trên Máy Tính

### Cách 1: Chạy bằng máy chủ nội bộ (Khuyến nghị)
Mở PowerShell trong thư mục này và chạy:
```powershell
python -m http.server 8000
```
Sau đó mở trình duyệt truy cập: `http://localhost:8000`

### Cách 2: Mở trực tiếp file HTML
Bạn có thể nhấp đúp trực tiếp vào tệp `index.html` trong File Explorer. Trang web đã được tích hợp sẵn bundle dữ liệu dự phòng offline nên vẫn nạp đầy đủ 100% dữ liệu mà không bị lỗi CORS!

---

## 🔄 Hướng dẫn Thêm / Đồng Bộ Game Mới Từ `VietHoaGame`

Mỗi khi bạn hoàn tất một bản dịch game mới hoặc cập nhật bản vá trong `C:\Users\khat5\OneDrive\Máy tính\VietHoaGame`, bạn chỉ cần chạy lệnh sau:

```powershell
python tools/sync_from_viethoagame.py
```
Toàn bộ thông tin từ file `manifest.json`, dung lượng file `.rar`/`.zip` và mã SHA-256 sẽ tự động được cập nhật vào website ngay lập tức!

---

## 🌐 Hướng dẫn Đưa Lên Mạng Miễn Phí (Deploy to Cloud)

### Cách triển khai miễn phí trọn đời qua GitHub Pages hoặc Cloudflare Pages:
1. Tạo một repository mới trên GitHub (ví dụ: `taphoaviet`).
2. Tải toàn bộ các tệp trong thư mục `TapHoaViet` lên repository đó.
3. Vào **Settings** -> **Pages** -> Chọn nhánh `main` và thư mục `/root` -> Bấm **Save**.
4. Website của bạn sẽ hoạt động ngay lập tức tại địa chỉ: `https://<ten-user>.github.io/taphoaviet/`
5. Bạn có thể gắn thêm tên miền riêng (ví dụ: `taphoaviet.vn`) hoàn toàn miễn phí!
