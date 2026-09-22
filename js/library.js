/* ==========================================================================
   TẠP HÓA VIỆT / BỘ SƯU TẬP CÁ NHÂN (library.js)
   Lưu trữ các game quan tâm / đã tải vào localStorage
   ========================================================================== */

const Library = {
  savedIds: new Set(),
  games: [],

  init(gamesData) {
    this.games = gamesData || [];
    try {
      const saved = JSON.parse(localStorage.getItem("thv_saved_games") || "[]");
      this.savedIds = new Set(saved);
    } catch (e) {
      this.savedIds = new Set();
    }
    this.updateBadges();
  },

  getSavedSet() {
    return this.savedIds;
  },

  toggle(id) {
    const game = this.games.find(g => g.id === id);
    if (!game) return;

    if (this.savedIds.has(id)) {
      this.savedIds.delete(id);
      App.showToast(`Đã bỏ ${game.title} khỏi bộ sưu tập`);
    } else {
      this.savedIds.add(id);
      App.showToast(`Đã lưu ${game.title} vào bộ sưu tập!`);
    }

    try {
      localStorage.setItem("thv_saved_games", JSON.stringify(Array.from(this.savedIds)));
    } catch (e) {}

    this.updateBadges();
    Catalog.renderCatalog();
    this.render();
  },

  updateBadges() {
    const count = this.savedIds.size;
    const badges = document.querySelectorAll(".library-badge-count");
    badges.forEach(b => b.textContent = count);
  },

  render() {
    const container = document.getElementById("library-grid-container");
    const countEl = document.getElementById("library-total-count");
    if (!container) return;

    const savedGames = this.games.filter(g => this.savedIds.has(g.id));
    if (countEl) countEl.textContent = savedGames.length;

    if (!savedGames.length) {
      container.innerHTML = `
        <div class="catalog-empty" style="grid-column: 1 / -1;">
          <i class="fa-regular fa-bookmark"></i>
          <h3>Bộ sưu tập của bạn đang trống</h3>
          <p>Bấm vào biểu tượng bookmark trên góc các thẻ game để lưu lại và theo dõi tiến độ cập nhật.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = savedGames.map(g => {
      let engineIcon = "fa-gamepad";
      if (g.engine_category === "ue") engineIcon = "fa-cubes";
      else if (g.engine_category === "unity") engineIcon = "fa-cube";
      else if (g.engine_category === "gamemaker") engineIcon = "fa-gear";

      const coverSrc = g.cover_image || `assets/covers/${g.id}.jpg`;

      return `
        <article class="game-card" onclick="App.openDetail('${g.id}')">
          <div class="card-poster-wrap" style="background-color: ${g.cover_color || '#111822'}">
            <img class="card-poster-img" src="${coverSrc}" alt="${g.title}" loading="lazy"
                 onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
            <div class="card-poster-art" style="display:none;">
              <i class="fa-solid ${engineIcon} card-poster-icon" style="color: rgba(255,255,255,0.7)"></i>
              <h3 class="card-poster-title">${g.title}</h3>
            </div>
            <span class="card-status-badge ${g.status === "ready" ? "ready" : "progress"}">
              ${g.status === "ready" ? "Hoàn tất 100%" : `Đang dịch ${g.progress.overall}%`}
            </span>
            <button class="card-bookmark-btn active" title="Bỏ lưu" onclick="event.stopPropagation(); Library.toggle('${g.id}')">
              <i class="fa-solid fa-bookmark"></i>
            </button>
            <div class="card-shade"></div>
          </div>
          <div class="card-body">
            <div class="card-meta-tags">
              <span class="engine-tag">${g.engine}</span>
              <span class="size-tag">${g.size}</span>
            </div>
            <h4 class="card-title">${g.title}</h4>
            <div class="card-version-info">Hỗ trợ: ${g.game_version}</div>
          </div>
        </article>
      `;
    }).join("");
  }
};

window.Library = Library;
