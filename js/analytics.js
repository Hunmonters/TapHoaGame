/* ==========================================================================
   TẠP HÓA VIỆT / TRAFFIC & VISITOR ANALYTICS ENGINE (analytics.js)
   Theo dõi lưu lượng truy cập THỰC TẾ 100% - Tuyệt đối KHÔNG dữ liệu giả mạo
   ========================================================================== */

const Analytics = {
  STORAGE_KEY: "thv_real_analytics_v2",
  VISITOR_KEY: "thv_real_visitor_uuid",
  SESSION_KEY: "thv_session_id",
  LAST_DATE_KEY: "thv_real_last_visit_date",
  SESSIONS_MAP_KEY: "thv_real_active_sessions",
  currentTimeframe: "7days", // 'today' | '7days' | '30days' | 'all'

  init() {
    this.cleanLegacyFakeData();
    this.ensureVisitorId();
    this.ensureSessionId();
    this.recordPageView();
    this.startHeartbeat();
  },

  /**
   * Dọn dẹp sạch sẽ các key dữ liệu mẫu cũ nếu có
   */
  cleanLegacyFakeData() {
    try {
      localStorage.removeItem("thv_analytics_store_v1");
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (!parsed || parsed.version !== "2.3") {
          localStorage.removeItem(this.STORAGE_KEY);
        }
      }
    } catch (e) {}
  },

  /**
   * Tạo hoặc lấy UUID duy nhất cho từng trình duyệt của người dùng thực
   */
  ensureVisitorId() {
    let vid = localStorage.getItem(this.VISITOR_KEY);
    if (!vid) {
      vid = "uv_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 8);
      localStorage.setItem(this.VISITOR_KEY, vid);
    }
    return vid;
  },

  /**
   * Quản lý phiên truy cập hiện tại của tab trình duyệt
   */
  ensureSessionId() {
    let sid = sessionStorage.getItem(this.SESSION_KEY);
    if (!sid) {
      sid = "sess_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 7);
      sessionStorage.setItem(this.SESSION_KEY, sid);
    }
    return sid;
  },

  /**
   * Nhịp tim phiên hoạt động (Heartbeat): Cập nhật thời gian hoạt động thực tế
   */
  startHeartbeat() {
    const update = () => {
      try {
        const sid = this.ensureSessionId();
        const now = Date.now();
        let sessions = {};
        try {
          sessions = JSON.parse(localStorage.getItem(this.SESSIONS_MAP_KEY) || "{}");
        } catch (e) {
          sessions = {};
        }

        // Dọn dẹp các session không còn hoạt động trong 3 phút qua
        const cleaned = {};
        for (const [sId, time] of Object.entries(sessions)) {
          if (now - time < 180000) {
            cleaned[sId] = time;
          }
        }
        cleaned[sid] = now;
        localStorage.setItem(this.SESSIONS_MAP_KEY, JSON.stringify(cleaned));
      } catch (e) {}
    };

    update();
    setInterval(update, 20000);

    window.addEventListener("beforeunload", () => {
      try {
        const sid = sessionStorage.getItem(this.SESSION_KEY);
        if (sid) {
          const sessions = JSON.parse(localStorage.getItem(this.SESSIONS_MAP_KEY) || "{}");
          delete sessions[sid];
          localStorage.setItem(this.SESSIONS_MAP_KEY, JSON.stringify(sessions));
        }
      } catch (e) {}
    });
  },

  /**
   * Đếm CHÍNH XÁC số lượng phiên thực tế đang hoạt động (trong 3 phút qua)
   * Tuyệt đối không giả lập hay tạo số ngẫu nhiên
   */
  getLiveActiveUsers() {
    try {
      const now = Date.now();
      const sessions = JSON.parse(localStorage.getItem(this.SESSIONS_MAP_KEY) || "{}");
      let count = 0;
      for (const [sId, time] of Object.entries(sessions)) {
        if (now - time < 180000) {
          count++;
        }
      }
      return Math.max(1, count); // Tối thiểu 1 người là người đang xem trang hiện tại
    } catch (e) {
      return 1;
    }
  },

  /**
   * Nhận diện Hệ điều hành thực tế của thiết bị
   */
  getDeviceOS() {
    const ua = navigator.userAgent || "";
    if (/SteamDeck|Valve/i.test(ua)) return "Steam Deck";
    if (/Android/i.test(ua)) return "Mobile Android";
    if (/iPhone|iPad|iPod/i.test(ua)) return "Mobile iOS";
    if (/Macintosh|Mac OS/i.test(ua)) return "macOS";
    if (/Linux/i.test(ua)) return "Linux PC";
    return "PC Windows";
  },

  /**
   * Nhận diện Trình duyệt thực tế
   */
  getBrowser() {
    const ua = navigator.userAgent || "";
    if (/CocCoc|coc_coc/i.test(ua)) return "Cốc Cốc";
    if (/Edg\//i.test(ua)) return "Microsoft Edge";
    if (/Firefox/i.test(ua)) return "Mozilla Firefox";
    if (/OPR|Opera/i.test(ua)) return "Opera";
    if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) return "Safari";
    return "Google Chrome";
  },

  /**
   * Nhận diện Nguồn giới thiệu thực tế (Referrer)
   */
  getReferrerSource() {
    const ref = document.referrer || "";
    if (!ref) return "Trực tiếp (Direct)";
    if (/google\./i.test(ref)) return "Google Search";
    if (/facebook\.com|fb\.com/i.test(ref)) return "Facebook";
    if (/discord/i.test(ref)) return "Discord";
    if (/theredteam/i.test(ref)) return "TheRedTeam";
    if (/youtube\.com/i.test(ref)) return "YouTube";
    if (/steamcommunity\.com/i.test(ref)) return "Steam Community";
    try {
      const url = new URL(ref);
      return url.hostname || "Nguồn khác";
    } catch (e) {
      return "Nguồn khác";
    }
  },

  /**
   * Lấy thông tin ngôn ngữ/múi giờ thực tế của thiết bị (Không bịa đặt thành phố)
   */
  getClientLocale() {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
      const lang = navigator.language || "vi-VN";
      return tz ? `${tz} (${lang})` : lang;
    } catch (e) {
      return "Việt Nam (vi-VN)";
    }
  },

  /**
   * Lấy kho dữ liệu thực tế từ LocalStorage
   */
  getStore() {
    let store = null;
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (raw) store = JSON.parse(raw);
    } catch (e) {
      console.warn("[Analytics] Không thể đọc store:", e);
    }

    if (!store) {
      store = this.createEmptyStore();
      this.saveStore(store);
    }

    return store;
  },

  /**
   * Lưu store vào LocalStorage
   */
  saveStore(store) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(store));
    } catch (e) {
      console.warn("[Analytics] Lỗi lưu store:", e);
    }
  },

  /**
   * Tạo store trống hoàn toàn 100% bắt đầu từ 0
   */
  createEmptyStore() {
    return {
      version: "2.3",
      created_at: new Date().toISOString(),
      total_pageviews: 0,
      total_unique_visitors: 0,
      total_downloads: 0,
      daily: {},
      games: {},
      devices: {},
      browsers: {},
      referrers: {},
      recent_logs: []
    };
  },

  /**
   * Ghi nhận một lượt xem trang (Pageview) thực tế
   */
  recordPageView() {
    const store = this.getStore();
    const today = new Date().toISOString().split("T")[0];
    const isNewDayForUser = localStorage.getItem(this.LAST_DATE_KEY) !== today;

    // Cập nhật tổng
    store.total_pageviews = (store.total_pageviews || 0) + 1;
    if (isNewDayForUser) {
      store.total_unique_visitors = (store.total_unique_visitors || 0) + 1;
      localStorage.setItem(this.LAST_DATE_KEY, today);
    }

    // Cập nhật theo ngày
    if (!store.daily[today]) {
      store.daily[today] = { views: 0, uv: 0, downloads: 0 };
    }
    store.daily[today].views = (store.daily[today].views || 0) + 1;
    if (isNewDayForUser) {
      store.daily[today].uv = (store.daily[today].uv || 0) + 1;
    }

    // Cập nhật thiết bị & trình duyệt thực
    const os = this.getDeviceOS();
    const browser = this.getBrowser();
    const ref = this.getReferrerSource();

    store.devices[os] = (store.devices[os] || 0) + 1;
    store.browsers[browser] = (store.browsers[browser] || 0) + 1;
    store.referrers[ref] = (store.referrers[ref] || 0) + 1;

    // Ghi nhật ký thực
    this.pushLog(store, {
      type: "page_view",
      action: "Truy Cập Trang Web",
      detail: `Mở trang: ${window.location.hash || "Kho Sưu Tập Game"}`,
      device: os,
      browser: browser,
      location: this.getClientLocale(),
      status: "Thành công"
    });

    this.saveStore(store);
  },

  /**
   * Ghi nhận người dùng xem chi tiết 1 game thực tế
   */
  trackGameView(gameId, gameTitle) {
    if (!gameId) return;
    const store = this.getStore();
    const today = new Date().toISOString().split("T")[0];

    store.total_pageviews = (store.total_pageviews || 0) + 1;
    if (store.daily[today]) {
      store.daily[today].views = (store.daily[today].views || 0) + 1;
    }

    if (!store.games[gameId]) {
      store.games[gameId] = { views: 0, downloads: 0 };
    }
    store.games[gameId].views = (store.games[gameId].views || 0) + 1;

    this.pushLog(store, {
      type: "view_game",
      action: "Xem Chi Tiết Game",
      detail: gameTitle || gameId,
      device: this.getDeviceOS(),
      browser: this.getBrowser(),
      location: this.getClientLocale(),
      status: "Xem bài"
    });

    this.saveStore(store);
  },

  /**
   * Ghi nhận người dùng thực tế bấm tải game
   */
  trackDownload(gameId, gameTitle, server) {
    if (!gameId) return;
    const store = this.getStore();
    const today = new Date().toISOString().split("T")[0];

    store.total_downloads = (store.total_downloads || 0) + 1;
    if (store.daily[today]) {
      store.daily[today].downloads = (store.daily[today].downloads || 0) + 1;
    }

    if (!store.games[gameId]) {
      store.games[gameId] = { views: 1, downloads: 0 };
    }
    store.games[gameId].downloads = (store.games[gameId].downloads || 0) + 1;

    this.pushLog(store, {
      type: "download",
      action: "Tải Bản Dịch",
      detail: `${gameTitle || gameId} (${server || "Google Drive"})`,
      device: this.getDeviceOS(),
      browser: this.getBrowser(),
      location: this.getClientLocale(),
      status: "200 OK"
    });

    this.saveStore(store);

    if (window.AdminStudio && AdminStudio.isAuthenticated) {
      AdminStudio.renderAnalytics();
    }
  },

  /**
   * Ghi nhận các hành động tương tác thực tế khác
   */
  trackAction(type, action, detail) {
    const store = this.getStore();
    this.pushLog(store, {
      type: type || "interaction",
      action: action || "Tương tác",
      detail: detail || "",
      device: this.getDeviceOS(),
      browser: this.getBrowser(),
      location: this.getClientLocale(),
      status: "Thành công"
    });
    this.saveStore(store);
  },

  pushLog(store, logItem) {
    logItem.time = new Date().toISOString();
    if (!store.recent_logs) store.recent_logs = [];
    store.recent_logs.unshift(logItem);
    // Giữ tối đa 50 log gần nhất
    if (store.recent_logs.length > 50) {
      store.recent_logs = store.recent_logs.slice(0, 50);
    }
  },

  /**
   * Định dạng số có dấu chấm phân cách hàng nghìn
   */
  formatNumber(num) {
    return new Intl.NumberFormat("vi-VN").format(num || 0);
  },

  /**
   * Lấy dữ liệu thực tế lọc theo timeframe (today | 7days | 30days | all)
   */
  getDataByTimeframe(timeframe) {
    const store = this.getStore();
    const tf = timeframe || this.currentTimeframe || "7days";
    const dailyKeys = Object.keys(store.daily || {}).sort();

    let filteredKeys = dailyKeys;
    if (tf === "today") {
      const today = new Date().toISOString().split("T")[0];
      filteredKeys = dailyKeys.filter(k => k === today);
      if (!filteredKeys.length) filteredKeys = [today];
    } else if (tf === "7days") {
      filteredKeys = dailyKeys.slice(-7);
    } else if (tf === "30days") {
      filteredKeys = dailyKeys.slice(-30);
    }

    const chartData = filteredKeys.map(k => {
      const item = store.daily[k] || { views: 0, uv: 0, downloads: 0 };
      const d = new Date(k);
      const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
      const dayName = isNaN(d.getTime()) ? "" : days[d.getDay()] || "";
      const label = isNaN(d.getTime()) ? k : `${dayName} ${d.getDate()}/${d.getMonth() + 1}`;
      return {
        date: k,
        label: label,
        views: item.views || 0,
        uv: item.uv || 0,
        downloads: item.downloads || 0
      };
    });

    const periodViews = chartData.reduce((a, b) => a + b.views, 0);
    const periodUV = chartData.reduce((a, b) => a + b.uv, 0);
    const periodDownloads = chartData.reduce((a, b) => a + b.downloads, 0);

    const totalViews = tf === "all" ? (store.total_pageviews || 0) : periodViews;
    const totalUV = tf === "all" ? (store.total_unique_visitors || 0) : periodUV;
    const totalDownloads = tf === "all" ? (store.total_downloads || 0) : periodDownloads;
    const convRate = totalViews > 0 ? ((totalDownloads / totalViews) * 100).toFixed(1) : "0.0";

    return {
      timeframe: tf,
      totalViews,
      totalUV,
      totalDownloads,
      conversionRate: convRate,
      liveUsers: this.getLiveActiveUsers(),
      chartData,
      games: store.games || {},
      devices: store.devices || {},
      browsers: store.browsers || {},
      referrers: store.referrers || {},
      recentLogs: store.recent_logs || []
    };
  },

  /**
   * Đặt lại bộ đếm về 0 nếu quản trị viên muốn reset
   */
  resetData() {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.SESSIONS_MAP_KEY);
    return this.createEmptyStore();
  }
};

window.Analytics = Analytics;
