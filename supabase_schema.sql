-- ==========================================================================
-- TẠP HÓA VIỆT / SUPABASE DATABASE & STORAGE SCHEMA
-- Hướng dẫn: Mở SQL Editor trên Supabase (https://supabase.com), dán toàn bộ
-- nội dung tệp này vào và bấm nút "Run" để khởi tạo toàn bộ CSDL và Storage!
-- ==========================================================================

-- 1. Bảng games: Lưu trữ thông tin chi tiết các bản dịch
CREATE TABLE IF NOT EXISTS public.games (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    original_title TEXT,
    developer TEXT,
    publisher TEXT,
    engine TEXT,
    engine_category TEXT,
    platforms JSONB DEFAULT '["PC Windows"]'::jsonb,
    game_version TEXT,
    patch_version TEXT,
    size TEXT,
    sha256 TEXT,
    status TEXT DEFAULT 'in-progress',
    progress JSONB DEFAULT '{"overall": 0, "translation": 0, "proofread": 0, "font": 0, "qa": 0}'::jsonb,
    featured BOOLEAN DEFAULT false,
    release_date TEXT,
    downloads_count INT DEFAULT 0,
    summary TEXT,
    description TEXT,
    install_guide JSONB DEFAULT '[]'::jsonb,
    rollback_guide JSONB DEFAULT '[]'::jsonb,
    files_affected JSONB DEFAULT '[]'::jsonb,
    changelog JSONB DEFAULT '[]'::jsonb,
    credits JSONB DEFAULT '[]'::jsonb,
    download_links JSONB DEFAULT '[]'::jsonb,
    badge TEXT,
    cover_color TEXT DEFAULT '#111822',
    cover_image TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Bảng requests: Lưu trữ đề xuất dịch game và lượt upvote cộng đồng
CREATE TABLE IF NOT EXISTS public.requests (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    engine TEXT,
    url TEXT,
    why TEXT,
    votes INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Bảng bug_reports: Lưu trữ báo cáo lỗi bản dịch từ người chơi
CREATE TABLE IF NOT EXISTS public.bug_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    game_name TEXT NOT NULL,
    bug_type TEXT NOT NULL,
    description TEXT NOT NULL,
    screenshot_url TEXT,
    contact TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Bật Row Level Security (RLS)
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bug_reports ENABLE ROW LEVEL SECURITY;

-- Tạo chính sách (Policies) truy cập
DROP POLICY IF EXISTS "Allow public read games" ON public.games;
CREATE POLICY "Allow public read games" ON public.games FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read requests" ON public.requests;
CREATE POLICY "Allow public read requests" ON public.requests FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read bug_reports" ON public.bug_reports;
CREATE POLICY "Allow public read bug_reports" ON public.bug_reports FOR SELECT USING (true);

-- Cho phép Admin và người dùng ghi/sửa dữ liệu qua Anon Key
DROP POLICY IF EXISTS "Allow anon all games" ON public.games;
CREATE POLICY "Allow anon all games" ON public.games FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon all requests" ON public.requests;
CREATE POLICY "Allow anon all requests" ON public.requests FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon insert bug_reports" ON public.bug_reports;
CREATE POLICY "Allow anon insert bug_reports" ON public.bug_reports FOR INSERT WITH CHECK (true);

-- 4. Tạo Storage Bucket lưu ảnh poster (covers)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('covers', 'covers', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Allow public read covers" ON storage.objects;
CREATE POLICY "Allow public read covers" ON storage.objects FOR SELECT USING (bucket_id = 'covers');

DROP POLICY IF EXISTS "Allow anon upload covers" ON storage.objects;
CREATE POLICY "Allow anon upload covers" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'covers');

DROP POLICY IF EXISTS "Allow anon update covers" ON storage.objects;
CREATE POLICY "Allow anon update covers" ON storage.objects FOR UPDATE USING (bucket_id = 'covers');

-- 5. Chèn sẵn 10 bản ghi game mẫu ban đầu từ VietHoaGame

INSERT INTO public.games (
    id, title, original_title, developer, publisher, engine, engine_category,
    platforms, game_version, patch_version, size, sha256, status, progress,
    featured, release_date, downloads_count, summary, description,
    install_guide, rollback_guide, files_affected, changelog, credits,
    download_links, badge, cover_color, cover_image
) VALUES (
    'together-moon-escape',
    'Together: Moon Escape',
    'Together: Moon Escape',
    'Moon Escape Team',
    'Steam (AppID: 3744430)',
    'Unreal Engine 5.4.4 / 5.6.1',
    'ue',
    '["PC Windows", "Steam Deck"]'::jsonb,
    '5.4.4 Shipping (AppID: 3744430)',
    'v1.0.0 (Official Release)',
    '570.2 KB',
    '34002033cf7a3a73bdceed8415ae64c1ac9cfd61570ef9331953b5d0b1cca6c5',
    'ready',
    '{"overall": 100, "translation": 100, "proofread": 100, "font": 100, "qa": 100}'::jsonb,
    true,
    '2026-09-16',
    5240,
    'Bản Việt hóa 100% hoàn chỉnh cho tựa game phiêu lưu hành động Together: Moon Escape trên Unreal Engine 5. Hỗ trợ toàn bộ 146 ký tự tiếng Việt với bộ font chuẩn SIL Open Font License.',
    'Together: Moon Escape đưa người chơi vào hành trình giải cứu và sinh tồn nơi mặt trăng kỳ bí. Bản Việt hóa được thực hiện với công nghệ native UE5 IoStore/Pak, bảo đảm tốc độ tải game tức thì, không phá hủy bất kỳ file nguyên bản nào của game. Toàn bộ 798 chuỗi hội thoại, bảng dữ liệu và giao diện đã được dịch và hiệu đính tỉ mỉ.',
    '["Tải tệp nén ''Together_Moon_Escape_VietHoa.zip'' về máy và giải nén.", "Chép tệp ''TogetherMoonEscape-Windows_Vietnamese_P.pak'' vào thư mục: ''TogetherMoonEscape/Content/Paks/''.", "Mở game và thưởng thức tiếng Việt trọn vẹn. Không cần cài đặt thêm bất kỳ font hay phần mềm ngoài nào."]'::jsonb,
    '["Để gỡ bỏ bản Việt hóa, chỉ cần vào thư mục ''TogetherMoonEscape/Content/Paks/'' và xóa tệp ''TogetherMoonEscape-Windows_Vietnamese_P.pak''.", "Game sẽ trở về 100% nguyên trạng tiếng Anh mà không làm ảnh hưởng đến file Save của bạn."]'::jsonb,
    '["TogetherMoonEscape/Content/Paks/TogetherMoonEscape-Windows_Vietnamese_P.pak (Thêm mới)"]'::jsonb,
    '["v1.0.0: Phát hành chính thức, hoàn tất 100% 798/822 entries văn bản", "Tích hợp bộ phông chữ vector Be Vietnam Pro và Xanh Mono độ nét cao", "Kiểm thử xuyên suốt toàn bộ cốt truyện và các màn chơi, 0 lỗi crash"]'::jsonb,
    '[{"name": "VietHoaGame Team", "role": "Dự án & Kỹ thuật UE5"}, {"name": "Antigravity 2.0", "role": "Hỗ trợ dịch thuật & QA"}, {"name": "SIL Open Font", "role": "Phông chữ Be Vietnam Pro"}]'::jsonb,
    '[{"server": "Google Drive", "url": "https://drive.google.com/", "badge": "Tốc độ cao"}]'::jsonb,
    'HOÀN TẤT 100%',
    '#28453B',
    'assets/covers/together-moon-escape.jpg'
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    progress = EXCLUDED.progress,
    status = EXCLUDED.status,
    cover_image = EXCLUDED.cover_image,
    download_links = EXCLUDED.download_links,
    updated_at = now();

INSERT INTO public.games (
    id, title, original_title, developer, publisher, engine, engine_category,
    platforms, game_version, patch_version, size, sha256, status, progress,
    featured, release_date, downloads_count, summary, description,
    install_guide, rollback_guide, files_affected, changelog, credits,
    download_links, badge, cover_color, cover_image
) VALUES (
    'loop-hero',
    'Loop Hero',
    'Loop Hero',
    'Four Quarters',
    'Devolver Digital',
    'GameMaker Studio 2',
    'gamemaker',
    '["PC Windows", "Steam Deck"]'::jsonb,
    '1.155 (Steam, GOG, Standalone)',
    'v2.0.0-FINAL',
    '196.2 KB',
    '98779add4926a3dc1abd99eb4ffeaa4e69645971e9a8b2b1731498c409b8b44f',
    'ready',
    '{"overall": 100, "translation": 100, "proofread": 100, "font": 100, "qa": 100}'::jsonb,
    true,
    '2026-09-18',
    8920,
    'Bản Việt hóa 100% hoàn hảo cho siêu phẩm Loop Hero v1.155. Dịch trọn vẹn 2.626 mục văn bản, tích hợp font chữ độ nét cao HD không vỡ hạt.',
    'Lich đã đưa thế giới vào một vòng lặp vô tận và hỗn loạn. Với bản Việt hóa v2.0 Final, bạn sẽ thưởng thức trọn vẹn câu chuyện triết lý sâu sắc, chi tiết kỹ năng của từng lớp nhân vật (Warrior, Rogue, Necromancer), thuộc tính trang bị và bách khoa toàn thư thế giới (Encyclopedia). 0 lỗi placeholder, 0 lỗi biến số, chuẩn hóa 100% thuật ngữ.',
    '["Cách 1 (Tự động): Chạy file ''Cai_Dat_Viet_Hoa.exe'', công cụ sẽ tự nhận diện thư mục game và cài đặt trong 1 giây.", "Cách 2 (Thủ công): Giải nén file ''LoopHero_VH.rar'' và kéo thả các thư mục ''fonts'' và ''local'' vào thư mục cài đặt gốc của game (nơi chứa file Loop Hero.exe).", "Khởi động game, vào Tùy chọn (Options) -> Chọn ngôn ngữ English (bản dịch đã tích hợp trực tiếp)."]'::jsonb,
    '["Chạy công cụ ''Go_Bo_Viet_Hoa.exe'' để tự động khôi phục game về nguyên bản ban đầu từ thư mục sao lưu an toàn."]'::jsonb,
    '["fonts/Roboto-Bold.ttf (Thêm mới)", "local/lang_eng.ini (Ghi đè)"]'::jsonb,
    '["v2.0.0 Final: Tinh chỉnh lại toàn bộ 2.626 chuỗi văn bản, loại bỏ hoàn toàn các lỗi dịch thô", "Nâng cấp phông chữ HD hiển thị siêu nét trên màn hình 2K/4K", "Đóng gói cài đặt 1-chạm cực kỳ tiện lợi và an toàn"]'::jsonb,
    '[{"name": "VietHoaGame Localization Lab", "role": "Dịch thuật & Biên tập"}, {"name": "Antigravity Orchestrator", "role": "Kiểm định & Đóng gói"}, {"name": "Four Quarters", "role": "Game Developer"}]'::jsonb,
    '[{"server": "Google Drive", "url": "https://drive.google.com/", "badge": "Tốc độ cao"}]'::jsonb,
    'HOÀN TẤT 100%',
    '#42281D',
    'assets/covers/loop-hero.jpg'
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    progress = EXCLUDED.progress,
    status = EXCLUDED.status,
    cover_image = EXCLUDED.cover_image,
    download_links = EXCLUDED.download_links,
    updated_at = now();

INSERT INTO public.games (
    id, title, original_title, developer, publisher, engine, engine_category,
    platforms, game_version, patch_version, size, sha256, status, progress,
    featured, release_date, downloads_count, summary, description,
    install_guide, rollback_guide, files_affected, changelog, credits,
    download_links, badge, cover_color, cover_image
) VALUES (
    'cat-mail-co',
    'Cat Mail Co.',
    'Cat Mail Co.',
    'Maracas Studio',
    'Steam (GSE)',
    'Unity 6 IL2CPP 64-bit',
    'unity',
    '["PC Windows"]'::jsonb,
    '1.0.0 (Steam / GSE)',
    'v1.0.0',
    '29.8 MB',
    '83096576d0c642f50a3f2c993cc01db537bb96360c112dcf280d03adc29eb9ac',
    'ready',
    '{"overall": 100, "translation": 100, "proofread": 100, "font": 100, "qa": 100}'::jsonb,
    true,
    '2026-09-17',
    3150,
    'Bản Việt hóa chuẩn mực cho tựa game đưa thư mèo đáng yêu Cat Mail Co. Nền tảng Unity 6 thế hệ mới, tối ưu font chữ tiếng Việt sắc nét.',
    'Vào vai chú mèo đưa thư dễ thương đi giao từng phong bì thư và gói quà ấm áp khắp thị trấn. Toàn bộ hội thoại vui nhộn, bảng điều khiển và cốt truyện ấm áp đã được chuyển ngữ trau chuốt, giữ trọn văn phong tươi sáng của trò chơi.',
    '["Tải gói ''Cat_Mail_Co_VietHoa.rar'' và giải nén.", "Kéo thả thư mục chứa dữ liệu vào thư mục cài game, hoặc chạy file ''Cai_Dat_Viet_Hoa.exe''.", "Mở game và trải nghiệm ngay."]'::jsonb,
    '["Chạy ''Go_Bo_Viet_Hoa.exe'' để hoàn tác về bản gốc."]'::jsonb,
    '["CatMailCo_Data/resources.assets (Cập nhật)", "CatMailCo_Data/Plugins/x86_64/ (Hỗ trợ)"]'::jsonb,
    '["v1.0.0: Phát hành đầu tiên, hoàn tất toàn bộ hội thoại và UI"]'::jsonb,
    '[{"name": "VietHoaGame Team", "role": "Dịch & Kỹ thuật Unity 6"}]'::jsonb,
    '[{"server": "Google Drive", "url": "https://drive.google.com/", "badge": "Tốc độ cao"}, {"server": "Mega.nz", "url": "https://mega.nz/", "badge": "Dự phòng"}]'::jsonb,
    'HOÀN TẤT 100%',
    '#C47C35',
    'assets/covers/cat-mail-co.jpg'
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    progress = EXCLUDED.progress,
    status = EXCLUDED.status,
    cover_image = EXCLUDED.cover_image,
    download_links = EXCLUDED.download_links,
    updated_at = now();

INSERT INTO public.games (
    id, title, original_title, developer, publisher, engine, engine_category,
    platforms, game_version, patch_version, size, sha256, status, progress,
    featured, release_date, downloads_count, summary, description,
    install_guide, rollback_guide, files_affected, changelog, credits,
    download_links, badge, cover_color, cover_image
) VALUES (
    'graveyard-shift',
    'Graveyard Shift',
    'Graveyard Shift',
    'Graveyard Devs',
    'Steam',
    'Unreal Engine 5.2.1 IoStore Zen',
    'ue',
    '["PC Windows"]'::jsonb,
    '1.0.1',
    'v1.0.1',
    '831 KB',
    '436D166DC04633AD03AC00EB471CA5F6C55625BF23B26600D008A475B6169D80',
    'ready',
    '{"overall": 100, "translation": 100, "proofread": 100, "font": 100, "qa": 100}'::jsonb,
    false,
    '2026-09-15',
    2740,
    'Bản Việt hóa kinh dị nghẹt thở Graveyard Shift trên nền Unreal Engine 5.2 Zen. Patch nhị phân siêu nhẹ chỉ 831 KB.',
    'Trải nghiệm ca trực đêm kinh hoàng tại nghĩa trang vắng. Toàn bộ nhiệm vụ, manh mối rùng rợn và tài liệu ghi chú đều được biên dịch với văn phong hồi hộp, kịch tính.',
    '["Giải nén ''Graveyard_Shift_VietHoa.rar''.", "Chép các tệp .pak, .ucas, .utoc vào thư mục Paks của game.", "Vào game bắt đầu ca trực đêm."]'::jsonb,
    '["Xóa 3 file mang hậu tố _P trong thư mục Paks."]'::jsonb,
    '["GraveyardShift/Content/Paks/GraveyardShift-Windows_P.pak", "GraveyardShift/Content/Paks/GraveyardShift-Windows_P.ucas", "GraveyardShift/Content/Paks/GraveyardShift-Windows_P.utoc"]'::jsonb,
    '["v1.0.1: Tối ưu bộ giải nén IoStore Zen, khắc phục triệt để lỗi mất chữ"]'::jsonb,
    '[{"name": "VietHoaGame Team", "role": "Kỹ thuật UE5 Zen & Dịch thuật"}]'::jsonb,
    '[{"server": "Google Drive", "url": "https://drive.google.com/", "badge": "Tốc độ cao"}, {"server": "Mega.nz", "url": "https://mega.nz/", "badge": "Dự phòng"}]'::jsonb,
    'HOÀN TẤT 100%',
    '#1A2E28',
    'assets/covers/graveyard-shift.jpg'
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    progress = EXCLUDED.progress,
    status = EXCLUDED.status,
    cover_image = EXCLUDED.cover_image,
    download_links = EXCLUDED.download_links,
    updated_at = now();

INSERT INTO public.games (
    id, title, original_title, developer, publisher, engine, engine_category,
    platforms, game_version, patch_version, size, sha256, status, progress,
    featured, release_date, downloads_count, summary, description,
    install_guide, rollback_guide, files_affected, changelog, credits,
    download_links, badge, cover_color, cover_image
) VALUES (
    'warlord-awaji',
    'Warlord Awaji',
    'Warlord Awaji',
    'Samurai Studio',
    'PC',
    'Unity Engine',
    'unity',
    '["PC Windows"]'::jsonb,
    '1.0',
    'v1.0.0',
    '12.4 MB',
    '5A8B2C4F6E1D3A9C8B7E6F5A4D3C2B1A9F8E7D6C5B4A3F2E1D0C9B8A7F6E5D4C',
    'ready',
    '{"overall": 100, "translation": 100, "proofread": 100, "font": 100, "qa": 100}'::jsonb,
    false,
    '2026-09-14',
    1840,
    'Chiến thuật thời phong kiến Nhật Bản Warlord Awaji. Chuẩn hóa tên tướng, kỹ năng binh chủng và các sự kiện ngoại giao bằng tiếng Việt.',
    'Lãnh đạo gia tộc của bạn thống nhất đảo Awaji trong thời kỳ nội chiến khốc liệt. Bản dịch đem lại trải nghiệm đọc hiểu mượt mà từ cây công nghệ, chỉ số binh sĩ đến các hội thoại chiến trường.',
    '["Giải nén tệp ''Warlord_Awaji_VietHoa.rar'' và chép vào thư mục game."]'::jsonb,
    '["Chạy ''Go_Bo_Viet_Hoa.exe'' để gỡ cài đặt."]'::jsonb,
    '["Warlord_Data/resources.assets"]'::jsonb,
    '["v1.0.0: Hoàn tất phát hành"]'::jsonb,
    '[{"name": "VietHoaGame Team", "role": "Dịch & Kỹ thuật"}]'::jsonb,
    '[{"server": "Google Drive", "url": "https://drive.google.com/", "badge": "Tốc độ cao"}]'::jsonb,
    'HOÀN TẤT 100%',
    '#542D2D',
    'assets/covers/warlord-awaji.jpg'
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    progress = EXCLUDED.progress,
    status = EXCLUDED.status,
    cover_image = EXCLUDED.cover_image,
    download_links = EXCLUDED.download_links,
    updated_at = now();

INSERT INTO public.games (
    id, title, original_title, developer, publisher, engine, engine_category,
    platforms, game_version, patch_version, size, sha256, status, progress,
    featured, release_date, downloads_count, summary, description,
    install_guide, rollback_guide, files_affected, changelog, credits,
    download_links, badge, cover_color, cover_image
) VALUES (
    'shape-of-dreams',
    'Shape of Dreams',
    'Shape of Dreams',
    'Lizard Smoothie',
    'Steam',
    'Unity (TextMeshPro + Dew Engine)',
    'unity',
    '["PC Windows"]'::jsonb,
    'v1.4.0.13',
    'v0.8.0 Beta',
    '18.5 MB (Dự kiến)',
    'Đang cập nhật mã bản phát hành',
    'in-progress',
    '{"overall": 75, "translation": 85, "proofread": 75, "font": 90, "qa": 50}'::jsonb,
    true,
    'Dự kiến tháng 10/2026',
    0,
    'Tựa game Roguelike hành động nghệ thuật Shape of Dreams. Đang xử lý bộ font kép độc quyền Be Vietnam Pro & EB Garamond cùng Dew Engine Hook.',
    'Bước vào thế giới mộng ảo đầy mê hoặc. Dự án đang hoàn thiện các chương truyện cuối cùng và tinh chỉnh bảng ngọc bổ trợ, các phép thuật phân nhánh.',
    '["Dự án đang trong giai đoạn kiểm thử nội bộ (QA giai đoạn 2). Sẽ mở tải công khai ngay khi đạt chuẩn 100%."]'::jsonb,
    '["Sẽ cung cấp script hoàn tác an toàn khi phát hành."]'::jsonb,
    '["BepInEx/plugins/ShapeOfDreams_VietHoa.dll (Dự kiến)", "Fonts/DualFont_TMP.asset"]'::jsonb,
    '["Build 75%: Hoàn tất trích xuất toàn bộ text Dew Engine", "Tạo atlas font kép tiếng Việt chống răng cưa thành công", "Đang dịch phần miêu tả Boss và Cổ vật"]'::jsonb,
    '[{"name": "VietHoaGame Team", "role": "Kỹ thuật C# Hook & Translation Lead"}]'::jsonb,
    '[]'::jsonb,
    'TIẾN ĐỘ 75%',
    '#3B2A54',
    'assets/covers/shape-of-dreams.jpg'
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    progress = EXCLUDED.progress,
    status = EXCLUDED.status,
    cover_image = EXCLUDED.cover_image,
    download_links = EXCLUDED.download_links,
    updated_at = now();

INSERT INTO public.games (
    id, title, original_title, developer, publisher, engine, engine_category,
    platforms, game_version, patch_version, size, sha256, status, progress,
    featured, release_date, downloads_count, summary, description,
    install_guide, rollback_guide, files_affected, changelog, credits,
    download_links, badge, cover_color, cover_image
) VALUES (
    'ironnest',
    'Iron''s Spiders: IronNest',
    'Iron''s Spiders: IronNest',
    'Iron Team',
    'Steam',
    'Unity Engine',
    'unity',
    '["PC Windows"]'::jsonb,
    '1.0',
    'v0.9.5 Release Candidate',
    '5.2 MB (Dự kiến)',
    'Đang kiểm định QA cuối',
    'in-progress',
    '{"overall": 90, "translation": 100, "proofread": 95, "font": 90, "qa": 75}'::jsonb,
    false,
    'Dự kiến 28/09/2026',
    0,
    'Bản dịch đã hoàn tất 100% văn bản, đang chạy kiểm thử QA tầng 2 nhằm bảo đảm không phát sinh bất kỳ lỗi ngữ cảnh nào.',
    'Chiến đấu với lũ quái vật cơ khí hung hãn. Toàn bộ thông số vũ khí, nhiệm vụ và giao diện đã sẵn sàng cho ngày ra mắt.',
    '["Sẽ phát hành kèm bộ cài đặt thủ công chuẩn Cách 1 không gây lỗi game."]'::jsonb,
    '["Tự động tạo bản sao lưu trước khi cài."]'::jsonb,
    '["IronNest_Data/sharedassets0.assets"]'::jsonb,
    '["QA đợt 2: Sửa 12 lỗi tràn dòng trong menu Nâng cấp"]'::jsonb,
    '[{"name": "VietHoaGame Team", "role": "Dịch thuật & Patcher"}]'::jsonb,
    '[]'::jsonb,
    'TIẾN ĐỘ 90%',
    '#4A3E2D',
    'assets/covers/ironnest.jpg'
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    progress = EXCLUDED.progress,
    status = EXCLUDED.status,
    cover_image = EXCLUDED.cover_image,
    download_links = EXCLUDED.download_links,
    updated_at = now();

INSERT INTO public.games (
    id, title, original_title, developer, publisher, engine, engine_category,
    platforms, game_version, patch_version, size, sha256, status, progress,
    featured, release_date, downloads_count, summary, description,
    install_guide, rollback_guide, files_affected, changelog, credits,
    download_links, badge, cover_color, cover_image
) VALUES (
    'valheim',
    'Valheim',
    'Valheim',
    'Iron Gate Studio',
    'Coffee Stain Publishing',
    'Unity Engine (JSON Modding)',
    'unity',
    '["PC Windows"]'::jsonb,
    'Latest Steam Build',
    'v0.6.5 Work-in-Progress',
    '3.8 MB',
    'Đang dịch',
    'in-progress',
    '{"overall": 65, "translation": 75, "proofread": 60, "font": 80, "qa": 45}'::jsonb,
    false,
    'Dự kiến tháng 10/2026',
    0,
    'Dự án Việt hóa thế giới sinh tồn Viking thần thoại Valheim. Triển khai phương thức nạp ngôn ngữ qua tệp JSON độc lập.',
    'Khám phá thế giới thần thoại Bắc Âu kỳ vĩ. Toàn bộ tên sinh vật, công thức chế tạo và bia đá rune cổ đang được chuyển ngữ tỉ mỉ.',
    '["Cài đặt nhẹ nhàng qua tệp mod BepInEx."]'::jsonb,
    '["Xóa tệp mod trong thư mục plugins."]'::jsonb,
    '["BepInEx/plugins/Valheim_Vietnamese.json"]'::jsonb,
    '["Hoàn tất dịch khu vực Đồng bằng và Đầm lầy"]'::jsonb,
    '[{"name": "VietHoaGame Team", "role": "Dịch thuật"}]'::jsonb,
    '[]'::jsonb,
    'TIẾN ĐỘ 65%',
    '#1C3642',
    'assets/covers/valheim.jpg'
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    progress = EXCLUDED.progress,
    status = EXCLUDED.status,
    cover_image = EXCLUDED.cover_image,
    download_links = EXCLUDED.download_links,
    updated_at = now();

INSERT INTO public.games (
    id, title, original_title, developer, publisher, engine, engine_category,
    platforms, game_version, patch_version, size, sha256, status, progress,
    featured, release_date, downloads_count, summary, description,
    install_guide, rollback_guide, files_affected, changelog, credits,
    download_links, badge, cover_color, cover_image
) VALUES (
    'duck-detective',
    'Duck Detective: The Secret Salami',
    'Duck Detective: The Secret Salami',
    'Happy Broccoli Games',
    'Steam',
    'Unity Engine',
    'unity',
    '["PC Windows"]'::jsonb,
    '1.0',
    'v0.4.0 Alpha',
    '8.4 MB (Dự kiến)',
    'Đang trích xuất',
    'in-progress',
    '{"overall": 40, "translation": 50, "proofread": 35, "font": 50, "qa": 25}'::jsonb,
    false,
    'Dự kiến quý 4/2026',
    0,
    'Thám tử vịt phá án vụ xúc xích bí ẩn. Trò chơi giải đố hài hước với nhiều câu chơi chữ tiếng Anh cần bản địa hóa sáng tạo.',
    'Một vụ án xúc xích làm chấn động giới động vật. Đội ngũ đang xử lý khéo léo các câu chơi chữ để người chơi Việt Nam vừa cười vừa suy luận logic.',
    '["Sẽ cập nhật khi có bản thử nghiệm"]'::jsonb,
    '["Cung cấp bản sao lưu"]'::jsonb,
    '["DuckDetective_Data/resources.assets"]'::jsonb,
    '["Xong Act 1 câu chuyện vụ án văn phòng"]'::jsonb,
    '[{"name": "VietHoaGame Team", "role": "Dịch thuật sáng tạo"}]'::jsonb,
    '[]'::jsonb,
    'TIẾN ĐỘ 40%',
    '#4A4325',
    'assets/covers/duck-detective.jpg'
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    progress = EXCLUDED.progress,
    status = EXCLUDED.status,
    cover_image = EXCLUDED.cover_image,
    download_links = EXCLUDED.download_links,
    updated_at = now();

INSERT INTO public.games (
    id, title, original_title, developer, publisher, engine, engine_category,
    platforms, game_version, patch_version, size, sha256, status, progress,
    featured, release_date, downloads_count, summary, description,
    install_guide, rollback_guide, files_affected, changelog, credits,
    download_links, badge, cover_color, cover_image
) VALUES (
    'manor-lords',
    'Manor Lords',
    'Manor Lords',
    'Slavic Magic',
    'Hooded Horse',
    'Unreal Engine',
    'ue',
    '["PC Windows"]'::jsonb,
    'Early Access',
    'v0.2.5 Concept',
    'Đang xây dựng',
    'Đang xây dựng',
    'in-progress',
    '{"overall": 25, "translation": 35, "proofread": 20, "font": 30, "qa": 15}'::jsonb,
    false,
    'Dự kiến 2026',
    0,
    'Dự án nghiên cứu cấu trúc gói dữ liệu Unreal Engine cho tựa game xây dựng thành quách thời trung cổ Manor Lords.',
    'Chuẩn bị từ điển thuật ngữ chuyên sâu về nông nghiệp, tước vị phong kiến và chiến thuật quân sự trung cổ.',
    '["Đang trong quá trình nghiên cứu kỹ thuật"]'::jsonb,
    '["Cung cấp gói hoàn tác"]'::jsonb,
    '["ManorLords/Content/Paks/"]'::jsonb,
    '["Trích xuất bảng dữ liệu FText ban đầu"]'::jsonb,
    '[{"name": "VietHoaGame Team", "role": "Kỹ thuật"}]'::jsonb,
    '[]'::jsonb,
    'TIẾN ĐỘ 25%',
    '#3D372E',
    'assets/covers/manor-lords.jpg'
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    progress = EXCLUDED.progress,
    status = EXCLUDED.status,
    cover_image = EXCLUDED.cover_image,
    download_links = EXCLUDED.download_links,
    updated_at = now();
