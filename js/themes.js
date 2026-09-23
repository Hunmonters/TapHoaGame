/* ==========================================================================
   TẠP HÓA VIỆT / THEMES & COLOR SYSTEM (themes.js)
   Quản lý chuyển đổi giao diện Sáng (Kem & Cam) / Tối (Ban Đêm Obsidian)
   ========================================================================== */

const ThemeManager = {
  currentTheme: "cream",

  init() {
    let saved = null;
    try {
      saved = localStorage.getItem("thv_theme");
    } catch (e) {}

    // Mặc định luôn là giao diện Kem & Cam ("cream") cho người dùng mới vào trang
    // Chỉ kích hoạt Dark Mode nếu người dùng đã tự tay bấm nút chuyển đổi ("dark") trước đó
    const initialTheme = saved === "dark" ? "dark" : "cream";
    this.applyTheme(initialTheme);
  },

  applyTheme(theme) {
    this.currentTheme = theme === "dark" ? "dark" : "cream";
    document.documentElement.setAttribute("data-theme", this.currentTheme);
    if (document.body) {
      document.body.setAttribute("data-theme", this.currentTheme);
    }

    try {
      localStorage.setItem("thv_theme", this.currentTheme);
    } catch (e) {}

    this.updateIcon();
  },

  toggleTheme() {
    const nextTheme = this.currentTheme === "dark" ? "cream" : "dark";
    try {
      localStorage.setItem("thv_theme_manual", "true");
    } catch (e) {}
    this.applyTheme(nextTheme);

    if (window.App && App.showToast) {
      App.showToast(nextTheme === "dark" ? "🌙 Đã kích hoạt Chế Độ Ban Đêm (Dark Mode)" : "☀️ Đã chuyển sang Giao Diện Kem & Cam");
    }
  },

  updateIcon() {
    const icon = document.getElementById("icon-theme");
    const btn = document.getElementById("btn-theme-toggle");
    if (!icon) return;

    if (this.currentTheme === "dark") {
      icon.className = "fa-solid fa-sun";
      icon.style.color = "#F59E0B";
      if (btn) btn.title = "Chuyển sang Giao diện Sáng (Kem & Cam)";
    } else {
      icon.className = "fa-solid fa-moon";
      icon.style.color = "var(--text-secondary)";
      if (btn) btn.title = "Chuyển sang Giao diện Tối (Ban Đêm)";
    }
  }
};

window.ThemeManager = ThemeManager;
