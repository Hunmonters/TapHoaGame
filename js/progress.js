/* ==========================================================================
   TẠP HÓA VIỆT / XƯỞNG DỊCH TIẾN ĐỘ LOGIC (progress.js)
   Quản lý hiển thị tiến độ 4 công đoạn: Dịch thuật, Hiệu đính, Font, QA
   ========================================================================== */

const Progress = {
  games: [],
  currentFilter: "in-progress", // "in-progress" | "ready" | "all"

  init(gamesData) {
    this.games = gamesData || [];
    this.bindEvents();
    this.render();
  },

  bindEvents() {
    const pills = document.querySelectorAll(".prog-pill");
    pills.forEach(pill => {
      pill.onclick = () => {
        pills.forEach(p => p.classList.remove("active"));
        pill.classList.add("active");
        this.currentFilter = pill.dataset.filter || "all";
        this.render();
      };
    });
  },

  render() {
    const listContainer = document.getElementById("progress-list-container");
    if (!listContainer) return;

    // Phân loại dự án
    const activeProjects = this.games.filter(g => g.status === "in-progress");
    const readyProjects = this.games.filter(g => g.status === "ready");

    // Cập nhật số lượng trên các badge pill
    const countWipPill = document.getElementById("count-wip-projects");
    const countReadyPill = document.getElementById("count-ready-projects");
    if (countWipPill) countWipPill.textContent = activeProjects.length;
    if (countReadyPill) countReadyPill.textContent = readyProjects.length;

    // Tính toán tiến độ trung bình của các dự án đang dịch
    const avg = activeProjects.length 
      ? Math.round(activeProjects.reduce((acc, g) => acc + ((g.progress && g.progress.overall) || 0), 0) / activeProjects.length) 
      : 0;

    const countEl = document.getElementById("progress-active-count");
    const avgEl = document.getElementById("progress-average");
    if (countEl) countEl.textContent = activeProjects.length;
    if (avgEl) avgEl.textContent = avg;

    // Lọc danh sách dự án theo tab
    let displayList = [];
    if (this.currentFilter === "in-progress") {
      displayList = activeProjects;
    } else if (this.currentFilter === "ready") {
      displayList = readyProjects;
    } else {
      displayList = this.games;
    }

    if (!displayList.length) {
      listContainer.innerHTML = `
        <div style="text-align:center; padding:50px 20px; background:var(--bg-card); border:2px solid var(--border-strong); border-radius:var(--radius-md); box-shadow:4px 4px 0px var(--border-strong);">
          <i class="fa-solid fa-hammer" style="font-size:2.5rem; color:var(--text-muted); margin-bottom:12px;"></i>
          <h3 style="font-size:1.2rem; font-weight:800; color:var(--text-primary); margin-bottom:6px;">Chưa có dự án nào trong mục này</h3>
          <p style="font-size:0.9rem; color:var(--text-secondary);">Bạn có thể gửi đề xuất game mới tại tab Đề Xuất để nhóm đưa vào xưởng dịch!</p>
        </div>
      `;
      return;
    }

    listContainer.innerHTML = displayList.map(g => {
      const p = g.progress || { overall: 0, translation: 0, proofread: 0, font: 0, qa: 0 };
      const coverSrc = g.cover_image || `assets/covers/${g.id}.jpg`;
      const isReady = g.status === "ready";
      const statusPillText = isReady ? "HOÀN TẤT" : `TIẾN ĐỘ ${p.overall}%`;
      const statusPillClass = isReady ? "ready" : "wip";

      return `
        <article class="progress-card">
          <!-- Cột 1: Ảnh bìa Steam 460x215 dễ nhận diện -->
          <div class="prog-cover-wrap" onclick="App.openDetail('${g.id}')" title="Bấm để xem chi tiết ${g.title}">
            <img class="prog-cover-img" src="${coverSrc}" alt="${g.title}" loading="lazy"
                 onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
            <div class="prog-cover-fallback" style="display:none;">
              <i class="fa-solid fa-gamepad" style="font-size:1.6rem; margin-bottom:4px;"></i>
              <span>${g.title}</span>
            </div>
            <span class="prog-status-pill ${statusPillClass}">${statusPillText}</span>
          </div>

          <!-- Cột 2: Thông tin tựa game -->
          <div class="prog-info">
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px; flex-wrap:wrap;">
              <span class="engine-tag" style="margin:0;">${g.engine || "PC Game"}</span>
              <span class="tag-version" style="font-size:0.75rem; padding:2px 8px;"><i class="fa-solid fa-code-branch"></i> ${g.patch_version || "v1.0"}</span>
            </div>
            <h3 onclick="App.openDetail('${g.id}')" class="prog-title">${g.title}</h3>
            <div class="prog-meta">
              <span><i class="fa-regular fa-calendar"></i> ${g.release_date || "Đang cập nhật"}</span>
              <span>•</span>
              <span><i class="fa-solid fa-hard-drive"></i> ${g.size || "Nhẹ"}</span>
            </div>
            <p class="prog-desc">${g.summary || g.description || "Dự án Việt hóa đang được tiến hành kiểm định kỹ thuật."}</p>
          </div>

          <!-- Cột 3: 4 Chặng tiến độ chi tiết -->
          <div class="stages-grid">
            <div class="stage-bar-item">
              <div class="stage-label-row">
                <span><i class="legend-dot trans" style="display:inline-block"></i> Chặng 1: Dịch thuật</span>
                <strong>${p.translation || 0}%</strong>
              </div>
              <div class="stage-track">
                <div class="stage-fill trans" style="width: ${p.translation || 0}%"></div>
              </div>
            </div>

            <div class="stage-bar-item">
              <div class="stage-label-row">
                <span><i class="legend-dot proof" style="display:inline-block"></i> Chặng 2: Hiệu đính</span>
                <strong>${p.proofread || 0}%</strong>
              </div>
              <div class="stage-track">
                <div class="stage-fill proof" style="width: ${p.proofread || 0}%"></div>
              </div>
            </div>

            <div class="stage-bar-item">
              <div class="stage-label-row">
                <span><i class="legend-dot font" style="display:inline-block"></i> Chặng 3: Font UI</span>
                <strong>${p.font || 0}%</strong>
              </div>
              <div class="stage-track">
                <div class="stage-fill font" style="width: ${p.font || 0}%"></div>
              </div>
            </div>

            <div class="stage-bar-item">
              <div class="stage-label-row">
                <span><i class="legend-dot qa" style="display:inline-block"></i> Chặng 4: Thẩm định QA</span>
                <strong>${p.qa || 0}%</strong>
              </div>
              <div class="stage-track">
                <div class="stage-fill qa" style="width: ${p.qa || 0}%"></div>
              </div>
            </div>
          </div>

          <!-- Cột 4: Tổng % tiến độ & Nút hành động -->
          <div class="prog-total-box">
            <span class="prog-total-percent">${p.overall || 0}%</span>
            <span class="prog-total-label">${isReady ? "Hoàn tất" : "Tiến độ"}</span>
            <button class="btn-prog-action" type="button" onclick="App.openDetail('${g.id}')">
              ${isReady ? `<i class="fa-brands fa-google-drive"></i> Tải ngay` : `Xem hồ sơ →`}
            </button>
          </div>
        </article>
      `;
    }).join("");
  }
};

window.Progress = Progress;
