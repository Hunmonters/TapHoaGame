@echo off
chcp 65001 >nul
title Tạp Hóa Việt - Đồng Bộ Dữ Liệu VietHoaGame
echo ============================================================
echo   TẠP HÓA VIỆT - ĐỒNG BỘ DỮ LIỆU TỪ VIETHOAGAME
echo ============================================================
echo.
python tools\sync_from_viethoagame.py
echo.
echo ============================================================
echo Đã hoàn tất! Nhấn phím bất kỳ để đóng cửa sổ này...
pause >nul
