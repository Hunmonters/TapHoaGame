/* ==========================================================================
   TẠP HÓA VIỆT / DONATE & SUPPORT CONTROLLER (donate.js)
   Quản lý Modal Ủng Hộ, sao chép STK TPBank và tương tác âm thanh phản hồi
   ========================================================================== */

const DonateModal = {
  accountNumber: "00006456922",
  accountName: "TRAN MINH KHA",
  bankName: "TPBank (Ngân hàng TMCP Tiên Phong)",
  defaultMemo: "Ung ho Tap Hoa Viet",

  init() {
    // Đóng khi click ra ngoài vùng modal
    const overlay = document.getElementById("donate-modal");
    if (overlay) {
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
          this.close();
        }
      });
    }

    // Đóng khi nhấn phím ESC
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && overlay && overlay.classList.contains("active")) {
        this.close();
      }
    });

    console.log("☕ DonateModal: Hệ thống tiếp sức & ủng hộ Tạp Hóa Việt đã sẵn sàng!");
  },

  /**
   * Mở Modal Ủng Hộ
   */
  open() {
    const modal = document.getElementById("donate-modal");
    if (!modal) return;

    modal.classList.add("active");
    document.body.style.overflow = "hidden";

    // Âm thanh mở hộp thoại nếu người dùng bật âm thanh
    if (window.AudioManager && typeof AudioManager.playWoosh === "function") {
      AudioManager.playWoosh();
    }
  },

  /**
   * Đóng Modal Ủng Hộ
   */
  close() {
    const modal = document.getElementById("donate-modal");
    if (!modal) return;

    modal.classList.remove("active");
    document.body.style.overflow = "";

    if (window.AudioManager && typeof AudioManager.playClick === "function") {
      AudioManager.playClick();
    }
  },

  /**
   * Sao chép Số Tài Khoản
   */
  copySTK() {
    this.copyToClipboard(this.accountNumber, "Số tài khoản " + this.accountNumber + " (TPBank)");
  },

  /**
   * Sao chép Nội Dung Chuyển Khoản
   */
  copyMemo() {
    const input = document.getElementById("donate-memo-val");
    const memo = (input && input.value) ? input.value : this.defaultMemo;
    this.copyToClipboard(memo, "Nội dung chuyển khoản: " + memo);
  },

  /**
   * Chọn mốc tiếp sức (Cốc trà đá, Ly cà phê, Bát phở...)
   */
  selectPreset(amount, label) {
    const memoInput = document.getElementById("donate-memo-val");
    const newMemo = `Ung ho Tap Hoa Viet - ${label}`;
    if (memoInput) {
      memoInput.value = newMemo;
    }

    // Hiệu ứng âm thanh chúc mừng
    if (window.AudioManager && typeof AudioManager.playDing === "function") {
      AudioManager.playDing();
    }

    if (window.App && typeof App.showToast === "function") {
      App.showToast(`💖 Đã chọn mốc ${label} (${amount.toLocaleString("vi-VN")}đ). Cảm ơn bạn!`);
    }
  },

  /**
   * Hàm sao chép vào bộ nhớ tạm (Clipboard) an toàn kèm Fallback
   */
  copyToClipboard(text, notifyText) {
    if (!text) return;

    const onSuccess = () => {
      // Âm thanh chuông báo
      if (window.AudioManager && typeof AudioManager.playDing === "function") {
        AudioManager.playDing();
      }

      if (window.App && typeof App.showToast === "function") {
        App.showToast("✅ Đã sao chép: " + notifyText);
      }
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(onSuccess).catch(() => {
        this.fallbackCopy(text, onSuccess);
      });
    } else {
      this.fallbackCopy(text, onSuccess);
    }
  },

  fallbackCopy(text, callback) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    textArea.style.top = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand("copy");
      if (callback) callback();
    } catch (err) {
      if (window.App && typeof App.showToast === "function") {
        App.showToast("⚠️ Vui lòng sao chép thủ công: " + text);
      }
    }
    document.body.removeChild(textArea);
  }
};

// Tự động khởi chạy khi tải xong trang
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => DonateModal.init());
} else {
  DonateModal.init();
}

window.DonateModal = DonateModal;
