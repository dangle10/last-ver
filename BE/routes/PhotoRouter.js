const express = require("express");
const mongoose = require("mongoose");
const Photo = require("../db/photoModel");
const User = require("../db/userModel");
const router = express.Router();

/* -------------------------------------------------------------------------
 * Lấy danh sách ảnh và bình luận của User
 * ------------------------------------------------------------------------- */
router.get("/photosOfUser/:id", async (request, response) => {
  const { id } = request.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    response.status(400).json({ message: `Invalid user id: ${id}.` });
    return;
  }

  try {
    const targetUser = await User.findById(id, "_id").lean();
    if (!targetUser) {
      response.status(400).json({ message: `No user found with id: ${id}.` });
      return;
    }

    const photos = await Photo.find(
      { user_id: id },
      "_id user_id comments file_name date_time",
    ).lean();

    const commentUserIds = [
      ...new Set(
        photos.flatMap((photo) =>
          (photo.comments || []).map((comment) => String(comment.user_id)),
        ),
      ),
    ];

    const commentUsers = commentUserIds.length
      ? await User.find(
          { _id: { $in: commentUserIds } },
          "_id first_name last_name",
        ).lean()
      : [];

    const commentUserMap = new Map(
      commentUsers.map((user) => [String(user._id), user]),
    );

    const apiPhotos = photos.map((photo) => ({
      _id: photo._id,
      user_id: photo.user_id,
      file_name: photo.file_name,
      date_time: photo.date_time,
      comments: (photo.comments || []).map((comment) => ({
        _id: comment._id,
        comment: comment.comment,
        date_time: comment.date_time,
        user: commentUserMap.get(String(comment.user_id)) || {
          _id: comment.user_id,
          first_name: "Unknown",
          last_name: "User",
        },
      })),
    }));

    response.status(200).json(apiPhotos);
  } catch (error) {
    response.status(500).json({ message: "Unable to fetch user photos." });
  }
});

/* -------------------------------------------------------------------------
 * API: Thêm bình luận mới cho ảnh
 * ------------------------------------------------------------------------- */
router.post("/commentsOfPhoto/:photo_id", async (request, response) => {
  const { photo_id } = request.params;
  const { comment } = request.body;
  const userId = request.session.userId; // Lấy thẻ từ Chốt chặn (Middleware)

  // 1. Kiểm tra ID ảnh hợp lệ
  if (!mongoose.Types.ObjectId.isValid(photo_id)) {
    return response.status(400).json({ message: "ID ảnh không hợp lệ." });
  }

  // 2. Yêu cầu của thầy: Không cho phép bình luận rỗng
  if (!comment || comment.trim().length === 0) {
    return response.status(400).json({ message: "Bình luận không được để trống." });
  }

  try {
    const photo = await Photo.findById(photo_id);
    if (!photo) {
      return response.status(400).json({ message: "Không tìm thấy ảnh." });
    }

    // 3. Đẩy bình luận mới vào mảng
    photo.comments.push({
      comment: comment,
      date_time: new Date(), // Lấy thời gian hiện tại
      user_id: userId
    });

    // 4. Lưu lại vào DB
    await photo.save();

    response.status(200).json({ message: "Thêm bình luận thành công." });
  } catch (error) {
    console.error("Lỗi khi thêm bình luận:", error);
    response.status(500).json({ message: "Lỗi server khi thêm bình luận." });
  }
});

const multer = require("multer");
const fs = require("fs");
const path = require("path");

// Cấu hình Multer: Nơi lưu file và Tên file
// LƯU Ý: Đoạn này mình đang cấu hình để nó trỏ ra thư mục gốc WevDev---lab1, 
// rồi chui vào thư mục chứa ảnh của bạn. Tùy vào cấu trúc thư mục mà bạn có thể cần chỉnh lại đường dẫn này!
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = "C:/Users/Admin/WevDev---lab1/Ver2/src/images";
    
    // Tuyệt chiêu: Nếu thư mục không tồn tại, tự động tạo mới luôn!
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log("Đã tự động tạo thư mục: ", dir);
    }
    // Chỉ định lưu thẳng vào thư mục ảnh của Frontend
    cb(null, dir); 
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  }
});

const upload = multer({ storage: storage });

/* -------------------------------------------------------------------------
 * API: Upload ảnh mới
 * ------------------------------------------------------------------------- */
// LƯU Ý: middleware chốt chặn login (kiểm tra session) ở index.js đã bảo vệ route này rồi
router.post("/photos/new", upload.single("uploadedphoto"), async (req, res) => {
  const userId = req.session.userId; // Lấy ID người đang đăng nhập

  // 1. Kiểm tra xem có file gửi lên không
  if (!req.file) {
    return res.status(400).send("Không có file nào được tải lên.");
  }

  try {
    // 2. Tạo bản ghi ảnh mới trong Database
    const newPhoto = new Photo({
      file_name: req.file.filename,
      date_time: new Date(),
      user_id: userId,
      comments: [] // Ảnh mới chưa có bình luận nào
    });

    // 3. Lưu vào DB
    await newPhoto.save();

    res.status(200).send("Upload ảnh thành công");
  } catch (err) {
    console.error("Lỗi khi lưu ảnh vào DB:", err);
    res.status(500).send("Lỗi server: " + err.message);
  }
});

module.exports = router;