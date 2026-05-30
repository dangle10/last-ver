const mongoose = require("mongoose");
// Dùng __dirname để đảm bảo nó luôn tìm đúng file .env dù bạn gõ lệnh ở thư mục nào
require("dotenv").config({ path: __dirname + '/../.env' }); 

const models = require("../modelData/models.js");

const User = require("./userModel.js"); // Lưu ý đường dẫn (nếu file cùng trong thư mục db thì đổi lại thành ./userModel.js)
const Photo = require("./photoModel.js");
const SchemaInfo = require("./schemaInfo.js");

const versionString = "1.0";

async function dbLoad() {
  try {
    // 1. Thêm dòng kết nối cực kỳ quan trọng này!
    await mongoose.connect(process.env.DB_URL);
    console.log("Đã kết nối thành công tới Local MongoDB:", process.env.DB_URL);

    await User.deleteMany({});
    await Photo.deleteMany({});
    await SchemaInfo.deleteMany({});

    const userModels = models.userListModel();
    const mapFakeId2RealId = {};
    for (const user of userModels) {
      const userObj = new User({
        first_name: user.first_name,
        last_name: user.last_name,
        location: user.location,
        description: user.description,
        occupation: user.occupation,
      });
      try {
        await userObj.save();
        mapFakeId2RealId[user._id] = userObj._id;
        user.objectID = userObj._id;
        console.log(
          "Adding user:",
          user.first_name + " " + user.last_name,
          " with ID ",
          user.objectID,
        );
      } catch (error) {
        console.error("Error create user", error);
      }
    }
    const photoModels = [];
    const userIDs = Object.keys(mapFakeId2RealId);
    userIDs.forEach(function (id) {
      photoModels.push(...models.photoOfUserModel(id));
    });
    for (const photo of photoModels) {
      const photoObj = await Photo.create({
        file_name: photo.file_name,
        date_time: photo.date_time,
        user_id: mapFakeId2RealId[photo.user_id],
      });
      photo.objectID = photoObj._id;
      if (photo.comments) {
        photo.comments.forEach(function (comment) {
          photoObj.comments = photoObj.comments.concat([
            {
              comment: comment.comment,
              date_time: comment.date_time,
              user_id: comment.user.objectID,
            },
          ]);
          console.log(
            "Adding comment of length %d by user %s to photo %s",
            comment.comment.length,
            comment.user.objectID,
            photo.file_name,
          );
        });
      }
      try {
        await photoObj.save();
        console.log(
          "Adding photo:",
          photo.file_name,
          " of user ID ",
          photoObj.user_id,
        );
      } catch (error) {
        console.error("Error create photo", error);
      }
    }

    try {
      const schemaInfo = await SchemaInfo.create({
        version: versionString,
      });
      console.log("SchemaInfo object created with version ", schemaInfo.version);
    } catch (error) {
      console.error("Error create schemaInfo", error);
    }
    
    // 2. Bật lại disconnect để máy tự ngắt kết nối khi nạp xong dữ liệu
    await mongoose.disconnect(); 
    console.log("Nạp dữ liệu hoàn tất. Đã ngắt kết nối DB!");

  } catch (err) {
    console.error("Lỗi khi kết nối hoặc nạp dữ liệu:", err);
  }
}

dbLoad();