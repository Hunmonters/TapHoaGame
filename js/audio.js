/* ==========================================================================
   TẠP HÓA VIỆT / TACTILE MICRO-SOUND FX (audio.js)
   Hệ thống âm thanh tương tác cơ học bằng Web Audio API thuần (0KB tải file)
   Mô phỏng âm thanh giao diện Steam Deck, Nintendo Switch & Cyberpunk HUD
   ========================================================================== */

const AudioManager = {
  ctx: null,
  enabled: true,
  masterGain: null,
  lastHoverTime: 0,

  init() {
    let saved = null;
    try {
      saved = localStorage.getItem("thv_sound_enabled");
    } catch (e) {}

    // Mặc định bật âm thanh nhẹ nhàng (hoặc đọc từ localStorage)
    this.enabled = saved !== "false";
    this.updateIcon();

    // Khởi tạo AudioContext khi có tương tác đầu tiên của người dùng (tránh lỗi autoplay policy)
    const initAudioContext = () => {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
          this.masterGain = this.ctx.createGain();
          this.masterGain.gain.value = 0.12; // Âm lượng dịu nhẹ, không gây ồn
          this.masterGain.connect(this.ctx.destination);
        }
      } else if (this.ctx.state === "suspended") {
        this.ctx.resume();
      }
      document.removeEventListener("pointerdown", initAudioContext);
      document.removeEventListener("keydown", initAudioContext);
    };

    document.addEventListener("pointerdown", initAudioContext, { once: true });
    document.addEventListener("keydown", initAudioContext, { once: true });

    // Gắn âm thanh tự động cho các nút bấm
    this.bindAutoSounds();
    console.log("🔊 AudioManager: Hệ thống âm thanh tương tác cơ học Web Audio đã sẵn sàng!");
  },

  getContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.12;
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return this.ctx;
  },

  toggleSound() {
    this.enabled = !this.enabled;
    try {
      localStorage.setItem("thv_sound_enabled", this.enabled ? "true" : "false");
    } catch (e) {}

    this.updateIcon();

    if (this.enabled) {
      this.playDing();
      if (window.App && App.showToast) {
        App.showToast("🔊 Đã bật Âm thanh Tương tác Cơ học (Tactile Sound)");
      }
    } else {
      if (window.App && App.showToast) {
        App.showToast("🔇 Đã tắt Âm thanh Tương tác");
      }
    }
  },

  updateIcon() {
    const icon = document.getElementById("icon-sound");
    const btn = document.getElementById("btn-sound-toggle");
    if (!icon) return;

    if (this.enabled) {
      icon.className = "fa-solid fa-volume-high";
      icon.style.color = "var(--accent-orange, #EA4828)";
      if (btn) btn.title = "Tắt âm thanh tương tác cơ học";
    } else {
      icon.className = "fa-solid fa-volume-xmark";
      icon.style.color = "var(--text-muted, #888275)";
      if (btn) btn.title = "Bật âm thanh tương tác cơ học";
    }
  },

  /**
   * 1. Âm thanh lia chuột qua thẻ game (Tactile Blip / Steam Deck Hover)
   */
  playHover() {
    if (!this.enabled) return;
    const now = Date.now();
    if (now - this.lastHoverTime < 60) return; // Chống spam khi lia chuột quá nhanh
    this.lastHoverTime = now;

    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = ctx.currentTime;

      osc.type = "sine";
      osc.frequency.setValueAtTime(850, t);
      osc.frequency.exponentialRampToValueAtTime(1250, t + 0.035);

      gain.gain.setValueAtTime(0.04, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);

      osc.connect(gain);
      gain.connect(this.masterGain || ctx.destination);

      osc.start(t);
      osc.stop(t + 0.04);
    } catch (e) {}
  },

  /**
   * 2. Âm thanh nhấp chuột cơ học (Mechanical Switch Click)
   */
  playClick() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const t = ctx.currentTime;

      // Tiếng gõ switch
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(380, t);
      osc.frequency.exponentialRampToValueAtTime(140, t + 0.045);

      gain.gain.setValueAtTime(0.09, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.045);

      osc.connect(gain);
      gain.connect(this.masterGain || ctx.destination);

      osc.start(t);
      osc.stop(t + 0.05);
    } catch (e) {}
  },

  /**
   * 3. Âm thanh chuông chúc mừng / Upvote / Bookmark (Reward Chime)
   */
  playDing() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const t = ctx.currentTime;
      const notes = [587.33, 880]; // D5 -> A5

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = t + idx * 0.06;

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.08, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.18);

        osc.connect(gain);
        gain.connect(this.masterGain || ctx.destination);

        osc.start(start);
        osc.stop(start + 0.19);
      });
    } catch (e) {}
  },

  /**
   * 4. Âm thanh mở cửa sổ / Slide Spotlight (Aperture Woosh)
   */
  playWoosh() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(320, t);
      osc.frequency.exponentialRampToValueAtTime(580, t + 0.05);
      osc.frequency.exponentialRampToValueAtTime(220, t + 0.1);

      gain.gain.setValueAtTime(0.04, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

      osc.connect(gain);
      gain.connect(this.masterGain || ctx.destination);

      osc.start(t);
      osc.stop(t + 0.11);
    } catch (e) {}
  },

  /**
   * 5. Tự động lắng nghe sự kiện trên các thành phần UI
   */
  bindAutoSounds() {
    // Click vào các nút, liên kết và thẻ
    document.addEventListener("click", (e) => {
      const clickable = e.target.closest("button, .nav-tab-btn, .game-card, .comm-card, .btn-comm-download, .spotlight-nav-btn, .spotlight-dash");
      if (clickable) {
        this.playClick();
      }
    }, { passive: true });
  }
};

// Khởi chạy khi DOM sẵn sàng
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => AudioManager.init());
} else {
  AudioManager.init();
}

window.AudioManager = AudioManager;
