/* ==========================================================================
   TẠP HÓA VIỆT / BÁO LỖI BẢN DỊCH (bug_reporter.js)
   Gửi báo lỗi tràn chữ, sai ngữ pháp trực tiếp tới Discord Webhook & LocalStorage
   ========================================================================== */

const BugReporter = {
  games: [],

  init(gamesData) {
    this.games = gamesData || [];
    this.populateGameOptions();
    this.bindEvents();
  },

  populateGameOptions(preselectId = "") {
    const select = document.getElementById("bug-select-game");
    if (!select) return;

    select.innerHTML = `<option value="">-- Chọn tựa game gặp sự cố --</option>` +
      this.games.map(g => `<option value="${g.id}" ${g.id === preselectId ? "selected" : ""}>${g.title}</option>`).join("");
  },

  openModal(preselectGameId = "") {
    const modal = document.getElementById("bug-report-modal");
    if (!modal) return;
    this.populateGameOptions(preselectGameId);
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  },

  closeModal() {
    const modal = document.getElementById("bug-report-modal");
    if (!modal) return;
    modal.classList.remove("active");
    document.body.style.overflow = "";
  },

  async sendReport(gameId, bugType, desc, screenshotUrl, userContact) {
    const game = this.games.find(g => g.id === gameId);
    const gameName = game ? game.title : gameId;

    const reportData = {
      id: "bug-" + Date.now(),
      gameId: gameId,
      gameName: gameName,
      bugType: bugType,
      desc: desc,
      screenshotUrl: screenshotUrl,
      userContact: userContact,
      timestamp: new Date().toISOString()
    };

    // 1. Lưu vào LocalStorage
    try {
      const saved = JSON.parse(localStorage.getItem("thv_bug_reports") || "[]");
      saved.unshift(reportData);
      localStorage.setItem("thv_bug_reports", JSON.stringify(saved));
    } catch (e) {}

    // 2. Gửi Discord Webhook nếu đã cấu hình
    if (window.CONFIG && CONFIG.discordBugWebhook) {
      try {
        await fetch(CONFIG.discordBugWebhook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: "Tạp Hóa Việt BugBot",
            avatar_url: "https://i.imgur.com/4M34hi2.png",
            embeds: [{
              title: `🐛 Báo lỗi mới: ${gameName}`,
              color: 0xEF4444,
              fields: [
                { name: "Phân loại", value: bugType, inline: true },
                { name: "Người gửi", value: userContact || "Ẩn danh", inline: true },
                { name: "Mô tả chi tiết", value: desc },
                { name: "Ảnh minh chứng", value: screenshotUrl || "Không đính kèm" }
              ],
              footer: { text: "Hệ thống tiếp nhận phản hồi VietHoaGame" },
              timestamp: new Date().toISOString()
            }]
          })
        });
      } catch (err) {
        console.warn("Không gửi được Discord Webhook (có thể do URL chưa cấu hình hoặc CORS):", err);
      }
    }

    App.showToast("Cảm ơn bạn! Báo cáo lỗi đã được ghi nhận vào hệ thống.");
    this.closeModal();
  },

  bindEvents() {
    const modal = document.getElementById("bug-report-modal");
    const closeBtn = document.getElementById("btn-close-bug-modal");
    const form = document.getElementById("form-bug-report");

    if (closeBtn) closeBtn.onclick = () => this.closeModal();
    if (modal) {
      modal.onclick = (e) => {
        if (e.target === modal) this.closeModal();
      };
    }

    if (form) {
      form.onsubmit = (e) => {
        e.preventDefault();
        const gameId = document.getElementById("bug-select-game").value;
        const bugType = document.getElementById("bug-select-type").value;
        const desc = document.getElementById("bug-input-desc").value;
        const screenshot = document.getElementById("bug-input-screenshot").value;
        const contact = document.getElementById("bug-input-contact").value;

        if (!gameId || !desc) return;
        this.sendReport(gameId, bugType, desc, screenshot, contact);
        form.reset();
      };
    }
  }
};

window.BugReporter = BugReporter;
