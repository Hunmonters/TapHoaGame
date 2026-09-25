/* ==========================================================================
   TẠP HÓA VIỆT / COMMUNITY HUB CONTROLLER (community.js)
   Quản lý danh sách bản dịch cộng đồng chia sẻ, Form đóng góp & Link Google Drive
   ========================================================================== */

const Community = {
  games: [],
  allGamesRef: [],
  filters: {
    query: "",
    status: "all",
    sort: "newest"
  },
  currentPage: 1,
  itemsPerPage: 9, // Ràng buộc: 9 thẻ / trang
  selectedCoverBase64: null,

  /**
   * Khởi tạo Module Cộng Đồng
   */
  init(allGames) {
    this.allGamesRef = allGames || [];

    // Nạp thêm các bản dịch cộng đồng đã lưu cục bộ trong localStorage
    this.syncCommunityGames();

    this.bindEvents();
    this.bindSubmitModal();
    this.render();
  },

  /**
   * Đồng bộ dữ liệu bản dịch cộng đồng từ danh sách tổng + localStorage
   */
  syncCommunityGames() {
    let deletedIds = new Set();
    try {
      deletedIds = new Set(JSON.parse(localStorage.getItem("thv_deleted_games") || "[]"));
    } catch (e) {}

    let localCommunity = [];
    try {
      const stored = localStorage.getItem("thv_community_games");
      if (stored) {
        localCommunity = JSON.parse(stored).filter(g => !deletedIds.has(g.id));
      }
    } catch (e) {
      console.warn("[Community] Lỗi đọc localStorage thv_community_games:", e);
    }

    // Gộp game có flag is_community từ hệ thống (loại trừ game Admin đã xóa)
    const systemCommunity = this.allGamesRef.filter(g => g.is_community && !deletedIds.has(g.id));

    // Ghép và lọc trùng theo ID
    const map = new Map();
    [...localCommunity, ...systemCommunity].forEach(g => {
      if (!map.has(g.id) && !deletedIds.has(g.id)) {
        map.set(g.id, g);
      }
    });

    this.games = Array.from(map.values());

    // Bảo đảm các game cộng đồng chưa bị xóa có mặt trong App.games
    localCommunity.forEach(localG => {
      if (!deletedIds.has(localG.id) && !this.allGamesRef.some(g => g.id === localG.id)) {
        this.allGamesRef.unshift(localG);
      }
    });
  },

  /**
   * Loại bỏ dấu tiếng Việt để tìm kiếm
   */
  removeAccents(str) {
    if (!str) return "";
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .toLowerCase();
  },

  /**
   * Cập nhật số liệu thống kê Masthead
   */
  renderMetrics() {
    const elTotal = document.getElementById("comm-stat-total");
    const elGroups = document.getElementById("comm-stat-groups");
    const elDownloads = document.getElementById("comm-stat-downloads");

    if (elTotal) elTotal.textContent = this.games.length;

    if (elGroups) {
      const groups = new Set(this.games.map(g => g.author || "Cộng Đồng").filter(Boolean));
      elGroups.textContent = groups.size || 1;
    }

    if (elDownloads) {
      const totalDl = this.games.reduce((acc, g) => acc + (g.downloads_count || 0), 0);
      elDownloads.textContent = totalDl.toLocaleString("vi-VN");
    }
  },

  /**
   * Lọc và sắp xếp danh sách bản dịch cộng đồng
   */
  getFilteredGames() {
    const q = this.removeAccents(this.filters.query.trim());

    let list = this.games.filter(g => {
      // 1. Tìm kiếm theo tên game hoặc tên nhóm dịch
      if (q) {
        const text = this.removeAccents(`${g.title} ${g.original_title || ""} ${g.author || ""} ${g.summary || ""}`);
        if (!text.includes(q)) return false;
      }

      // 2. Lọc theo trạng thái
      if (this.filters.status === "ready" && g.status !== "ready") return false;
      if (this.filters.status === "in-progress" && g.status === "ready") return false;

      return true;
    });

    // 3. Sắp xếp
    if (this.filters.sort === "newest") {
      list.sort((a, b) => (b.release_date || "").localeCompare(a.release_date || ""));
    } else if (this.filters.sort === "popular") {
      list.sort((a, b) => (b.downloads_count || 0) - (a.downloads_count || 0));
    } else if (this.filters.sort === "a-z") {
      list.sort((a, b) => a.title.localeCompare(b.title, "vi"));
    }

    return list;
  },

  /**
   * Render HTML cho 1 thẻ bản dịch cộng đồng chuẩn 460x215
   */
  renderCard(g, savedSet) {
    const isSaved = savedSet && savedSet.has(g.id);
    const isReady = g.status === "ready";
    const coverSrc = g.cover_image || `assets/covers/${g.id}.jpg`;
    const authorName = g.author || "Dịch Giả Tự Do";
    const authorLink = g.author_link || "";
    const gdrive = (g.download_links && g.download_links.find(d => d.url && d.url.includes("drive.google.com"))) 
                   || (g.download_links && g.download_links[0]);

    return `
      <article class="comm-card" onclick="App.openDetail('${g.id}')">
        <!-- Poster Frame Steam 460 x 215 -->
        <div class="comm-poster-wrap">
          <img class="comm-poster-img" src="${coverSrc}" alt="${g.title}" loading="lazy"
               onerror="this.src='https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=460&h=215&fit=crop';">
          
          <div class="comm-poster-top">
            <span class="comm-badge-source">
              <i class="fa-solid fa-users"></i> Cộng Đồng
            </span>
            <button class="comm-bookmark-btn ${isSaved ? "active" : ""}" 
                    title="${isSaved ? "Bỏ lưu" : "Lưu vào bộ sưu tập"}" 
                    type="button"
                    onclick="event.stopPropagation(); Library.toggle('${g.id}'); Community.render();">
              <i class="${isSaved ? "fa-solid" : "fa-regular"} fa-bookmark"></i>
            </button>
          </div>

          ${isReady && gdrive ? `
            <span class="comm-quick-dl" title="Tải nhanh Google Drive" onclick="event.stopPropagation(); window.open('${gdrive.url}', '_blank');">
              <i class="fa-brands fa-google-drive"></i> Tải Ngay
            </span>
          ` : ""}
        </div>

        <!-- Card Body -->
        <div class="comm-card-body">
          <div class="comm-author-box">
            <span class="comm-author-badge" title="Tác giả / Nhóm dịch thực hiện">
              <i class="fa-solid fa-user-pen"></i> ${authorName}
            </span>
            ${authorLink ? `
              <a href="${authorLink}" target="_blank" rel="noopener noreferrer" class="comm-author-link" onclick="event.stopPropagation();" title="Ghé thăm kênh nhóm dịch">
                <i class="fa-solid fa-arrow-up-right-from-square"></i> Ghé thăm
              </a>
            ` : ""}
          </div>

          <h4 class="comm-title" title="${g.title}">${g.title}</h4>
          <p class="comm-summary">${g.summary || g.description || "Bản dịch chia sẻ từ cộng đồng game thủ."}</p>

          <div class="comm-meta-row">
            <span class="comm-meta-pill"><i class="fa-solid fa-code-branch"></i> ${g.patch_version || "v1.0.0"}</span>
            <span class="comm-meta-pill"><i class="fa-solid fa-bolt"></i> ${g.size || "Gọn nhẹ"}</span>
            <span class="comm-meta-pill" style="margin-left:auto; color:${isReady ? "var(--accent-green)" : "var(--accent-gold)"};">
              ${isReady ? "✓ Hoàn tất 100%" : "Đang tiến hành"}
            </span>
          </div>

          <div class="comm-card-footer">
            ${isReady && gdrive ? `
              <a href="${gdrive.url}" target="_blank" rel="noopener noreferrer" class="btn-comm-download" onclick="event.stopPropagation(); if(window.Analytics) Analytics.trackDownload('${g.id}', '${(g.title||'').replace(/'/g, '\\\'')}', '${gdrive.server || 'Google Drive'}');">
                <i class="fa-brands fa-google-drive"></i> Tải Google Drive
              </a>
            ` : `
              <button class="btn-comm-download" style="background:var(--accent-gold); cursor:pointer;" type="button">
                <i class="fa-solid fa-clock"></i> Xem Tiến Độ
              </button>
            `}
            <button class="btn-comm-detail" type="button" onclick="event.stopPropagation(); App.openDetail('${g.id}')">
              Chi Tiết
            </button>
          </div>
        </div>
      </article>
    `;
  },

  /**
   * Đổi trang hiển thị cộng đồng & cuộn mượt mà lên đầu
   */
  setPage(page) {
    const filtered = this.getFilteredGames();
    const totalPages = Math.ceil(filtered.length / this.itemsPerPage) || 1;
    const targetPage = Math.min(Math.max(1, page), totalPages);
    if (this.currentPage === targetPage) return;
    this.currentPage = targetPage;
    this.render();

    const toolbar = document.querySelector(".community-toolbar") || document.getElementById("community-grid");
    if (toolbar) {
      const topOffset = toolbar.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: Math.max(0, topOffset), behavior: "smooth" });
    }
  },

  /**
   * Render thanh phân trang cộng đồng
   */
  renderPagination(totalItems) {
    const totalPages = Math.ceil(totalItems / this.itemsPerPage);
    if (totalPages <= 1) return "";

    const currentPage = this.currentPage;
    const startIdx = (currentPage - 1) * this.itemsPerPage + 1;
    const endIdx = Math.min(currentPage * this.itemsPerPage, totalItems);

    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, "...", totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }

    const numbersHtml = pages.map(p => {
      if (p === "...") return `<span class="page-ellipsis">…</span>`;
      return `
        <button class="page-num-btn ${p === currentPage ? "active" : ""}" 
                type="button" 
                onclick="Community.setPage(${p})" 
                aria-label="Trang ${p}" 
                ${p === currentPage ? 'aria-current="page"' : ''}>
          ${p}
        </button>
      `;
    }).join("");

    return `
      <nav class="catalog-pagination" aria-label="Phân trang bản dịch cộng đồng">
        <div class="pagination-info">
          Hiển thị <strong>${startIdx}–${endIdx}</strong> trên tổng số <strong>${totalItems}</strong> bản dịch
          <span style="color:var(--text-muted); font-size:0.8rem; margin-left:4px;">(Trang ${currentPage}/${totalPages})</span>
        </div>
        <div class="pagination-controls">
          <button class="page-btn prev-btn" 
                  type="button" 
                  onclick="Community.setPage(${currentPage - 1})" 
                  ${currentPage <= 1 ? "disabled" : ""} 
                  aria-label="Trang trước">
            <i class="fa-solid fa-chevron-left"></i> Trước
          </button>
          <div class="page-numbers">
            ${numbersHtml}
          </div>
          <button class="page-btn next-btn" 
                  type="button" 
                  onclick="Community.setPage(${currentPage + 1})" 
                  ${currentPage >= totalPages ? "disabled" : ""} 
                  aria-label="Trang tiếp theo">
            Sau <i class="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      </nav>
    `;
  },

  /**
   * Render toàn bộ danh sách bản dịch cộng đồng (Tối đa 9 thẻ / trang)
   */
  render() {
    this.renderMetrics();

    const grid = document.getElementById("community-grid");
    const pagWrap = document.getElementById("community-pagination-wrap");
    if (!grid) return;

    const filtered = this.getFilteredGames();
    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / this.itemsPerPage) || 1;

    if (this.currentPage > totalPages) this.currentPage = totalPages;
    if (this.currentPage < 1) this.currentPage = 1;

    if (!totalItems) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align:center; padding: 60px 20px; background:var(--bg-card); border:2px solid var(--border-strong); border-radius:14px; box-shadow:4px 4px 0px var(--border-strong);">
          <i class="fa-solid fa-people-carry-box" style="font-size:3rem; color:var(--text-muted); margin-bottom:12px;"></i>
          <h3 style="font-size:1.25rem; font-weight:800; color:var(--text-primary); margin-bottom:6px;">Chưa có bản dịch nào khớp với tìm kiếm</h3>
          <p style="color:var(--text-secondary); font-size:0.9rem; margin-bottom:16px;">Bạn có bản dịch muốn đóng góp? Hãy chia sẻ ngay với cộng đồng game thủ!</p>
          <button class="btn-submit-community" onclick="Community.openSubmitModal()" type="button">
            <i class="fa-solid fa-plus"></i> Chia Sẻ Bản Dịch Của Bạn
          </button>
        </div>
      `;
      if (pagWrap) pagWrap.innerHTML = "";
      return;
    }

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const pagedGames = filtered.slice(startIndex, startIndex + this.itemsPerPage);

    const savedSet = (window.Library && Library.getSavedSet()) || new Set();
    grid.innerHTML = pagedGames.map(g => this.renderCard(g, savedSet)).join("");

    if (pagWrap) {
      pagWrap.innerHTML = this.renderPagination(totalItems);
    }
  },

  /**
   * Lắng nghe sự kiện tìm kiếm & lọc trên toolbar Cộng Đồng
   */
  bindEvents() {
    // Search input (reset về trang 1 khi tìm kiếm)
    const searchInput = document.getElementById("comm-search");
    if (searchInput) {
      searchInput.oninput = (e) => {
        this.currentPage = 1;
        this.filters.query = e.target.value;
        this.render();
      };
    }

    // Filter pills (reset về trang 1 khi đổi bộ lọc)
    const pills = document.querySelectorAll(".comm-pill");
    pills.forEach(pill => {
      pill.onclick = () => {
        this.currentPage = 1;
        pills.forEach(p => p.classList.remove("active"));
        pill.classList.add("active");
        this.filters.status = pill.dataset.filter || "all";
        this.render();
      };
    });

    // Sort select (reset về trang 1 khi đổi sắp xếp)
    const sortSelect = document.getElementById("comm-sort");
    if (sortSelect) {
      sortSelect.onchange = (e) => {
        this.currentPage = 1;
        this.filters.sort = e.target.value;
        this.render();
      };
    }
  },

  /* ==========================================================================
     MODAL ĐÓNG GÓP BẢN DỊCH CỘNG ĐỒNG (SUBMISSION MODAL)
     ========================================================================== */
  bindSubmitModal() {
    const modal = document.getElementById("modal-community-submission");
    const closeBtn = document.getElementById("btn-close-comm-modal");
    const cancelBtn = document.getElementById("btn-cancel-comm-modal");
    const form = document.getElementById("form-community-submit");
    const fileInput = document.getElementById("comm-cover-file");
    const urlInput = document.getElementById("comm-input-cover-url");

    if (closeBtn) closeBtn.onclick = () => this.closeSubmitModal();
    if (cancelBtn) cancelBtn.onclick = () => this.closeSubmitModal();

    if (modal) {
      modal.onclick = (e) => {
        if (e.target === modal) this.closeSubmitModal();
      };
    }

    // Preview khi chọn file ảnh từ máy
    if (fileInput) {
      fileInput.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (evt) => {
            this.selectedCoverBase64 = evt.target.result;
            this.updateModalCoverPreview(this.selectedCoverBase64);
          };
          reader.readAsDataURL(file);
        }
      };
    }

    // Preview khi nhập URL ảnh
    if (urlInput) {
      urlInput.oninput = (e) => {
        const url = e.target.value.trim();
        if (url) {
          this.selectedCoverBase64 = null;
          this.updateModalCoverPreview(url);
        }
      };
    }

    // Xử lý gửi form
    if (form) {
      form.onsubmit = (e) => this.handleFormSubmit(e);
    }
  },

  openSubmitModal() {
    const modal = document.getElementById("modal-community-submission");
    if (!modal) return;

    // Reset form
    const form = document.getElementById("form-community-submit");
    if (form) form.reset();

    this.selectedCoverBase64 = null;
    this.updateModalCoverPreview("");

    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  },

  closeSubmitModal() {
    const modal = document.getElementById("modal-community-submission");
    if (!modal) return;
    modal.classList.remove("active");
    document.body.style.overflow = "";
  },

  updateModalCoverPreview(src) {
    const previewImg = document.getElementById("comm-cover-preview-img");
    const emptyPrompt = document.getElementById("comm-cover-empty-prompt");

    if (!previewImg || !emptyPrompt) return;

    if (src) {
      previewImg.src = src;
      previewImg.style.display = "block";
      emptyPrompt.style.display = "none";
    } else {
      previewImg.src = "";
      previewImg.style.display = "none";
      emptyPrompt.style.display = "block";
    }
  },

  /**
   * Xử lý xác thực và lưu trữ bản dịch cộng đồng
   */
  async handleFormSubmit(e) {
    e.preventDefault();

    const title = document.getElementById("comm-input-title").value.trim();
    const originalTitle = document.getElementById("comm-input-original").value.trim() || title;
    const author = document.getElementById("comm-input-author").value.trim();
    const authorLink = document.getElementById("comm-input-author-link").value.trim();
    const gdriveUrl = document.getElementById("comm-input-gdrive").value.trim();
    const size = document.getElementById("comm-input-size").value.trim() || "Gọn nhẹ";
    const patchVer = document.getElementById("comm-input-ver").value.trim() || "v1.0.0";
    const status = document.getElementById("comm-select-status").value;
    const summary = document.getElementById("comm-input-summary").value.trim();
    const desc = document.getElementById("comm-input-desc").value.trim();
    const installStep1 = document.getElementById("comm-input-step1").value.trim();
    const installStep2 = document.getElementById("comm-input-step2").value.trim();
    const installStep3 = document.getElementById("comm-input-step3").value.trim();
    const coverUrl = document.getElementById("comm-input-cover-url").value.trim();

    // RÀNG BUỘC NGHIÊM NGẶT: Chỉ chấp nhận Google Drive
    if (!gdriveUrl.toLowerCase().includes("drive.google.com")) {
      alert("⚠️ Quy định tải: Tạp Hóa Việt chỉ sử dụng link Google Drive tốc độ cao, không dùng các trang rút gọn hoặc hosting khác. Vui lòng dán link Google Drive chính xác!");
      document.getElementById("comm-input-gdrive").focus();
      return;
    }

    // Tạo ID thân thiện
    const slugBase = this.removeAccents(title).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    const newId = `comm-${slugBase}-${Date.now().toString().slice(-4)}`;

    // Ảnh bìa
    const finalCover = this.selectedCoverBase64 || coverUrl || "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=460&h=215&fit=crop";

    // Tạo object game chuẩn
    const newGame = {
      id: newId,
      title: title,
      original_title: originalTitle,
      developer: "Cộng đồng phát triển",
      publisher: "Cộng đồng game thủ",
      engine: "Đa nền tảng",
      engine_category: "other",
      platforms: ["PC Windows"],
      game_version: "Steam / Bản quyền",
      patch_version: patchVer,
      size: size,
      sha256: "Kiểm định sạch SHA-256",
      status: status,
      progress: {
        overall: status === "ready" ? 100 : 70,
        translation: status === "ready" ? 100 : 70,
        proofread: status === "ready" ? 100 : 70,
        font: 100,
        qa: status === "ready" ? 100 : 70
      },
      featured: false,
      is_community: true,
      author: author,
      author_link: authorLink,
      release_date: new Date().toISOString().split("T")[0],
      downloads_count: 1,
      summary: summary || `Bản dịch do nhóm ${author} thực hiện và chia sẻ.`,
      description: desc || `Bản Việt hóa tâm huyết được chia sẻ bởi ${author}. Chúng tôi hoan nghênh và tôn trọng quyền sở hữu tác giả của nhóm dịch.`,
      install_guide: [
        installStep1 || "Tải bộ tệp Việt hóa từ link Google Drive về máy tính.",
        installStep2 || "Giải nén và chép các file bản dịch vào thư mục cài đặt của game.",
        installStep3 || "Mở game và thưởng thức tiếng Việt trọn vẹn."
      ],
      rollback_guide: [
        "Xóa các tệp vừa sao chép vào hoặc chọn Verify game files trên Steam để hoàn tác."
      ],
      files_affected: [],
      changelog: [
        `${patchVer}: Bản phát hành chia sẻ công khai lên Tạp Hóa Việt`
      ],
      credits: [
        {
          name: author,
          role: "Tác giả / Nhóm dịch chia sẻ"
        }
      ],
      download_links: [
        {
          name: "Google Drive",
          url: gdriveUrl,
          server: "Google Drive VIP",
          note: `Bản chính thức từ ${author}`
        }
      ],
      badge: author.toUpperCase(),
      cover_color: "#18181B",
      cover_image: finalCover
    };

    // 1. Lưu vào localStorage
    try {
      let savedList = JSON.parse(localStorage.getItem("thv_community_games") || "[]");
      savedList.unshift(newGame);
      localStorage.setItem("thv_community_games", JSON.stringify(savedList));
    } catch (err) {
      console.warn("Lỗi ghi localStorage community:", err);
    }

    // 2. Thêm vào mảng trong bộ nhớ
    this.games.unshift(newGame);
    if (this.allGamesRef && !this.allGamesRef.some(g => g.id === newGame.id)) {
      this.allGamesRef.unshift(newGame);
    }

    // 3. Nếu Supabase Cloud có cấu hình, lưu lên cloud
    if (window.SupabaseClient && SupabaseClient.hasCloud()) {
      try {
        await SupabaseClient.upsertGame(newGame);
        console.log("[Community] Đã lưu bản dịch lên Supabase Cloud thành công!");
      } catch (cloudErr) {
        console.warn("[Community] Lỗi lưu lên Supabase Cloud:", cloudErr);
      }
    }

    // 4. Render lại UI
    this.render();
    if (window.Catalog) {
      Catalog.renderStats();
      Catalog.renderCatalog();
    }
    if (window.AdminStudio) {
      AdminStudio.renderGamesTable();
    }

    this.closeSubmitModal();
    App.showToast(`🎉 Cảm ơn bạn! Bản Việt hóa "${title}" từ "${author}" đã được chia sẻ lên Cộng Đồng!`);
  }
};

window.Community = Community;
