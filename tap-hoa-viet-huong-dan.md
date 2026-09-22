# Tạp Hóa Việt — Prompt, Code, Cấu trúc

Tài liệu này đi kèm file `tap-hoa-viet.html` (bản đầy đủ, chạy được ngay khi mở bằng trình duyệt). Gồm ba phần: **prompt** để bạn tái dùng hoặc đưa cho AI khác, **cấu trúc code** để bạn tự sửa, và **hướng dẫn tùy chỉnh** nhanh.

---

## 1. Prompt thiết kế (dùng lại được)

Đây là bản mô tả lại toàn bộ ý tưởng, viết dưới dạng một prompt hoàn chỉnh — bạn có thể đưa nguyên văn cho Claude (hoặc AI khác) ở một cuộc trò chuyện mới nếu muốn tạo lại hoặc tạo biến thể.

```
Xây một trang web một-file (HTML/CSS/JS thuần, không framework) tên
"Tạp Hóa Việt" — kho bản Việt hóa game do cộng đồng dịch.

Ý tưởng hình ảnh: cửa hàng tạp hóa giữa thành phố cyberpunk ngập mưa,
lấy màu từ một tấm poster game (rêu đen #0F3329, đèn neon vàng cam
#F2B632 → #F08A24, đỏ chu sa #E2452F). Có bản ban đêm (nền đen rêu,
canvas mưa rơi bằng JS) và bản ban ngày (giấy xanh nhạt), đổi qua lại
được. Phông chữ: Barlow Condensed (tiêu đề, kiểu biển hiệu, chữ hoa
co giãn) + Be Vietnam Pro (phần đọc, hỗ trợ đủ dấu tiếng Việt).

Ẩn dụ "tạp hóa" xuyên suốt: mỗi game là một "món hàng" trên kệ gỗ,
tên game là nhãn giá, phần hướng dẫn cài là một tờ hóa đơn giấy
(mép răng cưa bằng CSS mask), phần đề xuất game mới là "Sổ đặt hàng"
kiểu bảng tin đóng khung, nút giỏ hàng để lưu game quan tâm.

Bố cục: hero có tiêu đề neon lớn + ảnh poster nghiêng theo con trỏ,
lưới bìa game (kiểu quầy đĩa game/App Store) có thanh tiến độ dịch,
nhãn tình trạng (Hoàn chỉnh / Đang dịch / Bản thử), mỗi bìa nghiêng
3D nhẹ khi rê chuột. Phần cách cài đặt viết như hóa đơn thanh toán.
Phần "sổ đặt hàng" có bảng xếp hạng bình chọn + form gửi yêu cầu.

Giả lập giao diện macOS đầy đủ:
- Thanh menu trên cùng (đồng hồ, menu thả xuống dùng thẻ <popover>)
- Dock dưới cùng, phóng to icon theo khoảng cách con trỏ (magnification)
- Cửa sổ thật: kéo bằng thanh tiêu đề, bấm đúp để phóng to/thu nhỏ,
  ba nút đèn giao thông (đóng/thu nhỏ xuống Dock/phóng to), mở được
  nhiều cửa sổ cùng lúc, cửa sổ "mở ra" đúng từ vị trí bìa vừa bấm
  (dùng Web Animations API, không cần thư viện)
- Spotlight: Ctrl/⌘K mở hộp tìm kiếm nổi giữa màn hình, tìm cả game
  lẫn tác vụ, điều hướng bằng phím mũi tên
- Quick Look: phím Space khi đang chọn một bìa để xem nhanh không
  cần mở cửa sổ, dùng thẻ <dialog>
- Menu chuột phải trên mỗi bìa game (dùng Popover API, tự đóng khi
  click ra ngoài / cuộn / nhấn Esc)
- Thông báo góc trên phải kiểu banner của macOS, tự biến mất

Dữ liệu game để trong một mảng JS (GAMES) ở đầu <script>, không gọi
API — mỗi game có: tên, tên gốc, engine, nền tảng, % dịch (tính từ
số câu đã dịch / tổng), phiên bản bản vá, phiên bản game hỗ trợ,
changelog, danh sách file bị thêm/sửa, link tải. Có ô "Kiểm hàng"
để người dùng nhập phiên bản game của họ và so sánh tự động.

Toàn bộ text tiếng Việt, tìm kiếm bỏ dấu được (fold dấu về không
dấu để so khớp). Giỏ hàng và phiếu ủng hộ lưu bằng localStorage
(có ghi chú rõ đây là dữ liệu demo trên máy người dùng, chưa có
backend dùng chung). Tự làm nút, không dùng thư viện UI ngoài.
Có chế độ giảm chuyển động (prefers-reduced-motion) và không bị
tràn ngang trên điện thoại.
```

---

## 2. Cấu trúc code

File `tap-hoa-viet.html` là **một file duy nhất**, tự chạy được (mở trực tiếp bằng trình duyệt, không cần server). Cấu trúc bên trong:

