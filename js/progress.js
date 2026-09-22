/* ==========================================================================
   TẠP HÓA VIỆT / XƯỞNG DỊCH TIẾN ĐỘ LOGIC (progress.js)
   Quản lý hiển thị tiến độ 4 công đoạn: Dịch thuật, Hiệu đính, Font, QA
   ========================================================================== */

const Progress = {
  games: [],

  init(gamesData) {
    this.games = gamesData || [];
    this.render();
  },

  render() {
    const listContainer = document.getElementById("progress-list-container");
    if (!listContainer) return;

    // Lọc các dự án đang thực hiện và một số dự án hoàn thành gần đây
    const projects = this.games.filter(g => g.status === "in-progress" || g.id === "together-moon-escape" || g.id === "loop-hero");

    // Tính toán tiến độ trung bình
    const activeProjects = this.games.filter(g => g.status === "in-progress");
    const avg = activeProjects.length 
      ? Math.round(activeProjects.reduce((acc, g) => acc + g.progress.overall, 0) / activeProjects.length) 
      : 0;

    const countEl = document.getElementById("progress-active-count");
    const avgEl = document.getElementById("progress-average");
    if (countEl) countEl.textContent = activeProjects.length;
    if (avgEl) avgEl.textContent = avg;

    listContainer.innerHTML = projects.map(g => {
      const p = g.progress;
      return `
        <article class="progress-card">
          <div class="prog-info">
            <span class="engine-tag" style="margin-bottom: 8px; display: inline-block;">${g.engine}</span>
            <h3>${g.title}</h3>
            <div class="prog-meta">
              <span><i class="fa-solid fa-code-branch"></i> Phiên bản: ${g.patch_version}</span>
              <span>•</span>
              <span><i class="fa-solid fa-calendar"></i> ${g.release_date}</span>
            </div>
            <p class="prog-desc">${g.summary}</p>
          </div>

          <div class="stages-grid">
            <div class="stage-bar-item">
              <div class="stage-label-row">
                <span><i class="legend-dot trans" style="display:inline-block"></i> Dịch thuật</span>
                <strong>${p.translation}%</strong>
              </div>
              <div class="stage-track">
                <div class="stage-fill trans" style="width: ${p.translation}%"></div>
              </div>
            </div>

            <div class="stage-bar-item">
              <div class="stage-label-row">
                <span><i class="legend-dot proof" style="display:inline-block"></i> Hiệu đính</span>
                <strong>${p.proofread}%</strong>
              </div>
              <div class="stage-track">
                <div class="stage-fill proof" style="width: ${p.proofread}%"></div>
              </div>
            </div>

            <div class="stage-bar-item">
              <div class="stage-label-row">
                <span><i class="legend-dot font" style="display:inline-block"></i> Giao diện & Font</span>
                <strong>${p.font}%</strong>
              </div>
              <div class="stage-track">
                <div class="stage-fill font" style="width: ${p.font}%"></div>
              </div>
            </div>

            <div class="stage-bar-item">
              <div class="stage-label-row">
                <span><i class="legend-dot qa" style="display:inline-block"></i> Kiểm thử QA</span>
                <strong>${p.qa}%</strong>
              </div>
              <div class="stage-track">
                <div class="stage-fill qa" style="width: ${p.qa}%"></div>
              </div>
            </div>
          </div>

          <div class="prog-total-box">
            <span class="prog-total-percent">${p.overall}%</span>
            <span class="prog-total-label">${g.status === "ready" ? "Đã phát hành" : "Tiến độ chung"}</span>
            <button class="btn-secondary" style="margin-top: 12px; font-size: 0.8rem; padding: 6px 14px;" onclick="App.openDetail('${g.id}')">
              Hồ sơ
            </button>
          </div>
        </article>
      `;
    }).join("");
  }
};

window.Progress = Progress;
