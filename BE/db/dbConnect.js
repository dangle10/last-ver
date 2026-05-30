const mongoose = require("mongoose");

// Dùng __dirname để đường dẫn luôn đúng bất kể bạn chạy lệnh ở thư mục nào
require("dotenv").config({ path: __dirname + '/../.env' });

async function dbConnect() {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log("Successfully connected to MongoDB!");
  } catch (error) {
    console.log("Unable to connect to MongoDB!");
    console.error(error);
  }
}

module.exports = dbConnect;