```
tap-hoa-viet.html
├── <style>                     Toàn bộ CSS, chia theo khối bằng comment:
│   ├── Tokens (:root)          Bảng màu sáng/tối, font, biến dùng chung
│   ├── Nền (mưa + sương)       Canvas mưa vẽ bằng JS, nền gradient
│   ├── Thanh menu               .menubar, .menu (dropdown)
│   ├── Hero                    Tiêu đề neon, poster nghiêng 3D
│   ├── Kệ hàng                 .shelf, .card, .poster (lưới game)
│   ├── Cách dùng hàng           .receipt (hóa đơn giấy, CSS mask răng cưa)
│   ├── Sổ đặt hàng              .frame, .rank, .order-form
│   ├── Dock                    .dock, .dk (icon phóng to theo con trỏ)
│   ├── Cửa sổ                  .win, .tb, .wbody, .side, .pane (macOS window)
│   ├── Xem nhanh + Tìm kiếm     dialog.ql, dialog.spot (thẻ <dialog> gốc)
│   ├── Thông báo                #notes (thẻ popover="manual")
│   └── Responsive              @media cho điện thoại, rút gọn UI
│
└── <script>
    ├── CẤU HÌNH                 ← sửa ở đây là chính
    │   ├── SITE                 Tên trang, link Discord, link báo lỗi
    │   ├── GAMES[]               Danh sách game (xem mục 3 bên dưới)
    │   ├── SEED_REQUESTS[]       Đơn đặt hàng mẫu cho "Sổ đặt hàng"
    │   ├── DEFAULT_INSTALL       Hướng dẫn cài mặc định theo nền tảng
    │   └── GLOWS[]               Bảng màu neon cho bìa tự tạo
    │
    └── PHẦN CODE                 ← không cần đụng vào
        ├── Tiện ích chung        esc(), fold(), fmtDate(), store{}...
        ├── Chế độ sáng/tối       currentTheme(), toggleTheme()
        ├── Mưa (canvas)          rain() — vòng lặp requestAnimationFrame
        ├── Thông báo             notify()
        ├── Kệ hàng               visibleGames(), render(), paint()
        ├── Giỏ hàng              toggleSave()
        ├── CỬA SỔ                openWindow(), closeWin(), minimizeWin(),
        │                         restoreWin(), toggleMax(), kéo thả, tab
        ├── DOCK                  magnification theo con trỏ, mini icon
        ├── MENU                  thanh menu + menu chuột phải (popover)
        ├── XEM NHANH / SPOTLIGHT  openQL(), openSpot(), điều hướng phím
        └── SỔ ĐẶT HÀNG            renderRank(), sendRequest()
```

**Không phụ thuộc thư viện ngoài** — chỉ dùng:
- HTML gốc: `<dialog>`, `<popover>`, `<canvas>`
- CSS gốc: `@starting-style`, `color-mix()`, `container queries` (cho chữ bìa tự co giãn), View Transitions API (khi đổi bộ lọc/sắp xếp)
- 1 lần gọi Google Fonts (Barlow Condensed, Be Vietnam Pro)

---

## 3. Tùy chỉnh nhanh

Mọi thứ cần sửa để dùng dữ liệu thật đều nằm trong khối **CẤU HÌNH** ở đầu thẻ `<script>`.

### Thêm / sửa một game
```js
{
  id: "ten-khong-dau",              // định danh duy nhất, không dấu
  title: "Tên hiển thị",
  original: "Tên gốc / mô tả phụ",
  cover: "",                        // để trống = tự tạo bìa neon; hoặc dán URL ảnh
  engine: "Unity",                  // "Unity" | "Unreal Engine" | "Khác"
  platforms: ["PC"],                // ["PC","Android","Switch",...]
  version: "1.0",                   // phiên bản bản Việt hóa
  gameVersion: "1.4.2",             // phiên bản game mà bản vá hỗ trợ
  size: "48 MB",
  strings: [9420, 9420],            // [số câu đã dịch, tổng số câu] -> tự tính %
  tested: "Đã chơi thử toàn bộ cốt truyện",
  status: "done",                   // "done" | "wip" | "beta"
  updated: "2026-09-20",            // YYYY-MM-DD
  downloads: 4820,
  team: "Tên nhóm dịch",
  sha256: "...",                    // mã kiểm tra file, để trống nếu chưa có
  description: "Mô tả game...",
  changelog: ["Dòng 1", "Dòng 2"],
  files: ["đường/dẫn/file (thêm mới)", "đường/dẫn/khác (thay thế)"],
  links: [{ label: "Tải từ Google Drive", url: "https://..." }]
}
```
Ảnh bìa của "Tạp Hóa Ở Tận Thế" (từ poster bạn gửi) đã được nhúng sẵn dạng base64 trong biến `window.COVERS` ở đầu `<script>` thứ nhất — game nào có `id` trùng khóa trong đó sẽ dùng ảnh đó thay vì bìa neon tự tạo.

### Đổi link thật
Sửa `SITE.discord`, `SITE.report`, và từng `url` trong mảng `links` của mỗi game (hiện đang để `#` — bấm vào sẽ hiện thông báo nhắc bạn thay link thật).

### Đổi màu / phông chữ
Toàn bộ màu nằm trong khối `:root { ... }` đầu `<style>` (biến `--accent`, `--bg`, `--red`...) — đổi ở một chỗ, áp dụng toàn trang. Phông chữ: đổi link Google Fonts trong `<head>` và giá trị `--font-display` / `--font`.

### Dữ liệu "Sổ đặt hàng"
`SEED_REQUESTS[]` là các đơn mẫu ban đầu. Đơn người dùng tự gửi và lượt ủng hộ được lưu trong `localStorage` của từng trình duyệt (khóa `tth-requests`, `tth-votes`, `tth-saved`) — **chưa dùng chung giữa mọi người**. Muốn dữ liệu thật dùng chung (nhiều người thấy cùng một danh sách), cần nối vào một backend nhỏ (ví dụ Supabase/Firebase) thay cho các dòng `store.get()/store.set()`.

---

## 4. File đính kèm

- `tap-hoa-viet.html` — trang web đầy đủ, mở trực tiếp bằng trình duyệt hoặc tải lên hosting tĩnh (GitHub Pages, Cloudflare Pages, Netlify...).
