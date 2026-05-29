const mongoose = require("mongoose");
require("dotenv").config({ path: './BE/.env' });

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
