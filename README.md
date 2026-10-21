# Áo Dài Như Quỳnh — "Chuyện một tà áo"

Website một trang cho tiệm áo dài may đo: chiếc áo được "may" dần theo thao tác cuộn (CSS scroll-driven animations), tiếp theo là form đặt lịch đo gửi qua Zalo/SMS.
Ưu tiên mobile, có layout riêng cho desktop (≥ 900px).

## Cấu trúc

- `site/` — toàn bộ website tĩnh (HTML/CSS/JS thuần, không cần build)
  - `index.html` — nội dung và SVG chiếc áo
  - `styles.css` — giao diện, animation, responsive
  - `main.js` — gallery ảnh và form đặt lịch
- `.github/workflows/deploy-pages.yml` — tự deploy `site/` lên GitHub Pages khi push vào `main`
- `Mobile – Chuyện một tà áo-html/` — mockup thiết kế gốc, chỉ dùng để tham chiếu

## Chạy local

```sh
python -m http.server 8000 -d site
```

Mở <http://localhost:8000>.

## Sửa nội dung

- Tên tiệm, địa chỉ, giờ mở cửa, số điện thoại: `site/index.html`, cùng `SHOP` ở đầu file `site/main.js`.
- Ảnh gallery: thêm ảnh vào `site/images/`, rồi khai báo `imgs: ['./images/ten-anh.jpg', …]` cho từng danh mục trong `CATS` (`site/main.js`). Mục nào chưa có ảnh sẽ hiển thị hình áo vẽ sẵn.
- Màu chủ đạo: `--accent` trong `site/styles.css`.

## Form đặt lịch

GitHub Pages không có backend, vì vậy form chỉ soạn sẵn lời nhắn:
- **Gửi qua Zalo**: chép lời nhắn vào clipboard rồi mở `zalo.me/<SĐT>`; khách chỉ cần dán và gửi.
- **Gửi SMS** (chỉ hiện trên điện thoại): mở ứng dụng tin nhắn với nội dung soạn sẵn.

## Hỗ trợ trình duyệt

Animation dùng `animation-timeline` (Chrome/Edge 115+, Safari 26+). Trình duyệt chưa hỗ trợ hoặc máy bật "giảm chuyển động" sẽ thấy trang tĩnh với chiếc áo hoàn chỉnh và đủ các bước.
