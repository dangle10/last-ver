const express = require("express");
const app = express();
const cors = require("cors");
const session = require("express-session"); // Import thư viện session
const path = require("path");

const dbConnect = require("./db/dbConnect");
const UserRouter = require("./routes/UserRouter");
const PhotoRouter = require("./routes/PhotoRouter");
const User = require("./db/userModel"); // Cần model User để check login

dbConnect();

// Cho phép Frontend gửi cookie/session (rất quan trọng khi dùng cors với session)
app.use(cors({
  origin: "http://localhost:3000", // Đổi thành cổng Frontend của bạn nếu khác
  credentials: true 
}));
app.use(express.json());

// Cấu hình Session
app.use(session({
  secret: "bi_mat_cua_cuoc_doi", // Chuỗi bí mật để mã hóa session (bạn điền gì cũng được)
  resave: false,
  saveUninitialized: false,
}));

// =========================================================================
// CÁC API KHÔNG CẦN ĐĂNG NHẬP (Nằm trên Middleware)
// =========================================================================

app.get("/", (request, response) => {
  response.send({ message: "Hello from photo-sharing app API!" });
});

// API Đăng nhập
app.post("/admin/login", async (req, res) => {
  const { login_name, password } = req.body;
  try {
    // Tìm user có login_name khớp với dữ liệu gửi lên
    const user = await User.findOne({ login_name: login_name });
    if (!user) {
      return res.status(400).send("Login name không tồn tại");
    }
    
    if (user.password !== password) {
      return res.status(400).send("Mật khẩu không chính xác");
    }
    // Nếu tìm thấy, cấp "thẻ" cho session
    req.session.userId = user._id;
    req.session.login_name = user.login_name;
    
    // Trả về thông tin user (đề bài yêu cầu phải có _id)
    res.status(200).send({ 
      _id: user._id, 
      first_name: user.first_name, 
      login_name: user.login_name 
    });
  } catch (err) {
    console.error(">>> CHI TIẾT LỖI ĐĂNG NHẬP:", err); // In lỗi ra màn hình Terminal
    res.status(500).send("Lỗi server: " + err.message); // Gửi chi tiết lỗi lên Frontend
  }
});

// API Đăng ký tài khoản mới (POST /user)
app.post("/user", async (req, res) => {
  const { login_name, password, first_name, last_name, location, description, occupation } = req.body;

  // 1. Kiểm tra các trường bắt buộc không được bỏ trống
  if (!login_name || !password || !first_name || !last_name) {
    return res.status(400).send("Vui lòng điền đầy đủ: Tên đăng nhập, Mật khẩu, Tên và Họ");
  }

  try {
    // 2. Kiểm tra xem login_name đã có ai xí trước chưa
    const existingUser = await User.findOne({ login_name: login_name });
    if (existingUser) {
      return res.status(400).send("Tên đăng nhập đã tồn tại, vui lòng chọn tên khác");
    }

    // 3. Tạo tài khoản mới
    const newUser = new User({
      login_name, 
      password, 
      first_name, 
      last_name, 
      location, 
      description, 
      occupation
    });

    await newUser.save();
    
    // Đề bài yêu cầu trả về thông tin user và BẮT BUỘC phải có login_name
    res.status(200).send({ 
      login_name: newUser.login_name, 
      _id: newUser._id 
    });
  } catch (err) {
    console.error("Lỗi khi đăng ký:", err);
    res.status(500).send("Lỗi server khi đăng ký");
  }
});

// API Đăng xuất
app.post("/admin/logout", (req, res) => {
  // Kiểm tra xem đã đăng nhập chưa
  if (!req.session.userId) {
    return res.status(400).send("Bạn chưa đăng nhập");
  }
  
  // Hủy session
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("Không thể đăng xuất");
    }
    res.status(200).send("Đăng xuất thành công");
  });
});


// =========================================================================
// CHỐT CHẶN (MIDDLEWARE) BẢO VỆ CÁC ROUTE PHÍA DƯỚI
// =========================================================================
app.use((req, res, next) => {
  // Nếu session có chứa userId (tức là đã đăng nhập qua cổng /admin/login) -> Cho đi tiếp
  if (req.session.userId) {
    next();
  } else {
    // Nếu không có, đá về lỗi 401 Unauthorized
    res.status(401).send("Unauthorized: Bạn cần đăng nhập để thực hiện thao tác này");
  }
});


// =========================================================================
// CÁC ROUTE BỊ BẢO VỆ (Phải đăng nhập mới vào được)
// =========================================================================
// Biến thư mục images thành công khai qua đường dẫn http://localhost:8081/images/
app.use("/images", express.static("C:/Users/Admin/WevDev---lab1/Ver2/src/images"));
app.use("/user", UserRouter);
app.use("/", PhotoRouter);


app.listen(8081, () => {
  console.log("server listening on port 8081");
});