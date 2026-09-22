/* ==========================================================================
   TẠP HÓA VIỆT / CẤU HÌNH HỆ THỐNG (config.js)
   Quản lý cấu hình Discord Webhook, Mật khẩu quản trị & Cloud Database
   ========================================================================== */

const CONFIG = {
  // Thông tin thương hiệu
  siteName: "Tạp Hóa Việt",
  siteUrl: "https://taphoaviet.vn",
  
  // Mật khẩu truy cập Studio Dashboard quản trị nội bộ
  adminPin: "viethoagame2026",

  // Discord Webhook nhận thông báo báo lỗi (Điền URL Webhook kênh Discord của bạn vào đây)
  // Ví dụ: "https://discord.com/api/webhooks/123456/abcdef"
  discordBugWebhook: "",

  // Cấu hình Supabase (khi cần đồng bộ phiếu vote toàn quốc)
  supabase: {
    enabled: false,
    url: "",
    anonKey: ""
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
