/* ==========================================================================
   TẠP HÓA VIỆT / THEMES & COLOR SYSTEM (themes.js)
   Giao diện duy nhất: Tạp Hóa Kem & Cam (Editorial Vintage Cream & Orange)
   ========================================================================== */

const ThemeManager = {
  currentTheme: "cream",

  init() {
    // Xóa bỏ triệt để cache cyberpunk cũ trong trình duyệt
    try {
      localStorage.removeItem("thv_theme");
      sessionStorage.removeItem("thv_intro_seen");
    } catch (e) {}

    this.applyTheme("cream");
  },

  applyTheme(theme) {
    this.currentTheme = "cream";
    document.documentElement.setAttribute("data-theme", "cream");
  }
};

window.ThemeManager = ThemeManager;
