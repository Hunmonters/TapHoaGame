/* ==========================================================================
   TẠP HÓA VIỆT / SUPABASE CLOUD CLIENT (supabase_client.js)
   Kết nối CSDL PostgreSQL & Storage Bucket trực tiếp từ trình duyệt
   Hỗ trợ cơ chế Hybrid (Offline-first Fallback + Cloud Realtime)
   ========================================================================== */

const SupabaseClient = {
  client: null,
  isReady: false,

  init() {
    const config = window.CONFIG && window.CONFIG.supabase;
    if (config && config.enabled && config.url && config.anonKey && window.supabase) {
      try {
        this.client = window.supabase.createClient(config.url, config.anonKey);
        this.isReady = true;
        console.log("[Supabase] Đã kết nối thành công tới Supabase Cloud:", config.url);
      } catch (err) {
        console.warn("[Supabase] Lỗi khởi tạo Supabase client, chuyển về chế độ Offline:", err);
        this.isReady = false;
      }
    } else {
      console.log("[Supabase] Đang ở chế độ Offline-first (dùng data/games.json và localStorage).");
      this.isReady = false;
    }
  },

  /**
   * Kiểm tra xem Supabase đã sẵn sàng chưa
   */
  hasCloud() {
    return this.isReady && !!this.client;
  },

  /**
   * Lấy danh sách games từ Cloud
   */
  async getGames() {
    if (!this.hasCloud()) return null;
    try {
      const { data, error } = await this.client
        .from("games")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    } catch (err) {
      console.error("[Supabase] Lỗi tải danh sách game:", err);
      return null;
    }
  },

  /**
   * Thêm mới hoặc cập nhật game lên Cloud
   */
  async upsertGame(gameData) {
    if (!this.hasCloud()) return null;
    try {
      const { data, error } = await this.client
        .from("games")
        .upsert([gameData], { onConflict: "id" })
        .select();

      if (error) {
        // Tự động thử lại nếu CSDL Supabase chưa chạy lệnh ALTER TABLE bổ sung cột mới
        if (error.message && (error.message.includes("is_community") || error.message.includes("screenshots") || error.message.includes("author"))) {
          console.warn("[Supabase] Cột mới chưa có trong CSDL, đang lưu ở chế độ tương thích:", error.message);
          const fallback = { ...gameData };
          delete fallback.is_community;
          delete fallback.author;
          delete fallback.author_link;
          delete fallback.screenshots;
          const retry = await this.client.from("games").upsert([fallback], { onConflict: "id" }).select();
          if (!retry.error) return retry.data && retry.data[0];
        }
        throw error;
      }
      return data && data[0];
    } catch (err) {
      console.error("[Supabase] Lỗi lưu game:", err);
      throw err;
    }
  },

  async saveGame(gameData) {
    return this.upsertGame(gameData);
  },

  /**
   * Xóa game khỏi Cloud
   */
  async deleteGame(gameId) {
    if (!this.hasCloud()) return false;
    try {
      const { error } = await this.client
        .from("games")
        .delete()
        .eq("id", gameId);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error("[Supabase] Lỗi xóa game:", err);
      throw err;
    }
  },

  /**
   * Tải ảnh bìa poster (File) lên Supabase Storage Bucket 'covers'
   * @param {File} file - File ảnh người dùng chọn từ máy tính
   * @param {string} gameId - ID định danh game
   * @returns {Promise<string>} Public URL của ảnh trên CDN
   */
  async uploadCover(file, gameId) {
    if (!this.hasCloud()) return null;
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${gameId}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data, error } = await this.client.storage
        .from("covers")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true
        });

      if (error) throw error;

      // Lấy URL công khai
      const { data: publicData } = this.client.storage
        .from("covers")
        .getPublicUrl(filePath);

      return publicData.publicUrl;
    } catch (err) {
      console.error("[Supabase] Lỗi upload ảnh bìa:", err);
      throw err;
    }
  },

  /**
   * Lấy danh sách đề xuất từ Cloud
   */
  async getRequests() {
    if (!this.hasCloud()) return null;
    try {
      const { data, error } = await this.client
        .from("requests")
        .select("*")
        .order("votes", { ascending: false });

      if (error) throw error;
      return data;
    } catch (err) {
      console.error("[Supabase] Lỗi tải đề xuất:", err);
      return null;
    }
  },

  /**
   * Cập nhật số lượt bình chọn cho đề xuất trên Cloud
   */
  async updateRequestVotes(requestId, votes) {
    if (!this.hasCloud()) return false;
    try {
      const { error } = await this.client
        .from("requests")
        .update({ votes: votes })
        .eq("id", requestId);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error("[Supabase] Lỗi cập nhật vote:", err);
      return false;
    }
  },

  /**
   * Thêm đề xuất mới lên Cloud
   */
  async insertRequest(reqData) {
    if (!this.hasCloud()) return false;
    try {
      const { error } = await this.client
        .from("requests")
        .insert([reqData]);

      if (error) {
        if (error.message && error.message.includes("cover_url")) {
          console.warn("[Supabase] Cột cover_url chưa có trong bảng requests, đang lưu ở chế độ tương thích...");
          const fallback = { ...reqData };
          delete fallback.cover_url;
          const retry = await this.client.from("requests").insert([fallback]);
          if (!retry.error) return true;
        }
        throw error;
      }
      return true;
    } catch (err) {
      console.error("[Supabase] Lỗi thêm đề xuất:", err);
      return false;
    }
  },

  /**
   * Xóa một đề xuất trên Cloud
   */
  async deleteRequest(requestId) {
    if (!this.hasCloud()) return false;
    try {
      const { error } = await this.client
        .from("requests")
        .delete()
        .eq("id", requestId);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error("[Supabase] Lỗi xóa đề xuất:", err);
      return false;
    }
  },

  /**
   * Xóa toàn bộ đề xuất trên Cloud
   */
  async clearAllRequests() {
    if (!this.hasCloud()) return false;
    try {
      const { error } = await this.client
        .from("requests")
        .delete()
        .neq("id", "__keep_none__");

      if (error) throw error;
      return true;
    } catch (err) {
      console.error("[Supabase] Lỗi dọn sạch đề xuất:", err);
      return false;
    }
  },

  /**
   * Đăng ký kênh Supabase Realtime để đồng bộ trực tiếp khi CSDL thay đổi
   */
  subscribeTable(tableName, onInsert, onUpdate, onDelete) {
    if (!this.hasCloud()) return null;
    try {
      const channel = this.client
        .channel(`realtime:${tableName}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: tableName },
          (payload) => {
            if (payload.eventType === "INSERT" && onInsert) onInsert(payload.new);
            else if (payload.eventType === "UPDATE" && onUpdate) onUpdate(payload.new);
            else if (payload.eventType === "DELETE" && onDelete) onDelete(payload.old);
          }
        )
        .subscribe((status) => {
          console.log(`[Supabase Realtime] Kênh ${tableName} trạng thái:`, status);
        });
      return channel;
    } catch (err) {
      console.warn(`[Supabase Realtime] Lỗi kích hoạt realtime cho ${tableName}:`, err);
      return null;
    }
  },

  /**
   * Tăng lượt vote cho đề xuất trên Cloud (Tương thích ngược)
   */
  async voteRequest(requestId, currentVotes) {
    return this.updateRequestVotes(requestId, currentVotes + 1);
  },

  /**
   * Lưu báo lỗi lên Cloud
   */
  async submitBugReport(report) {
    if (!this.hasCloud()) return false;
    try {
      const { error } = await this.client
        .from("bug_reports")
        .insert([{
          game_name: report.gameName,
          bug_type: report.bugType,
          description: report.desc,
          screenshot_url: report.screenshot || null,
          contact: report.contact || null
        }]);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error("[Supabase] Lỗi gửi báo cáo sự cố lên Supabase:", err);
      return false;
    }
  }
};

window.SupabaseClient = SupabaseClient;
