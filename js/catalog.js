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
  sliderInterval: null,

  init(gamesData) {
    this.games = gamesData || [];
    this.renderStats();
    this.renderHeroSlider();
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
   * Hiển thị Hero Slider trình chiếu các game nổi bật (featured)
   */
  renderHeroSlider() {
    const featured = this.games.filter(g => g.featured);
    const container = document.getElementById("hero-slider-container");
    if (!container || !featured.length) return;

    container.innerHTML = featured.map((g, idx) => `
      <div class="hero-slide ${idx === 0 ? "active" : ""}" data-slide="${idx}" style="background-color: ${g.cover_color || "#131A24"}">
        <div class="hero-slide-overlay"></div>
        <div class="hero-slide-content">
          <span class="hero-tagline"><i class="fa-solid fa-star"></i> BẢN DỊCH NỔI BẬT</span>
          <h1 class="hero-title">${g.title}</h1>
          <div class="hero-meta">
            <span><i class="fa-solid fa-microchip"></i> ${g.engine}</span>
            <span><i class="fa-solid fa-code-branch"></i> ${g.patch_version}</span>
            <span><i class="fa-solid fa-weight-hanging"></i> ${g.size}</span>
            <span><i class="fa-solid fa-circle-check"></i> ${g.status === "ready" ? "Hoàn thành 100%" : "Đang thực hiện"}</span>
          </div>
          <p class="hero-desc">${g.summary}</p>
          <div class="hero-actions">
            <button class="btn-primary" onclick="App.openDetail('${g.id}')">
              <i class="fa-solid fa-download"></i> TẢI BẢN VÁ
            </button>
            <button class="btn-secondary" onclick="App.openDetail('${g.id}')">
              <i class="fa-solid fa-circle-info"></i> Xem Chi Tiết
            </button>
          </div>
        </div>
      </div>
    `).join("");

    this.startSliderAutoPlay(featured.length);
  },

  startSliderAutoPlay(totalSlides) {
    if (this.sliderInterval) clearInterval(this.sliderInterval);
    if (totalSlides <= 1) return;

    const showSlide = (n) => {
      const slides = document.querySelectorAll(".hero-slide");
      slides.forEach(s => s.classList.remove("active"));
      this.currentSlide = (n + totalSlides) % totalSlides;
      const target = document.querySelector(`.hero-slide[data-slide="${this.currentSlide}"]`);
      if (target) target.classList.add("active");
    };

    const nextBtn = document.getElementById("hero-next");
    const prevBtn = document.getElementById("hero-prev");

    if (nextBtn) nextBtn.onclick = () => showSlide(this.currentSlide + 1);
    if (prevBtn) prevBtn.onclick = () => showSlide(this.currentSlide - 1);

    this.sliderInterval = setInterval(() => {
      showSlide(this.currentSlide + 1);
    }, 6500);
  },

  /**
   * Lọc và sắp xếp danh sách game
   */
  getFilteredGames() {
    const q = this.removeAccents(this.filters.query.trim());

    let result = this.games.filter(g => {
      // Lọc theo search
      if (q) {
        const textToSearch = this.removeAccents(`${g.title} ${g.original_title} ${g.developer} ${g.engine} ${g.summary}`);
        if (!textToSearch.includes(q)) return false;
      }
      // Lọc theo engine
      if (this.filters.engine !== "all") {
        if (g.engine_category !== this.filters.engine) return false;
      }
      // Lọc theo status
      if (this.filters.status !== "all") {
        if (g.status !== this.filters.status) return false;
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
   * Render Lưới Card Game
   */
  renderCatalog() {
    const container = document.getElementById("games-grid");
    const countEl = document.getElementById("catalog-count");
    if (!container) return;

    const filtered = this.getFilteredGames();
    if (countEl) countEl.textContent = `${filtered.length} trên tổng ${this.games.length} game`;

    if (!filtered.length) {
      container.innerHTML = `
        <div class="catalog-empty">
          <i class="fa-solid fa-box-open"></i>
          <h3>Không tìm thấy bản Việt hóa nào phù hợp</h3>
          <p>Thử tìm kiếm với từ khóa khác hoặc bỏ bớt bộ lọc Engine / Trạng thái.</p>
        </div>
      `;
      return;
    }

    const savedSet = Library.getSavedSet();

    container.innerHTML = filtered.map(g => {
      const isSaved = savedSet.has(g.id);
      const isReady = g.status === "ready";
      const statusClass = isReady ? "ready" : "progress";
      const statusText = isReady ? "Hoàn tất 100%" : `Đang dịch ${g.progress.overall}%`;
      const fillClass = isReady ? "" : "wip";

      // Icon minh họa cho thẻ game
      let engineIcon = "fa-gamepad";
      if (g.engine_category === "ue") engineIcon = "fa-cubes";
      else if (g.engine_category === "unity") engineIcon = "fa-cube";
      else if (g.engine_category === "gamemaker") engineIcon = "fa-gear";

      return `
        <article class="game-card" onclick="App.openDetail('${g.id}')">
          <div class="card-poster-wrap" style="background-color: ${g.cover_color || '#111822'}">
            <span class="card-status-badge ${statusClass}">${statusText}</span>
            <button class="card-bookmark-btn ${isSaved ? "active" : ""}" 
                    title="${isSaved ? "Bỏ lưu" : "Lưu vào bộ sưu tập"}" 
                    onclick="event.stopPropagation(); Library.toggle('${g.id}')">
              <i class="${isSaved ? "fa-solid" : "fa-regular"} fa-bookmark"></i>
            </button>
            <div class="card-poster-art">
              <i class="fa-solid ${engineIcon} card-poster-icon" style="color: rgba(255,255,255,0.7)"></i>
              <h3 class="card-poster-title">${g.title}</h3>
            </div>
            <div class="card-shade"></div>
          </div>
          <div class="card-body">
            <div class="card-meta-tags">
              <span class="engine-tag">${g.engine}</span>
              <span class="size-tag">${g.size}</span>
            </div>
            <h4 class="card-title" title="${g.title}">${g.title}</h4>
            <div class="card-version-info">Hỗ trợ: ${g.game_version}</div>
            <div class="card-progress-wrap">
              <div class="card-progress-bar">
                <div class="card-progress-fill ${fillClass}" style="width: ${g.progress.overall}%"></div>
              </div>
              <span class="card-progress-percent">${g.progress.overall}%</span>
            </div>
          </div>
        </article>
      `;
    }).join("");
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

    // Filter engine buttons
    const engineBtns = document.querySelectorAll(".engine-btn");
    engineBtns.forEach(btn => {
      btn.onclick = () => {
        engineBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        this.filters.engine = btn.dataset.engine;
        this.renderCatalog();
      };
    });

    // Select status
    const statusSelect = document.getElementById("filter-status");
    if (statusSelect) {
      statusSelect.onchange = (e) => {
        this.filters.status = e.target.value;
        this.renderCatalog();
      };
    }

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
        this.filters = { query: "", engine: "all", status: "all", sort: "newest" };
        if (searchInput) searchInput.value = "";
        if (statusSelect) statusSelect.value = "all";
        if (sortSelect) sortSelect.value = "newest";
        engineBtns.forEach(b => b.classList.remove("active"));
        const defaultEngine = document.querySelector('.engine-btn[data-engine="all"]');
        if (defaultEngine) defaultEngine.classList.add("active");
        this.renderCatalog();
      };
    }
  }
};

window.Catalog = Catalog;
