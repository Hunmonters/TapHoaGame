/* ==========================================================================
   TẠP HÓA VIỆT / STUDIO DASHBOARD ADMIN LOGIC (admin.js)
   Bảng điều khiển quản trị nội bộ: Thêm/Sửa game, Upload ảnh bìa, Quản lý Cloud
   ========================================================================== */

const AdminStudio = {
  isAuthenticated: false,
  games: [],
  selectedCoverFile: null,
  selectedCoverBase64: null,

  init(gamesData) {
    this.games = gamesData || [];
    this.bindEvents();
    this.checkHash();
    window.addEventListener("hashchange", () => this.checkHash());
  },

  checkHash() {
    if (window.location.hash === "#admin") {
      this.open();
    }
  },

  open() {
    const modal = document.getElementById("admin-studio-modal");
    if (!modal) return;
    modal.classList.add("active");
    document.body.style.overflow = "hidden";

    if (this.isAuthenticated) {
      document.getElementById("admin-login-view").style.display = "none";
      document.getElementById("admin-dashboard-view").style.display = "block";
      this.renderGamesTable();
      this.renderReportsTable();
    } else {
      document.getElementById("admin-login-view").style.display = "block";
      document.getElementById("admin-dashboard-view").style.display = "none";
      const pinInput = document.getElementById("admin-pin-field");
      const pinStatus = document.getElementById("admin-pin-status");
      if (pinInput) {
        pinInput.value = "";
        pinInput.type = "password";
        const eyeIcon = document.getElementById("icon-pin-eye");
        if (eyeIcon) eyeIcon.className = "fa-regular fa-eye";
        pinInput.focus();
      }
      if (pinStatus) {
        pinStatus.textContent = "Chưa nhập mã PIN";
        pinStatus.style.color = "var(--text-muted)";
      }
    }
  },

  togglePinVisibility() {
    const pinInput = document.getElementById("admin-pin-field");
    const eyeIcon = document.getElementById("icon-pin-eye");
    if (!pinInput) return;

    if (pinInput.type === "password") {
      pinInput.type = "text";
      if (eyeIcon) eyeIcon.className = "fa-regular fa-eye-slash";
    } else {
      pinInput.type = "password";
      if (eyeIcon) eyeIcon.className = "fa-regular fa-eye";
    }
  },

  close() {
    const modal = document.getElementById("admin-studio-modal");
    if (!modal) return;
    modal.classList.remove("active");
    document.body.style.overflow = "";
    if (window.location.hash === "#admin") {
      history.pushState(null, "", window.location.pathname);
    }
  },

  login(pin) {
    const correctPin = (window.CONFIG && CONFIG.adminPin) || "viethoagame2026";
    if (pin.trim() === correctPin) {
      this.isAuthenticated = true;
      document.getElementById("admin-login-view").style.display = "none";
      document.getElementById("admin-dashboard-view").style.display = "block";
      this.renderGamesTable();
      this.renderReportsTable();
      App.showToast("Đăng nhập Studio Quản Trị thành công!");
    } else {
      App.showToast("Mã PIN quản trị không chính xác.");
    }
  },

  renderGamesTable() {
    const tbody = document.getElementById("admin-games-tbody");
    if (!tbody) return;

    tbody.innerHTML = this.games.map((g, idx) => {
      const coverSrc = g.cover_image || `assets/covers/${g.id}.jpg`;
      return `
      <tr>
        <td><b>${idx + 1}</b></td>
        <td>
          <div style="display:flex; align-items:center; gap:10px;">
            <img src="${coverSrc}" alt="" style="width:52px; height:24px; object-fit:cover; border-radius:4px; border:1px solid #121316;" onerror="this.style.display='none'">
            <div>
              <div style="display:flex; align-items:center; gap:6px;">
                <strong style="color:var(--text-primary); line-height:1.2;">${g.title}</strong>
                ${g.is_community ? `
                  <span style="font-size:0.68rem; background:#7C3AED; color:#FFF; padding:1px 6px; border-radius:4px; font-weight:800; white-space:nowrap;">
                    <i class="fa-solid fa-users"></i> ${g.author || "Cộng Đồng"}
                  </span>
                ` : ""}
              </div>
              <small style="color:var(--text-muted); font-size:0.75rem;">${g.original_title || g.id}</small>
            </div>
          </div>
        </td>
        <td style="text-align:center;">
          <button class="btn-admin-star ${g.featured ? "active" : ""}" 
                  type="button"
                  title="${g.featured ? "Đang ghim Spotlight (Bấm để gỡ)" : "Bấm để đưa lên Spotlight Nổi Bật"}" 
                  onclick="AdminStudio.toggleSpotlight('${g.id}')">
            <i class="${g.featured ? "fa-solid" : "fa-regular"} fa-star"></i>
          </button>
        </td>
        <td><span class="tag-size" style="font-size:0.75rem; padding:3px 8px;"><i class="fa-solid fa-bolt"></i> ${g.size || "Gọn nhẹ"}</span></td>
        <td><small style="font-family:var(--font-mono);">${g.game_version || "1.0"}</small></td>
        <td>
          <span class="card-status-badge ${g.status === "ready" ? "ready" : "progress"}" style="position:static; display:inline-block;">
            ${g.status === "ready" ? "Hoàn tất" : "Đang dịch"}
          </span>
        </td>
        <td><b>${g.progress ? g.progress.overall : 0}%</b></td>
        <td>
          <div style="display:flex; gap:6px; flex-wrap:wrap;">
            <button class="btn-admin-action" title="Chỉnh sửa toàn diện" onclick="AdminStudio.openEditGameModal('${g.id}')">
              <i class="fa-solid fa-pen-to-square"></i> Sửa
            </button>
            <button class="btn-admin-action" title="Cập nhật nhanh % tiến độ" onclick="AdminStudio.editGame('${g.id}')">
              <i class="fa-solid fa-sliders"></i> %
            </button>
            <button class="btn-admin-action" title="Xóa game" style="color:var(--accent-red); border-color:rgba(239,68,68,0.3);" onclick="AdminStudio.deleteGame('${g.id}')">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </td>
      </tr>
      `;
    }).join("");
  },

  renderReportsTable() {
    const tbody = document.getElementById("admin-reports-tbody");
    if (!tbody) return;

    let reports = [];
    try {
      reports = JSON.parse(localStorage.getItem("thv_bug_reports") || "[]");
    } catch (e) {
      reports = [];
    }

    if (!reports.length) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:24px; color:var(--text-muted);">Chưa có báo lỗi nào được gửi về.</td></tr>`;
      return;
    }

    tbody.innerHTML = reports.map((r, idx) => `
      <tr>
        <td>${idx + 1}</td>
        <td><b>${r.gameName}</b></td>
        <td><span style="color:var(--accent-red); font-weight:600;">${r.bugType}</span></td>
        <td>${r.desc}</td>
        <td><small style="color:var(--text-muted); font-family:var(--font-mono);">${new Date(r.timestamp).toLocaleString("vi-VN")}</small></td>
      </tr>
    `).join("");
  },

  /* ==========================================================================
     MODAL FORM THÊM & SỬA GAME (EDITOR)
     ========================================================================== */
  openAddGameModal() {
    const modal = document.getElementById("admin-game-form-modal");
    if (!modal) return;

    document.getElementById("admin-editor-heading").textContent = "Thêm Bản Việt Hóa Game Mới";
    document.getElementById("edit-game-is-new").value = "true";
    
    // Reset form inputs
    document.getElementById("edit-game-title").value = "";
    const idInput = document.getElementById("edit-game-id");
    idInput.value = "";
    idInput.readOnly = false;

    document.getElementById("edit-game-original").value = "";
    const engInput = document.getElementById("edit-game-engine");
    if (engInput) engInput.value = "";
    const engCatInput = document.getElementById("edit-game-engine-cat");
    if (engCatInput) engCatInput.value = "ue";
    document.getElementById("edit-game-status").value = "ready";
    document.getElementById("edit-game-ver").value = "1.0";
    document.getElementById("edit-game-patch-ver").value = "v1.0.0";
    document.getElementById("edit-game-size").value = "";
    document.getElementById("edit-game-sha256").value = "";

    document.getElementById("edit-prog-trans").value = "100";
    document.getElementById("edit-prog-proof").value = "100";
    document.getElementById("edit-prog-font").value = "100";
    document.getElementById("edit-prog-qa").value = "100";

    document.getElementById("edit-game-summary").value = "";
    document.getElementById("edit-game-desc").value = "";
    document.getElementById("edit-game-dl-url").value = "";
    document.getElementById("edit-game-cover-url").value = "";

    const featBox = document.getElementById("edit-game-featured");
    if (featBox) featBox.checked = true;

    // Reset preview
    this.selectedCoverFile = null;
    this.selectedCoverBase64 = null;
    const imgEl = document.getElementById("editor-cover-img");
    const emptyPrompt = document.getElementById("editor-cover-empty-prompt");
    if (imgEl) imgEl.style.display = "none";
    if (emptyPrompt) emptyPrompt.style.display = "flex";

    modal.classList.add("active");
  },

  openEditGameModal(gameId) {
    const game = this.games.find(g => g.id === gameId);
    if (!game) return;

    const modal = document.getElementById("admin-game-form-modal");
    if (!modal) return;

    document.getElementById("admin-editor-heading").textContent = `Chỉnh Sửa Bản Dịch: ${game.title}`;
    document.getElementById("edit-game-is-new").value = "false";

    document.getElementById("edit-game-title").value = game.title || "";
    const idInput = document.getElementById("edit-game-id");
    idInput.value = game.id;
    idInput.readOnly = true;

    document.getElementById("edit-game-original").value = game.original_title || "";
    const engEditInput = document.getElementById("edit-game-engine");
    if (engEditInput) engEditInput.value = game.engine || "";
    const engCatEditInput = document.getElementById("edit-game-engine-cat");
    if (engCatEditInput) engCatEditInput.value = game.engine_category || "other";
    document.getElementById("edit-game-status").value = game.status || "ready";
    document.getElementById("edit-game-ver").value = game.game_version || "";
    document.getElementById("edit-game-patch-ver").value = game.patch_version || "";
    document.getElementById("edit-game-size").value = game.size || "";
    document.getElementById("edit-game-sha256").value = game.sha256 || "";

    const p = game.progress || {};
    document.getElementById("edit-prog-trans").value = p.translation !== undefined ? p.translation : 100;
    document.getElementById("edit-prog-proof").value = p.proofread !== undefined ? p.proofread : 100;
    document.getElementById("edit-prog-font").value = p.font !== undefined ? p.font : 100;
    document.getElementById("edit-prog-qa").value = p.qa !== undefined ? p.qa : 100;

    document.getElementById("edit-game-summary").value = game.summary || "";
    document.getElementById("edit-game-desc").value = game.description || "";
    
    const dl = (game.download_links && game.download_links[0]) ? game.download_links[0].url : "";
    document.getElementById("edit-game-dl-url").value = dl;

    const featBoxEdit = document.getElementById("edit-game-featured");
    if (featBoxEdit) featBoxEdit.checked = !!game.featured;

    const cover = game.cover_image || `assets/covers/${game.id}.jpg`;
    document.getElementById("edit-game-cover-url").value = game.cover_image || "";

    // Set preview
    this.selectedCoverFile = null;
    this.selectedCoverBase64 = null;
    const imgEl = document.getElementById("editor-cover-img");
    const emptyPrompt = document.getElementById("editor-cover-empty-prompt");
    if (cover) {
      if (imgEl) {
        imgEl.src = cover;
        imgEl.style.display = "block";
      }
      if (emptyPrompt) emptyPrompt.style.display = "none";
    }

    modal.classList.add("active");
  },

  closeGameModal() {
    const modal = document.getElementById("admin-game-form-modal");
    if (modal) modal.classList.remove("active");
  },

  handleCoverFile(file) {
    if (!file) return;
    this.selectedCoverFile = file;

    const reader = new FileReader();
    reader.onload = (e) => {
      this.selectedCoverBase64 = e.target.result;
      const imgEl = document.getElementById("editor-cover-img");
      const emptyPrompt = document.getElementById("editor-cover-empty-prompt");
      if (imgEl) {
        imgEl.src = this.selectedCoverBase64;
        imgEl.style.display = "block";
      }
      if (emptyPrompt) emptyPrompt.style.display = "none";
    };
    reader.readAsDataURL(file);
  },

  async saveGame(e) {
    if (e) e.preventDefault();

    const isNew = document.getElementById("edit-game-is-new").value === "true";
    const id = document.getElementById("edit-game-id").value.trim().toLowerCase().replace(/[^a-z0-9-_]/g, "-");
    const title = document.getElementById("edit-game-title").value.trim();

    if (!id || !title) {
      App.showToast("Vui lòng điền Tên game và Mã ID định danh!");
      return;
    }

    const trans = parseInt(document.getElementById("edit-prog-trans").value, 10) || 0;
    const proof = parseInt(document.getElementById("edit-prog-proof").value, 10) || 0;
    const font = parseInt(document.getElementById("edit-prog-font").value, 10) || 0;
    const qa = parseInt(document.getElementById("edit-prog-qa").value, 10) || 0;
    const overall = Math.round((trans + proof + font + qa) / 4);

    const status = document.getElementById("edit-game-status").value;
    const dlUrl = document.getElementById("edit-game-dl-url").value.trim();
    const coverUrlInput = document.getElementById("edit-game-cover-url").value.trim();

    // Xác định ảnh bìa (Cover Image)
    let coverImage = coverUrlInput || `assets/covers/${id}.jpg`;

    // Nếu có file ảnh được chọn và Supabase Cloud đang bật -> upload lên Cloud Storage
    if (this.selectedCoverFile && window.SupabaseClient && SupabaseClient.hasCloud()) {
      try {
        App.showToast("Đang tải ảnh lên Supabase Cloud Storage...");
        const cloudUrl = await SupabaseClient.uploadCover(this.selectedCoverFile, id);
        if (cloudUrl) coverImage = cloudUrl;
      } catch (err) {
        console.warn("[Admin] Lỗi upload ảnh lên Cloud, sử dụng base64/cục bộ:", err);
        if (this.selectedCoverBase64) coverImage = this.selectedCoverBase64;
      }
    } else if (this.selectedCoverBase64) {
      coverImage = this.selectedCoverBase64;
    }

    // Tạo object game hoàn chỉnh
    let existingGame = this.games.find(g => g.id === id);
    let gameObj = existingGame ? { ...existingGame } : {
      id: id,
      featured: false,
      downloads_count: 0,
      release_date: new Date().toISOString().split("T")[0],
      platforms: ["PC Windows"],
      install_guide: ["Giải nén và chép đè vào thư mục cài game."],
      rollback_guide: ["Xóa các file patch đã chép."],
      files_affected: [],
      changelog: ["Bản dịch phát hành qua VietHoaGame Studio Dashboard"],
      credits: [{ name: "VietHoaGame Team", role: "Biên dịch & Kỹ thuật" }]
    };

    gameObj.title = title;
    gameObj.original_title = document.getElementById("edit-game-original").value.trim() || title;
    const engInput = document.getElementById("edit-game-engine");
    gameObj.engine = (engInput && engInput.value.trim()) || gameObj.engine || "PC";
    const engCatInput = document.getElementById("edit-game-engine-cat");
    gameObj.engine_category = (engCatInput && engCatInput.value) || gameObj.engine_category || "other";
    gameObj.game_version = document.getElementById("edit-game-ver").value.trim() || "1.0";
    gameObj.patch_version = document.getElementById("edit-game-patch-ver").value.trim() || "v1.0.0";
    gameObj.size = document.getElementById("edit-game-size").value.trim() || "Đang tính";
    gameObj.sha256 = document.getElementById("edit-game-sha256").value.trim() || "Chưa tạo";
    gameObj.status = status;
    gameObj.badge = status === "ready" ? "HOÀN TẤT 100%" : `TIẾN ĐỘ ${overall}%`;
    gameObj.cover_color = gameObj.cover_color || "#182230";
    gameObj.cover_image = coverImage;
    gameObj.summary = document.getElementById("edit-game-summary").value.trim();
    gameObj.description = document.getElementById("edit-game-desc").value.trim();
    const featBox = document.getElementById("edit-game-featured");
    gameObj.featured = featBox ? featBox.checked : false;

    gameObj.progress = {
      overall: overall,
      translation: trans,
      proofread: proof,
      font: font,
      qa: qa
    };

    if (dlUrl) {
      gameObj.download_links = [
        { server: "Google Drive", url: dlUrl, badge: "Tốc độ cao" }
      ];
    }

    // Lưu vào Supabase Cloud nếu khả dụng
    if (window.SupabaseClient && SupabaseClient.hasCloud()) {
      try {
        await SupabaseClient.upsertGame(gameObj);
        App.showToast("Đã đồng bộ game thành công lên Supabase Cloud!");
      } catch (err) {
        console.error("Lỗi lưu lên Supabase:", err);
      }
    }

    // Cập nhật danh sách cục bộ
    if (isNew) {
      this.games.unshift(gameObj);
    } else {
      const idx = this.games.findIndex(g => g.id === id);
      if (idx !== -1) {
        this.games[idx] = gameObj;
      } else {
        this.games.unshift(gameObj);
      }
    }

    // Lưu vào localStorage để duy trì kể cả khi offline
    try {
      localStorage.setItem("thv_custom_games", JSON.stringify(this.games));
    } catch (e) {}

    // Đồng bộ lại UI toàn bộ trang web
    App.games = this.games;
    this.renderGamesTable();
    if (window.Catalog) Catalog.init(this.games);
    if (window.Progress) Progress.init(this.games);
    if (window.Community) Community.init(this.games);
    if (window.Library) Library.init(this.games);

    this.closeGameModal();
    App.showToast(`Đã lưu bản dịch "${gameObj.title}" thành công!`);
  },

  async deleteGame(gameId) {
    const game = this.games.find(g => g.id === gameId);
    if (!game) return;

    if (!confirm(`Bạn có chắc chắn muốn xóa tựa game "${game.title}" khỏi danh sách?`)) {
      return;
    }

    if (window.SupabaseClient && SupabaseClient.hasCloud()) {
      try {
        await SupabaseClient.deleteGame(gameId);
      } catch (e) {
        console.error("Lỗi xóa từ Supabase:", e);
      }
    }

    this.games = this.games.filter(g => g.id !== gameId);
    App.games = this.games;

    try {
      localStorage.setItem("thv_custom_games", JSON.stringify(this.games));
    } catch (e) {}

    this.renderGamesTable();
    if (window.Catalog) Catalog.init(this.games);
    if (window.Progress) Progress.init(this.games);
    if (window.Community) Community.init(this.games);
    if (window.Library) Library.init(this.games);

    App.showToast(`Đã xóa "${game.title}" khỏi hệ thống.`);
  },

  async toggleSpotlight(gameId) {
    const game = this.games.find(g => g.id === gameId);
    if (!game) return;

    game.featured = !game.featured;

    // Lưu vào Supabase Cloud nếu khả dụng
    if (window.SupabaseClient && SupabaseClient.hasCloud()) {
      try {
        await SupabaseClient.upsertGame(game);
      } catch (err) {
        console.warn("[Admin] Lỗi cập nhật Spotlight lên Supabase:", err);
      }
    }

    try {
      localStorage.setItem("thv_custom_games", JSON.stringify(this.games));
    } catch (e) {}

    // Đồng bộ lại UI toàn bộ trang web
    App.games = this.games;
    this.renderGamesTable();
    if (window.Catalog) Catalog.init(this.games);

    if (game.featured) {
      App.showToast(`⭐ Đã đưa "${game.title}" lên Spotlight Mới Cập Nhật!`);
    } else {
      App.showToast(`Đã gỡ "${game.title}" khỏi Spotlight.`);
    }
  },

  editGame(gameId) {
    const game = this.games.find(g => g.id === gameId);
    if (!game) return;

    const newProgress = prompt(`Cập nhật % tiến độ tổng thể cho "${game.title}":`, game.progress ? game.progress.overall : 0);
    if (newProgress !== null && !isNaN(newProgress)) {
      const p = Math.min(100, Math.max(0, parseInt(newProgress, 10)));
      if (!game.progress) game.progress = {};
      game.progress.overall = p;
      if (p === 100) game.status = "ready";

      if (window.SupabaseClient && SupabaseClient.hasCloud()) {
        SupabaseClient.upsertGame(game);
      }

      try {
        localStorage.setItem("thv_custom_games", JSON.stringify(this.games));
      } catch (e) {}

      this.renderGamesTable();
      if (window.Catalog) Catalog.renderCatalog();
      if (window.Progress) Progress.render();
      App.showToast(`Đã cập nhật tiến độ ${game.title} thành ${p}%`);
    }
  },

  exportJson() {
    const jsonStr = JSON.stringify(this.games, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "games.json";
    a.click();
    URL.revokeObjectURL(url);
    App.showToast("Đã tải xuống file data/games.json mới!");
  },

  bindEvents() {
    // Phím tắt mở Admin: Ctrl + Shift + A
    document.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "a") {
        e.preventDefault();
        this.open();
      }
    });

    const closeBtn = document.getElementById("btn-close-admin");
    if (closeBtn) closeBtn.onclick = () => this.close();

    const loginForm = document.getElementById("form-admin-login");
    if (loginForm) {
      loginForm.onsubmit = (e) => {
        e.preventDefault();
        const pin = document.getElementById("admin-pin-field").value;
        this.login(pin);
      };
    }

    const pinField = document.getElementById("admin-pin-field");
    const pinStatus = document.getElementById("admin-pin-status");
    if (pinField) {
      pinField.oninput = (e) => {
        const len = e.target.value.length;
        if (pinStatus) {
          if (len === 0) {
            pinStatus.textContent = "Chưa nhập mã PIN";
            pinStatus.style.color = "var(--text-muted)";
          } else {
            pinStatus.textContent = `Đã nhập: ${len} ký tự`;
            pinStatus.style.color = "var(--accent-orange)";
          }
        }
      };
    }

    const exportBtn = document.getElementById("btn-admin-export-json");
    if (exportBtn) exportBtn.onclick = () => this.exportJson();

    // Nút Thêm Game Mới
    const addGameBtn = document.getElementById("btn-admin-add-game");
    if (addGameBtn) addGameBtn.onclick = () => this.openAddGameModal();

    // Nút Đóng Form Editor
    const closeEditorBtn = document.getElementById("btn-close-game-editor");
    if (closeEditorBtn) closeEditorBtn.onclick = () => this.closeGameModal();

    const cancelEditorBtn = document.getElementById("btn-cancel-game-editor");
    if (cancelEditorBtn) cancelEditorBtn.onclick = () => this.closeGameModal();

    // Tự sinh slug ID từ Tên game khi thêm mới
    const titleInput = document.getElementById("edit-game-title");
    const idInput = document.getElementById("edit-game-id");
    if (titleInput && idInput) {
      titleInput.oninput = () => {
        const isNew = document.getElementById("edit-game-is-new").value === "true";
        if (isNew) {
          idInput.value = titleInput.value
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/đ/g, "d")
            .replace(/[^a-z0-9]/g, "-")
            .replace(/-+/g, "-")
            .replace(/^-|-$/g, "");
        }
      };
    }

    // Xử lý chọn file ảnh bìa
    const coverFileInput = document.getElementById("editor-cover-file-input");
    if (coverFileInput) {
      coverFileInput.onchange = (e) => {
        if (e.target.files && e.target.files[0]) {
          this.handleCoverFile(e.target.files[0]);
        }
      };
    }

    // Xử lý dán link URL ảnh bìa
    const coverUrlInput = document.getElementById("edit-game-cover-url");
    if (coverUrlInput) {
      coverUrlInput.oninput = (e) => {
        const url = e.target.value.trim();
        const imgEl = document.getElementById("editor-cover-img");
        const emptyPrompt = document.getElementById("editor-cover-empty-prompt");
        if (url) {
          if (imgEl) {
            imgEl.src = url;
            imgEl.style.display = "block";
          }
          if (emptyPrompt) emptyPrompt.style.display = "none";
        }
      };
    }

    // Submit form thêm / sửa game
    const editorForm = document.getElementById("form-admin-game-editor");
    if (editorForm) {
      editorForm.onsubmit = (e) => this.saveGame(e);
    }

    // Chuyển tab trong Admin
    document.querySelectorAll(".admin-tab-btn").forEach(btn => {
      btn.onclick = () => {
        document.querySelectorAll(".admin-tab-btn").forEach(b => b.classList.remove("active"));
        document.querySelectorAll(".admin-pane").forEach(p => p.classList.remove("active"));
        btn.classList.add("active");
        const pane = document.getElementById(`admin-pane-${btn.dataset.admintab}`);
        if (pane) pane.classList.add("active");
      };
    });
  }
};

window.AdminStudio = AdminStudio;
