# TalkVela

Mở trực tiếp **index.html** bằng trình duyệt. Không cần terminal, cài thư viện, build hoặc chạy localhost. Giữ thư mục `assets` cạnh `index.html` khi sao chép dự án.

Trang dùng bố cục V1, hero V2, bộ ảnh Gen Z và các visual hội thoại đã chọn. Hero được đóng gói sẵn trong `assets/hero-v2/standalone.html`, gồm mã render, texture, font và hiệu ứng hover hình tròn. Tài nguyên WebGL được nhúng để không cần tải qua HTTP. Chế độ giảm chuyển động dùng hero tĩnh.

Đã bỏ các mảng pattern lớn quanh bốn visual kỹ năng. Chỉ giữ hai điểm nhấn nhỏ ở mép phần hội thoại và phương pháp; các card luôn ở lớp trên pattern. Trên điện thoại chỉ giữ một điểm nhấn.

Thư mục `assets/hero-v2/runtime` chứa tài nguyên dự phòng và nguồn để bảo trì; hãy giữ cùng dự án. Không cần chạy script đóng gói khi sử dụng.

## Creatie study

Khu vực visual/collage và AI speaking partners dùng ảnh đồi cỏ từ bản Creatie người dùng cung cấp, lưu tại `assets/bg/bg-creatie-hills.png`. Hero giữ nguyên nền tím, pattern pixel, bộ sprite khuôn mặt, hiệu ứng hover và trail hình tròn. Phần giới thiệu và Method dùng nền giấy kẻ ô nhẹ, CTA và lesson card có chi tiết tờ note. Các UI hội thoại, ảnh Gen Z và cách mở index.html trực tiếp được giữ nguyên. Style chính: `assets/css/creatie-study.css`.

Nền collage dùng bản WebP tối ưu ở nguyên kích thước 4320 × 3612 (giữ PNG gốc làm source), không phủ trắng hay làm mờ; chữ và waveform màu trắng như tham chiếu. Lớp pixel phủ trên collage được bỏ để ảnh rõ hơn; pixel và hover ở hero vẫn giữ nguyên.

Hero dùng lại tiêu đề gốc “Languages you can actually speak.”, mô tả AI tutor và CTA. Chế độ `layout=classic` của hero nhúng giữ pixel, hover khuôn mặt và trail hình tròn; nội dung và CTA nằm ở trang chính. Header dạng notch giữ nguyên.

## Loading performance

Hero giữ renderer, pixel, face springs và circular trail, nhưng texture nhúng dùng WebP chất lượng cao; shader noise và atlas giữ nguyên dữ liệu pixel. Gói standalone giảm từ 39,6 MB xuống khoảng 14,8 MB. Màn loading vẫn kết thúc trước khi hiện copy, với thời gian fade ngắn hơn. Charset nằm đầu file để mở trực tiếp từ disk đúng UTF-8.

Bảy chân dung dùng WebP responsive 480/800/full-width, giữ PNG nguồn. Ảnh dưới màn hình đầu tiên dùng lazy loading và async decoding; `assets/js/image-loading.js` tải và giải mã ảnh trước section khoảng 1400 px để sẵn sàng cho animation. Font Inter được chia sẻ giữa các weight thay vì nhúng trùng dữ liệu. Không cần build hay server để sử dụng.
