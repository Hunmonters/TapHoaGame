/* ==========================================================================
   TẠP HÓA VIỆT / CORE APPLICATION CONTROLLER (app.js)
   Quản lý Router URL Hash, Modal Chi Tiết, Intro Booting, Video Showcase, Theme
   ========================================================================== */

const App = {
  games: [],
  requests: [],
  activeTab: "catalog",
  currentGame: null,

  async init() {
    this.handleIntroScreen();
    await this.loadData();
    this.initModules();
    this.initVideoShowcase();
    this.bindTabNavigation();
    this.bindModalEvents();
    this.handleHashRouting();

    window.addEventListener("hashchange", () => this.handleHashRouting());
  },

  /**
   * Khởi tạo các module con
   */
  initModules() {
    if (window.ThemeManager) ThemeManager.init();
    if (window.Library) Library.init(this.games);
    if (window.Catalog) Catalog.init(this.games);
    if (window.Progress) Progress.init(this.games);
    if (window.Requests) Requests.init(this.requests);
    if (window.BugReporter) BugReporter.init(this.games);
    if (window.AdminStudio) AdminStudio.init(this.games);
  },

  /**
   * Xử lý màn hình mở màn thương hiệu phong cách VietPatch (Intro Booting Sequence)
   */
  handleIntroScreen() {
    const introEl = document.getElementById("brand-intro");
    const progressBar = document.getElementById("intro-progress-bar");
    const statusText = document.getElementById("intro-status-text");
    const skipBtn = document.getElementById("intro-skip-btn");

    if (!introEl) return;

    // Kiểm tra xem trong phiên duyệt web này người dùng đã xem intro chưa
    const alreadySeen = sessionStorage.getItem("thv_intro_seen");
    if (alreadySeen) {
      introEl.style.display = "none";
      return;
    }

    const steps = [
      { p: 25, t: "Đang nạp cấu hình hệ thống..." },
      { p: 60, t: "Kết nối cơ sở dữ liệu VietHoaGame..." },
      { p: 90, t: "Khởi tạo công cụ kiểm định mã băm & PE Inspector..." },
      { p: 100, t: "Đồng bộ hoàn tất!" }
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        if (progressBar) progressBar.style.width = steps[currentStep].p + "%";
        if (statusText) statusText.textContent = steps[currentStep].t;
        currentStep++;
      } else {
        clearInterval(interval);
        setTimeout(() => this.closeIntro(), 400);
      }
    }, 300);

    if (skipBtn) {
      skipBtn.onclick = () => {
        clearInterval(interval);
        this.closeIntro();
      };
    }
  },

  closeIntro() {
    const introEl = document.getElementById("brand-intro");
    if (!introEl) return;
    introEl.classList.add("fade-out");
    sessionStorage.setItem("thv_intro_seen", "1");
    setTimeout(() => {
      introEl.style.display = "none";
    }, 600);
  },

  /**
   * Tải dữ liệu JSON
   */
  async loadData() {
    try {
      const [gamesRes, reqsRes] = await Promise.all([
        fetch("data/games.json"),
        fetch("data/requests.json").catch(() => ({ ok: false }))
      ]);

      if (gamesRes.ok) {
        this.games = await gamesRes.json();
      }
      if (reqsRes && reqsRes.ok) {
        this.requests = await reqsRes.json();
      }
    } catch (err) {
      console.warn("Đang nạp dữ liệu dự phòng từ data_bundle.js", err);
      if (window.FALLBACK_GAMES) this.games = window.FALLBACK_GAMES;
      if (window.FALLBACK_REQUESTS) this.requests = window.FALLBACK_REQUESTS;
    }
  },

  /**
   * Widget Suất Chiếu Bản Dịch (Trailer Tuần chuẩn VietPatch)
   */
  initVideoShowcase() {
    const playBtn = document.getElementById("trailer-play-btn");
    const frame = document.getElementById("trailer-iframe");
    const poster = document.getElementById("trailer-poster");
    if (!playBtn || !frame || !poster) return;

    const ytId = (window.CONFIG && CONFIG.featuredTrailer && CONFIG.featuredTrailer.youtubeId) || "dQw4w9WgXcQ";

    playBtn.onclick = () => {
      frame.src = `https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&rel=0`;
      frame.style.display = "block";
      poster.style.display = "none";
      playBtn.style.display = "none";
    };
  },

  /**
   * Điều hướng 4 Tab chính
   */
  switchTab(tabId) {
    this.activeTab = tabId;

    document.querySelectorAll(".nav-tab-btn").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.tab === tabId);
    });

    document.querySelectorAll(".tab-pane").forEach(pane => {
      pane.classList.toggle("active", pane.id === `tab-${tabId}`);
    });

    if (tabId === "library" && window.Library) {
      Library.render();
    } else if (tabId === "progress" && window.Progress) {
      Progress.render();
    } else if (tabId === "requests" && window.Requests) {
      Requests.render();
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  },

  bindTabNavigation() {
    document.querySelectorAll("[data-tab]").forEach(el => {
      el.addEventListener("click", () => {
        this.switchTab(el.dataset.tab);
      });
    });
  },

  /**
   * Xử lý Router URL hash (Ví dụ: #together-moon-escape hoặc #admin)
   */
  handleHashRouting() {
    const hash = window.location.hash.replace("#", "").trim();
    if (!hash) {
      this.closeDetail(false);
      return;
    }

    if (hash === "admin") {
      if (window.AdminStudio) AdminStudio.open();
      return;
    }

    if (["catalog", "progress", "requests", "library"].includes(hash)) {
      this.switchTab(hash);
      return;
    }

    const game = this.games.find(g => g.id === hash);
    if (game) {
      this.openDetail(game.id, false);
    }
  },

  /**
   * Mở Modal Hồ Sơ Chi Tiết Game
   */
  openDetail(gameId, updateHash = true) {
    const game = this.games.find(g => g.id === gameId);
    if (!game) return;
    this.currentGame = game;

    if (updateHash) {
      history.pushState(null, "", `#${game.id}`);
    }

    const modal = document.getElementById("detail-modal");
    if (!modal) return;

    // Thông tin cơ bản
    document.getElementById("detail-title").textContent = game.title;
    document.getElementById("detail-original").textContent = game.original_title;
    document.getElementById("detail-engine-badge").textContent = game.engine;
    document.getElementById("detail-version-val").textContent = game.patch_version;
    document.getElementById("detail-gamever-val").textContent = game.game_version;
    document.getElementById("detail-size-val").textContent = game.size;

    const statusBadge = document.getElementById("detail-status-badge");
    if (statusBadge) {
      statusBadge.textContent = game.status === "ready" ? "Hoàn tất 100%" : `Đang dịch ${game.progress.overall}%`;
      statusBadge.className = `card-status-badge ${game.status === "ready" ? "ready" : "progress"}`;
    }

    // Poster box
    const posterBox = document.getElementById("detail-poster-box");
    if (posterBox) {
      posterBox.style.backgroundColor = game.cover_color || "#111822";
      let icon = "fa-gamepad";
      if (game.engine_category === "ue") icon = "fa-cubes";
      else if (game.engine_category === "unity") icon = "fa-cube";
      else if (game.engine_category === "gamemaker") icon = "fa-gear";

      posterBox.innerHTML = `
        <div style="text-align:center; padding: 16px;">
          <i class="fa-solid ${icon}" style="font-size: 3rem; color: rgba(255,255,255,0.7); margin-bottom: 8px; display:block;"></i>
          <strong style="color:#FFF; font-size: 1rem; line-height: 1.2; display:block;">${game.title}</strong>
        </div>
      `;
    }

    // Nút server download
    const dlGroup = document.getElementById("detail-download-links");
    if (dlGroup) {
      if (game.download_links && game.download_links.length > 0) {
        dlGroup.innerHTML = game.download_links.map(link => `
          <a href="${link.url}" target="_blank" rel="noopener noreferrer" class="btn-server-dl">
            <i class="fa-solid fa-cloud-arrow-down" style="color:var(--accent-gold)"></i>
            <span>${link.server}</span>
            <span class="server-badge">${link.badge || "Tải nhanh"}</span>
          </a>
        `).join("");
      } else {
        dlGroup.innerHTML = `
          <div style="color:var(--text-secondary); font-size:0.9rem; padding: 8px 0;">
            <i class="fa-solid fa-clock-rotate-left"></i> Dự án đang trong xưởng dịch kiểm thử. Sẽ mở tải công khai ngay khi đạt chuẩn 100%.
          </div>
        `;
      }
    }

    // Checksum SHA-256
    const shaVal = document.getElementById("detail-sha256-val");
    if (shaVal) shaVal.textContent = game.sha256 || "Đang cập nhật";

    // 1. Gắn Verifier kéo thả SHA-256
    const dropzone = document.getElementById("verifier-dropzone");
    const fileInput = document.getElementById("verifier-file-input");
    const resultBox = document.getElementById("verifier-result");
    if (window.Sha256Verifier && dropzone && fileInput && resultBox) {
      Sha256Verifier.bindDropzone(dropzone, fileInput, game.sha256, resultBox);
    }

    // 2. Gắn PE Binary Inspector kiểm tra phiên bản game tự động
    const peDropzone = document.getElementById("detector-dropzone");
    const peFileInput = document.getElementById("detector-file-input");
    const peResultBox = document.getElementById("detector-result");
    if (window.PeInspector && peDropzone && peFileInput && peResultBox) {
      PeInspector.bindDetector(peDropzone, peFileInput, game.game_version, peResultBox);
    }

    // Tab 1: Giới thiệu
    document.getElementById("pane-desc-content").innerHTML = `
      <p style="margin-bottom: 16px;">${game.description}</p>
      <div style="background: var(--bg-surface); padding: 18px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
        <strong style="color:var(--accent-gold); display:block; margin-bottom: 6px;"><i class="fa-solid fa-shield-halved"></i> Tiêu chuẩn chất lượng VietHoaGame:</strong>
        <p style="font-size: 0.88rem; color: var(--text-secondary);">Bản vá tuân thủ nguyên tắc không phá hủy dữ liệu gốc. Đảm bảo hỗ trợ đầy đủ font dấu tiếng Việt, không lỗi tràn viền và có thể gỡ bỏ dễ dàng.</p>
      </div>
    `;

    // Tab 2: Hướng dẫn cài đặt & Rollback
    const installSteps = game.install_guide || [];
    const rollbackSteps = game.rollback_guide || [];
    document.getElementById("pane-install-content").innerHTML = `
      <h3 style="font-size: 1.15rem; font-weight: 800; margin-bottom: 16px; color: var(--text-primary);">
        <i class="fa-solid fa-list-check" style="color:var(--accent-gold)"></i> Quy trình cài đặt chuẩn
      </h3>
      <ul class="steps-list">
        ${installSteps.map((step, i) => `
          <li class="step-item">
            <span class="step-num">${i + 1}</span>
            <div class="step-text">
              <p>${step}</p>
            </div>
          </li>
        `).join("")}
      </ul>

      <div class="rollback-box">
        <h4><i class="fa-solid fa-rotate-left"></i> Hướng dẫn hoàn tác / Gỡ cài đặt (Rollback)</h4>
        <ul style="list-style: none; padding-left: 0; font-size: 0.9rem; color: var(--text-secondary);">
          ${rollbackSteps.map(r => `<li style="margin-bottom: 6px;">• ${r}</li>`).join("")}
        </ul>
      </div>
    `;

    // Tab 3: Changelog
    const changelog = game.changelog || [];
    document.getElementById("pane-changelog-content").innerHTML = `
      <ul class="changelog-list">
        ${changelog.map(c => `<li class="changelog-item">${c}</li>`).join("")}
      </ul>
    `;

    // Tab 4: Credits
    const credits = game.credits || [];
    document.getElementById("pane-credits-content").innerHTML = `
      <div class="credits-grid">
        ${credits.map(c => `
          <div class="credit-card">
            <div class="credit-name">${c.name}</div>
            <div class="credit-role">${c.role}</div>
          </div>
        `).join("")}
      </div>
    `;

    this.switchModalTab("desc");
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  },

  closeDetail(clearHash = true) {
    const modal = document.getElementById("detail-modal");
    if (!modal) return;
    modal.classList.remove("active");
    document.body.style.overflow = "";
    this.currentGame = null;

    if (clearHash && window.location.hash && window.location.hash !== "#admin") {
      history.pushState(null, "", window.location.pathname);
    }
  },

  switchModalTab(tabKey) {
    document.querySelectorAll(".detail-tab-btn").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.modaltab === tabKey);
    });
    document.querySelectorAll(".detail-pane").forEach(pane => {
      pane.classList.toggle("active", pane.id === `pane-${tabKey}`);
    });
  },

  bindModalEvents() {
    const closeBtn = document.getElementById("btn-close-detail");
    if (closeBtn) closeBtn.onclick = () => this.closeDetail();

    const modal = document.getElementById("detail-modal");
    if (modal) {
      modal.onclick = (e) => {
        if (e.target === modal) this.closeDetail();
      };
    }

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal && modal.classList.contains("active")) {
        this.closeDetail();
      }
    });

    document.querySelectorAll(".detail-tab-btn").forEach(btn => {
      btn.onclick = () => {
        this.switchModalTab(btn.dataset.modaltab);
      };
    });

    const copyShaBtn = document.getElementById("btn-copy-sha");
    if (copyShaBtn) {
      copyShaBtn.onclick = () => {
        if (!this.currentGame || !this.currentGame.sha256) return;
        navigator.clipboard.writeText(this.currentGame.sha256).then(() => {
          this.showToast("Đã sao chép mã SHA-256!");
        }).catch(() => {
          this.showToast("Không sao chép được mã vào clipboard.");
        });
      };
    }

    // Nút báo lỗi từ modal chi tiết
    const reportBtnInModal = document.getElementById("btn-report-from-modal");
    if (reportBtnInModal) {
      reportBtnInModal.onclick = () => {
        const gid = this.currentGame ? this.currentGame.id : "";
        this.closeDetail(false);
        if (window.BugReporter) BugReporter.openModal(gid);
      };
    }
  },

  showToast(message) {
    const toast = document.getElementById("toast-box");
    const textEl = document.getElementById("toast-msg");
    if (!toast || !textEl) return;

    textEl.textContent = message;
    toast.classList.add("show");

    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      toast.classList.remove("show");
    }, 3200);
  }
};

document.addEventListener("DOMContentLoaded", () => {
  App.init();
});

window.App = App;
