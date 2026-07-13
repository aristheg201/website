# Hunter Network Website

Website công khai của Hunter Network, chạy miễn phí bằng GitHub Pages.

- Shop 29 skin Pokémon và bảng giá Hunter Coin/thẻ server
- Link tải mod Full/Lite và hướng dẫn cài PC/Android
- Wiki 897 Pokémon với 2.973 điều kiện spawn

Dữ liệu Wiki được nén gzip để tải nhanh hơn trên GitHub Pages và được giải nén trực tiếp trong trình duyệt.

## Giới hạn của GitHub Pages

GitHub Pages chỉ chạy frontend tĩnh. Webhook ngân hàng, tạo đơn, top nạp và lệnh give tự động phải dùng một backend riêng. Vì vậy bản public hiện chỉ hiển thị shop và tính giá; người chơi không được yêu cầu chuyển khoản khi chưa có QR do hệ thống tạo.

## Chạy thử

```bash
npm install
npm run dev
```

## Build

```bash
npm run check
npm run build
```

Mỗi lần đẩy lên `main`, workflow GitHub Actions sẽ build và triển khai thư mục `out` lên GitHub Pages.
