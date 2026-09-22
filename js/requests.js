/* ==========================================================================
   TẠP HÓA VIỆT / ĐỀ XUẤT CỘNG ĐỒNG LOGIC (requests.js)
   Bình chọn & Đề xuất game muốn Việt Hóa (Supabase Realtime + Local Fallback)
   ========================================================================== */

const Requests = {
  requests: [],
  userVotes: new Set(),
  realtimeChannel: null,

  init(initialRequests) {
    // 1. Tải danh sách vote của user từ localStorage
    try {
      const savedVotes = JSON.parse(localStorage.getItem("thv_user_votes") || "[]");
      this.userVotes = new Set(savedVotes);
    } catch (e) {
      this.userVotes = new Set();
    }

    // 2. Tải các request người dùng tự thêm từ localStorage (chế độ offline)
    let userRequests = [];
    try {
      userRequests = JSON.parse(localStorage.getItem("thv_user_requests") || "[]");
    } catch (e) {
      userRequests = [];
    }

    // 3. Hợp nhất danh sách
    const combined = [...(initialRequests || [])];
    userRequests.forEach(ur => {
      if (!combined.some(r => r.id === ur.id)) {
        combined.unshift(ur);
      }
    });

    this.requests = combined;
    this.render();
    this.bindEvents();
    this.initRealtime();
  },

  /**
   * Kích hoạt kênh Supabase Realtime để đồng bộ số phiếu vote và đề xuất mới tức thì
   */
  initRealtime() {
    if (!window.SupabaseClient || !SupabaseClient.hasCloud()) return;
    if (this.realtimeChannel) return;

    this.realtimeChannel = SupabaseClient.subscribeTable(
      "requests",
      (newRecord) => {
        // Nhận thêm mới từ người dùng khác trên mạng
        if (!this.requests.some(r => r.id === newRecord.id)) {
          this.requests.unshift(newRecord);
          this.render();
          if (window.App) App.showToast(`🔥 Cộng đồng vừa gửi đề xuất: "${newRecord.title}"`);
        }
      },
      (updatedRecord) => {
        // Đồng bộ số lượt bình chọn từ người dùng khác
        const idx = this.requests.findIndex(r => r.id === updatedRecord.id);
        if (idx !== -1) {
          this.requests[idx] = { ...this.requests[idx], ...updatedRecord };
          this.render();
        }
      },
      (deletedRecord) => {
        // Xóa đề xuất
        this.requests = this.requests.filter(r => r.id !== deletedRecord.id);
        this.render();
      }
    );
  },

  /**
   * Tăng hoặc hủy bỏ phiếu bình chọn cho tựa game
   */
  toggleVote(id) {
    const item = this.requests.find(r => r.id === id);
    if (!item) return;

    if (this.userVotes.has(id)) {
      this.userVotes.delete(id);
      item.votes = Math.max(0, (item.votes || 0) - 1);
      if (window.App) App.showToast(`Đã hủy ủng hộ cho ${item.title}`);
    } else {
      this.userVotes.add(id);
      item.votes = (item.votes || 0) + 1;
      if (window.App) App.showToast(`⚡ Đã bình chọn 1 phiếu cho "${item.title}"!`);
    }

    try {
      localStorage.setItem("thv_user_votes", JSON.stringify(Array.from(this.userVotes)));
    } catch (e) {}

    // Đồng bộ lên Supabase Cloud nếu khả dụng
    if (window.SupabaseClient && SupabaseClient.hasCloud()) {
      SupabaseClient.updateRequestVotes(id, item.votes);
    }

    this.render();
  },

  /**
   * Người dùng gửi đề xuất dịch tựa game mới
   */
  addRequest(title, url, why) {
    const newReq = {
      id: "req-" + Date.now(),
      title: title.trim(),
      engine: "PC",
      url: (url || "").trim(),
      why: (why || "").trim() || "Cộng đồng mong muốn được thưởng thức bản dịch tiếng Việt.",
      votes: 1
    };

    this.userVotes.add(newReq.id);
    this.requests.unshift(newReq);

    // Lưu vào localStorage
    try {
      const userRequests = JSON.parse(localStorage.getItem("thv_user_requests") || "[]");
      userRequests.unshift(newReq);
      localStorage.setItem("thv_user_requests", JSON.stringify(userRequests));
      localStorage.setItem("thv_user_votes", JSON.stringify(Array.from(this.userVotes)));
    } catch (e) {}

    // Đồng bộ lên Supabase Cloud nếu khả dụng
    if (window.SupabaseClient && SupabaseClient.hasCloud()) {
      SupabaseClient.insertRequest(newReq);
    }

    if (window.App) App.showToast(`🎉 Đã gửi đề xuất: "${newReq.title}"!`);
    this.render();
  },

  render() {
    const listContainer = document.getElementById("requests-list-container");
    const countEl = document.getElementById("request-open-count");
    const totalVoteEl = document.getElementById("request-vote-total");
    const topNameEl = document.getElementById("request-top-name");

    if (!listContainer) return;

    // Sắp xếp theo số vote giảm dần
    const sorted = [...this.requests].sort((a, b) => (b.votes || 0) - (a.votes || 0));

    if (countEl) countEl.textContent = sorted.length;
    if (totalVoteEl) {
      const total = sorted.reduce((acc, r) => acc + (r.votes || 0), 0);
      totalVoteEl.textContent = total.toLocaleString("vi-VN");
    }
    if (topNameEl && sorted.length > 0) {
      topNameEl.textContent = sorted[0].title;
    }

    listContainer.innerHTML = sorted.map((r, idx) => {
      const hasVoted = this.userVotes.has(r.id);
      const isTop3 = idx < 3;
      const rankClass = idx === 0 ? "rank-gold" : idx === 1 ? "rank-silver" : idx === 2 ? "rank-bronze" : "";

      return `
        <div class="request-item">
          <button class="btn-vote ${hasVoted ? "voted" : ""}" onclick="Requests.toggleVote('${r.id}')" title="${hasVoted ? "Hủy bình chọn" : "Bình chọn cho tựa game này"}">
            <i class="fa-solid fa-arrow-up"></i>
            <span>${r.votes || 0}</span>
          </button>
          <div class="req-details">
            <div class="req-title">
              <span class="req-rank-pill ${rankClass}">#${idx + 1}</span>
              <strong style="font-size:1.1rem; color:var(--text-primary);">${r.title}</strong>
              ${isTop3 ? `<span class="req-top-tag"><i class="fa-solid fa-fire"></i> Top đề cử</span>` : ""}
            </div>
            <p class="req-why">${r.why}</p>
            ${r.url ? `
              <div class="req-links">
                <a href="${r.url}" target="_blank" rel="noopener noreferrer">
                  <i class="fa-brands fa-steam"></i> Steam Store <i class="fa-solid fa-arrow-up-right-from-square" style="font-size:0.75rem; margin-left:2px;"></i>
                </a>
              </div>
            ` : ""}
          </div>
        </div>
      `;
    }).join("");
  },

  bindEvents() {
    const form = document.getElementById("form-add-request");
    if (!form) return;

    form.onsubmit = (e) => {
      e.preventDefault();
      const titleInput = document.getElementById("req-input-title");
      const urlInput = document.getElementById("req-input-url");
      const whyInput = document.getElementById("req-input-why");

      const title = titleInput ? titleInput.value : "";
      const url = urlInput ? urlInput.value : "";
      const why = whyInput ? whyInput.value : "";

      if (!title || !title.trim()) return;
      this.addRequest(title, url, why);
      form.reset();
    };
  }
};

window.Requests = Requests;
