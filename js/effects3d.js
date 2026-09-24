/* ==========================================================================
   TẠP HÓA VIỆT / THREEUI 3D PARALLAX & GLINT CONTROLLER (effects3d.js)
   Tạo hiệu ứng thẻ 3D tương tác theo chuột mượt mà 60 FPS chuẩn ThreeUI.
   Sử dụng Event Delegation & requestAnimationFrame (Zero Memory Leak).
   ========================================================================== */

const ThreeFX = {
  activeElement: null,
  rafId: null,
  mouseX: 0,
  mouseY: 0,
  isTouchDevice: false,

  init() {
    // Không chạy hiệu ứng trên thiết bị cảm ứng thuần hoặc người dùng bật giảm chuyển động
    if (window.matchMedia("(pointer: coarse)").matches ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    this.bindEvents();
    console.log("🎮 ThreeFX: Đã khởi động hệ thống hiệu ứng 3D Parallax & Glare chuẩn ThreeUI!");
  },

  bindEvents() {
    const selector = ".game-card, .comm-card, .spotlight-media-wrap";

    // 1. Khi chuột di chuyển trên trang web
    document.addEventListener("mousemove", (e) => {
      const card = e.target.closest(selector);

      if (card) {
        // Nếu chuyển sang thẻ mới
        if (this.activeElement !== card) {
          if (this.activeElement) {
            this.resetCard(this.activeElement);
          }
          this.activeElement = card;
          this.prepareCard(card);
        }

        this.mouseX = e.clientX;
        this.mouseY = e.clientY;

        if (!this.rafId) {
          this.rafId = requestAnimationFrame(() => this.updateTilt());
        }
      } else if (this.activeElement) {
        // Rời khỏi vùng thẻ
        this.resetCard(this.activeElement);
        this.activeElement = null;
      }
    }, { passive: true });

    // 2. Khi chuột rời khỏi cửa sổ trình duyệt
    document.addEventListener("mouseleave", () => {
      if (this.activeElement) {
        this.resetCard(this.activeElement);
        this.activeElement = null;
      }
    });
  },

  prepareCard(card) {
    card.style.transition = "";
    if (!card.classList.contains("has-3d-tilt")) {
      card.classList.add("has-3d-tilt");
    }

    // Đảm bảo có lớp phản quang ánh sáng Glare bên trong thẻ
    if (!card.querySelector(".card-glare-effect")) {
      const glare = document.createElement("div");
      glare.className = "card-glare-effect";
      glare.setAttribute("aria-hidden", "true");
      card.appendChild(glare);
    }
  },

  updateTilt() {
    this.rafId = null;
    const card = this.activeElement;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = this.mouseX - rect.left;
    const y = this.mouseY - rect.top;

    // Giới hạn trong kích thước thực
    if (x < -15 || x > rect.width + 15 || y < -15 || y > rect.height + 15) {
      this.resetCard(card);
      this.activeElement = null;
      return;
    }

    const cx = rect.width / 2;
    const cy = rect.height / 2;

    // Góc nghiêng tối đa: 8.5 độ cho thẻ game, 5.5 độ cho banner spotlight
    const isSpotlight = card.classList.contains("spotlight-media-wrap") || card.classList.contains("spotlight-media-box");
    const maxTilt = isSpotlight ? 5.5 : 8.5;

    // Tính toán góc nghiêng 3D
    const rx = -((y - cy) / cy) * maxTilt;
    const ry = ((x - cx) / cx) * maxTilt;

    card.classList.add("is-tilting");
    card.style.setProperty("--tilt-rx", `${rx.toFixed(2)}deg`);
    card.style.setProperty("--tilt-ry", `${ry.toFixed(2)}deg`);
    card.style.setProperty("--tilt-rx-num", rx.toFixed(2));
    card.style.setProperty("--tilt-ry-num", ry.toFixed(2));
    card.style.setProperty("--mouse-x", `${((x / rect.width) * 100).toFixed(1)}%`);
    card.style.setProperty("--mouse-y", `${((y / rect.height) * 100).toFixed(1)}%`);
  },

  resetCard(card) {
    if (!card) return;
    // Chuyển động hồi phục vị trí ban đầu êm ái
    card.style.transition = "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1)";
    card.style.setProperty("--tilt-rx", "0deg");
    card.style.setProperty("--tilt-ry", "0deg");
    card.style.setProperty("--tilt-rx-num", "0");
    card.style.setProperty("--tilt-ry-num", "0");

    setTimeout(() => {
      if (card !== this.activeElement) {
        card.classList.remove("is-tilting");
        card.style.transition = "";
      }
    }, 380);
  }
};

/* ==========================================================================
   SPOTLIGHT HERO INTERACTIVE PARTICLES (HẠT BỤI ÁNH SÁNG THREEUI)
   ========================================================================== */
const SpotlightParticles = {
  canvas: null,
  ctx: null,
  container: null,
  width: 0,
  height: 0,
  dpr: 1,
  particles: [],
  mouse: { x: -9999, y: -9999, radius: 125, active: false },
  rafId: null,
  isRunning: false,
  isVisible: false,
  observer: null,

  init() {
    this.canvas = document.getElementById("spotlight-particles");
    this.container = document.querySelector(".spotlight-container");
    if (!this.canvas || !this.container) return;

    this.ctx = this.canvas.getContext("2d");
    if (!this.ctx) return;

    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.resize();
    this.createParticles(38);
    this.bindEvents();
    this.setupObserver();
  },

  resize() {
    if (!this.container || !this.canvas) return;
    const rect = this.container.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    this.width = rect.width;
    this.height = rect.height;

    this.canvas.width = Math.round(this.width * this.dpr);
    this.canvas.height = Math.round(this.height * this.dpr);
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;

    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(this.dpr, this.dpr);
  },

  createParticles(count) {
    this.particles = [];
    const colors = ["orange", "gold", "ember"];
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * (this.width || 800),
        y: Math.random() * (this.height || 400),
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.35 - 0.12, // Nhẹ nhàng trôi lên như tàn than hồng
        radius: Math.random() * 2.2 + 1.2,
        baseAlpha: Math.random() * 0.35 + 0.25,
        alpha: 0.3,
        pulseSpeed: Math.random() * 0.025 + 0.015,
        pulsePhase: Math.random() * Math.PI * 2,
        colorType: colors[Math.floor(Math.random() * colors.length)]
      });
    }
  },

  bindEvents() {
    let resizeTimer = null;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        this.resize();
      }, 150);
    }, { passive: true });

    // Tương tác chuột trong phạm vi container
    this.container.addEventListener("mousemove", (e) => {
      const rect = this.container.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
      this.mouse.active = true;
    }, { passive: true });

    this.container.addEventListener("mouseleave", () => {
      this.mouse.active = false;
      this.mouse.x = -9999;
      this.mouse.y = -9999;
    }, { passive: true });

    // Tự động tạm dừng khi chuyển tab trình duyệt
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        this.stop();
      } else if (this.isVisible) {
        this.start();
      }
    });
  },

  setupObserver() {
    if (!window.IntersectionObserver) {
      this.start();
      return;
    }

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          this.isVisible = true;
          this.start();
        } else {
          this.isVisible = false;
          this.stop();
        }
      });
    }, { threshold: 0.05 });

    this.observer.observe(this.container);
  },

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.loop();
  },

  stop() {
    this.isRunning = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  },

  loop() {
    if (!this.isRunning) return;
    this.render();
    this.rafId = requestAnimationFrame(() => this.loop());
  },

  render() {
    const ctx = this.ctx;
    if (!ctx) return;

    ctx.clearRect(0, 0, this.width, this.height);

    const isDark = document.documentElement.getAttribute("data-theme") === "dark";

    // 1. Vẽ các đường nối chùm sao (Constellation Lines) ThreeUI
    const connectMaxDist = 65;
    ctx.lineWidth = 0.8;

    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const p1 = this.particles[i];
        const p2 = this.particles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < connectMaxDist) {
          const lineAlpha = (1 - dist / connectMaxDist) * (isDark ? 0.22 : 0.12);
          ctx.strokeStyle = isDark
            ? `rgba(255, 87, 51, ${lineAlpha})`
            : `rgba(234, 72, 40, ${lineAlpha})`;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
    }

    // 2. Cập nhật và vẽ từng hạt bụi ánh sáng
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      // Dao động độ mờ (shimmering / breathing pulse)
      p.pulsePhase += p.pulseSpeed;
      p.alpha = Math.max(0.1, p.baseAlpha + Math.sin(p.pulsePhase) * 0.18);

      // Tương tác đẩy nhẹ khi chuột đến gần
      if (this.mouse.active) {
        const mdx = p.x - this.mouse.x;
        const mdy = p.y - this.mouse.y;
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy);

        if (mdist < this.mouse.radius && mdist > 0) {
          const force = (1 - mdist / this.mouse.radius) * 1.8;
          const angle = Math.atan2(mdy, mdx);
          p.vx += Math.cos(angle) * force * 0.6;
          p.vy += Math.sin(angle) * force * 0.6;
        }
      }

      // Giảm dần lực tác động từ chuột về tốc độ bình thường (damping)
      p.vx *= 0.98;
      p.vy *= 0.98;

      // Di chuyển
      p.x += p.vx;
      p.y += p.vy;

      // Giới hạn màn hình (vòng lặp êm ái)
      if (p.x < -10) p.x = this.width + 10;
      else if (p.x > this.width + 10) p.x = -10;

      if (p.y < -10) {
        p.y = this.height + 10;
        p.x = Math.random() * this.width;
      } else if (p.y > this.height + 10) {
        p.y = -10;
      }

      // Màu sắc theo Theme
      let fillColor = "";
      if (isDark) {
        ctx.shadowBlur = p.radius * 3.5;
        if (p.colorType === "orange") {
          ctx.shadowColor = "#FF5733";
          fillColor = `rgba(255, 87, 51, ${p.alpha})`;
        } else if (p.colorType === "ember") {
          ctx.shadowColor = "#EA4828";
          fillColor = `rgba(255, 110, 60, ${p.alpha * 1.2})`;
        } else {
          ctx.shadowColor = "#F59E0B";
          fillColor = `rgba(245, 158, 11, ${p.alpha})`;
        }
      } else {
        // Giao diện Kem & Cam
        ctx.shadowBlur = p.radius * 2;
        if (p.colorType === "orange") {
          ctx.shadowColor = "rgba(234, 72, 40, 0.4)";
          fillColor = `rgba(234, 72, 40, ${p.alpha})`;
        } else if (p.colorType === "ember") {
          ctx.shadowColor = "rgba(206, 50, 20, 0.35)";
          fillColor = `rgba(206, 50, 20, ${p.alpha * 1.1})`;
        } else {
          ctx.shadowColor = "rgba(217, 119, 6, 0.35)";
          fillColor = `rgba(217, 119, 6, ${p.alpha})`;
        }
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = fillColor;
      ctx.fill();
    }

    ctx.shadowBlur = 0; // Reset shadow
  }
};

// Khởi chạy khi DOM sẵn sàng
function initAllEffects() {
  ThreeFX.init();
  SpotlightParticles.init();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAllEffects);
} else {
  initAllEffects();
}

window.ThreeFX = ThreeFX;
window.SpotlightParticles = SpotlightParticles;


