# NovelHub - Backend

Máy chủ cung cấp dịch vụ RESTful API phục vụ nền tảng đọc và quản lý tiểu thuyết trực tuyến **NovelHub**, được xây dựng trên môi trường Node.js và Express với kiến trúc bảo mật, quản lý quyền chặt chẽ và kết nối cơ sở dữ liệu MongoDB.

---

## 🚀 Công nghệ sử dụng

- **Môi trường chạy**: Node.js (v16.0+)
- **Khung ứng dụng web**: Express.js
- **Cơ sở dữ liệu & ODM**: MongoDB & Mongoose
- **Xác thực & Mã hóa**: JSON Web Token (jsonwebtoken), bcryptjs, Google Auth Library
- **Xử lý tập tin đa phương tiện**: Multer, Cloudinary, multer-storage-cloudinary
- **Bảo mật & Tiện ích**: CORS, cookie-parser, dotenv, uuid

---

## 📁 Cấu trúc thư mục

```
backend/
├── authentication/         # Xác thực phiên làm việc & kiểm tra JWT
│   └── authentication.js   # Middleware verifyToken
├── controllers/            # Bộ điều khiển xử lý logic nghiệp vụ
│   ├── authController.js         # Đăng nhập, đăng ký, đăng xuất, OAuth Google
│   ├── authorController.js       # Đăng ký và quản lý hồ sơ tác giả
│   ├── chapterController.js      # Tải lên, đọc và quản lý chương
│   ├── novelController.js        # Đăng truyện, tìm kiếm, xếp hạng, cập nhật, xóa
│   ├── novelReviewsController.js # Đánh giá tiểu thuyết và phản hồi đánh giá
│   ├── postController.js         # Bài viết diễn đàn, bình luận và phản hồi
│   └── userController.js         # Quản lý hồ sơ người dùng và danh sách yêu thích
├── middlewares/            # Các middleware trung gian
│   ├── cloudinaryStore.js  # Cấu hình lưu trữ ảnh/video bìa trên Cloudinary
│   ├── dbConnection.js     # Kết nối cơ sở dữ liệu MongoDB
│   └── ownership.js        # Kiểm tra quyền tác giả/chủ sở hữu hoặc quản trị viên
├── models/                 # Lược đồ dữ liệu Mongoose
│   ├── Author.js           # Hồ sơ tác giả
│   ├── Chapter.js          # Chương tiểu thuyết
│   ├── Comment.js          # Bình luận bài viết
│   ├── Novel.js            # Tác phẩm tiểu thuyết
│   ├── Post.js             # Bài viết diễn đàn
│   ├── Reply.js            # Phản hồi bình luận
│   ├── Review.js           # Đánh giá tác phẩm
│   └── User.js             # Tài khoản người dùng
├── oauth/                  # Cấu hình xác thực bên ngoài
│   └── googleOauth.js      # Khởi tạo Google OAuth2Client
├── routes/                 # Định tuyến API endpoints
│   ├── authRouter.js       # Tuyến xác thực tài khoản
│   ├── authorRouter.js     # Tuyến quản lý tác giả
│   ├── chapterRouter.js    # Tuyến chương truyện
│   ├── novelReviewsRouter.js # Tuyến đánh giá tiểu thuyết
│   ├── novelRouter.js      # Tuyến tiểu thuyết
│   ├── postRouter.js       # Tuyến bài viết diễn đàn
│   └── userRouter.js       # Tuyến người dùng
├── utils/                  # Các hàm tiện ích hỗ trợ
│   ├── cloudUpload.js      # Tiện ích tải tệp đa phương tiện
│   ├── escapeRegex.js      # Chống lỗ hổng ReDoS khi tìm kiếm
│   ├── likeHelper.js       # Xử lý cập nhật nguyên tử ($addToSet/$pull) tương tác thích
│   └── pagination.js       # Hỗ trợ phân trang dữ liệu
├── app.js                  # Khởi tạo máy chủ Express, gắn tuyến và xử lý lỗi tập trung
├── package.json            # Cấu hình phụ thuộc và tập lệnh thực thi
└── package-lock.json       # Khóa phiên bản các gói phụ thuộc
```

---

## 🛠️ Hướng dẫn cài đặt và khởi chạy

### Yêu cầu hệ thống
- **Node.js**: Phiên bản 16.0 trở lên
- **npm**: Phiên bản 8.0 trở lên
- **MongoDB**: Máy chủ MongoDB cục bộ hoặc MongoDB Atlas

### Các bước thực hiện

1. **Di chuyển vào thư mục backend:**
   ```bash
   cd backend
   ```

2. **Cài đặt các gói phụ thuộc:**
   ```bash
   npm install
   ```

3. **Cấu hình biến môi trường:**
   Tạo tệp `.env` tại thư mục gốc `backend/` và khai báo các khóa cấu hình sau (chỉ tạo file và không commit lên kho mã nguồn):
   - `PORT`: Cổng mạng máy chủ Express lắng nghe (mặc định: `3002`)
   - `MONGO_URI`: Chuỗi kết nối cơ sở dữ liệu MongoDB
   - `jwt_secret`: Khóa bí mật dùng để ký và xác thực JSON Web Token
   - `GOOGLE_CLIENT_ID`: Mã định danh Google OAuth Client
   - `GOOGLE_CLIENT_SECRET`: Mã bí mật Google OAuth Client
   - `CLOUDINARY_CLOUD_NAME`: Tên không gian lưu trữ Cloudinary
   - `CLOUDINARY_API_KEY`: Khóa API Cloudinary
   - `CLOUDINARY_API_SECRET`: Khóa bí mật API Cloudinary

4. **Khởi chạy máy chủ:**
   - Khởi chạy chế độ phát triển (tự khởi động lại khi có thay đổi mã nguồn):
     ```bash
     npm start
     ```
   - Khởi chạy trực tiếp bằng Node.js:
     ```bash
     node app.js
     ```

5. **Kiểm tra cú pháp mã nguồn:**
   ```bash
   node --check app.js
   ```
