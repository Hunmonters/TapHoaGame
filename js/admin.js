/* ==========================================================================
   TẠP HÓA VIỆT / STUDIO DASHBOARD ADMIN LOGIC (admin.js)
   Bảng điều khiển quản trị nội bộ: Thêm/Sửa game, Upload ảnh bìa, Quản lý Cloud
   ========================================================================== */

const AdminStudio = {
  isAuthenticated: false,
  games: [],
  selectedCoverFile: null,
  selectedCoverBase64: null,
  currentScreenshots: [],

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
      this.renderRequestsTable();
      this.renderReportsTable();
      this.renderAnalytics();
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
      this.renderRequestsTable();
      this.renderReportsTable();
      this.renderAnalytics();
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
          <button class="btn-admin-status-pill ${g.status === "ready" ? "ready" : "progress"}"
                  type="button"
                  title="Nhấp 1 chạm để chuyển: ${g.status === "ready" ? "Hoàn tất -> Đang dịch" : "Đang dịch -> Hoàn tất 100%"}"
                  onclick="AdminStudio.toggleGameStatus('${g.id}')">
            ${g.status === "ready" ? '<i class="fa-solid fa-circle-check"></i> Hoàn tất' : '<i class="fa-solid fa-clock"></i> Đang dịch'}
          </button>
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
     PHÂN TÍCH & SỐ LIỆU NGƯỜI TRUY CẬP (ANALYTICS DASHBOARD)
     ========================================================================== */
  analyticsTimeframe: "7days",

  renderAnalytics() {
    if (!window.Analytics) return;
    const pane = document.getElementById("admin-pane-analytics");
    if (!pane) return;

    const data = Analytics.getDataByTimeframe(this.analyticsTimeframe || "7days");

    // 1. Cập nhật 5 KPI Cards
    const elViews = document.getElementById("an-total-views");
    const elUV = document.getElementById("an-unique-visitors");
    const elLive = document.getElementById("an-live-users");
    const elDl = document.getElementById("an-total-downloads");
    const elConv = document.getElementById("an-conversion-rate");

    if (elViews) elViews.textContent = Analytics.formatNumber(data.totalViews);
    if (elUV) elUV.textContent = Analytics.formatNumber(data.totalUV);
    if (elLive) elLive.textContent = data.liveUsers;
    if (elDl) elDl.textContent = Analytics.formatNumber(data.totalDownloads);
    if (elConv) elConv.textContent = `${data.conversionRate}%`;

    // Cập nhật nhãn phụ hôm nay & badge chuyển đổi thực tế
    const store = Analytics.getStore();
    const today = new Date().toISOString().split("T")[0];
    const todayStats = (store.daily && store.daily[today]) ? store.daily[today] : { views: 0, uv: 0, downloads: 0 };

    const elViewsTrend = document.getElementById("an-views-trend");
    if (elViewsTrend) elViewsTrend.innerHTML = `<i class="fa-solid fa-calendar-day"></i> Hôm nay: ${Analytics.formatNumber(todayStats.views)}`;

    const elUvTrend = document.getElementById("an-uv-trend");
    if (elUvTrend) elUvTrend.innerHTML = `<i class="fa-solid fa-calendar-day"></i> Hôm nay: ${Analytics.formatNumber(todayStats.uv)}`;

    const elDlTrend = document.getElementById("an-dl-trend");
    if (elDlTrend) elDlTrend.innerHTML = `<i class="fa-solid fa-calendar-day"></i> Hôm nay: ${Analytics.formatNumber(todayStats.downloads)}`;

    const elConvBadge = document.getElementById("an-conversion-badge");
    if (elConvBadge) {
      const cr = parseFloat(data.conversionRate) || 0;
      if (cr >= 25) elConvBadge.textContent = "Chuyển đổi cao";
      else if (cr >= 10) elConvBadge.textContent = "Tương tác tốt";
      else if (cr > 0) elConvBadge.textContent = "Đang chuyển đổi";
      else elConvBadge.textContent = "Thực tế 100%";
    }

    // 2. Vẽ biểu đồ SVG Xu Hướng
    this.renderAnalyticsChart(data.chartData);

    // 3. Render Top Games
    this.renderAnalyticsTopGames(data.games);

    // 4. Render Thiết bị & Nguồn
    this.renderAnalyticsDevices(data.devices);
    this.renderAnalyticsReferrers(data.referrers);

    // 5. Render Nhật ký hoạt động
    this.renderAnalyticsLogs(data.recentLogs);

    // 6. Bind timeframe buttons
    document.querySelectorAll(".analytics-time-btn").forEach(btn => {
      btn.onclick = () => {
        document.querySelectorAll(".analytics-time-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        this.analyticsTimeframe = btn.dataset.timeframe || "7days";
        this.renderAnalytics();
      };
    });
  },

  renderAnalyticsChart(chartData) {
    const container = document.getElementById("analytics-chart-container");
    if (!container) return;

    if (!chartData || !chartData.length) {
      container.innerHTML = `<div style="text-align:center; padding:50px; color:var(--text-muted);">Chưa có đủ dữ liệu để tạo biểu đồ.</div>`;
      return;
    }

    const svgWidth = 800;
    const svgHeight = 240;
    const paddingLeft = 55;
    const paddingRight = 20;
    const paddingTop = 25;
    const paddingBottom = 40;

    const plotWidth = svgWidth - paddingLeft - paddingRight;
    const plotHeight = svgHeight - paddingTop - paddingBottom;

    // Tìm giá trị lớn nhất cho trục tung (co giãn tỉ lệ mượt mà theo số liệu thực tế)
    const maxVal = Math.max(5, ...chartData.map(d => Math.max(d.views, d.uv)));
    const roundMax = maxVal <= 10 ? 10 : (maxVal <= 50 ? 50 : (maxVal <= 100 ? 100 : Math.ceil(maxVal / 50) * 50));

    // Các đường lưới ngang (Gridlines)
    const gridLinesCount = 4;
    let gridHtml = "";
    for (let i = 0; i <= gridLinesCount; i++) {
      const yVal = Math.round((roundMax / gridLinesCount) * i);
      const yPos = paddingTop + plotHeight - (plotHeight * (i / gridLinesCount));
      gridHtml += `
        <line x1="${paddingLeft}" y1="${yPos}" x2="${svgWidth - paddingRight}" y2="${yPos}" class="chart-grid-line" stroke="#E2DAC8" stroke-dasharray="3 3" />
        <text x="${paddingLeft - 10}" y="${yPos + 4}" class="chart-axis-text" text-anchor="end" font-size="10" fill="var(--text-secondary)">${Analytics.formatNumber(yVal)}</text>
      `;
    }

    // Vẽ các cột cho từng mốc thời gian
    const groupWidth = plotWidth / chartData.length;
    const barWidth = Math.min(22, Math.max(10, groupWidth * 0.32));
    const barGap = 4;

    let barsHtml = "";
    chartData.forEach((d, idx) => {
      const centerX = paddingLeft + (idx * groupWidth) + (groupWidth / 2);

      // Cột Views (Cam)
      const hViews = (d.views / roundMax) * plotHeight;
      const yViews = paddingTop + plotHeight - hViews;
      const xViews = centerX - barWidth - (barGap / 2);

      // Cột UV (Vàng/Amber)
      const hUV = (d.uv / roundMax) * plotHeight;
      const yUV = paddingTop + plotHeight - hUV;
      const xUV = centerX + (barGap / 2);

      barsHtml += `
        <g class="chart-bar-group">
          <title>${d.date} (${d.label}):\n• Lượt xem trang: ${Analytics.formatNumber(d.views)}\n• Khách độc nhất: ${Analytics.formatNumber(d.uv)}\n• Lượt bấm tải: ${Analytics.formatNumber(d.downloads)}</title>
          <!-- Cột Lượt xem -->
          <rect x="${xViews}" y="${yViews}" width="${barWidth}" height="${Math.max(2, hViews)}" rx="4" class="chart-bar bar-views" fill="#EA4828" />
          <text x="${xViews + (barWidth / 2)}" y="${yViews - 5}" class="chart-bar-val" font-size="9" fill="var(--text-primary)">${d.views > 999 ? (d.views/1000).toFixed(1) + 'k' : d.views}</text>
          
          <!-- Cột Khách độc nhất -->
          <rect x="${xUV}" y="${yUV}" width="${barWidth}" height="${Math.max(2, hUV)}" rx="4" class="chart-bar bar-uv" fill="#F59E0B" />
          
          <!-- Nhãn trục hoành -->
          <text x="${centerX}" y="${svgHeight - 12}" class="chart-axis-text" text-anchor="middle" font-size="11" font-weight="700">${d.label}</text>
        </g>
      `;
    });

    container.innerHTML = `
      <svg class="svg-chart" viewBox="0 0 ${svgWidth} ${svgHeight}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Biểu đồ lưu lượng truy cập">
        ${gridHtml}
        ${barsHtml}
        <!-- Đường trục hoành đáy -->
        <line x1="${paddingLeft}" y1="${paddingTop + plotHeight}" x2="${svgWidth - paddingRight}" y2="${paddingTop + plotHeight}" class="chart-axis-line" stroke="#121316" stroke-width="1.5" />
      </svg>
    `;
  },

  renderAnalyticsTopGames(gamesStats) {
    const tbody = document.getElementById("analytics-top-games-tbody");
    if (!tbody) return;

    const allGames = this.games || [];
    const statsMap = gamesStats || {};

    // Gộp tất cả game và tính số liệu 100% thực tế (Tuyệt đối không số liệu giả)
    const list = allGames.map(g => {
      const s = statsMap[g.id] || { views: 0, downloads: 0 };
      const views = s.views || 0;
      const downloads = s.downloads || 0;
      const conv = views > 0 ? ((downloads / views) * 100).toFixed(1) : "0.0";
      return {
        id: g.id,
        title: g.title,
        cover: g.cover_image || `assets/covers/${g.id}.jpg`,
        views,
        downloads,
        conv
      };
    });

    // Lọc các game đã phát sinh tương tác thực tế
    const interacted = list.filter(g => g.views > 0 || g.downloads > 0);
    interacted.sort((a, b) => (b.downloads - a.downloads) || (b.views - a.views));

    // Nếu chưa có game nào được xem/tải, hiển thị 5 game đầu với số liệu thực tế 0
    const displayList = interacted.length > 0 ? interacted.slice(0, 6) : list.slice(0, 5);

    if (!displayList.length) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:20px; color:var(--text-muted);">Chưa có dữ liệu thống kê game.</td></tr>`;
      return;
    }

    tbody.innerHTML = displayList.map((g, idx) => {
      const rankClass = idx === 0 ? "rank-1" : (idx === 1 ? "rank-2" : (idx === 2 ? "rank-3" : "rank-other"));
      return `
        <tr>
          <td style="text-align:center;"><span class="rank-pill ${rankClass}">${idx + 1}</span></td>
          <td>
            <div style="display:flex; align-items:center; gap:8px;">
              <img src="${g.cover}" alt="" style="width:42px; height:24px; object-fit:cover; border-radius:3px; border:1px solid #121316;" onerror="this.style.display='none'">
              <span style="font-weight:700; color:var(--text-primary); font-size:0.86rem;">${g.title}</span>
            </div>
          </td>
          <td style="text-align:right; font-family:var(--font-mono); font-weight:700;">${Analytics.formatNumber(g.views)}</td>
          <td style="text-align:right; font-family:var(--font-mono); font-weight:800; color:var(--accent-orange);">${Analytics.formatNumber(g.downloads)}</td>
          <td style="text-align:center;">
            <span style="font-size:0.78rem; font-weight:800; font-family:var(--font-mono);">${g.conv}%</span>
            <div class="conv-bar-wrap">
              <div class="conv-bar-fill" style="width:${Math.min(100, Math.max(0, parseFloat(g.conv)))}%"></div>
            </div>
          </td>
        </tr>
      `;
    }).join("");
  },

  renderAnalyticsDevices(devices) {
    const container = document.getElementById("analytics-devices-list");
    if (!container) return;

    const total = Object.values(devices || {}).reduce((a, b) => a + b, 0) || 1;
    const entries = Object.entries(devices || {}).sort((a, b) => b[1] - a[1]);

    const colors = ["", "alt-blue", "alt-purple", "alt-green", ""];

    container.innerHTML = entries.map(([name, count], idx) => {
      const pct = Math.round((count / total) * 100);
      const colorClass = colors[idx % colors.length];
      return `
        <div class="breakdown-bar-item">
          <div class="breakdown-meta">
            <span class="breakdown-name">${name}</span>
            <span class="breakdown-stat">${pct}% (${Analytics.formatNumber(count)})</span>
          </div>
          <div class="breakdown-track">
            <div class="breakdown-fill ${colorClass}" style="width:${pct}%"></div>
          </div>
        </div>
      `;
    }).join("");
  },

  renderAnalyticsReferrers(referrers) {
    const container = document.getElementById("analytics-referrers-list");
    if (!container) return;

    const total = Object.values(referrers || {}).reduce((a, b) => a + b, 0) || 1;
    const entries = Object.entries(referrers || {}).sort((a, b) => b[1] - a[1]);

    const colors = ["", "alt-green", "alt-blue", "alt-purple", ""];

    container.innerHTML = entries.map(([name, count], idx) => {
      const pct = Math.round((count / total) * 100);
      const colorClass = colors[idx % colors.length];
      return `
        <div class="breakdown-bar-item">
          <div class="breakdown-meta">
            <span class="breakdown-name">${name}</span>
            <span class="breakdown-stat">${pct}% (${Analytics.formatNumber(count)})</span>
          </div>
          <div class="breakdown-track">
            <div class="breakdown-fill ${colorClass}" style="width:${pct}%"></div>
          </div>
        </div>
      `;
    }).join("");
  },

  renderAnalyticsLogs(logs) {
    const tbody = document.getElementById("analytics-logs-tbody");
    const countEl = document.getElementById("an-log-count");
    if (!tbody) return;

    const list = logs || [];
    if (countEl) countEl.textContent = `${list.length} sự kiện gần nhất`;

    if (!list.length) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:20px; color:var(--text-muted);">Chưa có nhật ký hoạt động nào được ghi nhận.</td></tr>`;
      return;
    }

    tbody.innerHTML = list.slice(0, 15).map(item => {
      let badgeType = "visit";
      let icon = "fa-eye";
      if (item.type === "download") {
        badgeType = "download";
        icon = "fa-cloud-arrow-down";
      } else if (item.type === "view_game") {
        badgeType = "view";
        icon = "fa-gamepad";
      } else if (item.type === "vote") {
        badgeType = "vote";
        icon = "fa-paper-plane";
      }

      // Format time
      const d = new Date(item.time);
      const timeStr = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")} ${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;

      return `
        <tr>
          <td style="font-family:var(--font-mono); font-size:0.78rem; color:var(--text-secondary);">${timeStr}</td>
          <td>
            <span class="log-action-badge ${badgeType}">
              <i class="fa-solid ${icon}"></i> ${item.action || "Truy cập"}
            </span>
          </td>
          <td><strong style="color:var(--text-primary); font-size:0.85rem;">${item.detail || ""}</strong></td>
          <td style="font-size:0.8rem; color:var(--text-secondary);"><i class="fa-solid fa-laptop"></i> ${item.device} • ${item.browser}</td>
          <td style="text-align:center; font-size:0.8rem; color:var(--text-muted);"><i class="fa-solid fa-location-dot" style="color:var(--accent-orange);"></i> ${item.location || "Việt Nam"}</td>
          <td style="text-align:center;"><span class="log-status-pill">${item.status || "200 OK"}</span></td>
        </tr>
      `;
    }).join("");
  },

  refreshAnalytics() {
    this.renderAnalytics();
    if (window.App) App.showToast("Đã làm mới số liệu người truy cập web!");
  },

  exportAnalyticsReport() {
    if (!window.Analytics) return;
    const store = Analytics.getStore();
    const now = new Date();
    const dateStr = now.toISOString().split("T")[0];

    let csv = "\uFEFF"; // UTF-8 BOM
    csv += "BÁO CÁO THỐNG KÊ LƯU LƯỢNG TRUY CẬP WEBSITE TẠP HÓA VIỆT\n";
    csv += `Thời gian xuất:,"${now.toLocaleString('vi-VN')}"\n`;
    csv += `Tổng Lượt Xem (Pageviews):,${store.total_pageviews}\n`;
    csv += `Tổng Khách Độc Nhất (UVs):,${store.total_unique_visitors}\n`;
    csv += `Tổng Lượt Tải Bản Dịch:,${store.total_downloads}\n`;
    csv += `Số Khách Đang Trực Tuyến:,${Analytics.getLiveActiveUsers()}\n\n`;

    csv += "1. XU HƯỚNG THEO NGÀY (DAILY TREND)\n";
    csv += "Ngày,Lượt Xem (Views),Khách Độc Nhất (UVs),Lượt Tải\n";
    Object.keys(store.daily || {}).sort().forEach(k => {
      const row = store.daily[k];
      csv += `"${k}",${row.views},${row.uv},${row.downloads || 0}\n`;
    });

    csv += "\n2. TOP TỰA GAME ĐƯỢC TẢI & XEM\n";
    csv += "ID Game,Tên Game,Lượt Xem,Lượt Tải\n";
    this.games.forEach(g => {
      const s = store.games[g.id] || { views: 0, downloads: 0 };
      csv += `"${g.id}","${g.title}",${s.views},${s.downloads}\n`;
    });

    csv += "\n3. PHÂN BỐ THIẾT BỊ\n";
    csv += "Thiết Bị,Lượt Dùng\n";
    Object.entries(store.devices || {}).forEach(([k, v]) => {
      csv += `"${k}",${v}\n`;
    });

    csv += "\n4. NGUỒN TRUY CẬP (REFERRERS)\n";
    csv += "Kênh Đến,Lượt Dùng\n";
    Object.entries(store.referrers || {}).forEach(([k, v]) => {
      csv += `"${k}",${v}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `taphoaviet_analytics_report_${dateStr}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (window.App) App.showToast("Đã xuất tệp báo cáo số liệu CSV thành công!");
  },

  renderRequestsTable() {
    const tbody = document.getElementById("admin-requests-tbody");
    const badge = document.getElementById("admin-req-count");
    if (!tbody) return;

    const reqs = (window.Requests && Requests.requests) ? Requests.requests : [];
    if (badge) badge.textContent = reqs.length;

    // Sắp xếp theo số vote giảm dần
    const sorted = [...reqs].sort((a, b) => (b.votes || 0) - (a.votes || 0));

    if (!sorted.length) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:28px; color:var(--text-muted); font-size:0.9rem;"><i class="fa-solid fa-inbox" style="font-size:1.5rem; display:block; margin-bottom:8px; opacity:0.5;"></i>Chưa có đề xuất nào được gửi lên.</td></tr>`;
      return;
    }

    tbody.innerHTML = sorted.map((r, idx) => {
      const coverHtml = r.cover_url
        ? `<div style="width:70px; height:38px; border-radius:4px; overflow:hidden; border:1px solid #121316; background:#000;"><img src="${r.cover_url}" alt="${r.title}" style="width:100%; height:100%; object-fit:cover;" onerror="this.parentElement.style.display='none'"></div>`
        : `<span style="font-size:0.75rem; color:var(--text-muted);">Không có</span>`;

      return `
        <tr>
          <td><strong style="font-family:var(--font-mono); color:var(--accent-orange);">#${idx + 1}</strong></td>
          <td>
            <strong style="display:block; font-size:0.95rem; color:var(--text-primary);">${r.title}</strong>
            ${r.url ? `<a href="${r.url}" target="_blank" rel="noopener noreferrer" style="font-size:0.75rem; color:var(--text-muted); display:inline-flex; align-items:center; gap:4px; margin-top:2px;"><i class="fa-brands fa-steam"></i> Steam Store ↗</a>` : ""}
          </td>
          <td>${coverHtml}</td>
          <td style="max-width:280px; font-size:0.85rem; color:var(--text-secondary); line-height:1.4;">${r.why || "Chưa có ghi chú lý do."}</td>
          <td style="text-align:center;">
            <span style="font-family:var(--font-mono); font-weight:800; font-size:1.05rem; color:var(--accent-gold); background:rgba(245,158,11,0.12); padding:3px 8px; border-radius:6px; border:1px solid rgba(245,158,11,0.3);">
              ▲ ${r.votes || 0}
            </span>
          </td>
          <td style="text-align:center;">
            <div style="display:flex; gap:6px; justify-content:center; flex-wrap:wrap;">
              <button class="btn-admin-action" type="button" title="Đưa tựa game này vào xưởng dịch" onclick="AdminStudio.convertRequestToGame('${r.id}')" style="background:var(--accent-orange); color:#fff; border-color:#121316;">
                <i class="fa-solid fa-wand-magic-sparkles"></i> Vào xưởng dịch
              </button>
              <button class="btn-admin-action" type="button" title="Xóa đề xuất này" style="color:var(--accent-red); border-color:rgba(239,68,68,0.3);" onclick="AdminStudio.deleteRequest('${r.id}')">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join("");
  },

  convertRequestToGame(reqId) {
    const reqs = (window.Requests && Requests.requests) ? Requests.requests : [];
    const r = reqs.find(item => item.id === reqId);
    if (!r) return;

    // Mở form thêm game mới
    this.openAddGameModal();

    // Điền trước thông tin từ đề xuất
    const titleInput = document.getElementById("edit-game-title");
    const idInput = document.getElementById("edit-game-id");
    const statusSelect = document.getElementById("edit-game-status");
    const summaryInput = document.getElementById("edit-game-summary");
    const descInput = document.getElementById("edit-game-desc");
    const coverUrlInput = document.getElementById("edit-game-cover-url");

    if (titleInput) {
      titleInput.value = r.title;
      if (idInput) {
        idInput.value = r.title
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/đ/g, "d")
          .replace(/[^a-z0-9]/g, "-")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, "");
      }
    }

    if (statusSelect) {
      statusSelect.value = "in-progress";
      const t = document.getElementById("edit-prog-trans");
      const p = document.getElementById("edit-prog-proof");
      const f = document.getElementById("edit-prog-font");
      const q = document.getElementById("edit-prog-qa");
      if (t) t.value = 15;
      if (p) p.value = 10;
      if (f) f.value = 20;
      if (q) q.value = 0;
    }

    if (summaryInput) {
      summaryInput.value = `Dự án khởi xướng theo đề xuất từ cộng đồng (${r.votes || 1} lượt ủng hộ).`;
    }

    if (descInput) {
      descInput.value = `Tựa game được đưa vào xưởng dịch Tạp Hóa Việt theo nguyện vọng từ cộng đồng game thủ.\nLý do đề xuất: ${r.why || "Cộng đồng mong muốn có bản dịch tiếng Việt chuẩn mực."}`;
    }

    if (r.cover_url) {
      if (coverUrlInput) coverUrlInput.value = r.cover_url;
      const imgEl = document.getElementById("editor-cover-img");
      const emptyPrompt = document.getElementById("editor-cover-empty-prompt");
      if (imgEl) {
        imgEl.src = r.cover_url;
        imgEl.style.display = "block";
      }
      if (emptyPrompt) emptyPrompt.style.display = "none";
      if (!this.currentScreenshots.includes(r.cover_url)) {
        this.currentScreenshots.push(r.cover_url);
        this.renderScreenshotsManager();
      }
    }

    App.showToast(`🚀 Đã chuyển đề xuất "${r.title}" vào xưởng dịch! Hãy điền thêm thông tin và bấm Lưu.`);
  },

  async deleteRequest(reqId) {
    const reqs = (window.Requests && Requests.requests) ? Requests.requests : [];
    const r = reqs.find(item => item.id === reqId);
    if (!r) return;

    if (!confirm(`Bạn có chắc muốn xóa vĩnh viễn đề xuất "${r.title}" khỏi hệ thống?`)) return;

    // 1. Xóa khỏi Supabase Cloud nếu có kết nối
    if (window.SupabaseClient && SupabaseClient.hasCloud()) {
      await SupabaseClient.deleteRequest(reqId);
    }

    // 2. Xóa khỏi Requests.requests
    if (window.Requests) {
      Requests.requests = Requests.requests.filter(item => item.id !== reqId);
    }

    // 3. Xóa khỏi localStorage
    try {
      let userRequests = JSON.parse(localStorage.getItem("thv_user_requests") || "[]");
      userRequests = userRequests.filter(item => item.id !== reqId);
      localStorage.setItem("thv_user_requests", JSON.stringify(userRequests));
    } catch (e) {}

    // 4. Render lại giao diện
    this.renderRequestsTable();
    if (window.Requests) Requests.render();
    App.showToast(`Đã xóa đề xuất "${r.title}".`);
  },

  async clearAllRequests() {
    if (!confirm("CẢNH BÁO QUẢN TRỊ: Bạn có chắc chắn muốn dọn sạch TOÀN BỘ danh sách đề xuất & bình chọn?")) return;

    if (window.SupabaseClient && SupabaseClient.hasCloud()) {
      await SupabaseClient.clearAllRequests();
    }

    if (window.Requests) {
      Requests.requests = [];
      Requests.userVotes = new Set();
    }

    try {
      localStorage.removeItem("thv_user_requests");
      localStorage.removeItem("thv_user_votes");
    } catch (e) {}

    this.renderRequestsTable();
    if (window.Requests) Requests.render();
    App.showToast("Đã dọn sạch toàn bộ bảng xếp hạng đề xuất!");
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

    // Khởi tạo danh sách ảnh minh họa rỗng
    this.currentScreenshots = [];
    this.renderScreenshotsManager();

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
    
    // Tự động đẩy tiến độ lên 100% khi chọn Hoàn tất trong form
    const statusSel = document.getElementById("edit-game-status");
    if (statusSel) {
      statusSel.onchange = () => {
        if (statusSel.value === "ready") {
          const t = document.getElementById("edit-prog-trans");
          const p = document.getElementById("edit-prog-proof");
          const f = document.getElementById("edit-prog-font");
          const q = document.getElementById("edit-prog-qa");
          if (t) t.value = 100;
          if (p) p.value = 100;
          if (f) f.value = 100;
          if (q) q.value = 100;
        }
      };
    }

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

    // Nạp danh sách ảnh minh họa Việt hóa của game
    this.currentScreenshots = Array.isArray(game.screenshots) ? [...game.screenshots] : [];
    this.renderScreenshotsManager();

    modal.classList.add("active");
  },

  closeGameModal() {
    const modal = document.getElementById("admin-game-form-modal");
    if (modal) modal.classList.remove("active");
  },

  renderScreenshotsManager() {
    const countEl = document.getElementById("editor-screenshots-count");
    const listEl = document.getElementById("editor-screenshots-list");
    if (!listEl) return;

    if (countEl) countEl.textContent = `${this.currentScreenshots.length} ảnh`;

    if (!this.currentScreenshots.length) {
      listEl.innerHTML = `
        <div style="grid-column: 1/-1; text-align:center; padding:12px; font-size:0.75rem; color:var(--text-muted); border:1.5px dashed var(--border-subtle); border-radius:8px;">
          Chưa có ảnh minh họa nào. Bạn hãy tải ảnh từ máy hoặc dán link bên dưới!
        </div>
      `;
      return;
    }

    listEl.innerHTML = this.currentScreenshots.map((src, idx) => `
      <div style="position:relative; aspect-ratio:16/9; border-radius:6px; overflow:hidden; border:1.5px solid #121316; background:#000; box-shadow:2px 2px 0px #121316;">
        <img src="${src}" alt="Screenshot ${idx + 1}" style="width:100%; height:100%; object-fit:cover; display:block;" onerror="this.parentElement.style.opacity='0.4'">
        <button type="button" onclick="AdminStudio.removeScreenshot(${idx})" title="Xóa ảnh này" style="position:absolute; top:3px; right:3px; width:20px; height:20px; border-radius:4px; background:#E11D48; color:#fff; border:1px solid #121316; display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:0.68rem; box-shadow:1px 1px 0px #121316;">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
    `).join("");
  },

  removeScreenshot(idx) {
    this.currentScreenshots.splice(idx, 1);
    this.renderScreenshotsManager();
  },

  addScreenshotFromUrl() {
    const input = document.getElementById("editor-screenshot-url-input");
    if (!input) return;
    const url = input.value.trim();
    if (!url) {
      App.showToast("Vui lòng nhập link ảnh hợp lệ!");
      return;
    }
    this.currentScreenshots.push(url);
    input.value = "";
    this.renderScreenshotsManager();
  },

  handleScreenshotFiles(files) {
    if (!files || !files.length) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target.result) {
          this.currentScreenshots.push(e.target.result);
          this.renderScreenshotsManager();
        }
      };
      reader.readAsDataURL(file);
    });
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

    let trans = parseInt(document.getElementById("edit-prog-trans").value, 10) || 0;
    let proof = parseInt(document.getElementById("edit-prog-proof").value, 10) || 0;
    let font = parseInt(document.getElementById("edit-prog-font").value, 10) || 0;
    let qa = parseInt(document.getElementById("edit-prog-qa").value, 10) || 0;
    let overall = Math.round((trans + proof + font + qa) / 4);

    const status = document.getElementById("edit-game-status").value;

    // Tự động đồng bộ chuẩn xác: Nếu chuyển thành 'ready' (Hoàn tất) thì tự động đặt 100%
    if (status === "ready") {
      overall = 100;
      trans = 100;
      proof = 100;
      font = 100;
      qa = 100;
    } else if (overall === 100) {
      overall = 90;
    }
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

    // Ảnh minh họa Việt hóa in-game
    gameObj.screenshots = (this.currentScreenshots && this.currentScreenshots.length > 0)
      ? [...this.currentScreenshots]
      : (coverImage ? [coverImage] : []);

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

    if (!confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn tựa game "${game.title}" khỏi hệ thống?`)) {
      return;
    }

    // 1. Xóa khỏi Supabase Cloud nếu có kết nối
    if (window.SupabaseClient && SupabaseClient.hasCloud()) {
      try {
        await SupabaseClient.deleteGame(gameId);
      } catch (e) {
        console.warn("[Admin] Lỗi xóa từ Supabase:", e);
      }
    }

    // 2. Lọc bỏ khỏi bộ nhớ Admin & App
    this.games = this.games.filter(g => g.id !== gameId);
    if (window.App && Array.isArray(App.games)) {
      App.games = App.games.filter(g => g.id !== gameId);
    }

    // 3. Cập nhật kho game tùy biến thv_custom_games
    try {
      localStorage.setItem("thv_custom_games", JSON.stringify(this.games));
    } catch (e) {}

    // 4. Xóa triệt để khỏi kho cộng đồng thv_community_games trong localStorage
    try {
      let commGames = JSON.parse(localStorage.getItem("thv_community_games") || "[]");
      commGames = commGames.filter(g => g.id !== gameId);
      localStorage.setItem("thv_community_games", JSON.stringify(commGames));
    } catch (e) {}

    // 5. Lưu ID vào danh sách cấm thv_deleted_games để không bao giờ bị nạp lại khi F5
    try {
      let deletedList = JSON.parse(localStorage.getItem("thv_deleted_games") || "[]");
      if (!deletedList.includes(gameId)) {
        deletedList.push(gameId);
      }
      localStorage.setItem("thv_deleted_games", JSON.stringify(deletedList));
    } catch (e) {}

    // 6. Cập nhật trực tiếp module Cộng Đồng
    if (window.Community) {
      Community.games = Community.games.filter(g => g.id !== gameId);
      if (Array.isArray(Community.allGamesRef)) {
        Community.allGamesRef = Community.allGamesRef.filter(g => g.id !== gameId);
      }
      Community.renderMetrics();
      Community.render();
    }

    // 7. Cập nhật giao diện Admin và các tab khác
    this.renderGamesTable();
    if (window.Catalog) Catalog.init(this.games);
    if (window.Progress) Progress.init(this.games);
    if (window.Library) Library.init(this.games);

    App.showToast(`Đã xóa vĩnh viễn "${game.title}" khỏi hệ thống.`);
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

  /**
   * Đổi trạng thái nhanh 1 chạm (Hoàn Tất <-> Đang Dịch) ngay trên bảng Admin
   */
  async toggleGameStatus(gameId) {
    const game = this.games.find(g => g.id === gameId);
    if (!game) return;

    if (game.status === "ready") {
      game.status = "in-progress";
      if (!game.progress) game.progress = {};
      game.progress.overall = 75;
      game.progress.translation = 80;
      game.progress.proofread = 70;
      game.progress.font = 80;
      game.progress.qa = 70;
      game.badge = "TIẾN ĐỘ 75%";
    } else {
      game.status = "ready";
      game.progress = {
        overall: 100,
        translation: 100,
        proofread: 100,
        font: 100,
        qa: 100
      };
      game.badge = "HOÀN TẤT 100%";
      if (!game.download_links || !game.download_links.length) {
        game.download_links = [
          { server: "Google Drive", url: "https://drive.google.com/", badge: "Tốc độ cao" }
        ];
      }
    }

    // 1. Đồng bộ lên Supabase Cloud nếu khả dụng
    if (window.SupabaseClient && SupabaseClient.hasCloud()) {
      try {
        await SupabaseClient.upsertGame(game);
      } catch (err) {
        console.warn("[Admin] Lỗi đồng bộ trạng thái lên Supabase:", err);
      }
    }

    // 2. Lưu vào localStorage
    try {
      localStorage.setItem("thv_custom_games", JSON.stringify(this.games));
    } catch (e) {}

    // 3. Cập nhật UI toàn trang web
    App.games = this.games;
    this.renderGamesTable();
    if (window.Catalog) Catalog.init(this.games);
    if (window.Progress) Progress.init(this.games);
    if (window.Community) Community.init(this.games);
    if (window.Library) Library.init(this.games);

    const isNowReady = game.status === "ready";
    App.showToast(`✨ Đã chuyển "${game.title}" sang: ${isNowReady ? "⚡ HOÀN TẤT (Sẵn sàng tải)" : "⏳ ĐANG DỊCH"}`);
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

  exportFullBackup() {
    let communityGames = [];
    try {
      communityGames = JSON.parse(localStorage.getItem("thv_community_games") || "[]");
    } catch (e) {}

    let userRequests = [];
    try {
      userRequests = JSON.parse(localStorage.getItem("thv_user_requests") || "[]");
    } catch (e) {}

    let bugReports = [];
    try {
      bugReports = JSON.parse(localStorage.getItem("thv_bug_reports") || "[]");
    } catch (e) {}

    const backupData = {
      app: "TapHoaViet",
      version: "2026.1",
      backup_at: new Date().toISOString(),
      games: this.games || [],
      community_games: communityGames,
      requests: (window.Requests && Requests.requests) ? Requests.requests : userRequests,
      bug_reports: bugReports,
      analytics: (window.Analytics ? Analytics.getStore() : null)
    };

    const jsonStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const dateStr = new Date().toISOString().split("T")[0];
    a.href = url;
    a.download = `taphoaviet_backup_${dateStr}.json`;
    a.click();
    URL.revokeObjectURL(url);
    App.showToast("📦 Đã xuất tệp sao lưu toàn bộ hệ thống (.json)!");
  },

  async importFullBackup(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (!confirm(`Bạn có chắc chắn muốn nạp dữ liệu từ tệp sao lưu "${file.name}"? Dữ liệu hiện tại sẽ được cập nhật và đồng bộ.`)) {
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (!data || (!data.games && !data.requests && !data.community_games)) {
          alert("Tệp sao lưu không hợp lệ hoặc không có dữ liệu Tạp Hóa Việt!");
          return;
        }

        // 1. Khôi phục danh sách Game
        if (Array.isArray(data.games) && data.games.length > 0) {
          this.games = data.games;
          App.games = this.games;
          localStorage.setItem("thv_custom_games", JSON.stringify(this.games));
          // Nếu có Supabase, đồng bộ lên Cloud
          if (window.SupabaseClient && SupabaseClient.hasCloud()) {
            for (const g of this.games) {
              try { await SupabaseClient.upsertGame(g); } catch (err) {}
            }
          }
        }

        // 2. Khôi phục Game cộng đồng
        if (Array.isArray(data.community_games) && data.community_games.length > 0) {
          localStorage.setItem("thv_community_games", JSON.stringify(data.community_games));
        }

        // 3. Khôi phục Đề xuất
        if (Array.isArray(data.requests) && data.requests.length > 0) {
          if (window.Requests) Requests.requests = data.requests;
          localStorage.setItem("thv_user_requests", JSON.stringify(data.requests));
          if (window.SupabaseClient && SupabaseClient.hasCloud()) {
            for (const r of data.requests) {
              try { await SupabaseClient.insertRequest(r); } catch (err) {}
            }
          }
        }

        // 4. Khôi phục Báo lỗi
        if (Array.isArray(data.bug_reports) && data.bug_reports.length > 0) {
          localStorage.setItem("thv_bug_reports", JSON.stringify(data.bug_reports));
        }

        // 5. Khôi phục số liệu Analytics nếu có
        if (data.analytics && typeof data.analytics === "object") {
          localStorage.setItem("thv_real_analytics_v2", JSON.stringify(data.analytics));
        }

        // 6. Cập nhật lại UI toàn bộ trang web
        this.renderGamesTable();
        this.renderRequestsTable();
        this.renderReportsTable();
        this.renderAnalytics();
        if (window.Catalog) Catalog.init(this.games);
        if (window.Progress) Progress.init(this.games);
        if (window.Community) Community.init(this.games);
        if (window.Requests) Requests.render();
        if (window.Library) Library.init(this.games);

        App.showToast("🎉 Phục hồi dữ liệu thành công! Đã nạp lại game, cộng đồng và đề xuất!");
      } catch (err) {
        console.error("Lỗi đọc file sao lưu:", err);
        alert("Lỗi phân tích file sao lưu JSON: " + err.message);
      }
      e.target.value = "";
    };
    reader.readAsText(file);
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

    // Xử lý chọn file ảnh minh họa in-game (hỗ trợ chọn nhiều ảnh)
    const ssFileInput = document.getElementById("editor-screenshot-file-input");
    if (ssFileInput) {
      ssFileInput.onchange = (e) => {
        if (e.target.files && e.target.files.length) {
          this.handleScreenshotFiles(e.target.files);
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
        if (btn.dataset.admintab === "analytics") {
          this.renderAnalytics();
        }
      };
    });
  }
};

window.AdminStudio = AdminStudio;
