const mongoose = require("mongoose")

const connectDB = async() => {
  try {
    await mongoose.connect("mongodb+srv://haku818181:Haku0717@cluster0.fpvab3h.mongodb.net/appDataBase?retryWrites=true&w=majority")
    console.log("Succcess: Connected to MongoDB")
  }catch(err){
    console.log("Failure: Unconnected to MongoDB")
    throw new Error()
  }
}

module.exports = connectDB