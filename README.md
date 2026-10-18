# TalkVela

Mở trực tiếp **index.html** bằng trình duyệt. Không cần terminal, cài thư viện, build hoặc chạy localhost. Giữ thư mục `assets` cạnh `index.html` khi sao chép dự án.

Trang dùng bố cục V1, hero V2, bộ ảnh Gen Z và các visual hội thoại đã chọn. Hero được đóng gói sẵn trong `assets/hero-v2/standalone.html`, gồm mã render, texture, font và hiệu ứng hover hình tròn. Tài nguyên WebGL được nhúng để không cần tải qua HTTP. Chế độ giảm chuyển động dùng hero tĩnh.

Đã bỏ các mảng pattern lớn quanh bốn visual kỹ năng. Chỉ giữ hai điểm nhấn nhỏ ở mép phần hội thoại và phương pháp; các card luôn ở lớp trên pattern. Trên điện thoại chỉ giữ một điểm nhấn.

Thư mục `assets/hero-v2/runtime` chứa tài nguyên dự phòng và nguồn để bảo trì; hãy giữ cùng dự án. Không cần chạy script đóng gói khi sử dụng.

## Creatie study

Khu vực visual/collage và AI speaking partners dùng ảnh đồi cỏ từ bản Creatie người dùng cung cấp, lưu tại `assets/bg/bg-creatie-hills.png`. Hero giữ nguyên nền tím, pattern pixel, bộ sprite khuôn mặt, hiệu ứng hover và trail hình tròn. Phần giới thiệu và Method dùng nền giấy kẻ ô nhẹ, CTA và lesson card có chi tiết tờ note. Các UI hội thoại, ảnh Gen Z và cách mở index.html trực tiếp được giữ nguyên. Style chính: `assets/css/creatie-study.css`.

Nền collage dùng PNG gốc 4320 × 3612, không phủ trắng hay làm mờ; chữ và waveform màu trắng như tham chiếu. Lớp pixel phủ trên collage được bỏ để ảnh rõ hơn; pixel và hover ở hero vẫn giữ nguyên.

Hero dùng lại tiêu đề gốc “Languages you can actually speak.”, mô tả AI tutor và CTA. Chế độ `layout=classic` của hero nhúng giữ pixel, hover khuôn mặt và trail hình tròn; nội dung và CTA nằm ở trang chính. Header dạng notch giữ nguyên.
