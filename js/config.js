/* ==========================================================================
   TẠP HÓA VIỆT / CẤU HÌNH HỆ THỐNG (config.js)
   Quản lý cấu hình Discord Webhook, Mật khẩu quản trị & Cloud Database
   ========================================================================== */

const CONFIG = {
  // Thông tin thương hiệu
  siteName: "Tạp Hóa Việt",
  siteUrl: "https://taphoaviet.vn",

  // Mật khẩu truy cập Studio Dashboard quản trị nội bộ
  adminPin: "020402",

  // Discord Webhook nhận thông báo báo lỗi (Điền URL Webhook kênh Discord của bạn vào đây)
  // Ví dụ: "https://discord.com/api/webhooks/123456/abcdef"
  discordBugWebhook: "",

  // Cấu hình Supabase Cloud (Đồng bộ Realtime kho game, bình chọn và upload ảnh CDN)
  supabase: {
    enabled: true,
    url: "https://qtfnokoacwuokrbamzka.supabase.co",
    anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF0Zm5va29hY3d1b2tyYmFtemthIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAwNjcyNjgsImV4cCI6MjEwNTY0MzI2OH0.6vzYGeRiVmqsh_U1TZocuQrWBzMkD-3ZciUPqNgNGqc"
  },

  // Video trailer nổi bật mặc định ở đầu trang chủ (YouTube Video ID)
  // Ví dụ: "17thL7LTEjo" hoặc trailer game nổi bật
  featuredTrailer: {
    title: "Together: Moon Escape — Trailer Khám Phá Mặt Trăng",
    category: "UNREAL ENGINE 5 / PHIÊU LƯU KỲ BÍ",
    youtubeId: "dQw4w9WgXcQ", // Bạn có thể thay bằng ID video YouTube của game
    description: "Khám phá thế giới kỳ bí trên mặt trăng với bản Việt hóa hoàn chỉnh 100% chuẩn native Unreal Engine 5."
  }
};

window.CONFIG = CONFIG;
