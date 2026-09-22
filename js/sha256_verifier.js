/* ==========================================================================
   TẠP HÓA VIỆT / SHA-256 CHECKSUM VERIFIER (sha256_verifier.js)
   Sử dụng Web Crypto API gốc kiểm tra tính toàn vẹn của tệp đã tải
   ========================================================================== */

const Sha256Verifier = {
  /**
   * Tính toán chuỗi mã băm SHA-256 của một đối tượng File
   * @param {File} file 
   * @returns {Promise<string>} Mã SHA-256 dạng hex
   */
  async hashFile(file) {
    if (!window.crypto || !window.crypto.subtle) {
      throw new Error("Trình duyệt không hỗ trợ Web Crypto API.");
    }
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  },

  /**
   * Gắn sự kiện kéo thả file vào vùng dropzone
   * @param {HTMLElement} dropzoneEl 
   * @param {HTMLInputElement} fileInputEl 
   * @param {string} targetHash 
   * @param {HTMLElement} resultEl 
   */
  bindDropzone(dropzoneEl, fileInputEl, targetHash, resultEl) {
    if (!dropzoneEl || !fileInputEl || !resultEl) return;

    const resetUI = () => {
      resultEl.className = "verifier-result";
      resultEl.style.display = "none";
      resultEl.innerHTML = "";
    };

    const handleFile = async (file) => {
      if (!file) return;
      resultEl.style.display = "block";
      resultEl.className = "verifier-result";
      resultEl.style.background = "rgba(245, 158, 11, 0.15)";
      resultEl.style.color = "var(--accent-gold)";
      resultEl.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Đang tính toán mã SHA-256 cho tệp <b>${file.name}</b>...`;

      try {
        const computedHash = await this.hashFile(file);
        const cleanTarget = String(targetHash || "").trim().toLowerCase();
        const cleanComputed = computedHash.trim().toLowerCase();

        if (cleanComputed === cleanTarget) {
          resultEl.className = "verifier-result match";
          resultEl.innerHTML = `<i class="fa-solid fa-circle-check"></i> <b>CHÍNH XÁC 100%!</b> Mã băm khớp hoàn toàn (${cleanComputed.slice(0, 16)}...). Tệp của bạn nguyên vẹn và an toàn tuyệt đối.`;
        } else {
          resultEl.className = "verifier-result mismatch";
          resultEl.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> <b>CẢNH BÁO: MÃ BĂM KHÔNG KHỚP!</b><br>
          <small>Mã file của bạn: ${cleanComputed.slice(0, 24)}...<br>Mã chuẩn của nhóm: ${cleanTarget.slice(0, 24)}...</small><br>
          File có thể đã tải bị lỗi hoặc bị gián đoạn, bạn nên tải lại nhé.`;
        }
      } catch (err) {
        resultEl.className = "verifier-result mismatch";
        resultEl.innerHTML = `<i class="fa-solid fa-circle-xmark"></i> Lỗi khi đọc tệp: ${err.message}`;
      }
    };

    // Click mở file explorer
    dropzoneEl.onclick = () => fileInputEl.click();
    fileInputEl.onchange = (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) handleFile(file);
    };

    // Drag and Drop
    dropzoneEl.ondragover = (e) => {
      e.preventDefault();
      dropzoneEl.classList.add("dragover");
    };

    dropzoneEl.ondragleave = () => {
      dropzoneEl.classList.remove("dragover");
    };

    dropzoneEl.ondrop = (e) => {
      e.preventDefault();
      dropzoneEl.classList.remove("dragover");
      const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      if (file) handleFile(file);
    };
  }
};

window.Sha256Verifier = Sha256Verifier;
