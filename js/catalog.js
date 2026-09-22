/* ==========================================================================
   TẠP HÓA VIỆT / CATALOG LOGIC (catalog.js)
   Quản lý danh sách game, lọc engine, tìm kiếm không dấu, hero carousel, stats
   ========================================================================== */

const Catalog = {
  games: [],
  filters: {
    query: "",
    engine: "all",
    status: "all",
    sort: "newest"
  },
  currentSlide: 0,
  spotlightGames: [],
  currentSpotlightIndex: 0,
  spotlightInterval: null,

  init(gamesData) {
    this.games = gamesData || [];
    this.renderStats();
    this.renderSpotlight();
    this.renderArchiveWire();
    this.bindEvents();
    this.renderCatalog();
  },

  /**
   * Loại bỏ dấu tiếng Việt để tìm kiếm thông minh
   */
  removeAccents(str) {
    if (!str) return "";
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .toLowerCase();
  },

  /**
   * Cập nhật các con số trong Live Stats Bar
   */
  renderStats() {
    const total = this.games.length;
    const ready = this.games.filter(g => g.status === "ready").length;
    const wip = this.games.filter(g => g.status === "in-progress").length;
    const engines = new Set(this.games.map(g => g.engine_category)).size;

    const elTotal = document.getElementById("stat-total");
    const elReady = document.getElementById("stat-ready");
    const elWip = document.getElementById("stat-wip");
    const elEngines = document.getElementById("stat-engines");

    if (elTotal) elTotal.textContent = total;
    if (elReady) elReady.textContent = ready;
    if (elWip) elWip.textContent = wip;
    if (elEngines) elEngines.textContent = engines;
  },

  /**
   * Hiển thị Bản Việt Hóa Mới Cập Nhật Nổi Bật (Spotlight Showcase)
   * Bám sát 100% bố cục từ hình ảnh mẫu
   */
  renderSpotlight() {
    let featured = this.games.filter(g => g.featured);
    if (!featured.length) featured = this.games.slice(0, 5);
    this.spotlightGames = featured;

    if (!this.spotlightGames.length) return;

    // Render dashes pagination
    const dashesContainer = document.getElementById("spotlight-dashes");
    if (dashesContainer) {
      dashesContainer.innerHTML = this.spotlightGames.map((g, idx) => `
        <div class="spotlight-dash ${idx === this.currentSpotlightIndex ? "active" : ""}"
             onclick="Catalog.goToSpotlight(${idx})" title="${g.title}"></div>
      `).join("");
    }

    this.renderSpotlightSlide(this.currentSpotlightIndex);
    this.startSpotlightAutoPlay();
  },

  renderSpotlightSlide(index) {
    const game = this.spotlightGames[index];
    if (!game) return;

    this.currentSpotlightIndex = index;

    // Update dashes active class
    const dashes = document.querySelectorAll(".spotlight-dash");
    dashes.forEach((d, i) => d.classList.toggle("active", i === index));

    // Update release date
    const dateEl = document.getElementById("spotlight-date");
    if (dateEl) {
      let dateText = "01/08/2026";
      if (game.release_date) {
        const parts = game.release_date.split("-");
        if (parts.length === 3) dateText = `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      dateEl.textContent = `CẬP NHẬT • ${dateText}`;
    }

    const bodyEl = document.getElementById("spotlight-body");
    if (!bodyEl) return;

    const numStr = String(index + 1).padStart(2, "0");
    const coverSrc = game.cover_image || `assets/covers/${game.id}.jpg`;
    const devText = game.developer || "VietHoaGame Team";
    const statusText = game.status === "ready" ? "Sẵn sàng" : "Đang dịch";
    const statusSub = game.status === "ready" ? "Hoàn tất 100%" : `Đang dịch ${game.progress ? game.progress.overall : 0}%`;

    bodyEl.innerHTML = `
      <!-- Cột trái: Thông tin bản dịch -->
      <div class="spotlight-info">
        <div class="spotlight-corner-accent"></div>
        <div class="spotlight-badge">
          <i class="fa-solid fa-circle-dot" style="font-size:0.65rem;"></i> CẬP NHẬT MỚI
        </div>
        <h1 class="spotlight-title">${game.title} Việt Hóa</h1>
        <div class="spotlight-subtitle">
          ${devText} · ${statusSub}
        </div>
        <div class="spotlight-divider"></div>
        
        <div class="spotlight-stats-wrap">
          <div class="spotlight-watermark">${numStr}</div>
          <div class="spotlight-stat-item">
            <span class="spotlight-stat-label">PHIÊN BẢN</span>
            <span class="spotlight-stat-val">${game.patch_version || "v1.0.0"}</span>
          </div>
          <div class="spotlight-stat-item">
            <span class="spotlight-stat-label">DUNG LƯỢNG</span>
            <span class="spotlight-stat-val">${game.size || "18 MB"}</span>
          </div>
          <div class="spotlight-stat-item">
            <span class="spotlight-stat-label">TRẠNG THÁI</span>
            <span class="spotlight-stat-val" style="color:${game.status === "ready" ? "var(--text-primary)" : "var(--accent-orange)"}">${statusText}</span>
          </div>
        </div>

        <button type="button" class="spotlight-btn-action" onclick="App.openDetail('${game.id}')">
          <span>Mở hồ sơ</span>
          <i class="fa-solid fa-arrow-right"></i>
        </button>
      </div>

      <!-- Cột phải: Khung ảnh 16:9 & Cụm nút điều hướng -->
      <div class="spotlight-media-wrap">
        <div class="spotlight-corner-tl"></div>
        <div class="spotlight-corner-br"></div>
        <div class="spotlight-media-box" onclick="App.openDetail('${game.id}')" style="cursor:pointer;" title="Bấm để xem hồ sơ ${game.title}">
          <img class="spotlight-media-img" src="${coverSrc}" alt="${game.title}" onerror="this.src='assets/covers/together-moon-escape.jpg'">
        </div>
        <div class="spotlight-nav-controls">
          <button type="button" class="spotlight-nav-btn" onclick="Catalog.prevSpotlight()" aria-label="Game trước">
            <i class="fa-solid fa-chevron-up"></i>
          </button>
          <button type="button" class="spotlight-nav-btn" onclick="Catalog.nextSpotlight()" aria-label="Game kế tiếp">
            <i class="fa-solid fa-chevron-down"></i>
          </button>
        </div>
      </div>
    `;
  },

  goToSpotlight(idx) {
    if (!this.spotlightGames.length) return;
    this.currentSpotlightIndex = (idx + this.spotlightGames.length) % this.spotlightGames.length;
    this.renderSpotlightSlide(this.currentSpotlightIndex);
  },

  nextSpotlight() {
    this.goToSpotlight(this.currentSpotlightIndex + 1);
  },

  prevSpotlight() {
    this.goToSpotlight(this.currentSpotlightIndex - 1);
  },

  startSpotlightAutoPlay() {
    if (this.spotlightInterval) clearInterval(this.spotlightInterval);
    if (this.spotlightGames.length <= 1) return;

    this.spotlightInterval = setInterval(() => {
      this.nextSpotlight();
    }, 7000);

    const showcase = document.getElementById("spotlight-showcase");
    if (showcase) {
      showcase.onmouseenter = () => clearInterval(this.spotlightInterval);
      showcase.onmouseleave = () => this.startSpotlightAutoPlay();
    }
  },

  /**
   * Dải tin vắn Archive Wire Ticker chạy chữ mượt mà dưới chân Spotlight
   */
  renderArchiveWire() {
    const wireTrack = document.getElementById("wire-track");
    if (!wireTrack || !this.games.length) return;

    const items = this.games.map(g => {
      const patch = g.patch_version ? g.patch_version.split(" ")[0] : "v1.0.0";
      let dateText = "16/09/2026";
      if (g.release_date) {
        const parts = g.release_date.split("-");
        if (parts.length === 3) dateText = `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      return `${g.title.toUpperCase()} VIỆT HÓA — PATCH ${patch} — ${dateText}`;
    });

    const separator = `<span style="color:var(--accent-orange, #EA4828); margin: 0 16px;">♦</span>`;
    const staticBanner = `GỬI ĐỀ XUẤT GAME BẠN MUỐN VIỆT HÓA TẠI MỤC ĐỀ XUẤT ${separator} TẠP HÓA VIỆT — KHO BẢN DỊCH CHUẨN MỰC`;
    const fullText = [...items, staticBanner].join(` ${separator} `);

    wireTrack.innerHTML = `${fullText} ${separator} ${fullText}`;
  },

  filters: {
    query: "",
    filter: "all",
    sort: "newest"
  },

  /**
   * Lọc và sắp xếp danh sách game
   */
  getFilteredGames() {
    const q = this.removeAccents(this.filters.query.trim());

    let result = this.games.filter(g => {
      // Lọc theo search
      if (q) {
        const textToSearch = this.removeAccents(`${g.title} ${g.original_title || ""} ${g.summary || ""}`);
        if (!textToSearch.includes(q)) return false;
      }
      // Lọc theo tab nhanh
      if (this.filters.filter === "ready") {
        if (g.status !== "ready") return false;
      } else if (this.filters.filter === "community") {
        if (!g.is_community) return false;
      } else if (this.filters.filter === "wip") {
        if (g.status === "ready") return false;
      } else if (this.filters.filter === "featured") {
        if (!g.featured) return false;
      }
      return true;
    });

    // Sắp xếp
    if (this.filters.sort === "newest") {
      result.sort((a, b) => (b.release_date || "").localeCompare(a.release_date || ""));
    } else if (this.filters.sort === "popular") {
      result.sort((a, b) => (b.downloads_count || 0) - (a.downloads_count || 0));
    } else if (this.filters.sort === "a-z") {
      result.sort((a, b) => a.title.localeCompare(b.title, "vi"));
    }

    return result;
  },

  /**
   * Render HTML cho 1 thẻ Game Card
   */
  renderGameCard(g, savedSet) {
    const isSaved = savedSet.has(g.id);
    const isReady = g.status === "ready";
    const statusClass = isReady ? "ready" : "progress";
    const statusText = isReady ? "⚡ SẴN SÀNG TẢI" : `Đang dịch ${g.progress ? g.progress.overall : 0}%`;
    const fillClass = isReady ? "" : "wip";
    const readyGlowClass = isReady ? "card-ready" : "";
    const coverSrc = g.cover_image || `assets/covers/${g.id}.jpg`;

    return `
      <article class="game-card ${readyGlowClass}" onclick="App.openDetail('${g.id}')">
        <div class="card-poster-wrap" style="background-color: ${g.cover_color || '#111822'}">
          <img class="card-poster-img" src="${coverSrc}" alt="${g.title}" loading="lazy"
               onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
          <div class="card-poster-art" style="display:none;">
            <i class="fa-solid fa-gamepad card-poster-icon" style="color: rgba(255,255,255,0.7)"></i>
            <h3 class="card-poster-title">${g.title}</h3>
          </div>
          <span class="card-status-badge ${statusClass}">${statusText}</span>
          ${g.is_community ? `
            <span class="card-status-badge" style="top:38px; background:#7C3AED; color:#FFF; font-size:0.68rem; padding:2px 7px;">
              <i class="fa-solid fa-users"></i> CỘNG ĐỒNG
            </span>
          ` : ""}
          <button class="card-bookmark-btn ${isSaved ? "active" : ""}" 
                  title="${isSaved ? "Bỏ lưu" : "Lưu vào bộ sưu tập"}" 
                  onclick="event.stopPropagation(); Library.toggle('${g.id}')">
            <i class="${isSaved ? "fa-solid" : "fa-regular"} fa-bookmark"></i>
          </button>
          <div class="card-shade"></div>
          ${isReady ? `
            <span class="card-quick-download" onclick="event.stopPropagation(); App.openDetail('${g.id}')">
              <i class="fa-brands fa-google-drive"></i> Tải Ngay
            </span>
          ` : ""}
        </div>
        <div class="card-body">
          <div class="card-meta-tags">
            ${g.is_community ? `
              <span class="tag-version" style="background:rgba(124, 58, 237, 0.08); color:#7C3AED; border-color:rgba(124, 58, 237, 0.25);" title="Dịch giả: ${g.author}">
                <i class="fa-solid fa-user-pen"></i> ${g.author || "Cộng Đồng"}
              </span>
            ` : `
              <span class="tag-version"><i class="fa-solid fa-code-branch"></i> ${g.game_version || "Bản 1.0"}</span>
            `}
            <span class="tag-size"><i class="fa-solid fa-bolt"></i> ${g.size || "Nhẹ"}</span>
          </div>
          <h4 class="card-title" title="${g.title}">${g.title}</h4>
          <div class="card-progress-wrap">
            <div class="card-progress-bar">
              <div class="card-progress-fill ${fillClass}" style="width: ${g.progress ? g.progress.overall : 0}%"></div>
            </div>
            <span class="card-progress-percent">${g.progress ? g.progress.overall : 0}%</span>
          </div>
        </div>
      </article>
    `;
  },

  /**
   * Render Thư Viện Bản Dịch chia thành 2 phân khu Hoàn Thành & Đang Dịch
   */
  renderCatalog() {
    const container = document.getElementById("catalog-sections-wrap") || document.getElementById("games-grid");
    const countEl = document.getElementById("catalog-count");
    if (!container) return;

    const filtered = this.getFilteredGames();
    if (countEl) countEl.textContent = `${filtered.length} trên tổng ${this.games.length} game`;

    if (!filtered.length) {
      container.innerHTML = `
        <div class="catalog-empty" style="text-align:center; padding:60px 20px; background:#FFFFFF; border:2px solid #121316; border-radius:var(--radius-md); box-shadow:4px 4px 0px #121316;">
          <i class="fa-solid fa-box-open" style="font-size:2.8rem; color:var(--text-muted); margin-bottom:12px;"></i>
          <h3 style="font-size:1.25rem; font-weight:800; color:var(--text-primary); margin-bottom:6px;">Không tìm thấy bản Việt hóa nào phù hợp</h3>
          <p style="color:var(--text-secondary); font-size:0.9rem;">Thử tìm kiếm với từ khóa khác hoặc chọn xem Tất Cả Game.</p>
        </div>
      `;
      return;
    }

    const savedSet = Library.getSavedSet();

    // Nếu người dùng chọn tab Cộng Đồng
    if (this.filters.filter === "community") {
      container.innerHTML = `
        <section class="catalog-group-section" id="section-community-games">
          <div class="catalog-group-head">
            <div class="catalog-group-title">
              <span class="group-badge ready" style="background:#7C3AED"><i class="fa-solid fa-users"></i> CỘNG ĐỒNG</span>
              <h3>Bản Dịch Do Cộng Đồng & Nhóm Dịch Đóng Góp</h3>
            </div>
            <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
              <span class="catalog-group-count">${filtered.length} bản dịch</span>
            </div>
          </div>
          <div class="games-grid grid-community">
            ${filtered.map(g => this.renderGameCard(g, savedSet)).join("")}
          </div>
        </section>
      `;
      return;
    }

    // Nếu người dùng chọn tab Nổi bật (Featured)
    if (this.filters.filter === "featured") {
      container.innerHTML = `
        <section class="catalog-group-section" id="section-featured-games">
          <div class="catalog-group-head">
            <div class="catalog-group-title">
              <span class="group-badge ready" style="background:var(--accent-orange)"><i class="fa-solid fa-star"></i> SPOTLIGHT</span>
              <h3>Bản Dịch Mới Cập Nhật Nổi Bật</h3>
            </div>
            <span class="catalog-group-count">${filtered.length} bản dịch nổi bật</span>
          </div>
          <div class="games-grid grid-featured">
            ${filtered.map(g => this.renderGameCard(g, savedSet)).join("")}
          </div>
        </section>
      `;
      return;
    }

    const readyGames = filtered.filter(g => g.status === "ready");
    const wipGames = filtered.filter(g => g.status !== "ready");

    let html = "";

    // Phân khu 1: Bản Dịch Đã Hoàn Thành
    if (readyGames.length > 0) {
      html += `
        <section class="catalog-group-section" id="section-ready-games">
          <div class="catalog-group-head">
            <div class="catalog-group-title">
              <span class="group-badge ready"><i class="fa-solid fa-circle-check"></i> HOÀN THÀNH</span>
              <h3>Bản Dịch Đã Hoàn Thành (Sẵn Sàng Tải Về)</h3>
            </div>
            <span class="catalog-group-count">${readyGames.length} bản dịch</span>
          </div>
          <div class="games-grid grid-ready">
            ${readyGames.map(g => this.renderGameCard(g, savedSet)).join("")}
          </div>
        </section>
      `;
    }

    // Phân khu 2: Dự Án Đang Dịch
    if (wipGames.length > 0) {
      html += `
        <section class="catalog-group-section" id="section-wip-games">
          <div class="catalog-group-head">
            <div class="catalog-group-title">
              <span class="group-badge wip"><i class="fa-solid fa-clock-rotate-left"></i> ĐANG THỰC HIỆN</span>
              <h3>Dự Án Đang Dịch (Tiến Độ Trong Xưởng)</h3>
            </div>
            <span class="catalog-group-count">${wipGames.length} dự án</span>
          </div>
          <div class="games-grid grid-wip">
            ${wipGames.map(g => this.renderGameCard(g, savedSet)).join("")}
          </div>
        </section>
      `;
    }

    container.innerHTML = html;
  },

  bindEvents() {
    // Tìm kiếm
    const searchInput = document.getElementById("catalog-search");
    if (searchInput) {
      searchInput.oninput = (e) => {
        this.filters.query = e.target.value;
        this.renderCatalog();
      };
    }

    // Filter pill buttons (Tất cả, Tải ngay, Đang dịch, Nổi bật)
    const filterPills = document.querySelectorAll(".filter-pill");
    filterPills.forEach(pill => {
      pill.onclick = () => {
        filterPills.forEach(p => p.classList.remove("active"));
        pill.classList.add("active");
        this.filters.filter = pill.dataset.filter || "all";
        this.renderCatalog();
      };
    });

    // Select sort
    const sortSelect = document.getElementById("filter-sort");
    if (sortSelect) {
      sortSelect.onchange = (e) => {
        this.filters.sort = e.target.value;
        this.renderCatalog();
      };
    }

    // Nút đặt lại bộ lọc
    const resetBtn = document.getElementById("btn-reset-filters");
    if (resetBtn) {
      resetBtn.onclick = () => {
        this.filters = { query: "", filter: "all", sort: "newest" };
        if (searchInput) searchInput.value = "";
        if (sortSelect) sortSelect.value = "newest";
        filterPills.forEach(p => p.classList.remove("active"));
        const defaultPill = document.querySelector('.filter-pill[data-filter="all"]');
        if (defaultPill) defaultPill.classList.add("active");
        this.renderCatalog();
      };
    }
  }
};

window.Catalog = Catalog;
