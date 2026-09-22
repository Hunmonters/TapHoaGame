/* ==========================================================================
   TẠP HÓA VIỆT / THEMES & RAIN LOGIC (themes.js)
   Quản lý đổi theme & Hiệu ứng mưa rơi canvas phong cách Cyberpunk Vintage
   ========================================================================== */

const ThemeManager = {
  currentTheme: "cyberpunk",
  rainAnimationId: null,
  drops: [],

  init() {
    try {
      const saved = localStorage.getItem("thv_theme");
      if (saved === "vintage" || saved === "cyberpunk") {
        this.currentTheme = saved;
      }
    } catch (e) {
      this.currentTheme = "cyberpunk";
    }

    this.applyTheme(this.currentTheme);
    this.bindEvents();
  },

  applyTheme(theme) {
    this.currentTheme = theme;
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("thv_theme", theme);
    } catch (e) {}

    // Cập nhật nhãn và icon trên nút
    const themeBtn = document.getElementById("btn-toggle-theme");
    if (themeBtn) {
      if (theme === "vintage") {
        themeBtn.innerHTML = `<i class="fa-solid fa-cloud-rain"></i> <span>Tạp Hóa Mưa</span>`;
        this.startRain();
      } else {
        themeBtn.innerHTML = `<i class="fa-solid fa-bolt"></i> <span>Cyberpunk</span>`;
        this.stopRain();
      }
    }
  },

  toggle() {
    const next = this.currentTheme === "cyberpunk" ? "vintage" : "cyberpunk";
    this.applyTheme(next);
    App.showToast(`Đã chuyển sang giao diện: ${next === "vintage" ? "Tạp Hóa Việt (Mưa rơi hoài niệm)" : "Cyberpunk Gaming"}`);
  },

  bindEvents() {
    const btn = document.getElementById("btn-toggle-theme");
    if (btn) {
      btn.onclick = () => this.toggle();
    }

    window.addEventListener("resize", () => {
      if (this.currentTheme === "vintage") {
        this.initRainDrops();
      }
    });
  },

  /* ==========================================================================
     CANVAS MƯA RƠI HOÀI NIỆM (Từ bản demo gốc của bạn)
     ========================================================================== */
  initRainDrops() {
    const canvas = document.getElementById("rain-canvas");
    if (!canvas) return;
    const W = canvas.width = window.innerWidth;
    const H = canvas.height = window.innerHeight;
    const N = Math.min(100, Math.floor(W / 14)); // Mật độ hạt mưa tối ưu

    this.drops = Array.from({ length: N }, () => ({
      x: Math.random() * (W + 200) - 100,
      y: Math.random() * H,
      l: 12 + Math.random() * 18,
      v: 480 + Math.random() * 550,
      a: 0.08 + Math.random() * 0.16
    }));
  },

  startRain() {
    const canvas = document.getElementById("rain-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    this.initRainDrops();

    let lastTime = performance.now();
    const frame = (t) => {
      if (this.currentTheme !== "vintage") return;
      const dt = Math.min(0.05, (t - lastTime) / 1000);
      lastTime = t;

      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      ctx.lineWidth = 1;

      for (const d of this.drops) {
        d.y += d.v * dt;
        d.x -= d.v * dt * 0.18; // Góc rơi nghiêng nhẹ do gió
        if (d.y > H + 20) {
          d.y = -20;
          d.x = Math.random() * (W + 200);
        }
        ctx.strokeStyle = `rgba(190, 255, 225, ${d.a})`;
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x + d.l * 0.18, d.y - d.l);
        ctx.stroke();
      }

      this.rainAnimationId = requestAnimationFrame(frame);
    };

    if (this.rainAnimationId) cancelAnimationFrame(this.rainAnimationId);
    this.rainAnimationId = requestAnimationFrame(frame);
  },

  stopRain() {
    if (this.rainAnimationId) {
      cancelAnimationFrame(this.rainAnimationId);
      this.rainAnimationId = null;
    }
    const canvas = document.getElementById("rain-canvas");
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
};

window.ThemeManager = ThemeManager;
