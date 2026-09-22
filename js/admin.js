/* ==========================================================================
   TẠP HÓA VIỆT / STUDIO DASHBOARD ADMIN LOGIC (admin.js)
   Bảng điều khiển quản trị nội bộ hệ sinh thái VietHoaGame
   ========================================================================== */

const AdminStudio = {
  isAuthenticated: false,
  games: [],

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
      if (pinInput) pinInput.focus();
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

    tbody.innerHTML = this.games.map((g, idx) => `
      <tr>
        <td><b>${idx + 1}</b></td>
        <td>
          <strong style="color:var(--text-primary); display:block;">${g.title}</strong>
          <small style="color:var(--text-muted);">${g.original_title}</small>
        </td>
        <td><span class="engine-tag">${g.engine}</span></td>
        <td>${g.game_version}</td>
        <td>
          <span class="card-status-badge ${g.status === "ready" ? "ready" : "progress"}" style="position:static; display:inline-block;">
            ${g.status === "ready" ? "Hoàn tất" : "Đang dịch"}
          </span>
        </td>
        <td><b>${g.progress.overall}%</b></td>
        <td>
          <button class="btn-admin-action" onclick="AdminStudio.editGame('${g.id}')">
            <i class="fa-solid fa-pen-to-square"></i> Sửa nhanh
          </button>
        </td>
      </tr>
    `).join("");
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

  editGame(gameId) {
    const game = this.games.find(g => g.id === gameId);
    if (!game) return;

    const newProgress = prompt(`Cập nhật % tiến độ tổng thể cho "${game.title}":`, game.progress.overall);
    if (newProgress !== null && !isNaN(newProgress)) {
      const p = Math.min(100, Math.max(0, parseInt(newProgress, 10)));
      game.progress.overall = p;
      if (p === 100) game.status = "ready";
      this.renderGamesTable();
      Catalog.renderCatalog();
      Progress.render();
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

    const exportBtn = document.getElementById("btn-admin-export-json");
    if (exportBtn) exportBtn.onclick = () => this.exportJson();

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
