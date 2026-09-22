/* ==========================================================================
   TẠP HÓA VIỆT / CLIENT-SIDE PE BINARY INSPECTOR (pe_inspector.js)
   Tự động phân tích file .exe của game để nhận diện phiên bản trực tiếp
   Chạy 100% offline trên RAM máy tính bằng FileReader & Web APIs
   ========================================================================== */

const PeInspector = {
  /**
   * Đọc và trích xuất số phiên bản từ file .exe bằng cách quét chuỗi UTF-16LE và ASCII
   * @param {File} file 
   * @returns {Promise<{version: string, raw: string}>}
   */
  async extractVersion(file) {
    if (!file) throw new Error("Chưa chọn tệp.");

    // Chỉ đọc tối đa 8MB đầu hoặc 8MB cuối của file (nơi chứa Resource Directory và Version Info)
    const chunkSize = Math.min(file.size, 8 * 1024 * 1024);
    const slice = file.slice(0, chunkSize);
    const buffer = await slice.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    // Chuyển đổi sang chuỗi để tìm kiếm pattern
    // Windows PE Version Info thường lưu dưới dạng UTF-16LE (mỗi ký tự cách nhau 1 byte 0x00)
    let versionFound = null;

    // 1. Quét tìm chuỗi ProductVersion hoặc FileVersion trong UTF-16LE
    const textDecoder = new TextDecoder("utf-16le", { fatal: false });
    const fullTextUtf16 = textDecoder.decode(bytes);

    const patterns = [
      /ProductVersion\0+([0-9]+(?:\.[0-9]+)+)/i,
      /FileVersion\0+([0-9]+(?:\.[0-9]+)+)/i,
      /Assembly Version\0+([0-9]+(?:\.[0-9]+)+)/i
    ];

    for (const pat of patterns) {
      const match = fullTextUtf16.match(pat);
      if (match && match[1]) {
        versionFound = match[1];
        break;
      }
    }

    // 2. Nếu chưa thấy, quét theo chuẩn ASCII
    if (!versionFound) {
      const asciiDecoder = new TextDecoder("ascii", { fatal: false });
      const fullTextAscii = asciiDecoder.decode(bytes);
      const asciiMatch = fullTextAscii.match(/(?:ProductVersion|FileVersion)[^\d]*([0-9]+\.[0-9]+(?:\.[0-9]+)*)/i);
      if (asciiMatch && asciiMatch[1]) {
        versionFound = asciiMatch[1];
      }
    }

    // 3. Quét tìm chuỗi phiên bản dạng x.x.x tổng quát
    if (!versionFound) {
      const genMatch = fullTextUtf16.match(/\b([1-9]\.[0-9]{1,3}(?:\.[0-9]{1,4})*)\b/);
      if (genMatch && genMatch[1]) {
        versionFound = genMatch[1];
      }
    }

    if (!versionFound) {
      throw new Error("Không tìm thấy thông tin Header Version trong tệp này. Tệp có thể đã bị nén bằng packer hoặc là file thực thi đặc thù.");
    }

    return {
      version: versionFound,
      fileName: file.name,
      fileSize: (file.size / (1024 * 1024)).toFixed(2) + " MB"
    };
  },

  /**
   * So sánh 2 chuỗi phiên bản dạng số (ví dụ 1.4.2 và 1.4.0)
   */
  compareVersions(v1, v2) {
    const parse = s => {
      const m = String(s || "").match(/\d+(?:\.\d+)*/);
      return m ? m[0].split(".").map(Number) : [0];
    };
    const a = parse(v1);
    const b = parse(v2);
    for (let i = 0; i < Math.max(a.length, b.length); i++) {
      const numA = a[i] || 0;
      const numB = b[i] || 0;
      if (numA !== numB) return numA < numB ? -1 : 1;
    }
    return 0;
  },

  /**
   * Gắn sự kiện cho vùng kéo thả kiểm tra phiên bản game
   */
  bindDetector(dropzoneEl, fileInputEl, targetGameVersion, resultEl) {
    if (!dropzoneEl || !fileInputEl || !resultEl) return;

    const handleFile = async (file) => {
      resultEl.style.display = "block";
      resultEl.className = "detector-result";
      resultEl.style.background = "rgba(245, 158, 11, 0.12)";
      resultEl.style.color = "var(--accent-gold)";
      resultEl.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Đang phân tích cấu trúc nhị phân PE của <b>${file.name}</b>...`;

      try {
        const info = await this.extractVersion(file);
        const cmp = this.compareVersions(info.version, targetGameVersion);

        if (cmp === 0) {
          resultEl.className = "detector-result match";
          resultEl.innerHTML = `
            <div style="display:flex; align-items:center; gap:10px;">
              <i class="fa-solid fa-circle-check" style="font-size:1.4rem;"></i>
              <div>
                <strong>KHỚP HOÀN TOÀN 100%!</strong><br>
                <span>Tệp <b>${info.fileName}</b> có phiên bản <b>v${info.version}</b>, trùng khớp chính xác với phiên bản mà bản vá hỗ trợ (<b>${targetGameVersion}</b>).</span>
              </div>
            </div>
          `;
        } else if (cmp > 0) {
          resultEl.className = "detector-result warn";
          resultEl.innerHTML = `
            <div style="display:flex; align-items:center; gap:10px;">
              <i class="fa-solid fa-triangle-exclamation" style="font-size:1.4rem;"></i>
              <div>
                <strong>GAME MỚI HƠN BẢN VÁ!</strong><br>
                <span>Game của bạn là <b>v${info.version}</b>, trong khi bản vá được kiểm thử cho <b>${targetGameVersion}</b>. Bản vá có thể vẫn chạy được nhưng bạn nên sao lưu thư mục gốc trước khi cài.</span>
              </div>
            </div>
          `;
        } else {
          resultEl.className = "detector-result mismatch";
          resultEl.innerHTML = `
            <div style="display:flex; align-items:center; gap:10px;">
              <i class="fa-solid fa-circle-xmark" style="font-size:1.4rem;"></i>
              <div>
                <strong>GAME CŨ HƠN BẢN VÁ!</strong><br>
                <span>Game của bạn là <b>v${info.version}</b>, cũ hơn phiên bản yêu cầu (<b>${targetGameVersion}</b>). Vui lòng cập nhật game lên bản mới nhất trên Steam để tránh lỗi crash.</span>
              </div>
            </div>
          `;
        }
      } catch (err) {
        resultEl.className = "detector-result mismatch";
        resultEl.innerHTML = `<i class="fa-solid fa-circle-info"></i> Không thể đọc phiên bản từ tệp này: ${err.message}`;
      }
    };

    dropzoneEl.onclick = () => fileInputEl.click();
    fileInputEl.onchange = (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) handleFile(file);
    };

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

window.PeInspector = PeInspector;
