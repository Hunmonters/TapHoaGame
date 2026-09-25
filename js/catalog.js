/* ==========================================================================
   TẠP HÓA VIỆT / CATALOG LOGIC (catalog.js)
   Quản lý danh sách game, lọc engine, tìm kiếm không dấu, hero carousel, stats
   ========================================================================== */

const Catalog = {
  games: [],
  filters: {
    query: "",
    filter: "all",
    sort: "newest"
  },
  currentPage: 1,
  currentReadyPage: 1, // Điều hướng phân trang riêng cho Bản Dịch Hoàn Thành
  currentWipPage: 1,   // Điều hướng phân trang riêng cho Dự Án Đang Dịch
  itemsPerPage: 9,     // Ràng buộc: đúng 9 thẻ / trang
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
   * Đổi trang hiển thị cho các view đơn (Community, Featured)
   */
  setPage(page) {
    const filtered = this.getFilteredGames();
    const totalPages = Math.ceil(filtered.length / this.itemsPerPage) || 1;
    const targetPage = Math.min(Math.max(1, page), totalPages);
    if (this.currentPage === targetPage) return;
    this.currentPage = targetPage;
    this.renderCatalog();

    const toolbar = document.querySelector(".catalog-toolbar") || document.getElementById("catalog-sections-wrap");
    if (toolbar) {
      const topOffset = toolbar.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: Math.max(0, topOffset), behavior: "smooth" });
    }
  },

  /**
   * Đổi trang hiển thị ĐỘC LẬP cho phân khu Bản Dịch Hoàn Thành
   */
  setReadyPage(page) {
    const filtered = this.getFilteredGames();
    const readyGames = filtered.filter(g => g.status === "ready");
    const totalPages = Math.ceil(readyGames.length / this.itemsPerPage) || 1;
    const targetPage = Math.min(Math.max(1, page), totalPages);
    if (this.currentReadyPage === targetPage) return;
    this.currentReadyPage = targetPage;
    this.renderCatalog();

    const sec = document.getElementById("section-ready-games");
    if (sec) {
      const topOffset = sec.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: Math.max(0, topOffset), behavior: "smooth" });
    }
  },

  /**
   * Đổi trang hiển thị ĐỘC LẬP cho phân khu Dự Án Đang Dịch
   */
  setWipPage(page) {
    const filtered = this.getFilteredGames();
    const wipGames = filtered.filter(g => g.status !== "ready");
    const totalPages = Math.ceil(wipGames.length / this.itemsPerPage) || 1;
    const targetPage = Math.min(Math.max(1, page), totalPages);
    if (this.currentWipPage === targetPage) return;
    this.currentWipPage = targetPage;
    this.renderCatalog();

    const sec = document.getElementById("section-wip-games");
    if (sec) {
      const topOffset = sec.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: Math.max(0, topOffset), behavior: "smooth" });
    }
  },

  /**
   * Render thanh phân trang chuẩn Neubrutalist tái sử dụng cho từng phân khu
   */
  renderPagination(totalItems, currentPage = 1, onPageChangeFnName = "Catalog.setPage", label = "bản dịch") {
    const totalPages = Math.ceil(totalItems / this.itemsPerPage);
    if (totalPages <= 1) {
      return "";
    }

    const startIdx = (currentPage - 1) * this.itemsPerPage + 1;
    const endIdx = Math.min(currentPage * this.itemsPerPage, totalItems);

    // Tính toán các nút số trang (hỗ trợ dấu ba chấm nếu nhiều trang)
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, "...", totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }

    const numbersHtml = pages.map(p => {
      if (p === "...") {
        return `<span class="page-ellipsis">…</span>`;
      }
      return `
        <button class="page-num-btn ${p === currentPage ? "active" : ""}" 
                type="button" 
                onclick="${onPageChangeFnName}(${p})" 
                aria-label="Trang ${p}" 
                ${p === currentPage ? 'aria-current="page"' : ''}>
          ${p}
        </button>
      `;
    }).join("");

    return `
      <nav class="catalog-pagination" aria-label="Phân trang ${label}">
        <div class="pagination-info">
          Hiển thị <strong>${startIdx}–${endIdx}</strong> trên tổng số <strong>${totalItems}</strong> ${label}
          <span style="color:var(--text-muted); font-size:0.8rem; margin-left:4px;">(Trang ${currentPage}/${totalPages})</span>
        </div>
        <div class="pagination-controls">
          <button class="page-btn prev-btn" 
                  type="button" 
                  onclick="${onPageChangeFnName}(${currentPage - 1})" 
                  ${currentPage <= 1 ? "disabled" : ""} 
                  aria-label="Trang trước">
            <i class="fa-solid fa-chevron-left"></i> Trước
          </button>
          <div class="page-numbers">
            ${numbersHtml}
          </div>
          <button class="page-btn next-btn" 
                  type="button" 
                  onclick="${onPageChangeFnName}(${currentPage + 1})" 
                  ${currentPage >= totalPages ? "disabled" : ""} 
                  aria-label="Trang tiếp theo">
            Sau <i class="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      </nav>
    `;
  },

  /**
   * Render Thư Viện Bản Dịch
   * - Hoàn Thành & Đang Dịch mỗi phân khu có bộ đếm và nút điều hướng phân trang RIÊNG BIỆT
   * - Mỗi phân khu chỉ hiển thị tối đa đúng 9 thẻ / trang
   */
  renderCatalog() {
    const container = document.getElementById("catalog-sections-wrap") || document.getElementById("games-grid");
    const countEl = document.getElementById("catalog-count");
    if (!container) return;

    const filtered = this.getFilteredGames();
    const totalItems = filtered.length;

    if (countEl) countEl.textContent = `${totalItems} trên tổng ${this.games.length} game`;

    if (!totalItems) {
      container.innerHTML = `
        <div class="catalog-empty" style="text-align:center; padding:60px 20px; background:var(--bg-card); border:2px solid var(--border-strong); border-radius:var(--radius-md); box-shadow:4px 4px 0px var(--border-strong);">
          <i class="fa-solid fa-box-open" style="font-size:2.8rem; color:var(--text-muted); margin-bottom:12px;"></i>
          <h3 style="font-size:1.25rem; font-weight:800; color:var(--text-primary); margin-bottom:6px;">Không tìm thấy bản Việt hóa nào phù hợp</h3>
          <p style="color:var(--text-secondary); font-size:0.9rem;">Thử tìm kiếm với từ khóa khác hoặc chọn xem Tất Cả Game.</p>
        </div>
      `;
      return;
    }

    const savedSet = (window.Library && Library.getSavedSet()) || new Set();

    // 1. Nếu người dùng chọn tab Cộng Đồng
    if (this.filters.filter === "community") {
      const totalPages = Math.ceil(totalItems / this.itemsPerPage) || 1;
      if (this.currentPage > totalPages) this.currentPage = totalPages;
      if (this.currentPage < 1) this.currentPage = 1;

      const paged = filtered.slice((this.currentPage - 1) * this.itemsPerPage, this.currentPage * this.itemsPerPage);
      const paginationHtml = this.renderPagination(totalItems, this.currentPage, "Catalog.setPage", "bản dịch cộng đồng");

      container.innerHTML = `
        <section class="catalog-group-section" id="section-community-games">
          <div class="catalog-group-head">
            <div class="catalog-group-title">
              <span class="group-badge ready" style="background:#7C3AED"><i class="fa-solid fa-users"></i> CỘNG ĐỒNG</span>
              <h3>Bản Dịch Do Cộng Đồng & Nhóm Dịch Đóng Góp</h3>
            </div>
            <div class="catalog-group-controls">
              <span class="catalog-group-count">${totalItems} bản dịch • Trang ${this.currentPage}/${totalPages}</span>
              ${totalPages > 1 ? `
                <div class="mini-page-nav">
                  <button class="mini-page-btn" onclick="Catalog.setPage(${this.currentPage - 1})" ${this.currentPage <= 1 ? "disabled" : ""} title="Trang trước">
                    <i class="fa-solid fa-chevron-left"></i>
                  </button>
                  <span class="mini-page-indicator">${this.currentPage}/${totalPages}</span>
                  <button class="mini-page-btn" onclick="Catalog.setPage(${this.currentPage + 1})" ${this.currentPage >= totalPages ? "disabled" : ""} title="Trang sau">
                    <i class="fa-solid fa-chevron-right"></i>
                  </button>
                </div>
              ` : ""}
            </div>
          </div>
          <div class="games-grid grid-community">
            ${paged.map(g => this.renderGameCard(g, savedSet)).join("")}
          </div>
          ${paginationHtml}
        </section>
      `;
      return;
    }

    // 2. Nếu người dùng chọn tab Nổi bật (Featured)
    if (this.filters.filter === "featured") {
      const totalPages = Math.ceil(totalItems / this.itemsPerPage) || 1;
      if (this.currentPage > totalPages) this.currentPage = totalPages;
      if (this.currentPage < 1) this.currentPage = 1;

      const paged = filtered.slice((this.currentPage - 1) * this.itemsPerPage, this.currentPage * this.itemsPerPage);
      const paginationHtml = this.renderPagination(totalItems, this.currentPage, "Catalog.setPage", "bản dịch nổi bật");

      container.innerHTML = `
        <section class="catalog-group-section" id="section-featured-games">
          <div class="catalog-group-head">
            <div class="catalog-group-title">
              <span class="group-badge ready" style="background:var(--accent-orange)"><i class="fa-solid fa-star"></i> SPOTLIGHT</span>
              <h3>Bản Dịch Mới Cập Nhật Nổi Bật</h3>
            </div>
            <div class="catalog-group-controls">
              <span class="catalog-group-count">${totalItems} bản dịch • Trang ${this.currentPage}/${totalPages}</span>
              ${totalPages > 1 ? `
                <div class="mini-page-nav">
                  <button class="mini-page-btn" onclick="Catalog.setPage(${this.currentPage - 1})" ${this.currentPage <= 1 ? "disabled" : ""} title="Trang trước">
                    <i class="fa-solid fa-chevron-left"></i>
                  </button>
                  <span class="mini-page-indicator">${this.currentPage}/${totalPages}</span>
                  <button class="mini-page-btn" onclick="Catalog.setPage(${this.currentPage + 1})" ${this.currentPage >= totalPages ? "disabled" : ""} title="Trang sau">
                    <i class="fa-solid fa-chevron-right"></i>
                  </button>
                </div>
              ` : ""}
            </div>
          </div>
          <div class="games-grid grid-featured">
            ${paged.map(g => this.renderGameCard(g, savedSet)).join("")}
          </div>
          ${paginationHtml}
        </section>
      `;
      return;
    }

    // 3. Cho chế độ "Tất Cả", "Tải Ngay" (ready) hoặc "Đang Dịch" (wip)
    // Hoàn Thành và Đang Dịch có phân trang 9 thẻ và cụm điều hướng HOÀN TOÀN ĐỘC LẬP
    const readyGames = filtered.filter(g => g.status === "ready");
    const wipGames = filtered.filter(g => g.status !== "ready");

    let html = "";

    // Phân khu 1: Bản Dịch Đã Hoàn Thành (có điều hướng riêng)
    if (readyGames.length > 0 && this.filters.filter !== "wip") {
      const readyTotalPages = Math.ceil(readyGames.length / this.itemsPerPage) || 1;
      if (this.currentReadyPage > readyTotalPages) this.currentReadyPage = readyTotalPages;
      if (this.currentReadyPage < 1) this.currentReadyPage = 1;

      const pagedReady = readyGames.slice(
        (this.currentReadyPage - 1) * this.itemsPerPage,
        this.currentReadyPage * this.itemsPerPage
      );
      const readyPagination = this.renderPagination(
        readyGames.length,
        this.currentReadyPage,
        "Catalog.setReadyPage",
        "bản dịch hoàn thành"
      );

      html += `
        <section class="catalog-group-section" id="section-ready-games">
          <div class="catalog-group-head">
            <div class="catalog-group-title">
              <span class="group-badge ready"><i class="fa-solid fa-circle-check"></i> HOÀN THÀNH</span>
              <h3>Bản Dịch Đã Hoàn Thành (Sẵn Sàng Tải Về)</h3>
            </div>
            <div class="catalog-group-controls">
              <span class="catalog-group-count">${readyGames.length} bản dịch • Trang ${this.currentReadyPage}/${readyTotalPages}</span>
              ${readyTotalPages > 1 ? `
                <div class="mini-page-nav">
                  <button class="mini-page-btn" onclick="Catalog.setReadyPage(${this.currentReadyPage - 1})" ${this.currentReadyPage <= 1 ? "disabled" : ""} title="Trang trước">
                    <i class="fa-solid fa-chevron-left"></i>
                  </button>
                  <span class="mini-page-indicator">${this.currentReadyPage}/${readyTotalPages}</span>
                  <button class="mini-page-btn" onclick="Catalog.setReadyPage(${this.currentReadyPage + 1})" ${this.currentReadyPage >= readyTotalPages ? "disabled" : ""} title="Trang sau">
                    <i class="fa-solid fa-chevron-right"></i>
                  </button>
                </div>
              ` : ""}
            </div>
          </div>
          <div class="games-grid grid-ready">
            ${pagedReady.map(g => this.renderGameCard(g, savedSet)).join("")}
          </div>
          ${readyPagination}
        </section>
      `;
    }

    // Phân khu 2: Dự Án Đang Dịch (có điều hướng riêng)
    if (wipGames.length > 0 && this.filters.filter !== "ready") {
      const wipTotalPages = Math.ceil(wipGames.length / this.itemsPerPage) || 1;
      if (this.currentWipPage > wipTotalPages) this.currentWipPage = wipTotalPages;
      if (this.currentWipPage < 1) this.currentWipPage = 1;

      const pagedWip = wipGames.slice(
        (this.currentWipPage - 1) * this.itemsPerPage,
        this.currentWipPage * this.itemsPerPage
      );
      const wipPagination = this.renderPagination(
        wipGames.length,
        this.currentWipPage,
        "Catalog.setWipPage",
        "dự án đang dịch"
      );

      html += `
        <section class="catalog-group-section" id="section-wip-games">
          <div class="catalog-group-head">
            <div class="catalog-group-title">
              <span class="group-badge wip"><i class="fa-solid fa-clock-rotate-left"></i> ĐANG THỰC HIỆN</span>
              <h3>Dự Án Đang Dịch (Tiến Độ Trong Xưởng)</h3>
            </div>
            <div class="catalog-group-controls">
              <span class="catalog-group-count">${wipGames.length} dự án • Trang ${this.currentWipPage}/${wipTotalPages}</span>
              ${wipTotalPages > 1 ? `
                <div class="mini-page-nav">
                  <button class="mini-page-btn" onclick="Catalog.setWipPage(${this.currentWipPage - 1})" ${this.currentWipPage <= 1 ? "disabled" : ""} title="Trang trước">
                    <i class="fa-solid fa-chevron-left"></i>
                  </button>
                  <span class="mini-page-indicator">${this.currentWipPage}/${wipTotalPages}</span>
                  <button class="mini-page-btn" onclick="Catalog.setWipPage(${this.currentWipPage + 1})" ${this.currentWipPage >= wipTotalPages ? "disabled" : ""} title="Trang sau">
                    <i class="fa-solid fa-chevron-right"></i>
                  </button>
                </div>
              ` : ""}
            </div>
          </div>
          <div class="games-grid grid-wip">
            ${pagedWip.map(g => this.renderGameCard(g, savedSet)).join("")}
          </div>
          ${wipPagination}
        </section>
      `;
    }

    container.innerHTML = html;
  },

  bindEvents() {
    // Tìm kiếm (reset tất cả phân trang về trang 1 khi gõ tìm kiếm)
    const searchInput = document.getElementById("catalog-search");
    if (searchInput) {
      searchInput.oninput = (e) => {
        this.currentPage = 1;
        this.currentReadyPage = 1;
        this.currentWipPage = 1;
        this.filters.query = e.target.value;
        this.renderCatalog();
      };
    }

    // Filter pill buttons (Tất cả, Tải ngay, Đang dịch, Nổi bật)
    const filterPills = document.querySelectorAll(".filter-pill");
    filterPills.forEach(pill => {
      pill.onclick = () => {
        this.currentPage = 1;
        this.currentReadyPage = 1;
        this.currentWipPage = 1;
        filterPills.forEach(p => p.classList.remove("active"));
        pill.classList.add("active");
        this.filters.filter = pill.dataset.filter || "all";
        this.renderCatalog();
      };
    });

    // Select sort (reset về trang 1 khi đổi sắp xếp)
    const sortSelect = document.getElementById("filter-sort");
    if (sortSelect) {
      sortSelect.onchange = (e) => {
        this.currentPage = 1;
        this.currentReadyPage = 1;
        this.currentWipPage = 1;
        this.filters.sort = e.target.value;
        this.renderCatalog();
      };
    }

    // Nút đặt lại bộ lọc
    const resetBtn = document.getElementById("btn-reset-filters");
    if (resetBtn) {
      resetBtn.onclick = () => {
        this.currentPage = 1;
        this.currentReadyPage = 1;
        this.currentWipPage = 1;
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
