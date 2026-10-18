# NovelHub - Frontend

Giao diện người dùng cho nền tảng đọc và xuất bản tiểu thuyết trực tuyến **NovelHub**, được xây dựng trên nền tảng React 18 và Vite với hiệu năng cao, giao diện hiện đại và hỗ trợ hoàn toàn tiếng Việt.

---

## 🚀 Công nghệ sử dụng

- **Thư viện cốt lõi**: React 18, React DOM
- **Công cụ đóng gói & phát triển**: Vite 5
- **Định tuyến (Routing)**: React Router DOM v6
- **Thiết kế giao diện (Styling)**: Tailwind CSS, PostCSS, Autoprefixer
- **Hoạt họa (Animation)**: Framer Motion
- **Quản lý kết nối & HTTP**: Axios (với cấu hình Axios Instance tập trung và Interceptors)
- **Quản lý phiên & Token**: js-cookie, jwt-decode
- **Xác thực mạng xã hội**: Google OAuth (@react-oauth/google)
- **Thông báo & Biểu tượng**: React Toastify, React Icons, Tabler Icons

---

## 📁 Cấu trúc thư mục

```
frontend/
├── public/                 # Tài nguyên tĩnh (ảnh đại diện, favicon, logo)
├── src/
│   ├── assets/             # Hình ảnh và media nội bộ
│   ├── components/         # Các component giao diện dùng chung
│   │   ├── Navbar.jsx          # Thanh điều hướng chính
│   │   ├── ProtectedRoute.jsx  # Bảo vệ tuyến đường yêu cầu đăng nhập
│   │   ├── DisplayBooks.jsx    # Danh sách hiển thị truyện
│   │   ├── WeeklyBest.jsx      # Bảng tin truyện nổi bật trong tuần
│   │   ├── NovelCover.jsx      # Trình bày bìa truyện
│   │   ├── NovelReviews.jsx    # Danh sách đánh giá truyện
│   │   ├── WriteReview.jsx     # Biểu mẫu viết đánh giá
│   │   ├── AuthorSection.jsx   # Khu vực tác giả
│   │   ├── ApplyAuthorship.jsx # Đăng ký quyền tác giả
│   │   ├── UploadNovel.jsx     # Đăng tác phẩm mới
│   │   ├── Forum.jsx           # Bảng tin diễn đàn
│   │   ├── PostUpload.jsx      # Đăng bài viết thảo luận
│   │   ├── UserPosts.jsx       # Danh sách bài viết của người dùng
│   │   └── LikedNovels.jsx     # Danh sách truyện yêu thích
│   ├── context/            # Quản lý trạng thái xác thực người dùng
│   │   ├── AuthContext.jsx     # Context xác thực
│   │   └── AuthState.jsx       # Quản trị logic đăng nhập, đăng xuất, token
│   ├── pages/              # Các trang chính của ứng dụng
│   │   ├── HomePage.jsx        # Trang chủ
│   │   ├── BookDetails.jsx     # Chi tiết tiểu thuyết
│   │   ├── Chapters.jsx        # Danh sách chương của truyện
│   │   ├── ChapterDetail.jsx   # Trình đọc chương (tích hợp Text-to-Speech tiếng Việt)
│   │   ├── Dashboard.jsx       # Bảng điều khiển / Trang cá nhân
│   │   ├── ForumPage.jsx       # Trang cộng đồng / Diễn đàn
│   │   ├── Rankings.jsx        # Bảng xếp hạng tác phẩm
│   │   ├── SearchResults.jsx   # Kết quả tìm kiếm
│   │   ├── NovelAnalytics.jsx  # Thống kê lượt đọc và tương tác truyện
│   │   ├── ReviewDetails.jsx   # Chi tiết và bình luận đánh giá
│   │   ├── LoginPage.jsx       # Trang đăng nhập
│   │   ├── SignUpPage.jsx      # Trang đăng ký
│   │   └── NotFound.jsx        # Trang 404 không tìm thấy
│   ├── services/           # Cấu hình API client tập trung
│   │   └── api.js              # Axios instance với auth headers & auto redirect 401
│   ├── utils/              # Tiện ích bổ trợ giao diện
│   │   ├── Book.jsx            # Thẻ hiển thị bìa và thông tin truyện
│   │   ├── Footer.jsx          # Chân trang
│   │   └── GoogleSignIn.jsx    # Nút đăng nhập Google
│   ├── App.jsx             # Cấu hình định tuyến chính
│   ├── main.jsx            # Điểm khởi chạy React DOM
│   └── index.css           # Cấu hình CSS toàn cục
├── index.html              # HTML template chính (lang="vi")
├── package.json            # Cấu hình dependencies và scripts
├── tailwind.config.js      # Cấu hình giao diện Tailwind CSS
└── vite.config.js          # Cấu hình trình đóng gói Vite
```

---

## 🛠️ Hướng dẫn cài đặt và khởi chạy

### Yêu cầu hệ thống
- **Node.js**: Phiên bản 16.0 trở lên
- **npm**: Phiên bản 8.0 trở lên

### Các bước thực hiện

1. **Di chuyển vào thư mục frontend:**
   ```bash
   cd frontend
   ```

2. **Cài đặt các gói phụ thuộc:**
   ```bash
   npm install
   ```

3. **Cấu hình biến môi trường:**
   Tạo tệp `.env` tại thư mục gốc `frontend/` và khai báo các khóa cấu hình sau (chỉ tạo file và không commit lên kho mã nguồn):
   - `VITE_API_URL`: Đường dẫn gốc đến API backend (ví dụ: `http://localhost:3002/api`)
   - `VITE_API_GOOGLE_CLIENT_ID`: Mã nhận diện ứng dụng Google OAuth

4. **Khởi chạy máy chủ phát triển:**
   ```bash
   npm run dev
   ```
   Ứng dụng sẽ chạy tại địa chỉ mặc định: `http://localhost:5173`

5. **Kiểm tra mã nguồn và đóng gói sản phẩm:**
   - Kiểm tra chuẩn mã nguồn (linter):
     ```bash
     npm run lint
     ```
   - Đóng gói dự án phục vụ triển khai (production build):
     ```bash
     npm run build
     ```
