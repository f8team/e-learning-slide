# Online Learning Platform Deck

HTML slide deck 18 trang, tối ưu cho trình chiếu trên trình duyệt và export PDF.

## Cách mở

- Mục lục: `index.html`
- Trình chiếu: mở `slides/01.html`, dùng phím mũi tên trái/phải để chuyển slide
- Export PDF: mở `print.html`, bấm `In hoặc lưu PDF`, chọn `Save as PDF`
- English: `en/index.html`, `en/print.html`
- Burmese: `my/index.html`, `my/print.html`

## Cách thay ảnh

- Các khung có chữ `Screenshot placeholder` là nơi cần thay bằng ảnh chụp màn hình thật.
- Nội dung cần chụp đã được ghi ngay trong placeholder của từng slide.
- Ảnh minh họa tự thiết kế đang nằm trong `assets/images/generated/`.

## Ghi chú kỹ thuật

- Nội dung slide nằm trong `assets/js/deck-data.js`.
- Nội dung có 3 ngôn ngữ trong `window.SLIDE_DECKS`: `vi`, `en`, `my`.
- CSS trình chiếu và layout chung nằm trong `assets/css/theme.css`.
- CSS PDF nằm trong `assets/css/print.css`.
- `print.html` dùng cùng dữ liệu với từng slide riêng để tránh lệch nội dung khi sửa.
- Rules nội bộ nằm trong `AGENTS.md`; khi sửa nội dung phải sửa đủ 3 ngôn ngữ.
