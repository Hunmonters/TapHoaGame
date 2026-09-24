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
    await this.loadData();
    this.initModules();
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
    if (window.Community) Community.init(this.games);
    if (window.Requests) Requests.init(this.requests);
    if (window.BugReporter) BugReporter.init(this.games);
    if (window.AdminStudio) AdminStudio.init(this.games);
    this.initRealtimeGames();
  },

  /**
   * Đồng bộ Realtime cho danh sách Game khi có cập nhật từ Admin Studio
   */
  initRealtimeGames() {
    if (!window.SupabaseClient || !SupabaseClient.hasCloud()) return;
    try {
      SupabaseClient.subscribeTable(
        "games",
        (newGame) => {
          if (!this.games.some(g => g.id === newGame.id)) {
            this.games.unshift(newGame);
            if (window.Catalog) Catalog.render();
            if (window.Progress) Progress.render();
            this.showToast(`✨ Đã có bản Việt hóa mới: "${newGame.title}"!`);
          }
        },
        (updatedGame) => {
          const idx = this.games.findIndex(g => g.id === updatedGame.id);
          if (idx !== -1) {
            this.games[idx] = { ...this.games[idx], ...updatedGame };
            if (window.Catalog) Catalog.render();
            if (window.Progress) Progress.render();
            if (this.currentGame && this.currentGame.id === updatedGame.id) {
              this.openDetail(updatedGame.id, false);
            }
          }
        },
        (deletedGame) => {
          this.games = this.games.filter(g => g.id !== deletedGame.id);
          if (window.Community) {
            Community.games = Community.games.filter(g => g.id !== deletedGame.id);
            if (Array.isArray(Community.allGamesRef)) {
              Community.allGamesRef = Community.allGamesRef.filter(g => g.id !== deletedGame.id);
            }
            Community.renderMetrics();
            Community.render();
          }
          if (window.Catalog) Catalog.render();
          if (window.Progress) Progress.render();
          if (window.AdminStudio) AdminStudio.renderGamesTable();
        }
      );
    } catch (e) {
      console.warn("[App Realtime Games] Lỗi kết nối:", e);
    }
  },

  /**
   * Tải dữ liệu JSON (Hỗ trợ Supabase Cloud -> localStorage -> file cục bộ)
   */
  async loadData() {
    // 1. Khởi tạo Supabase client
    if (window.SupabaseClient) {
      SupabaseClient.init();
    }

    // 2. Thử lấy dữ liệu từ Supabase Cloud nếu đã cấu hình
    if (window.SupabaseClient && SupabaseClient.hasCloud()) {
      const cloudGames = await SupabaseClient.getGames();
      const cloudReqs = await SupabaseClient.getRequests();
      if (cloudGames && cloudGames.length) {
        this.games = cloudGames;
        console.log("[App] Đã nạp thành công dữ liệu games từ Supabase Cloud!");
      }
      if (cloudReqs && cloudReqs.length) {
        this.requests = cloudReqs;
      }
      if (this.games.length) return;
    }

    // 3. Thử lấy từ localStorage nếu có bản lưu tùy biến của Admin
    try {
      const cached = localStorage.getItem("thv_custom_games");
      if (cached) {
        this.games = JSON.parse(cached);
      }
    } catch (e) {}

    // 4. Nạp từ games.json nếu chưa có
    if (!this.games || !this.games.length) {
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
    }

    // 5. Loại bỏ vĩnh viễn các game Admin đã bấm Xóa
    try {
      const deletedIds = new Set(JSON.parse(localStorage.getItem("thv_deleted_games") || "[]"));
      if (deletedIds.size > 0 && Array.isArray(this.games)) {
        this.games = this.games.filter(g => !deletedIds.has(g.id));
      }
    } catch (e) {}
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
    } else if (tabId === "community" && window.Community) {
      Community.render();
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

    if (hash === "donate" || hash === "ungho") {
      if (window.DonateModal) DonateModal.open();
      return;
    }

    if (["catalog", "progress", "community", "requests", "library"].includes(hash)) {
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

    // Callout tác giả nếu là bản dịch cộng đồng
    const commCallout = document.getElementById("detail-community-callout");
    if (commCallout) {
      if (game.is_community) {
        commCallout.innerHTML = `
          <div class="detail-author-callout">
            <i class="fa-solid fa-users"></i>
            <div class="detail-author-callout-text">
              Bản dịch đóng góp bởi: <strong>${game.author || "Cộng Đồng"}</strong>
              ${game.author_link ? `<a href="${game.author_link}" target="_blank" rel="noopener noreferrer"><i class="fa-solid fa-arrow-up-right-from-square"></i> Ghé thăm nhóm</a>` : ""}
            </div>
          </div>
        `;
        commCallout.style.display = "block";
      } else {
        commCallout.innerHTML = "";
        commCallout.style.display = "none";
      }
    }

    const engineBadge = document.getElementById("detail-engine-badge");
    if (engineBadge) engineBadge.textContent = game.engine || "";
    document.getElementById("detail-version-val").textContent = game.patch_version;
    document.getElementById("detail-gamever-val").textContent = game.game_version;
    const sizeVal = document.getElementById("detail-size-val");
    if (sizeVal) sizeVal.textContent = game.size;

    const statusBadge = document.getElementById("detail-status-badge");
    if (statusBadge) {
      statusBadge.textContent = game.status === "ready" ? "Hoàn tất 100%" : `Đang dịch ${game.progress.overall}%`;
      statusBadge.className = `card-status-badge ${game.status === "ready" ? "ready" : "progress"}`;
    }

    // Cập nhật background banner và poster box
    const coverSrc = game.cover_image || `assets/covers/${game.id}.jpg`;
    const heroBanner = document.querySelector(".detail-hero-banner");
    if (heroBanner) {
      heroBanner.style.backgroundImage = `url('${coverSrc}')`;
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
        <img class="detail-poster-img" src="${coverSrc}" alt="${game.title}"
             onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
        <div style="display:none; text-align:center; padding: 16px;">
          <i class="fa-solid ${icon}" style="font-size: 3rem; color: rgba(255,255,255,0.7); margin-bottom: 8px; display:block;"></i>
          <strong style="color:#FFF; font-size: 1rem; line-height: 1.2; display:block;">${game.title}</strong>
        </div>
      `;
    }

    // Nút download Google Drive Độc Quyền
    const dlGroup = document.getElementById("detail-download-links");
    if (dlGroup) {
      if (game.status === "ready" && game.download_links && game.download_links.length > 0) {
        const gdrive = game.download_links[0];
        dlGroup.innerHTML = `
          <a href="${gdrive.url}" target="_blank" rel="noopener noreferrer" class="btn-gdrive-primary">
            <div class="gdrive-icon-wrap">
              <i class="fa-brands fa-google-drive"></i>
            </div>
            <div class="gdrive-content">
              <span class="gdrive-label"><i class="fa-solid fa-bolt"></i> TẢI TỐC ĐỘ CAO CHÍNH THỨC</span>
              <span class="gdrive-title">Tải Bản Việt Hóa (Google Drive)</span>
              <span class="gdrive-sub">Dung lượng: ${game.size || "Siêu gọn nhẹ"} • Tệp nén kiểm định sạch 100% SHA-256</span>
            </div>
            <div class="gdrive-action-btn">
              <i class="fa-solid fa-cloud-arrow-down"></i> Tải Ngay
            </div>
          </a>
        `;
      } else {
        dlGroup.innerHTML = `
          <div class="gdrive-wip-banner">
            <i class="fa-solid fa-clock-rotate-left"></i>
            <div>
              <strong>Dự án đang trong xưởng dịch kiểm thử (${game.progress ? game.progress.overall : 0}%)</strong>
              <p>Bản vá đang được nhóm hoàn thiện và kiểm định kỹ thuật. Link Google Drive sẽ được mở công khai ngay khi đạt chuẩn 100%.</p>
            </div>
          </div>
        `;
      }
    }
    // Tab 1: Giới thiệu kèm Ảnh Chụp Minh Họa Bản Dịch
    const screenshots = (game.screenshots && game.screenshots.length > 0)
      ? game.screenshots
      : (game.cover_image ? [game.cover_image] : []);
    this.currentGalleryImages = screenshots;
    this.currentGalleryIndex = 0;

    let galleryHtml = "";
    if (screenshots.length > 0) {
      galleryHtml = `
        <div class="detail-gallery-wrap">
          <div class="detail-gallery-header">
            <div class="detail-gallery-title">
              <i class="fa-solid fa-images"></i> Ảnh Chụp Minh Họa Bản Dịch
            </div>
            <span class="detail-gallery-counter" id="gallery-counter">1 / ${screenshots.length}</span>
          </div>

          <div class="detail-gallery-viewport" id="gallery-viewport" onclick="App.openLightbox()" title="Bấm để phóng to xem rõ chữ">
            <img id="gallery-main-img" src="${screenshots[0]}" alt="Ảnh minh họa ${game.title}">
            ${screenshots.length > 1 ? `
              <button type="button" class="gallery-nav-btn prev" onclick="event.stopPropagation(); App.stepGallery(-1)" aria-label="Ảnh trước">
                <i class="fa-solid fa-chevron-left"></i>
              </button>
              <button type="button" class="gallery-nav-btn next" onclick="event.stopPropagation(); App.stepGallery(1)" aria-label="Ảnh kế tiếp">
                <i class="fa-solid fa-chevron-right"></i>
              </button>
            ` : ""}
            <div class="detail-gallery-expand-hint">
              <i class="fa-solid fa-maximize"></i> Bấm để phóng to
            </div>
          </div>

          <!-- Dải ảnh nhỏ (Thumbnails) phía dưới -->
          ${screenshots.length > 1 ? `
            <div class="detail-gallery-thumbs" id="gallery-thumbs-row">
              ${screenshots.map((s, idx) => `
                <div class="detail-gallery-thumb ${idx === 0 ? "active" : ""}" 
                     onclick="App.selectGalleryImage(${idx})"
                     onmouseenter="App.selectGalleryImage(${idx})"
                     title="Xem ảnh ${idx + 1}">
                  <img src="${s}" alt="Thumbnail ${idx + 1}" loading="lazy" onerror="this.parentElement.style.display='none'">
                </div>
              `).join("")}
            </div>
          ` : ""}
        </div>
      `;
    }

    document.getElementById("pane-desc-content").innerHTML = `
      <p style="margin-bottom: 16px; font-size: 0.95rem; line-height: 1.6;">${game.description}</p>
      ${galleryHtml}
      <div style="background: var(--bg-surface); padding: 18px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle); margin-top: 18px;">
        <strong style="color:var(--accent-gold); display:block; margin-bottom: 6px;"><i class="fa-solid fa-shield-halved"></i> Tiêu chuẩn chất lượng VietHoaGame:</strong>
        <p style="font-size: 0.88rem; color: var(--text-secondary);">Bản vá tuân thủ nguyên tắc không phá hủy dữ liệu gốc. Đảm bảo hỗ trợ đầy đủ font dấu tiếng Việt, không lỗi tràn viền và có thể gỡ bỏ dễ dàng.</p>
      </div>
    `;

    // Tab 2: Hướng dẫn cài đặt tương tác 3 bước & Rollback
    const installSteps = game.install_guide || [];
    const rollbackSteps = game.rollback_guide || [];

    // Tìm thư mục game mục tiêu để hỗ trợ copy 1 chạm
    let targetPath = "";
    if (game.files_affected && game.files_affected.length > 0) {
      const raw = game.files_affected[0].split(" ")[0];
      const slashIdx = raw.lastIndexOf("/");
      if (slashIdx !== -1) {
        targetPath = raw.substring(0, slashIdx + 1);
      } else {
        targetPath = raw;
      }
    } else if (installSteps.length > 1) {
      const match = installSteps.join(" ").match(/['"`]([A-Za-z0-9_\-\.\/\\ ]+\/)[ '"`]/);
      if (match) targetPath = match[1];
    }

    const step2CustomText = installSteps.length >= 2
      ? installSteps[1]
      : "Giải nén tệp vừa tải và sao chép toàn bộ các file bên trong vào thư mục cài đặt gốc của game.";

    document.getElementById("pane-install-content").innerHTML = `
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:16px;">
        <h3 style="font-size: 1.15rem; font-weight: 800; color: var(--text-primary); margin:0;">
          <i class="fa-solid fa-list-check" style="color:var(--accent-gold)"></i> Quy trình cài đặt 3 bước (Bấm từng bước để đánh dấu)
        </h3>
        <span style="font-size:0.8rem; color:var(--accent-green);"><i class="fa-solid fa-shield-halved"></i> 100% An toàn</span>
      </div>

      <div class="install-checklist">
        <!-- Bước 1 -->
        <div class="install-step-card" onclick="App.toggleStep(this)">
          <div class="install-step-checkbox"><i class="fa-solid fa-check"></i></div>
          <div class="install-step-content">
            <div class="install-step-title">Bước 1: Tải tệp bản vá từ Google Drive</div>
            <div class="install-step-desc">${installSteps[0] || "Nhấn nút 'Tải Ngay' màu xanh ở trên để tải file nén bản Việt hóa từ Google Drive về máy."}</div>
          </div>
        </div>

        <!-- Bước 2 -->
        <div class="install-step-card" onclick="App.toggleStep(this)">
          <div class="install-step-checkbox"><i class="fa-solid fa-check"></i></div>
          <div class="install-step-content">
            <div class="install-step-title">Bước 2: Giải nén & dán vào thư mục game</div>
            <div class="install-step-desc">${step2CustomText}</div>
            ${targetPath ? `
              <div class="install-path-box">
                <i class="fa-regular fa-folder-open" style="color:var(--accent-cyan)"></i>
                <span class="install-path-code">${targetPath}</span>
                <button type="button" class="btn-copy-path" onclick="event.stopPropagation(); App.copyText('${targetPath}', this)">
                  <i class="fa-regular fa-copy"></i> Sao chép đường dẫn
                </button>
              </div>
            ` : ""}
          </div>
        </div>

        <!-- Bước 3 -->
        <div class="install-step-card" onclick="App.toggleStep(this)">
          <div class="install-step-checkbox"><i class="fa-solid fa-check"></i></div>
          <div class="install-step-content">
            <div class="install-step-title">Bước 3: Mở game và trải nghiệm tiếng Việt</div>
            <div class="install-step-desc">${installSteps[2] || "Khởi động game từ Steam hoặc shortcut desktop. Bản dịch tiếng Việt sẽ tự động áp dụng."}</div>
          </div>
        </div>
      </div>

      ${rollbackSteps && rollbackSteps.length > 0 ? `
        <div class="rollback-box" style="margin-top:24px;">
          <h4><i class="fa-solid fa-rotate-left"></i> Hướng dẫn hoàn tác / Gỡ cài đặt (Rollback)</h4>
          <ul style="list-style: none; padding-left: 0; font-size: 0.9rem; color: var(--text-secondary); margin-top: 8px;">
            ${rollbackSteps.map(r => `<li style="margin-bottom: 6px;">• ${r}</li>`).join("")}
          </ul>
        </div>
      ` : ""}
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
    this.closeLightbox();
    const modal = document.getElementById("detail-modal");
    if (!modal) return;
    modal.classList.remove("active");
    document.body.style.overflow = "";
    this.currentGame = null;

    if (clearHash && window.location.hash && window.location.hash !== "#admin") {
      history.pushState(null, "", window.location.pathname);
    }
  },

  selectGalleryImage(idx) {
    if (!this.currentGalleryImages || !this.currentGalleryImages.length) return;
    this.currentGalleryIndex = (idx + this.currentGalleryImages.length) % this.currentGalleryImages.length;
    const mainImg = document.getElementById("gallery-main-img");
    const counter = document.getElementById("gallery-counter");
    const lbImg = document.getElementById("lightbox-img");
    if (mainImg) mainImg.src = this.currentGalleryImages[this.currentGalleryIndex];
    if (counter) counter.textContent = `${this.currentGalleryIndex + 1} / ${this.currentGalleryImages.length}`;
    if (lbImg) lbImg.src = this.currentGalleryImages[this.currentGalleryIndex];

    document.querySelectorAll(".detail-gallery-thumb").forEach((t, i) => {
      t.classList.toggle("active", i === this.currentGalleryIndex);
    });
  },

  stepGallery(delta) {
    this.selectGalleryImage(this.currentGalleryIndex + delta);
  },

  openLightbox(customSrc) {
    const lightbox = document.getElementById("gallery-lightbox");
    const lbImg = document.getElementById("lightbox-img");
    if (customSrc) {
      if (lbImg) lbImg.src = customSrc;
      if (lightbox) lightbox.classList.add("active");
      return;
    }
    if (!this.currentGalleryImages || !this.currentGalleryImages.length) return;
    if (lbImg) lbImg.src = this.currentGalleryImages[this.currentGalleryIndex];
    if (lightbox) lightbox.classList.add("active");
  },

  closeLightbox() {
    const lightbox = document.getElementById("gallery-lightbox");
    if (lightbox) lightbox.classList.remove("active");
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
      const lb = document.getElementById("gallery-lightbox");
      if (e.key === "Escape") {
        if (lb && lb.classList.contains("active")) {
          this.closeLightbox();
          return;
        }
        if (modal && modal.classList.contains("active")) {
          this.closeDetail();
        }
      }
      if (modal && modal.classList.contains("active")) {
        if (e.key === "ArrowLeft") this.stepGallery(-1);
        if (e.key === "ArrowRight") this.stepGallery(1);
      }
    });

    document.querySelectorAll(".detail-tab-btn").forEach(btn => {
      btn.onclick = () => {
        this.switchModalTab(btn.dataset.modaltab);
      };
    });
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

  toggleTheme() {
    if (window.ThemeManager) {
      ThemeManager.toggleTheme();
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
  },

  /**
   * Sao chép văn bản vào clipboard với hiệu ứng nút bấm
   */
  copyText(text, btnEl) {
    if (!text) return;
    const doSuccess = () => {
      this.showToast("Đã sao chép đường dẫn vào bộ nhớ tạm!");
      if (btnEl) {
        const origHtml = btnEl.innerHTML;
        btnEl.classList.add("copied");
        btnEl.innerHTML = `<i class="fa-solid fa-check"></i> Đã sao chép!`;
        setTimeout(() => {
          btnEl.classList.remove("copied");
          btnEl.innerHTML = origHtml;
        }, 2200);
      }
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(doSuccess).catch(() => {
        this.fallbackCopyText(text, doSuccess);
      });
    } else {
      this.fallbackCopyText(text, doSuccess);
    }
  },

  fallbackCopyText(text, callback) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand("copy");
      if (callback) callback();
    } catch (err) {
      this.showToast("Không thể sao chép tự động, vui lòng chọn và copy thủ công.");
    }
    document.body.removeChild(textArea);
  },

  /**
   * Đánh dấu hoàn thành bước cài đặt trong checklist
   */
  toggleStep(cardEl) {
    if (!cardEl) return;
    cardEl.classList.toggle("completed");
  }
};

document.addEventListener("DOMContentLoaded", () => {
  App.init();
});

window.App = App;
