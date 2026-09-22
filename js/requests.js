/* ==========================================================================
   TẠP HÓA VIỆT / ĐỀ XUẤT CỘNG ĐỒNG LOGIC (requests.js)
   Bình chọn & Đề xuất game muốn Việt Hóa (lưu trữ localStorage)
   ========================================================================== */

const Requests = {
  requests: [],
  userVotes: new Set(),

  init(initialRequests) {
    // Tải danh sách vote của user từ localStorage
    try {
      const savedVotes = JSON.parse(localStorage.getItem("thv_user_votes") || "[]");
      this.userVotes = new Set(savedVotes);
    } catch (e) {
      this.userVotes = new Set();
    }

    // Tải các request người dùng tự thêm
    let userRequests = [];
    try {
      userRequests = JSON.parse(localStorage.getItem("thv_user_requests") || "[]");
    } catch (e) {
      userRequests = [];
    }

    this.requests = [...(initialRequests || []), ...userRequests];
    this.render();
    this.bindEvents();
  },

  toggleVote(id) {
    const item = this.requests.find(r => r.id === id);
    if (!item) return;

    if (this.userVotes.has(id)) {
      this.userVotes.delete(id);
      item.votes = Math.max(0, (item.votes || 0) - 1);
      App.showToast(`Đã hủy ủng hộ cho ${item.title}`);
    } else {
      this.userVotes.add(id);
      item.votes = (item.votes || 0) + 1;
      App.showToast(`Đã ủng hộ 1 phiếu cho ${item.title}!`);
    }

    try {
      localStorage.setItem("thv_user_votes", JSON.stringify(Array.from(this.userVotes)));
    } catch (e) {}

    this.render();
  },

  addRequest(title, engine, url, why) {
    const newReq = {
      id: "req-" + Date.now(),
      title: title.trim(),
      engine: engine.trim() || "Chưa rõ",
      url: url.trim(),
      why: why.trim() || "Cộng đồng mong muốn được thưởng thức bản dịch tiếng Việt.",
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

    App.showToast(`Đã nhận đề xuất dịch: ${newReq.title}`);
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

    listContainer.innerHTML = sorted.map(r => {
      const hasVoted = this.userVotes.has(r.id);
      return `
        <div class="request-item">
          <button class="btn-vote ${hasVoted ? "voted" : ""}" onclick="Requests.toggleVote('${r.id}')" title="${hasVoted ? "Hủy ủng hộ" : "Bình chọn cho game này"}">
            <i class="fa-solid fa-arrow-up"></i>
            <span>${r.votes || 0}</span>
          </button>
          <div class="req-details">
            <div class="req-title">
              <span>${r.title}</span>
              <span class="req-engine">${r.engine}</span>
            </div>
            <p class="req-why">${r.why}</p>
            ${r.url ? `
              <div class="req-links">
                <a href="${r.url}" target="_blank" rel="noopener noreferrer">
                  <i class="fa-solid fa-arrow-up-right-from-square"></i> Trang Steam cửa hàng
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
      const title = document.getElementById("req-input-title").value;
      const engine = document.getElementById("req-input-engine").value;
      const url = document.getElementById("req-input-url").value;
      const why = document.getElementById("req-input-why").value;

      if (!title) return;
      this.addRequest(title, engine, url, why);
      form.reset();
    };
  }
};

window.Requests = Requests;
