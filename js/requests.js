/* ==========================================================================
   TẠP HÓA VIỆT / ĐỀ XUẤT CỘNG ĐỒNG LOGIC (requests.js)
   Bình chọn & Đề xuất game muốn Việt Hóa (Supabase Realtime + Local Fallback)
   ========================================================================== */

const Requests = {
  requests: [],
  userVotes: new Set(),
  realtimeChannel: null,

  init(initialRequests) {
    // Tự động dọn dẹp sạch sẽ bộ nhớ đệm đề xuất cũ nếu có
    try {
      if (!localStorage.getItem("thv_requests_cleared_2026")) {
        localStorage.removeItem("thv_user_requests");
        localStorage.removeItem("thv_user_votes");
        localStorage.setItem("thv_requests_cleared_2026", "true");
        this.userVotes = new Set();
      }
    } catch (e) {}

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
      if (window.AudioManager) AudioManager.playClick();
      if (window.App) App.showToast(`Đã hủy ủng hộ cho ${item.title}`);
    } else {
      this.userVotes.add(id);
      item.votes = (item.votes || 0) + 1;
      if (window.AudioManager) AudioManager.playDing();
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
  addRequest(title, url, why, coverUrl) {
    const newReq = {
      id: "req-" + Date.now(),
      title: title.trim(),
      engine: "PC",
      url: (url || "").trim(),
      why: (why || "").trim() || "Cộng đồng mong muốn được thưởng thức bản dịch tiếng Việt.",
      cover_url: (coverUrl || "").trim(),
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
    if (topNameEl) {
      topNameEl.textContent = sorted.length > 0 ? sorted[0].title : "Chưa có";
    }

    if (!sorted.length) {
      listContainer.innerHTML = `
        <div class="requests-empty-state" style="text-align:center; padding:60px 24px; background:var(--bg-card); border:2px solid var(--border-strong); border-radius:12px; box-shadow:4px 4px 0px var(--border-strong);">
          <div style="width:58px; height:58px; margin:0 auto 16px; background:var(--bg-surface); border:2px solid var(--border-strong); border-radius:14px; display:flex; align-items:center; justify-content:center; font-size:1.6rem; color:var(--accent-orange); box-shadow:2px 2px 0px var(--border-strong);">
            <i class="fa-solid fa-square-poll-vertical"></i>
          </div>
          <h3 style="font-size:1.25rem; font-weight:800; color:var(--text-primary); margin-bottom:8px;">Bảng Xếp Hạng Đang Trống</h3>
          <p style="font-size:0.9rem; color:var(--text-secondary); max-width:440px; margin:0 auto; line-height:1.5;">
            Chưa có tựa game nào trong danh sách bình chọn. Hãy là người đầu tiên gửi đề xuất tựa game bạn mong muốn nhóm Việt hóa tiếp theo ở biểu mẫu bên cạnh!
          </p>
        </div>
      `;
      return;
    }

    listContainer.innerHTML = sorted.map((r, idx) => {
      const hasVoted = this.userVotes.has(r.id);
      const isTop3 = idx < 3;
      const rankClass = idx === 0 ? "rank-gold" : idx === 1 ? "rank-silver" : idx === 2 ? "rank-bronze" : "";

      const coverHtml = r.cover_url ? `
        <div class="req-thumb-box">
          <img src="${r.cover_url}" alt="${r.title}" loading="lazy" onerror="this.parentElement.style.display='none'">
        </div>
      ` : "";

      return `
        <div class="request-item">
          <div class="req-inner-row">
            <button class="btn-vote ${hasVoted ? "voted" : ""}" onclick="Requests.toggleVote('${r.id}')" title="${hasVoted ? "Hủy bình chọn" : "Bình chọn cho tựa game này"}">
              <i class="fa-solid fa-arrow-up"></i>
              <span>${r.votes || 0}</span>
            </button>
            ${coverHtml}
            <div class="req-details">
              <div class="req-title">
                <span class="req-rank-pill ${rankClass}">#${idx + 1}</span>
                <strong style="font-size:1.08rem; color:var(--text-primary);">${r.title}</strong>
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
      const coverUrlInput = document.getElementById("req-input-cover-url");

      const title = titleInput ? titleInput.value : "";
      const url = urlInput ? urlInput.value : "";
      const why = whyInput ? whyInput.value : "";
      const coverUrl = (coverUrlInput && coverUrlInput.value.trim()) ? coverUrlInput.value.trim()
        : (this._reqCoverDataUrl || "");

      if (!title || !title.trim()) return;
      this.addRequest(title, url, why, coverUrl);
      form.reset();
      // Reset preview
      this._reqCoverDataUrl = "";
      const wrap = document.getElementById("req-cover-preview-wrap");
      if (wrap) wrap.style.display = "none";
    };

    // --- Preview ảnh bìa đề xuất (file upload) ---
    const reqCoverFile = document.getElementById("req-cover-file");
    const reqCoverUrlInput = document.getElementById("req-input-cover-url");
    const reqCoverPreviewWrap = document.getElementById("req-cover-preview-wrap");
    const reqCoverPreviewImg = document.getElementById("req-cover-preview-img");
    const reqCoverClear = document.getElementById("req-cover-clear");

    const showReqCover = (src) => {
      if (!src || !reqCoverPreviewWrap || !reqCoverPreviewImg) return;
      reqCoverPreviewImg.src = src;
      reqCoverPreviewWrap.style.display = "block";
    };
    const clearReqCover = () => {
      this._reqCoverDataUrl = "";
      if (reqCoverPreviewWrap) reqCoverPreviewWrap.style.display = "none";
      if (reqCoverPreviewImg) reqCoverPreviewImg.src = "";
      if (reqCoverFile) reqCoverFile.value = "";
      if (reqCoverUrlInput) reqCoverUrlInput.value = "";
    };

    if (reqCoverFile) {
      reqCoverFile.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          this._reqCoverDataUrl = ev.target.result;
          showReqCover(ev.target.result);
        };
        reader.readAsDataURL(file);
      };
    }
    if (reqCoverUrlInput) {
      let reqUrlTimer;
      reqCoverUrlInput.oninput = () => {
        clearTimeout(reqUrlTimer);
        reqUrlTimer = setTimeout(() => {
          const v = reqCoverUrlInput.value.trim();
          if (v) showReqCover(v); else clearReqCover();
        }, 700);
      };
    }
    if (reqCoverClear) {
      reqCoverClear.onclick = clearReqCover;
    }

    // --- Preview ảnh chụp lỗi Bug Reporter ---
    const bugFile = document.getElementById("bug-screenshot-file");
    const bugUrlInput = document.getElementById("bug-input-screenshot");
    const bugPreviewWrap = document.getElementById("bug-screenshot-preview-wrap");
    const bugPreviewImg = document.getElementById("bug-screenshot-preview-img");
    const bugClear = document.getElementById("bug-screenshot-clear");

    const showBugPreview = (src) => {
      if (!src || !bugPreviewWrap || !bugPreviewImg) return;
      bugPreviewImg.src = src;
      bugPreviewWrap.style.display = "block";
    };
    const clearBugPreview = () => {
      if (bugPreviewWrap) bugPreviewWrap.style.display = "none";
      if (bugPreviewImg) bugPreviewImg.src = "";
      if (bugFile) bugFile.value = "";
      if (bugUrlInput) bugUrlInput.value = "";
    };

    if (bugFile) {
      bugFile.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => showBugPreview(ev.target.result);
        reader.readAsDataURL(file);
      };
    }
    if (bugUrlInput) {
      let bugUrlTimer;
      bugUrlInput.oninput = () => {
        clearTimeout(bugUrlTimer);
        bugUrlTimer = setTimeout(() => {
          const v = bugUrlInput.value.trim();
          if (v) showBugPreview(v); else clearBugPreview();
        }, 700);
      };
    }
    if (bugClear) {
      bugClear.onclick = clearBugPreview;
    }
  }
};

window.Requests = Requests;
